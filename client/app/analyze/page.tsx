// client/app/analyze/page.tsx
"use client";

import { useState } from 'react';
import {
    Search, ArrowRight, Wallet, Flame, Activity, Sparkles,
    ArrowUpRight, ArrowDownLeft, Terminal, ShieldCheck, Zap, Check,
    ArrowRightCircle, AlertTriangle, CheckCircle2, ArrowLeft
} from 'lucide-react';
import { fetchTransactions, fetchStats } from '../../utils/api';
import ActivityChart from '../../components/ActivityChart';
import Navbar from '../../components/Navbar';
import SkeletonLoader from '../../components/SkeletonLoader';
import Link from 'next/link';

// --- Types ---
interface Insight { title: string; type: 'warning' | 'success' | 'info'; message: string; }
interface Token { symbol: string; balance: number; price: number; valueUSD: number; }

// Updated Interface to include spamTokenCount
interface WalletStats {
    address: string; 
    currentPriceUSD: number; 
    balanceETH: number; 
    balanceUSD: number;
    netWorthUSD: number; 
    totalGasPaidETH: number; 
    totalGasPaidUSD: number;
    spamTokenCount: number; // <--- ADDED THIS
    totalTransactions: number; 
    tokens: Token[]; 
    insights: Insight[];
}

