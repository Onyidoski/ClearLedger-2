// server/controllers/walletController.js
const axios = require('axios');
const Moralis = require('moralis').default;
const { EvmChain } = require('@moralisweb3/common-evm-utils');
const WalletCache = require('../models/WalletCache'); 

// --- Config: Supported Chains ---
const CHAIN_CONFIG = {
    '0x1':  { name: 'Ethereum', native: 'ETH',  scanUrl: 'https://api.etherscan.io/api' }, // Changed to V1 API for better compatibility
    '0x38': { name: 'BSC',      native: 'BNB',  scanUrl: 'https://api.bscscan.com/api' },
    '0x89': { name: 'Polygon',  native: 'MATIC',scanUrl: 'https://api.polygonscan.com/api' }
};

// --- Helper: Sleep ---
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// --- Helper: Get Prices (Dynamic Native Token) ---
const getPrices = async (tokenSymbols = [], nativeSymbol = 'ETH') => {
    let prices = {};
    let nativePrice = 0;
    try {
        // 1. Get Native Price (ETH, BNB, or MATIC)
        const nativeRes = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=${nativeSymbol}&tsyms=USD`);
        nativePrice = nativeRes.data.USD || 0;

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
    return { native: nativePrice, tokens: prices };
};

// --- Helper: Get Historical Price ---
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
    } catch (error) { return 0; }
};

// --- Helper: FIFO Engine ---
const calculateFIFO = async (transfers, walletAddress, symbol) => {
    let inventory = []; 
    let realizedPL = 0;
    const sortedTransfers = transfers.sort((a, b) => new Date(a.block_timestamp) - new Date(b.block_timestamp));

    for (const tx of sortedTransfers) {
        const decimals = parseInt(tx.token_decimals);
        const qty = parseFloat(tx.value) / (10 ** decimals);
        const txTime = Math.floor(new Date(tx.block_timestamp).getTime() / 1000);
        await sleep(50); 
        const price = await getHistoricalPrice(symbol, txTime);

        if (tx.to_address.toLowerCase() === walletAddress.toLowerCase()) {
            inventory.push({ qty, price });
        } else {
            let qtyToSell = qty;
            while (qtyToSell > 0 && inventory.length > 0) {
                let batch = inventory[0];
                if (batch.qty > qtyToSell) {
                    realizedPL += (price * qtyToSell) - (batch.price * qtyToSell);
                    batch.qty -= qtyToSell;
                    qtyToSell = 0;
                } else {
                    realizedPL += (price * batch.qty) - (batch.price * batch.qty);
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
    const chainId = req.query.chain || '0x1'; // Default ETH

    try {
        const response = await Moralis.EvmApi.transaction.getWalletTransactions({
            address,
            chain: chainId,
            limit: 20
        });

        const rawTransactions = response.toJSON().result;
        
        const cleanedTransactions = rawTransactions.map(tx => ({
            hash: tx.hash,
            timeStamp: new Date(tx.block_timestamp).getTime(),
            from: tx.from_address,
            to: tx.to_address,
            value: tx.value,
            gasPrice: tx.gas_price,
            gasUsed: tx.gas_used,
            isError: tx.receipt_status === "1" ? "0" : "1",
            walletAddress: address.toLowerCase()
        }));

        res.json({ message: "Success", count: cleanedTransactions.length, transactions: cleanedTransactions });
    } catch (error) { 
        console.error("Tx Sync Error:", error.message);
        res.status(500).json({ error: "Failed to sync transactions" }); 
    }
};


// =========================================================
// 2. Get Wallet Stats (Gas Fix + Index Fix)
// =========================================================
exports.getWalletStats = async (req, res) => {
    const { address } = req.params;
    const chainId = req.query.chain || '0x1';
    const cleanAddress = address.toLowerCase();
    const currentChain = CHAIN_CONFIG[chainId] || CHAIN_CONFIG['0x1'];
    const apiKey = process.env.ETHERSCAN_API_KEY; // Note: Use specific keys for BSC/Polygon if you have them
    
    // 1. CACHE CHECK
    try {
        const cachedData = await WalletCache.findOne({ address: cleanAddress, chain: chainId });
        
        if (cachedData) {
            // Auto-delete legacy data
            if (!cachedData.chain) {
                await WalletCache.deleteOne({ _id: cachedData._id });
            } 
            else {
                const minutesSinceUpdate = (Date.now() - cachedData.lastUpdated) / 1000 / 60;
                if (minutesSinceUpdate < 5) {
                    console.log(`[CACHE HIT] Serving ${cleanAddress} on ${currentChain.name}`);
                    return res.json({
                        address: cleanAddress,
                        chain: chainId,
                        nativeSymbol: currentChain.native,
                        currentPriceUSD: cachedData.ethPrice,
                        netWorthUSD: cachedData.netWorthUSD,
                        netWorthNative: cachedData.netWorthETH, 
                        balanceUSD: cachedData.balanceUSD, 
                        totalGasPaidETH: cachedData.totalGasPaidETH, // Return Gas
                        totalGasPaidUSD: cachedData.totalGasPaidUSD, // Return Gas USD
                        spamTokenCount: cachedData.spamTokenCount,
                        tokens: cachedData.tokens,
                        cached: true 
                    });
                }
            }
        }
    } catch (err) { console.error("Cache Check Error:", err); }

    // 2. FETCH FRESH DATA
    try {
        console.log(`[CACHE MISS] Fetching ${currentChain.name} data for ${cleanAddress}`);

        // A. Balances
        const nativeBalanceResponse = await Moralis.EvmApi.balance.getNativeBalance({ address, chain: chainId });
        const nativeBalance = Number(nativeBalanceResponse.toJSON().balance) / 1e18;

        const tokenResponse = await Moralis.EvmApi.token.getWalletTokenBalances({ address, chain: chainId, excludeSpam: false });
        const allTokens = tokenResponse.toJSON();
        
        // B. Spam Filter
        const spamTokens = allTokens.filter(t => t.possibleSpam);
        const rawValidTokens = allTokens.filter(t => !t.possibleSpam);
        const validTokens = rawValidTokens.filter(t => t.symbol && t.symbol.length < 7);
        const symbolSpamCount = rawValidTokens.length - validTokens.length;
        const totalSpamBlocked = spamTokens.length + symbolSpamCount;

        // C. Prices
        const topTokens = validTokens.slice(0, 15);
        const prices = await getPrices(topTokens.map(t => t.symbol), currentChain.native);

        // D. Values
        const tokenHoldings = topTokens.map(t => {
            const balance = parseFloat(t.balance) / (10 ** t.decimals);
            const price = prices.tokens[t.symbol] || 0;
            return { symbol: t.symbol, balance, price, valueUSD: balance * price };
        }).sort((a, b) => b.valueUSD - a.valueUSD);

        const nativeValueUSD = nativeBalance * prices.native;
        const tokenTotalUSD = tokenHoldings.reduce((acc, t) => acc + t.valueUSD, 0);

        const netWorthUSD = nativeValueUSD + tokenTotalUSD; 
        const netWorthNative = prices.native > 0 ? (netWorthUSD / prices.native) : 0;

        // --- E. FIXED GAS CALCULATION ---
        let totalGasNative = 0;
        try {
            // Use the dynamic scanUrl from CHAIN_CONFIG
            const baseUrl = currentChain.scanUrl;
            
            // Build the URL for the correct chain
            const txUrl = `${baseUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;
            
            const txRes = await axios.get(txUrl);
            if (txRes.data.result && Array.isArray(txRes.data.result)) {
                totalGasNative = txRes.data.result.reduce((acc, tx) => (tx.from.toLowerCase() === cleanAddress ? acc + (Number(tx.gasUsed)*Number(tx.gasPrice)) : acc), 0) / 1e18;
            }
        } catch (err) {
            console.log("Gas Calc Error (likely missing API key for this chain):", err.message);
            // Ignore error, default to 0 gas
        }
        // Fix: Use prices.native instead of undefined prices.eth
        const totalGasUsd = totalGasNative * prices.native; 


        // --- F. DATABASE SAVE ---
        await WalletCache.deleteMany({ address: cleanAddress, chain: chainId });

        try {
            await WalletCache.create({
                address: cleanAddress,
                chain: chainId,
                ethPrice: prices.native,
                netWorthUSD,
                netWorthETH: netWorthNative, 
                balanceUSD: nativeValueUSD, 
                totalGasPaidETH: totalGasNative, // Save Gas
                totalGasPaidUSD: totalGasUsd,    // Save Gas USD
                spamTokenCount: totalSpamBlocked,
                tokens: tokenHoldings,
                lastUpdated: Date.now()
            });
        } catch (dbError) {
            if (dbError.code === 11000) {
                console.log("⚠️ Index Conflict. Dropping old index...");
                try {
                    await WalletCache.collection.dropIndex("address_1");
                    await WalletCache.create({
                        address: cleanAddress,
                        chain: chainId,
                        ethPrice: prices.native,
                        netWorthUSD,
                        netWorthETH: netWorthNative, 
                        balanceUSD: nativeValueUSD, 
                        totalGasPaidETH: totalGasNative,
                        totalGasPaidUSD: totalGasUsd,
                        spamTokenCount: totalSpamBlocked,
                        tokens: tokenHoldings,
                        lastUpdated: Date.now()
                    });
                } catch (retryError) {}
            }
        }

        res.json({
            address: cleanAddress,
            chain: chainId,
            nativeSymbol: currentChain.native,
            currentPriceUSD: prices.native,
            balanceNative: nativeBalance,
            balanceUSD: nativeValueUSD,
            netWorthUSD,
            netWorthNative,
            totalGasPaidETH: totalGasNative, // Return Gas
            totalGasPaidUSD: totalGasUsd,    // Return Gas USD
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
// 3. Get Portfolio Performance
// =========================================================
exports.getPortfolioPerformance = async (req, res) => {
    const { address } = req.params;
    const chainId = req.query.chain || '0x1';
    const currentChain = CHAIN_CONFIG[chainId] || CHAIN_CONFIG['0x1'];

    try {
        const tokenResponse = await Moralis.EvmApi.token.getWalletTokenBalances({ address, chain: chainId, excludeSpam: true });
        const activeTokens = tokenResponse.toJSON().filter(t => t.symbol && t.symbol.length < 7).slice(0, 6); 

        const performanceData = [];
        let totalRealizedPL = 0;
        let totalUnrealizedPL = 0;
        let profitableCount = 0;

        const transfersResponse = await Moralis.EvmApi.token.getWalletTokenTransfers({ address, chain: chainId, limit: 100 });
        const allTransfers = transfersResponse.toJSON().result;

        for (const token of activeTokens) {
            const symbol = token.symbol;
            const tokenAddress = token.token_address.toLowerCase();
            const decimals = parseInt(token.decimals);
            const currentBalance = parseFloat(token.balance) / (10 ** decimals);

            const tokenTransfers = allTransfers.filter(tx => tx.address.toLowerCase() === tokenAddress);
            const { realizedPL, avgBuyPrice } = await calculateFIFO(tokenTransfers, address, symbol);
            
            const priceData = await getPrices([symbol], currentChain.native);
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