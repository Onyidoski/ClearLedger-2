// client/app/analyze/page.tsx
"use client";

import { useState, useEffect, useRef } from 'react'; // <--- Added useRef
import {
    Search, ArrowRight, Wallet, Flame, Activity, Sparkles,
    ArrowUpRight, ArrowDownLeft, Terminal, ShieldCheck, Zap, Check,
    ArrowLeft, Download, Clock, X
} from 'lucide-react';
import { fetchTransactions, fetchStats, fetchPerformance } from '../../utils/api';
import { generateCSV } from '../../utils/csvGenerator';
import ActivityChart from '../../components/ActivityChart';
import Navbar from '../../components/Navbar';
import TokenPerformance from '../../components/TokenPerformance';
import ModernLoader from '../../components/ModernLoader';
import PerformanceSkeleton from '../../components/PerformanceSkeleton';
import Link from 'next/link';

// --- Types ---
interface Insight {
    title: string;
    type: 'warning' | 'success' | 'info';
    message: string;
}

interface Token {
    symbol: string;
    balance: number;
    price: number;
    valueUSD: number;
}

interface WalletStats {
    address: string;
    currentPriceUSD: number;
    balanceETH: number;
    balanceUSD: number;
    netWorthUSD: number;
    netWorthETH: number;
    totalGasPaidETH: number;
    totalGasPaidUSD: number;
    spamTokenCount: number;
    totalTransactions: number;
    tokens: Token[];
    insights: Insight[];
    cached?: boolean;
}

interface PerformanceData {
    symbol: string;
    name: string;
    balance: number;
    currentPrice: number;
    avgBuyPrice: number;
    currentValueUSD: number;
    unrealizedPL_USD: number;
    unrealizedPL_Percentage: number;
    realizedPL_USD: number;
    isProfitable: boolean;
}

interface RecentSearch {
    address: string;
    netWorth: number;
    timestamp: number;
}