export default function AnalyzePage() {
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<WalletStats | null>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        if (!address) return;
        setLoading(true);
        setError('');
        setStats(null);
        setTransactions([]);

        try {
            const txData = await fetchTransactions(address);
            setTransactions(Array.isArray(txData.transactions) ? txData.transactions : []);
            const statsData = await fetchStats(address);
            setStats(statsData);
        } catch (err) {
            console.error(err);
            setError('Could not verify this address. Please ensure it is a valid ETH address.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#492BFF]/30 overflow-x-hidden">

            {/* --- Background Effects --- */}
            <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            <div className="fixed top-[-20%] left-[20%] w-[800px] h-[800px] bg-[#492BFF]/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen animate-pulse-slow"></div>

            <Navbar />

            <main className="relative z-10 pt-32 pb-10 min-h-screen">

                <div className="max-w-7xl mx-auto px-6 mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold">Back to Home</span>
                    </Link>
                </div>

                {/* ================= SEARCH SECTION ================= */}
                <section className="relative max-w-4xl mx-auto px-4 md:px-6 mb-12 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-700">

                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-8 max-w-2xl mx-auto">
                        Analyze Any Wallet
                    </h1>

                    {/* SEARCH BAR */}
                    <div className="w-full relative z-20 mb-8 group">
                        <div className="absolute -inset-[2px] bg-gradient-to-r from-[#492BFF] via-[#00C2FF] to-[#492BFF] rounded-full blur-md opacity-40 group-hover:opacity-100 transition duration-500"></div>
                        <div className="relative flex items-center bg-[#000] border border-white/10 rounded-full p-2 shadow-2xl">
                            <Terminal className="ml-6 w-6 h-6 text-gray-500 group-focus-within:text-[#00C2FF] transition" />
                            <input
                                type="text"
                                placeholder="Paste an Ethereum Address (e.g. 0xd8...)"
                                className="flex-1 bg-transparent border-none text-white px-6 py-5 text-lg focus:outline-none placeholder-gray-600 font-bold tracking-wide w-full"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                            />
                            <button
                                onClick={handleAnalyze}
                                disabled={loading}
                                className="bg-white text-black hover:bg-[#E0E0E0] px-10 py-5 rounded-full font-black text-lg transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? 'SCANNING' : 'ANALYZE'}
                            </button>
                        </div>
                    </div>

                    {/* SIMPLE STATS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full opacity-80">
                        <div className="flex items-center justify-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
                            <div className="p-2 bg-[#492BFF]/20 rounded-xl text-[#492BFF]"><Zap className="w-5 h-5" /></div>
                            <div className="text-left text-sm">
                                <div className="text-white font-bold">Real-Time</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
                            <div className="p-2 bg-[#00C2FF]/20 rounded-xl text-[#00C2FF]"><ShieldCheck className="w-5 h-5" /></div>
                            <div className="text-left text-sm">
                                <div className="text-white font-bold">Safe Mode</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
                            <div className="p-2 bg-[#FFAC43]/20 rounded-xl text-[#FFAC43]"><Check className="w-5 h-5" /></div>
                            <div className="text-left text-sm">
                                <div className="text-white font-bold">Verified</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ================= RESULTS DASHBOARD ================= */}
                {error && <div className="max-w-xl mx-auto p-4 bg-red-500/10 border border-red-500/50 text-red-200 rounded-xl mb-12 text-center font-bold animate-in fade-in zoom-in duration-300">{error}</div>}
                {loading && <div className="max-w-4xl mx-auto mb-20"><SkeletonLoader /></div>}

                {!loading && stats && (
                    <div className="max-w-7xl mx-auto px-4 md:px-6 mb-20 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
                                <div className="w-3 h-3 bg-[#00C2FF] rounded-full animate-pulse"></div>
                                Live Results
                            </h2>
                            <div className="px-4 py-1 rounded-full border border-white/10 text-xs font-mono text-gray-500">
                                LATENCY: 12ms
                            </div>
                        </div>

                        {/* Updated Grid to 3 Columns */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            
                            {/* Card 1: Net Worth */}
                            <div className="relative bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-10 overflow-hidden group hover:border-[#492BFF]/50 transition-colors">
                                <div className="absolute -right-10 -top-10 w-64 h-64 bg-[#492BFF]/10 rounded-full blur-[80px] group-hover:bg-[#492BFF]/20 transition-all"></div>
                                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Wallet className="w-5 h-5 text-[#492BFF]" /> Real Net Worth
                                </h3>
                                <p className="text-5xl md:text-6xl font-black text-white tracking-tighter">
                                    ${(stats.netWorthUSD || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </p>
                            </div>

                            {/* Card 2: Gas Fees */}
                            <div className="relative bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-10 overflow-hidden group hover:border-[#FFAC43]/50 transition-colors">
                                <div className="absolute -right-10 -top-10 w-64 h-64 bg-[#FFAC43]/10 rounded-full blur-[80px] group-hover:bg-[#FFAC43]/20 transition-all"></div>
                                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Flame className="w-5 h-5 text-[#FFAC43]" /> Total Fees Spent
                                </h3>
                                <p className="text-5xl md:text-6xl font-black text-white tracking-tighter">
                                    -${(stats.totalGasPaidUSD || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </p>
                            </div>

                            {/* Card 3: NEW SPAM BLOCKED */}
                            <div className="relative bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-10 overflow-hidden group hover:border-red-500/50 transition-colors">
                                <div className="absolute -right-10 -top-10 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] group-hover:bg-red-500/20 transition-all"></div>
                                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-red-500" /> Spam Blocked
                                </h3>
                                <p className="text-5xl md:text-6xl font-black text-white tracking-tighter">
                                    {stats.spamTokenCount || 0}
                                </p>
                                <p className="text-xs text-red-400 mt-2 font-mono uppercase">
                                    Fake assets removed
                                </p>
                            </div>

                        </div>

                        <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-8 mb-8">
                            <ActivityChart transactions={transactions} />
                        </div>

                        <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] overflow-hidden">
                            {/* Terminal Style Header */}
                            <div className="p-6 border-b border-white/5 flex items-center gap-2">
                                <Terminal className="w-5 h-5 text-gray-400" />
                                <span className="font-mono text-sm text-gray-400">Recent Transactions</span>
                            </div>
                            {transactions.slice(0, 5).map((tx, idx) => (
                                <div key={idx} className="p-6 flex items-center justify-between border-b border-white/5 hover:bg-white/[0.02] transition font-mono">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${tx.to?.toLowerCase() === address.toLowerCase() ? 'bg-[#00C2FF]/10 text-[#00C2FF]' : 'bg-[#FFAC43]/10 text-[#FFAC43]'}`}>
                                            {tx.to?.toLowerCase() === address.toLowerCase() ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className="text-white font-bold">{tx.hash.substring(0, 12)}...</div>
                                            <div className="text-xs text-gray-500 mt-1">{new Date(tx.timeStamp).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-white font-bold tracking-tight">{(Number(tx.value) / 1e18).toFixed(4)} ETH</div>
                                        <div className="text-xs text-gray-600 mt-1">GWEI: {tx.gasPrice ? (Number(tx.gasPrice) / 1e9).toFixed(0) : '0'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}