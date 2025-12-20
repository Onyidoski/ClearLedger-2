// server/models/Transaction.js
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    hash: { type: String, required: true, unique: true }, // The ID of the transaction
    walletAddress: { type: String, required: true, index: true }, // Who owns this history?
    blockNumber: String,
    timeStamp: Date,
    from: String,
    to: String,
    value: String, // Stored as string to prevent precision loss (Wei)
    gasUsed: String,
    gasPrice: String,
    tokenName: String,
    tokenSymbol: String,
    isError: String,
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);