const mongoose = require('mongoose');

const WalletCacheSchema = new mongoose.Schema({
    address: { type: String, required: true, lowercase: true }, // Removed 'unique: true'
    chain: { type: String, required: true, default: '0x1' },    // <--- NEW: Track the chain (0x1, 0x38, etc.)
    
    ethPrice: Number,    // Stores price of Native Asset (ETH, BNB, or MATIC)
    netWorthUSD: Number, 
    netWorthETH: Number, // Stores Native Balance (ETH/BNB/MATIC)
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

// Compound Index: Address + Chain must be unique together
WalletCacheSchema.index({ address: 1, chain: 1 }, { unique: true });

module.exports = mongoose.model('WalletCache', WalletCacheSchema);