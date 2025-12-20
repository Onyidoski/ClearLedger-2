// server/controllers/walletController.js
const axios = require('axios');
const Moralis = require('moralis').default;
const { EvmChain } = require('@moralisweb3/common-evm-utils');
const Transaction = require('../models/Transaction');

// --- Helper: Get Prices ---
const getPrices = async (tokenSymbols = []) => {
    let prices = {};
    let ethPrice = 0;

    try {
        // 1. Get ETH Price
        const ethRes = await axios.get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD');
        ethPrice = ethRes.data.USD || 0;

        // 2. Get Token Prices
        if (tokenSymbols.length > 0) {
            const symbols = tokenSymbols.slice(0, 30).join(',');
            const url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbols}&tsyms=USD`;
            const response = await axios.get(url);
            for (const [symbol, data] of Object.entries(response.data)) {
                if (data.USD) prices[symbol] = data.USD;
            }
        }
    } catch (error) {
        console.error("Price Fetch Error:", error.message);
    }
    return { eth: ethPrice, tokens: prices };
};

// --- Sync Transactions (Newest First) ---
exports.getTransactions = async (req, res) => {
    const { address } = req.params;
    const apiKey = process.env.ETHERSCAN_API_KEY;

    try {
        // Sort DESC to show newest activity first
        const url = `https://api.etherscan.io/v2/api?chainid=1&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
        const response = await axios.get(url);
        const data = response.data;

        if (data.status === "0" && data.message === "No transactions found") {
            return res.json({ message: "Success", count: 0, transactions: [] });
        }

        const rawTransactions = data.result || [];
        
        // Show last 50 transactions for the UI list
        const limitedTx = rawTransactions.slice(0, 50); 

        const cleanedTransactions = limitedTx.map(tx => ({
            ...tx,
            timeStamp: Number(tx.timeStamp) * 1000, 
            walletAddress: address.toLowerCase()
        }));

        res.json({ 
            message: "Success", 
            count: cleanedTransactions.length, 
            transactions: cleanedTransactions 
        });

    } catch (error) {
        console.error("Tx Sync Error:", error.message);
        res.status(500).json({ error: "Failed to sync transactions" });
    }
};

// --- Get Wallet Stats (With Gas Calculation) ---
exports.getWalletStats = async (req, res) => {
    const { address } = req.params;
    const chain = EvmChain.ETHEREUM;
    const apiKey = process.env.ETHERSCAN_API_KEY;

    try {
        // 1. Get Native Balance (ETH)
        const nativeBalanceResponse = await Moralis.EvmApi.balance.getNativeBalance({
            address,
            chain,
        });
        const rawWei = nativeBalanceResponse.toJSON().balance; 
        const nativeBalance = Number(rawWei) / 1e18;

        // 2. Get Token Balances (Spam Filtered)
        const tokenResponse = await Moralis.EvmApi.token.getWalletTokenBalances({
            address,
            chain,
            excludeSpam: true 
        });
        const rawTokens = tokenResponse.toJSON();
        
        // 3. Prepare Symbols & Prices
        const validTokens = rawTokens.filter(t => t.symbol && t.symbol.length < 7);
        const topTokens = validTokens.slice(0, 15);
        const symbols = topTokens.map(t => t.symbol);
        const prices = await getPrices(symbols);

        // 4. Calculate Token Values
        const tokenHoldings = topTokens.map(t => {
            const balance = parseFloat(t.balance) / (10 ** t.decimals);
            const price = prices.tokens[t.symbol] || 0;
            return {
                symbol: t.symbol,
                balance: balance,
                price: price,
                valueUSD: balance * price
            };
        }).sort((a, b) => b.valueUSD - a.valueUSD);

        // 5. Net Worth (Safe Mode: ETH Only)
        const ethValue = nativeBalance * prices.eth;
        const netWorth = ethValue; 

        // --- NEW: Calculate Total Gas Fees Burned ---
        let totalGasEth = 0;
        try {
            // Fetch full history (up to 10k txs) to sum gas
            const txUrl = `https://api.etherscan.io/v2/api?chainid=1&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;
            const txRes = await axios.get(txUrl);
            
            if (txRes.data.status === "1" && txRes.data.result) {
                const allTxs = txRes.data.result;
                const myAddress = address.toLowerCase();

                // Sum gas for outgoing transactions
                totalGasEth = allTxs.reduce((acc, tx) => {
                    if (tx.from.toLowerCase() === myAddress) {
                        // Gas Cost = GasUsed * GasPrice
                        const gasCost = BigInt(tx.gasUsed) * BigInt(tx.gasPrice);
                        return acc + Number(gasCost);
                    }
                    return acc;
                }, 0);
                
                // Convert Wei to ETH
                totalGasEth = totalGasEth / 1e18;
            }
        } catch (err) {
            console.error("Gas Calc Error:", err.message);
            // Non-critical, continue with 0 if fails
        }

        const totalGasUsd = totalGasEth * prices.eth;

        // 6. Generate Insights
        const insights = [];
        if (tokenHoldings.length > 5) insights.push({ title: "Diversified", type: "success", message: `Holding ${tokenHoldings.length} verified assets.` });
        if (netWorth > 100000) insights.push({ title: "Whale Status", type: "info", message: "High value portfolio." });
        if (totalGasEth > 1) insights.push({ title: "Active User", type: "warning", message: `Burned ${totalGasEth.toFixed(2)} ETH in fees.` });

        res.json({
            address: address,
            currentPriceUSD: prices.eth,
            balanceETH: nativeBalance,
            balanceUSD: ethValue,
            netWorthUSD: netWorth,
            totalGasPaidETH: totalGasEth, // <--- Now Accurate
            totalGasPaidUSD: totalGasUsd, // <--- Now Accurate
            totalTransactions: 0,
            tokens: tokenHoldings,
            insights: insights
        });

    } catch (error) {
        console.error("Moralis Error:", error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
};