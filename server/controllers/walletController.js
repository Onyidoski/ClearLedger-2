// server/controllers/walletController.js
const axios = require('axios');
const Moralis = require('moralis').default;
const { EvmChain } = require('@moralisweb3/common-evm-utils');
const WalletCache = require('../models/WalletCache'); 

// --- Helper: Sleep (Rate Limiting) ---
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// --- Helper: Get Current Prices ---
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

// --- Helper: Get Historical Price (Cache) ---
const priceCache = {}; 
const getHistoricalPrice = async (symbol, timestamp) => {
    const cacheKey = `${symbol}-${timestamp}`;
    if (priceCache[cacheKey]) return priceCache[cacheKey];

    try {
        const url = `https://min-api.cryptocompare.com/data/pricehistorical?fsym=${symbol}&tsyms=USD&ts=${timestamp}`;
        const response = await axios.get(url);
        if (response.data[symbol] && response.data[symbol].USD) {
            priceCache[cacheKey] = response.data[symbol].USD;
            return response.data[symbol].USD;
        }
        return 0;
    } catch (error) {
        console.error(`Historical Price Error for ${symbol}:`, error.message);
        return 0;
    }
};

// --- Helper: FIFO Engine (Calculates Realized P/L) ---
const calculateFIFO = async (transfers, walletAddress, symbol) => {
    let inventory = []; 
    let realizedPL = 0;
    // Sort transactions by date (Oldest first)
    const sortedTransfers = transfers.sort((a, b) => new Date(a.block_timestamp) - new Date(b.block_timestamp));

    for (const tx of sortedTransfers) {
        const decimals = parseInt(tx.token_decimals);
        const qty = parseFloat(tx.value) / (10 ** decimals);
        const txTime = Math.floor(new Date(tx.block_timestamp).getTime() / 1000);
        await sleep(100); 
        const price = await getHistoricalPrice(symbol, txTime);

        if (tx.to_address.toLowerCase() === walletAddress.toLowerCase()) {
            // BUY
            inventory.push({ qty, price });
        } else {
            // SELL
            let qtyToSell = qty;
            while (qtyToSell > 0 && inventory.length > 0) {
                let batch = inventory[0];
                if (batch.qty > qtyToSell) {
                    const costBasis = batch.price * qtyToSell;
                    const sellValue = price * qtyToSell;
                    realizedPL += (sellValue - costBasis);
                    batch.qty -= qtyToSell;
                    qtyToSell = 0;
                } else {
                    const costBasis = batch.price * batch.qty;
                    const sellValue = price * batch.qty;
                    realizedPL += (sellValue - costBasis);
                    qtyToSell -= batch.qty;
                    inventory.shift();
                }
            }
        }
    }
    const remainingQty = inventory.reduce((acc, batch) => acc + batch.qty, 0);
    const remainingCost = inventory.reduce((acc, batch) => acc + (batch.qty * batch.price), 0);
    const avgBuyPrice = remainingQty > 0 ? (remainingCost / remainingQty) : 0;
    return { realizedPL, avgBuyPrice };
};


