// client/utils/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/wallet';

// --- Updated to accept Chain ID ---
export const fetchStats = async (address: string, chain = '0x1') => {
    try {
        const response = await axios.get(`${API_BASE_URL}/stats/${address}?chain=${chain}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching stats:", error);
        return null;
    }
};

export const fetchTransactions = async (address: string, chain = '0x1') => {
    try {
        const response = await axios.get(`${API_BASE_URL}/transactions/${address}?chain=${chain}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return { transactions: [] };
    }
};

export const fetchPerformance = async (address: string, chain = '0x1') => {
    try {
        const response = await axios.get(`${API_BASE_URL}/performance/${address}?chain=${chain}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching performance:", error);
        return null;
    }
};