export default function AnalyzePage() {
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);

    // --- NEW: State for the "Slow Loading" message ---
    const [isWakingUp, setIsWakingUp] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Core Data State
    const [stats, setStats] = useState<WalletStats | null>(null);
    const [transactions, setTransactions] = useState<any[]>([]);

    // Performance Engine State
    const [performance, setPerformance] = useState<PerformanceData[]>([]);
    const [performanceStats, setPerformanceStats] = useState<any>(null);
    const [loadingPerformance, setLoadingPerformance] = useState(false);

    // Recent Searches State
    const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

    const [error, setError] = useState('');

    // Load History on Mount
    useEffect(() => {
        const stored = localStorage.getItem('clearledger_recents');
        if (stored) {
            setRecentSearches(JSON.parse(stored));
        }
    }, []);

    // Helper: Add to History
    const addToHistory = (addr: string, netWorth: number) => {
        const newEntry: RecentSearch = {
            address: addr,
            netWorth: netWorth,
            timestamp: Date.now()
        };
        const updated = [newEntry, ...recentSearches.filter(s => s.address.toLowerCase() !== addr.toLowerCase())].slice(0, 4);
        setRecentSearches(updated);
        localStorage.setItem('clearledger_recents', JSON.stringify(updated));
    };

    // Helper: Remove from History
    const removeFromHistory = (e: React.MouseEvent, addr: string) => {
        e.stopPropagation();
        const updated = recentSearches.filter(s => s.address !== addr);
        setRecentSearches(updated);
        localStorage.setItem('clearledger_recents', JSON.stringify(updated));
    };

    const handleAnalyze = async (overrideAddress?: string) => {
        const targetAddress = overrideAddress || address;
        if (!targetAddress) return;

        if (overrideAddress) setAddress(overrideAddress);

        // Reset States
        setLoading(true);
        setIsWakingUp(false); // Reset message

        // --- NEW: Start a 4-second timer ---
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            setIsWakingUp(true); // Show message after 4 seconds
        }, 4000);

        setLoadingPerformance(true);
        setError('');
        setStats(null);
        setTransactions([]);
        setPerformance([]);
        setPerformanceStats(null);

        try {
            // 1. Fetch Fast Data
            const [txData, statsData] = await Promise.all([
                fetchTransactions(targetAddress),
                fetchStats(targetAddress)
            ]);

            setTransactions(Array.isArray(txData.transactions) ? txData.transactions : []);
            setStats(statsData);
            setLoading(false); // Stop Main Loader

            // Save to Recent Searches
            if (statsData && statsData.netWorthUSD !== undefined) {
                addToHistory(targetAddress, statsData.netWorthUSD);
            }

            // 2. Fetch Performance Data (The Slow Part)
            const perfResponse = await fetchPerformance(targetAddress);
            if (perfResponse) {
                if (perfResponse.performance) setPerformance(perfResponse.performance);
                if (perfResponse.stats) setPerformanceStats(perfResponse.stats);
            }
        } catch (err) {
            console.error(err);
            setError('Could not verify this address. Please ensure it is a valid ETH address.');
            setLoading(false);
        } finally {
            // --- NEW: Clear timer when done ---
            if (timerRef.current) clearTimeout(timerRef.current);
            setIsWakingUp(false);

            setLoadingPerformance(false); // Stop Performance Loader
        }
    };

    const handleDownload = () => {
        if (transactions.length > 0) {
            generateCSV(transactions, address);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#492BFF]/30 overflow-x-hidden">

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
                                onClick={() => handleAnalyze()}
                                disabled={loading}
                                className="bg-white text-black hover:bg-[#E0E0E0] px-10 py-5 rounded-full font-black text-lg transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? 'SCANNING' : 'ANALYZE'}
                            </button>
                        </div>
                    </div>
                    {recentSearches.length > 0 && (
                        <div className="w-full mb-8">
                            <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest mb-3 pl-2">
                                <Clock className="w-3 h-3" /> Recent Searches
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                {recentSearches.map((item, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => handleAnalyze(item.address)}
                                        className="bg-white/[0.03] border border-white/5 hover:border-[#492BFF]/50 hover:bg-white/[0.05] rounded-xl p-3 cursor-pointer transition group relative text-left"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="font-mono text-sm text-gray-300 group-hover:text-white truncate max-w-[80%]">
                                                {item.address.substring(0, 6)}...{item.address.substring(38)}
                                            </div>
                                            <button
                                                onClick={(e) => removeFromHistory(e, item.address)}
                                                className="text-gray-600 hover:text-red-500 transition"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <div className="text-[#00C2FF] font-bold text-xs">
                                            ${item.netWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {!loading && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full opacity-80">
                            <div className="flex items-center justify-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm"><div className="p-2 bg-[#492BFF]/20 rounded-xl text-[#492BFF]"><Zap className="w-5 h-5" /></div><div className="text-left text-sm"><div className="text-white font-bold">Real-Time</div></div></div>
                            <div className="flex items-center justify-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm"><div className="p-2 bg-[#00C2FF]/20 rounded-xl text-[#00C2FF]"><ShieldCheck className="w-5 h-5" /></div><div className="text-left text-sm"><div className="text-white font-bold">Safe Mode</div></div></div>
                            <div className="flex items-center justify-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm"><div className="p-2 bg-[#FFAC43]/20 rounded-xl text-[#FFAC43]"><Check className="w-5 h-5" /></div><div className="text-left text-sm"><div className="text-white font-bold">Verified</div></div></div>
                        </div>
                    )}
                </section>

                {/* ================= RESULTS DASHBOARD ================= */}
                {error && <div className="max-w-xl mx-auto p-4 bg-red-500/10 border border-red-500/50 text-red-200 rounded-xl mb-12 text-center font-bold animate-in fade-in zoom-in duration-300">{error}</div>}

                {/* --- NEW: Loader with Wake-up Message --- */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-10">
                        <ModernLoader />

                        {isWakingUp && (
                            <div className="mt-6 text-center animate-in fade-in zoom-in duration-500 max-w-md mx-auto">
                                <p className="text-[#00C2FF] font-bold text-sm uppercase tracking-widest mb-2">
                                    Waking up the server...
                                </p>
                                <p className="text-gray-400 text-xs px-6 leading-relaxed">
                                    Since this is a free instance, the server went to sleep to save energy.
                                    This might take about 60 seconds. Thank you for your patience!
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {!loading && stats && (
                    <div className="max-w-7xl mx-auto px-4 md:px-6 mb-20 animate-in fade-in slide-in-from-bottom-12 duration-1000">

                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${stats.cached ? 'bg-green-500' : 'bg-[#00C2FF] animate-pulse'}`}></div>
                                {stats.cached ? 'Cached Results' : 'Live Results'}
                            </h2>
                            <div className="flex items-center gap-3">
                                <div className="hidden md:flex items-center gap-2 px-4 py-1 rounded-full border border-white/10 text-xs font-mono text-[#00C2FF] bg-[#00C2FF]/5">
                                    ETH: ${(stats.currentPriceUSD || 0).toLocaleString()}
                                </div>
                                <div className="px-4 py-1 rounded-full border border-white/10 text-xs font-mono text-gray-500">
                                    LATENCY: {stats.cached ? '0ms (DB)' : '142ms (API)'}
                                </div>
                            </div>
                        </div>

                        {/* Top Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="relative bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-10 overflow-hidden group hover:border-[#492BFF]/50 transition-colors">
                                <div className="absolute -right-10 -top-10 w-64 h-64 bg-[#492BFF]/10 rounded-full blur-[80px] group-hover:bg-[#492BFF]/20 transition-all"></div>
                                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Wallet className="w-5 h-5 text-[#492BFF]" /> Total Net Worth
                                </h3>
                                <p className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight whitespace-nowrap mb-6">
                                    ${(stats.netWorthUSD || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </p>
                                <div className="pt-6 border-t border-white/10 flex items-start gap-8">
                                    <div>
                                        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest block mb-1">Liquid ETH</span>
                                        <span className="text-[#00C2FF] font-black text-2xl tracking-tight">
                                            ${(stats.balanceUSD || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                    <div className="w-px h-10 bg-white/10 self-center"></div>
                                    <div>
                                        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest block mb-1">Tokens</span>
                                        <span className="text-white font-black text-2xl tracking-tight">
                                            ${((stats.netWorthUSD || 0) - (stats.balanceUSD || 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="relative bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-10 overflow-hidden group hover:border-[#FFAC43]/50 transition-colors">
                                <div className="absolute -right-10 -top-10 w-64 h-64 bg-[#FFAC43]/10 rounded-full blur-[80px] group-hover:bg-[#FFAC43]/20 transition-all"></div>
                                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Flame className="w-5 h-5 text-[#FFAC43]" /> Total Fees Spent
                                </h3>
                                <p className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-tight whitespace-nowrap">
                                    -${(stats.totalGasPaidUSD || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </p>
                                <p className="text-sm text-gray-400 mt-2 font-mono flex items-center gap-1">
                                    <span className="text-[#FFAC43]">♦</span> {stats.totalGasPaidETH.toFixed(4)} ETH
                                </p>
                            </div>
                            <div className="relative bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-10 overflow-hidden group hover:border-red-500/50 transition-colors">
                                <div className="absolute -right-10 -top-10 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] group-hover:bg-red-500/20 transition-all"></div>
                                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-red-500" /> Spam Blocked
                                </h3>
                                <p className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                                    {stats.spamTokenCount || 0}
                                </p>
                                <p className="text-xs text-red-400 mt-2 font-mono uppercase">
                                    Fake assets removed
                                </p>
                            </div>
                        </div>

                        {/* P/L PERFORMANCE ENGINE OR SKELETON */}
                        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                            {loadingPerformance ? (
                                <PerformanceSkeleton />
                            ) : (
                                <TokenPerformance
                                    data={performance}
                                    stats={performanceStats}
                                    isLoading={false}
                                />
                            )}
                        </div>

                        {/* Charts & History Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-8 h-full">
                                <ActivityChart transactions={transactions} />
                            </div>
                            <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] overflow-hidden h-full flex flex-col">
                                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Terminal className="w-5 h-5 text-gray-400" />
                                        <span className="font-mono text-sm text-gray-400">Recent Transactions</span>
                                    </div>
                                    <button
                                        onClick={handleDownload}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-colors group"
                                        title="Export as CSV"
                                    >
                                        <Download className="w-3 h-3 group-hover:text-[#492BFF] transition-colors" />
                                        CSV
                                    </button>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto custom-scrollbar flex-1">
                                    {transactions.slice(0, 10).map((tx, idx) => (
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
                        </div>

                    </div>
                )}

            </main>
        </div>
    );
}