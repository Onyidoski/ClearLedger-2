// client/utils/api.ts
import axios from 'axios';

// Point to your backend URL
const API_URL = 'http://localhost:5000/api/wallet';

// Fix: Add ': string' to the address parameter
export const fetchTransactions = async (address: string) => {
    try {
        const response = await axios.get(`${API_URL}/${address}`);
        return response.data;
    } catch (error) {
        console.error("API Error (Transactions):", error);
        throw error;
    }
};

// Fix: Add ': string' to the address parameter
export const fetchStats = async (address: string) => {
    try {
        const response = await axios.get(`${API_URL}/${address}/stats`);
        return response.data;
    } catch (error) {
        console.error("API Error (Stats):", error);
        throw error;
    }
};