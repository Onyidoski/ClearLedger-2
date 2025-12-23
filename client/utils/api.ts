// client/utils/api.ts
import axios from 'axios';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'; 

export const fetchStats = async (address: string) => {
    const response = await axios.get(`${API_BASE_URL}/wallet/stats/${address}`);
    return response.data;
};

export const fetchTransactions = async (address: string) => {
    const response = await axios.get(`${API_BASE_URL}/wallet/transactions/${address}`);
    return response.data;
};

// --- NEW FUNCTION ---
export const fetchPerformance = async (address: string) => {
    const response = await axios.get(`${API_BASE_URL}/wallet/performance/${address}`);
    return response.data;
};