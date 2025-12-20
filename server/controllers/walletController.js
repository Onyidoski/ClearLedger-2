// server/controllers/walletController.js
const axios = require('axios');
const Moralis = require('moralis').default;
const { EvmChain } = require('@moralisweb3/common-evm-utils');
const Transaction = require('../models/Transaction');

// --- Helper: Get Prices for Top Tokens (Using CryptoCompare) ---
const getPrices = async (tokenSymbols = []) => {
    let prices = {};
    let ethPrice = 0;

    try {
        // 1. Get ETH Price
        const ethRes = await axios.get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD');
        ethPrice = ethRes.data.USD;

        // 2. Get Token Prices (Batch)
        // CryptoCompare handles about 30 symbols in one request easily
        if (tokenSymbols.length > 0) {
            const symbols = tokenSymbols.slice(0, 30).join(',');
            const url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbols}&tsyms=USD`;
            const response = await axios.get(url);
            
            // Format: { "OMG": { "USD": 1.23 } } -> { "OMG": 1.23 }
            for (const [symbol, data] of Object.entries(response.data)) {
                if (data.USD) prices[symbol] = data.USD;
            }
        }
    } catch (error) {
        console.error("Price Fetch Error:", error.message);
    }

    return { eth: ethPrice, tokens: prices };
};

// --- Sync Transactions (Keep Etherscan for History/Chart) ---
// Moralis has a transaction API too, but since your Chart works, 
// we will keep this part as-is to save you effort.
exports.getTransactions = async (req, res) => {
    const { address } = req.params;
    const apiKey = process.env.ETHERSCAN_API_KEY;

    try {
        const url = `https://api.etherscan.io/v2/api?chainid=1&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;
        const response = await axios.get(url);
        const data = response.data;

        if (data.status === "0" && data.message === "No transactions found") {
            return res.json({ message: "Success", count: 0, transactions: [] });
        }

        const rawTransactions = data.result || [];
        
        // Save only the last 1000 to DB to be fast
        const limitedTx = rawTransactions.slice(-1000); 

        const bulkOps = limitedTx.map(tx => ({
            updateOne: {
                filter: { hash: tx.hash },
                update: { $set: { ...tx, walletAddress: address.toLowerCase(), timeStamp: new Date(tx.timeStamp * 1000) } },
                upsert: true
            }
        }));

        if (bulkOps.length > 0) await Transaction.bulkWrite(bulkOps);

        // Return sorted list for the Chart
        res.json({ 
            message: "Success", 
            count: limitedTx.length, 
            transactions: limitedTx.sort((a, b) => b.timeStamp - a.timeStamp) 
        });

    } catch (error) {
        console.error("Tx Sync Error:", error.message);
        res.status(500).json({ error: "Failed to sync transactions" });
    }
};

// --- NEW: Accurate Stats using Moralis ---
exports.getWalletStats = async (req, res) => {
    const { address } = req.params;
    const chain = EvmChain.ETHEREUM;

    try {
        // 1. Get Native Balance (ETH) - Includes Internal Txs!
        const nativeBalanceResponse = await Moralis.EvmApi.balance.getNativeBalance({
            address,
            chain,
        });
        const nativeBalance = nativeBalanceResponse.result.balance.ether; // returns string

        // 2. Get Token Balances (The Accurate List)
        const tokenResponse = await Moralis.EvmApi.token.getWalletTokenBalances({
            address,
            chain,
        });
        
        // Moralis gives us the exact list of tokens currently owned
        const rawTokens = tokenResponse.toJSON(); // Convert to clean JSON
        
        // 3. Prepare Symbols for Price Fetching
        // Filter out spam/scam tokens (heuristic: no symbol or weird names)
        const validTokens = rawTokens.filter(t => t.symbol && t.symbol.length < 7);
        const topTokens = validTokens.slice(0, 15); // Take top 15
        const symbols = topTokens.map(t => t.symbol);

        // 4. Get Prices
        const prices = await getPrices(symbols);

        // 5. Build the "Portfolio Assets" List
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

        // 6. Calculate Net Worth
        const ethBalance = parseFloat(nativeBalance);
        const ethValue = ethBalance * prices.eth;
        const tokenValue = tokenHoldings.reduce((sum, t) => sum + t.valueUSD, 0);
        const netWorth = ethValue + tokenValue;

        // 7. Generate Insights
        const insights = [];
        if (tokenHoldings.length > 5) insights.push({ title: "Diversified", type: "success", message: `Holding ${tokenHoldings.length} assets.` });
        if (netWorth > 10000) insights.push({ title: "Whale Status", type: "info", message: "High value portfolio." });

        // 8. Send Response
        res.json({
            address: address,
            currentPriceUSD: prices.eth,
            balanceETH: ethBalance,
            balanceUSD: ethValue,
            netWorthUSD: netWorth,
            totalGasPaidETH: 0, // Moralis doesn't give gas history easily, we can skip or calculate separately
            totalGasPaidUSD: 0,
            totalTransactions: 0, // Handled by the other endpoint
            tokens: tokenHoldings,
            insights: insights
        });

    } catch (error) {
        console.error("Moralis Error:", error);
        res.status(500).json({ error: "Failed to fetch Moralis data" });
    }
};