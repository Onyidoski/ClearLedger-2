// server/models/WalletCache.js
const mongoose = require('mongoose');

const WalletCacheSchema = new mongoose.Schema({
    address: { type: String, required: true, unique: true, lowercase: true },
    
    ethPrice: Number,    // <--- NEW: Store the price of ETH
    netWorthUSD: Number, 
    netWorthETH: Number,
    balanceUSD: Number,  
    
    totalGasPaidETH: Number,
    totalGasPaidUSD: Number,
    spamTokenCount: Number,
    tokens: [{
        symbol: String,
        balance: Number,
        price: Number,
        valueUSD: Number
    }],
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WalletCache', WalletCacheSchema);