// =========================================================
// 1. Get Transactions
// =========================================================
exports.getTransactions = async (req, res) => {
    const { address } = req.params;
    const apiKey = process.env.ETHERSCAN_API_KEY;
    try {
        const url = `https://api.etherscan.io/v2/api?chainid=1&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
        const response = await axios.get(url);
        const data = response.data;
        if (data.status === "0") return res.json({ message: "Success", count: 0, transactions: [] });
        const rawTransactions = data.result || [];
        const limitedTx = rawTransactions.slice(0, 50); 
        const cleanedTransactions = limitedTx.map(tx => ({ ...tx, timeStamp: Number(tx.timeStamp) * 1000, walletAddress: address.toLowerCase() }));
        res.json({ message: "Success", count: cleanedTransactions.length, transactions: cleanedTransactions });
    } catch (error) { res.status(500).json({ error: "Failed to sync transactions" }); }
};


// =========================================================
// 2. UPDATED: Get Wallet Stats (With Caching & Price Fix)
// =========================================================
exports.getWalletStats = async (req, res) => {
    const { address } = req.params;
    const cleanAddress = address.toLowerCase();
    
    // CACHE CHECK
    try {
        const cachedData = await WalletCache.findOne({ address: cleanAddress });
        if (cachedData) {
            const minutesSinceUpdate = (Date.now() - cachedData.lastUpdated) / 1000 / 60;
            if (minutesSinceUpdate < 5) {
                console.log(`[CACHE HIT] Serving ${cleanAddress} from DB`);
                return res.json({
                    address: cleanAddress,
                    currentPriceUSD: cachedData.ethPrice, // <--- RETURN SAVED PRICE
                    netWorthUSD: cachedData.netWorthUSD,
                    netWorthETH: cachedData.netWorthETH,
                    balanceUSD: cachedData.balanceUSD, 
                    totalGasPaidETH: cachedData.totalGasPaidETH,
                    totalGasPaidUSD: cachedData.totalGasPaidUSD,
                    spamTokenCount: cachedData.spamTokenCount,
                    tokens: cachedData.tokens,
                    cached: true 
                });
            }
        }
    } catch (err) { console.error("Cache Check Error:", err); }

    // FETCH FRESH DATA
    const chain = EvmChain.ETHEREUM;
    const apiKey = process.env.ETHERSCAN_API_KEY;

    try {
        console.log(`[CACHE MISS] Fetching fresh data for ${cleanAddress}`);

        // 1. Get ETH Balance
        const nativeBalanceResponse = await Moralis.EvmApi.balance.getNativeBalance({ address, chain });
        const nativeBalance = Number(nativeBalanceResponse.toJSON().balance) / 1e18;

        // 2. Get Token Balances
        const tokenResponse = await Moralis.EvmApi.token.getWalletTokenBalances({ address, chain, excludeSpam: false });
        const allTokens = tokenResponse.toJSON();
        
        // 3. Filter Spam
        const spamTokens = allTokens.filter(t => t.possibleSpam);
        const rawValidTokens = allTokens.filter(t => !t.possibleSpam);
        const validTokens = rawValidTokens.filter(t => t.symbol && t.symbol.length < 7);
        const symbolSpamCount = rawValidTokens.length - validTokens.length;
        const totalSpamBlocked = spamTokens.length + symbolSpamCount;

        // 4. Get Prices for Top Tokens
        const topTokens = validTokens.slice(0, 15);
        const prices = await getPrices(topTokens.map(t => t.symbol));

        // 5. Calculate Token Values
        const tokenHoldings = topTokens.map(t => {
            const balance = parseFloat(t.balance) / (10 ** t.decimals);
            const price = prices.tokens[t.symbol] || 0;
            return { symbol: t.symbol, balance, price, valueUSD: balance * price };
        }).sort((a, b) => b.valueUSD - a.valueUSD);

        // 6. Calculate Net Worth
        const ethValueUSD = nativeBalance * prices.eth;
        const tokenTotalUSD = tokenHoldings.reduce((acc, t) => acc + t.valueUSD, 0);

        // Total Net Worth (ETH + Tokens)
        const netWorthUSD = ethValueUSD + tokenTotalUSD; 
        const netWorthETH = prices.eth > 0 ? (netWorthUSD / prices.eth) : 0;

        // 7. Gas Calculation
        let totalGasEth = 0;
        try {
            const txUrl = `https://api.etherscan.io/v2/api?chainid=1&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;
            const txRes = await axios.get(txUrl);
            if (txRes.data.result) {
                totalGasEth = txRes.data.result.reduce((acc, tx) => (tx.from.toLowerCase() === cleanAddress ? acc + (Number(tx.gasUsed)*Number(tx.gasPrice)) : acc), 0) / 1e18;
            }
        } catch (err) {}
        const totalGasUsd = totalGasEth * prices.eth;

        // 8. Save to Cache
        await WalletCache.findOneAndUpdate(
            { address: cleanAddress },
            {
                ethPrice: prices.eth, // <--- SAVE PRICE HERE
                netWorthUSD,
                netWorthETH,
                balanceUSD: ethValueUSD, 
                totalGasPaidETH: totalGasEth,
                totalGasPaidUSD: totalGasUsd,
                spamTokenCount: totalSpamBlocked,
                tokens: tokenHoldings,
                lastUpdated: Date.now()
            },
            { upsert: true, new: true }
        );

        res.json({
            address: cleanAddress,
            currentPriceUSD: prices.eth,
            balanceETH: nativeBalance,
            balanceUSD: ethValueUSD,
            netWorthUSD,
            netWorthETH,
            totalGasPaidETH: totalGasEth,
            totalGasPaidUSD: totalGasUsd,
            spamTokenCount: totalSpamBlocked,
            tokens: tokenHoldings,
            cached: false
        });

    } catch (error) {
        console.error("Wallet Stats Error:", error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
};


// =========================================================
// 3. Get Portfolio Performance (P/L Engine)
// =========================================================
exports.getPortfolioPerformance = async (req, res) => {
    const { address } = req.params;
    const chain = EvmChain.ETHEREUM;

    try {
        const tokenResponse = await Moralis.EvmApi.token.getWalletTokenBalances({ address, chain, excludeSpam: true });
        const activeTokens = tokenResponse.toJSON().filter(t => t.symbol && t.symbol.length < 7).slice(0, 6); 

        const performanceData = [];
        let totalRealizedPL = 0;
        let totalUnrealizedPL = 0;
        let profitableCount = 0;

        const transfersResponse = await Moralis.EvmApi.token.getWalletTokenTransfers({ address, chain, limit: 100 });
        const allTransfers = transfersResponse.toJSON().result;

        for (const token of activeTokens) {
            const symbol = token.symbol;
            const tokenAddress = token.token_address.toLowerCase();
            const decimals = parseInt(token.decimals);
            const currentBalance = parseFloat(token.balance) / (10 ** decimals);

            const tokenTransfers = allTransfers.filter(tx => tx.address.toLowerCase() === tokenAddress);
            const { realizedPL, avgBuyPrice } = await calculateFIFO(tokenTransfers, address, symbol);
            
            const priceData = await getPrices([symbol]);
            const currentPrice = priceData.tokens[symbol] || 0;
            const currentValueUSD = currentBalance * currentPrice;
            const costBasisUSD = currentBalance * avgBuyPrice;
            const unrealizedPL_USD = currentValueUSD - costBasisUSD;
            const unrealizedPL_Percentage = costBasisUSD > 0 ? ((unrealizedPL_USD / costBasisUSD) * 100) : 0;
            const isProfitable = (unrealizedPL_USD + realizedPL) >= 0;

            totalRealizedPL += realizedPL;
            totalUnrealizedPL += unrealizedPL_USD;
            if (isProfitable) profitableCount++;

            performanceData.push({
                symbol: symbol,
                name: token.name,
                balance: currentBalance,
                currentPrice: currentPrice,
                avgBuyPrice: avgBuyPrice,
                currentValueUSD: currentValueUSD,
                unrealizedPL_USD: unrealizedPL_USD,
                unrealizedPL_Percentage: unrealizedPL_Percentage,
                realizedPL_USD: realizedPL,
                isProfitable: isProfitable
            });
        }

        const totalTokens = performanceData.length;
        const winRate = totalTokens > 0 ? ((profitableCount / totalTokens) * 100) : 0;
        const bestAsset = performanceData.reduce((prev, current) => {
            const prevTotal = (prev.unrealizedPL_USD || 0) + (prev.realizedPL_USD || 0);
            const currTotal = (current.unrealizedPL_USD || 0) + (current.realizedPL_USD || 0);
            return prevTotal > currTotal ? prev : current;
        }, performanceData[0] || {});

        res.json({
            address: address,
            analyzedTokenCount: totalTokens,
            stats: {
                totalRealizedPL: totalRealizedPL,
                totalUnrealizedPL: totalUnrealizedPL,
                winRate: winRate,
                bestPerformer: bestAsset.symbol || "N/A",
                bestPerformerValue: (bestAsset.unrealizedPL_USD || 0) + (bestAsset.realizedPL_USD || 0)
            },
            performance: performanceData.sort((a, b) => b.currentValueUSD - a.currentValueUSD)
        });

    } catch (error) {
        console.error("Performance Engine Error:", error);
        res.status(500).json({ error: "Failed to calculate performance", details: error.message });
    }
};