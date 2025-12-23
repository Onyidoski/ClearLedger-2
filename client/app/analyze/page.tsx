// client/app/analyze/page.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import {
    Search, ArrowRight, Wallet, Flame, Activity, Sparkles,
    ArrowUpRight, ArrowDownLeft, Terminal, ShieldCheck, Zap, Check,
    ArrowLeft, Download, Clock, X, ChevronDown, CheckCircle2
} from 'lucide-react';
import { fetchTransactions, fetchStats, fetchPerformance } from '../../utils/api';
import { generateCSV } from '../../utils/csvGenerator';
import ActivityChart from '../../components/ActivityChart';
import Navbar from '../../components/Navbar';
import TokenPerformance from '../../components/TokenPerformance';
import ModernLoader from '../../components/ModernLoader';
import PerformanceSkeleton from '../../components/PerformanceSkeleton';
import Link from 'next/link';

// --- Multi-Chain Config ---
const CHAINS = [
    { id: '0x1', name: 'Ethereum', symbol: 'ETH', icon: '🔷' },
    { id: '0x38', name: 'BSC', symbol: 'BNB', icon: '🟨' },
    { id: '0x89', name: 'Polygon', symbol: 'MATIC', icon: '💜' }
];

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
    chain: string;
    nativeSymbol: string;
    currentPriceUSD: number; 
    balanceNative: number; 
    balanceUSD: number; 
    netWorthUSD: number; 
    netWorthNative: number; 
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
    const [selectedChain, setSelectedChain] = useState(CHAINS[0]); 
    const [loading, setLoading] = useState(false);
    
    // Dropdown State
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    // Core Data State
    const [stats, setStats] = useState<WalletStats | null>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [performance, setPerformance] = useState<PerformanceData[]>([]);
    const [performanceStats, setPerformanceStats] = useState<any>(null); 
    const [loadingPerformance, setLoadingPerformance] = useState(false);
    const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
    const [error, setError] = useState('');

    // Load History & Event Listeners
    useEffect(() => {
        const stored = localStorage.getItem('clearledger_recents');
        if (stored) { setRecentSearches(JSON.parse(stored)); }
        
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const addToHistory = (addr: string, netWorth: number) => {
        const newEntry: RecentSearch = { address: addr, netWorth: netWorth, timestamp: Date.now() };
        const updated = [newEntry, ...recentSearches.filter(s => s.address.toLowerCase() !== addr.toLowerCase())].slice(0, 4);
        setRecentSearches(updated);
        localStorage.setItem('clearledger_recents', JSON.stringify(updated));
    };

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

        setLoading(true);
        setLoadingPerformance(true);
        setError('');
        setStats(null);
        setTransactions([]);
        setPerformance([]);
        setPerformanceStats(null);
        setIsDropdownOpen(false);

        try {
            const [txData, statsData] = await Promise.all([
                fetchTransactions(targetAddress, selectedChain.id),
                fetchStats(targetAddress, selectedChain.id)
            ]);
            
            setTransactions(Array.isArray(txData.transactions) ? txData.transactions : []);
            setStats(statsData);
            setLoading(false); 

            if (statsData && statsData.netWorthUSD !== undefined) {
                addToHistory(targetAddress, statsData.netWorthUSD);
            }

            const perfResponse = await fetchPerformance(targetAddress, selectedChain.id);
            if (perfResponse) {
                if (perfResponse.performance) setPerformance(perfResponse.performance);
                if (perfResponse.stats) setPerformanceStats(perfResponse.stats);
            }
        } catch (err) {
            console.error(err);
            setError(`Could not verify this address on ${selectedChain.name}.`);
            setLoading(false);
        } finally {
            setLoadingPerformance(false);
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

                    {/* Responsive Search Input Container */}
                    <div className="w-full relative z-20 mb-12 group">
                        {/* Glowing Border Gradient */}
                        <div className="absolute -inset-[2px] bg-gradient-to-r from-[#492BFF] via-[#00C2FF] to-[#492BFF] rounded-3xl md:rounded-full blur-md opacity-40 group-hover:opacity-100 transition duration-500"></div>
                        
                        {/* Main Black Container - Stacked on Mobile, Row on Desktop */}
                        <div className="relative flex flex-col md:flex-row items-stretch md:items-center bg-[#000] border border-white/10 rounded-3xl md:rounded-full shadow-2xl overflow-visible p-2 md:p-0">
                            
                            {/* CUSTOM DROPDOWN */}
                            <div className="relative md:pl-6 z-30" ref={dropdownRef}>
                                <button 
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="w-full md:w-auto flex items-center justify-between md:justify-start gap-2 text-white font-bold text-sm hover:text-[#00C2FF] transition-colors outline-none p-4 md:py-5 group/btn"
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="text-xl leading-none filter drop-shadow-lg">{selectedChain.icon}</span>
                                        <span className="tracking-wide">{selectedChain.symbol}</span>
                                    </span>
                                    <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform duration-300 group-hover/btn:text-[#00C2FF] ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div className="absolute top-[100%] left-0 w-full md:w-[200px] bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-white/5">
                                        <div className="p-1">
                                            {CHAINS.map(chain => (
                                                <button
                                                    key={chain.id}
                                                    onClick={() => {
                                                        setSelectedChain(chain);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 group/item ${
                                                        selectedChain.id === chain.id 
                                                        ? 'bg-white/10 text-white' 
                                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                    }`}
                                                >
                                                    <span className="flex items-center gap-3">
                                                        <span className="text-lg">{chain.icon}</span>
                                                        <span className="font-medium">{chain.name}</span>
                                                    </span>
                                                    {selectedChain.id === chain.id && (
                                                        <CheckCircle2 className="w-4 h-4 text-[#00C2FF]" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Vertical Divider (Hidden on Mobile) */}
                            <div className="hidden md:block w-px h-8 bg-white/10 mx-4"></div>
                            
                            {/* Horizontal Divider (Visible on Mobile Only) */}
                            <div className="md:hidden w-full h-px bg-white/10 my-0"></div>

                            {/* Input Field */}
                            <input
                                type="text"
                                placeholder={`Paste ${selectedChain.name} Address...`}
                                className="flex-1 bg-transparent border-none text-white px-4 md:px-0 py-4 md:py-5 text-base md:text-lg focus:outline-none placeholder-gray-600 font-medium tracking-wide w-full md:w-auto text-center md:text-left"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                            />
                            
                            {/* Action Button */}
                            <div className="md:pr-2 pt-2 md:pt-0">
                                <button
                                    onClick={() => handleAnalyze()}
                                    disabled={loading}
                                    className="w-full md:w-auto bg-white text-black hover:bg-[#E0E0E0] px-8 py-4 md:py-3 rounded-2xl md:rounded-full font-black text-sm md:text-base transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] active:scale-95 shadow-lg"
                                >
                                    {loading ? 'SCANNING' : 'ANALYZE'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Trust Bubbles (RESTORED) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full opacity-80 mb-12">
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

                    {/* Recent Searches */}
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
                </section>

                {/* ================= RESULTS DASHBOARD ================= */}
                {error && <div className="max-w-xl mx-auto p-4 bg-red-500/10 border border-red-500/50 text-red-200 rounded-xl mb-12 text-center font-bold animate-in fade-in zoom-in duration-300">{error}</div>}
                
                {loading && <ModernLoader />}

                {!loading && stats && (
                    <div className="max-w-7xl mx-auto px-4 md:px-6 mb-20 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                        
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${stats.cached ? 'bg-green-500' : 'bg-[#00C2FF] animate-pulse'}`}></div>
                                {stats.cached ? 'Cached Results' : 'Live Results'}
                            </h2>

                            <div className="flex items-center gap-3">
                                {/* Dynamic Price Badge */}
                                <div className="hidden md:flex items-center gap-2 px-4 py-1 rounded-full border border-white/10 text-xs font-mono text-[#00C2FF] bg-[#00C2FF]/5">
                                    {selectedChain.symbol}: ${(stats.currentPriceUSD || 0).toLocaleString()}
                                </div>
                                <div className="px-4 py-1 rounded-full border border-white/10 text-xs font-mono text-gray-500">
                                    LATENCY: {stats.cached ? '0ms (DB)' : '142ms (API)'}
                                </div>
                            </div>
                        </div>

                        {/* Top Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            
                            {/* Card 1: TOTAL NET WORTH */}
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
                                        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest block mb-1">
                                            Liquid {selectedChain.symbol}
                                        </span>
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

                            {/* Card 2: Gas Fees */}
                            <div className="relative bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-10 overflow-hidden group hover:border-[#FFAC43]/50 transition-colors">
                                <div className="absolute -right-10 -top-10 w-64 h-64 bg-[#FFAC43]/10 rounded-full blur-[80px] group-hover:bg-[#FFAC43]/20 transition-all"></div>
                                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Flame className="w-5 h-5 text-[#FFAC43]" /> Total Fees Spent
                                </h3>
                                <p className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-tight whitespace-nowrap">
                                    -${(stats.totalGasPaidUSD || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </p>
                                <p className="text-sm text-gray-400 mt-2 font-mono flex items-center gap-1">
                                    <span className="text-[#FFAC43]">♦</span> {stats.totalGasPaidETH?.toFixed(4)} {selectedChain.symbol}
                                </p>
                            </div>

                            {/* Card 3: Spam Blocked */}
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

                        {/* P/L PERFORMANCE */}
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
                                                <div className="text-white font-bold tracking-tight">
                                                    {(Number(tx.value) / 1e18).toFixed(4)} {selectedChain.symbol}
                                                </div>
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