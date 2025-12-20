"use client";

import { useState } from 'react';
import { Search, ArrowRight, Wallet, Flame, Activity, Sparkles, Coins } from 'lucide-react';
import { fetchTransactions, fetchStats } from '../utils/api';
import ActivityChart from '../components/ActivityChart';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SkeletonLoader from '../components/SkeletonLoader';

// Interfaces
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
  netWorthUSD: number; // NEW
  totalGasPaidETH: number;
  totalGasPaidUSD: number;
  totalTransactions: number;
  tokens: Token[]; // NEW
  insights: Insight[];
}

export default function Home() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]); 
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleAnalyze = async () => {
    if (!address) return;
    setLoading(true);
    setError('');
    setStats(null);
    setTransactions([]);
    setHasSearched(true);
    
    try {
      const txData = await fetchTransactions(address);
      const safeTransactions = Array.isArray(txData.transactions) ? txData.transactions : [];
      setTransactions(safeTransactions); 

      const statsData = await fetchStats(address);
      setStats(statsData);

    } catch (err) {
      console.error(err);
      setError('Failed to fetch data. Check the address or try again.');
    } finally {
      setLoading(false);
    }
  };

  // Styles
  const cardBaseStyle = "relative overflow-hidden bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_0_20px_rgba(139,92,246,0.1)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] hover:border-white/20";
  const glowAccent = "absolute -top-20 -right-20 w-40 h-40 bg-purple-600/30 rounded-full blur-3xl pointer-events-none opacity-50 mix-blend-screen";

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30 overflow-hidden relative">
      
      {/* Background Atmosphere */}
      <div className="fixed top-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>
      <div className="fixed bottom-[10%] right-[10%] w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen"></div>

      <Navbar />

      <main className="relative max-w-7xl mx-auto px-6 pt-32 pb-20 z-10">
        
        {/* Hero Section */}
        <div className={`flex flex-col items-center justify-center transition-all duration-700 ${!hasSearched ? 'min-h-[60vh]' : 'mb-16'}`}>
          <div className="mb-6 p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.3)] animate-pulse">
             <Sparkles className="w-6 h-6 text-purple-300" />
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-center leading-tight">
            Analyze any wallet's <br />
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              crypto portfolio
            </span>
          </h1>
          
          <p className="text-lg text-gray-400 mb-10 text-center max-w-2xl leading-relaxed">
            Track Net Worth (ETH + Tokens), Gas Fees, and activity history with professional-grade analytics.
          </p>

          <div className="relative w-full max-w-3xl group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative flex items-center bg-[#0A0A0A] border border-white/10 rounded-full p-2 shadow-2xl transition-all duration-300 group-focus-within:border-purple-500/50">
              <Search className="ml-6 w-6 h-6 text-gray-500 group-focus-within:text-purple-400 transition" />
              <input 
                type="text" 
                placeholder="Paste Ethereum Address (0x...)" 
                className="flex-1 bg-transparent border-none text-white px-4 py-4 text-lg focus:outline-none placeholder-gray-600 font-medium"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              />
              <button 
                onClick={handleAnalyze}
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-10 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-3"
              >
                {loading ? 'Analyzing...' : 'Analyze'} 
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto p-4 bg-red-900/20 border border-red-500/30 backdrop-blur text-red-200 rounded-xl mb-12 text-center">
            {error}
          </div>
        )}

        {loading && (
          <div className="max-w-5xl mx-auto mt-20">
            <SkeletonLoader />
          </div>
        )}

        {/* RESULTS DASHBOARD */}
        {!loading && stats && (
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 mt-20">
            
            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              
              {/* Total Net Worth Card (Includes Tokens) */}
              <div className={cardBaseStyle}>
                <div className={glowAccent}></div>
                <div className="relative z-10">
                    <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-purple-400" /> Total Net Worth
                    </h3>
                    <p className="text-5xl font-extrabold text-white tracking-tight">
                    ${(stats.netWorthUSD || stats.balanceUSD || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                    <div className="mt-4 flex gap-3">
                         <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-purple-200 font-medium">
                            {(stats.balanceETH || 0).toFixed(4)} ETH
                         </span>
                         {stats.tokens.length > 0 && (
                             <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-sm text-blue-200 font-medium">
                                + {stats.tokens.length} Assets
                             </span>
                         )}
                    </div>
                </div>
              </div>

              {/* Gas Card */}
              <div className={cardBaseStyle}>
                <div className={`absolute -top-20 -left-20 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl pointer-events-none opacity-50 mix-blend-screen`}></div>
                <div className="relative z-10">
                    <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Flame className="w-4 h-4 text-blue-400" /> Fees Burned
                    </h3>
                    <p className="text-5xl font-extrabold text-white tracking-tight">
                    -${(stats.totalGasPaidUSD || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                    <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-blue-200 font-medium">
                    {(stats.totalGasPaidETH || 0).toFixed(4)} ETH Total
                    </div>
                </div>
              </div>
            </div>

            {/* NEW: Portfolio Assets Section */}
            {stats.tokens && stats.tokens.length > 0 && (
                <div className="mb-12">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                       <Coins className="w-6 h-6 text-yellow-400" />
                       Portfolio Assets
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stats.tokens.map((token, idx) => (
                             <div key={idx} className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-4 flex justify-between items-center hover:bg-white/5 transition">
                                 <div>
                                     <p className="font-bold text-lg text-white">{token.symbol}</p>
                                     <p className="text-sm text-gray-500">{token.balance.toLocaleString()} tokens</p>
                                 </div>
                                 <div className="text-right">
                                     <p className="font-bold text-white">${token.valueUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                     <p className="text-xs text-gray-500">@ ${token.price.toFixed(2)}</p>
                                 </div>
                             </div>
                        ))}
                    </div>
                </div>
            )}
              
            {/* Activity Summary & Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                       <Activity className="w-6 h-6 text-purple-400" />
                       Activity Volume
                    </h3>
                    <div className={`${cardBaseStyle} !p-6`}>
                         <ActivityChart transactions={transactions} />
                    </div>
                </div>

                {/* Insights Section */}
                <div className="lg:col-span-1">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-blue-400" />
                    Wallet Insights
                  </h3>
                  <div className="flex flex-col gap-4">
                    {stats.insights && stats.insights.length > 0 ? (
                        stats.insights.map((insight, index) => (
                        <div key={index} className={`relative overflow-hidden p-6 rounded-3xl border backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${
                            insight.type === 'warning' ? 'bg-orange-900/20 border-orange-500/30 hover:shadow-[0_0_20px_rgba(249,115,22,0.2)]' :
                            insight.type === 'success' ? 'bg-green-900/20 border-green-500/30 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]' :
                            'bg-blue-900/20 border-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                        }`}>
                            <h4 className={`font-bold mb-2 text-lg flex items-center gap-2 ${
                                insight.type === 'warning' ? 'text-orange-300' : insight.type === 'success' ? 'text-green-300' : 'text-blue-300'
                            }`}>
                                {insight.title}
                            </h4>
                            <p className="text-sm text-gray-300 leading-relaxed font-medium relative z-10">{insight.message}</p>
                        </div>
                        ))
                    ) : (
                        <div className={`${cardBaseStyle} text-gray-500 text-center py-8`}>
                            No specific insights found.
                        </div>
                    )}
                  </div>
                </div>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}