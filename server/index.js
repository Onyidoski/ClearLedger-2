// server/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Moralis = require('moralis').default; // <--- NEW: Import Moralis

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const walletRoutes = require('./routes/walletRoutes');
app.use('/api/wallet', walletRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Start Server & Moralis
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // <--- NEW: Start Moralis with your API Key
        await Moralis.start({
            apiKey: process.env.MORALIS_API_KEY // Make sure this is in your .env
        });
        console.log("Moralis Initialized");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Error starting server:", error);
    }
};

startServer();