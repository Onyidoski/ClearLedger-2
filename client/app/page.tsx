"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  // Combined Icon Imports
  Clock, Quote, Search, ArrowRight, Wallet, Flame, Activity, Sparkles, 
  ArrowUpRight, ArrowDownLeft, Terminal, ShieldCheck, Zap, Globe, 
  ChevronDown, Check, Star, AlertTriangle, User, CheckCircle2, 
  ArrowRightCircle, BarChart3, Lock, Cpu, XCircle
} from 'lucide-react';
import { fetchTransactions, fetchStats } from '../utils/api';
import ActivityChart from '../components/ActivityChart';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SkeletonLoader from '../components/SkeletonLoader';

// --- Types ---
interface Insight { title: string; type: 'warning' | 'success' | 'info'; message: string; }
interface Token { symbol: string; balance: number; price: number; valueUSD: number; }
interface WalletStats {
  address: string; currentPriceUSD: number; balanceETH: number; balanceUSD: number;
  netWorthUSD: number; totalGasPaidETH: number; totalGasPaidUSD: number;
  totalTransactions: number; tokens: Token[]; insights: Insight[];
}

// --- Helper Hook for Scroll Animations ---
function useOnScreen(ref: any) {
  const [isIntersecting, setIntersecting] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIntersecting(entry.isIntersecting), { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, [ref]);
  return isIntersecting;
}

// --- Component: FadeInSection (Gravity Effect) ---
const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
  const ref = useRef(null);
  const isVisible = useOnScreen(ref);
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out transform ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

export default function Home() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]); 
  const [error, setError] = useState('');
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

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

  // --- Design Tokens ---
  const heroGradient = "bg-clip-text text-transparent bg-gradient-to-r from-[#492BFF] via-[#00C2FF] to-[#FFAC43] animate-gradient bg-[length:200%_auto]";
  const gravityBtn = "relative bg-white text-black font-bold px-10 py-5 rounded-full hover:bg-[#F2F2F2] transition-all transform hover:-translate-y-1 active:translate-y-0 shadow-[0_10px_30px_rgba(255,255,255,0.1)]";

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#492BFF]/30 overflow-x-hidden">
      
      {/* --- Background Effects --- */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      <div className="fixed top-[-20%] left-[20%] w-[800px] h-[800px] bg-[#492BFF]/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen animate-pulse-slow"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#00C2FF]/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>

      <Navbar />

      <main className="relative z-10 pt-32 pb-10">
        
        {/* ================= HERO SECTION ================= */}
        <section className="relative max-w-7xl mx-auto px-4 md:px-6 mb-24 flex flex-col items-center text-center">
            
            <div className="mb-10 inline-flex items-center gap-3 px-5 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md hover:bg-white/10 transition cursor-pointer">
               <Star className="w-4 h-4 text-[#FFAC43] fill-[#FFAC43]" />
               <span className="text-sm font-bold tracking-wide uppercase text-gray-200">New: Anti-Spam V2 Live</span>
               <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-8 leading-[0.95] max-w-6xl mx-auto">
              SEE INSIDE ANY <br />
              <span className={heroGradient}>CRYPTO WALLET</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed font-normal">
              Instantly track Net Worth, audit transaction history, and calculate gas fees for any address. No wallet connection required.
            </p>

            {/* SEARCH BAR */}
            <div className="w-full max-w-3xl relative z-20 mb-16 group">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto opacity-80">
                <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
                    <div className="p-3 bg-[#492BFF]/20 rounded-xl text-[#492BFF]"><Zap className="w-6 h-6"/></div>
                    <div className="text-left">
                        <div className="text-white font-bold text-lg">Real-Time</div>
                        <div className="text-xs text-gray-500 uppercase tracking-widest">Mempool Sync</div>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
                    <div className="p-3 bg-[#00C2FF]/20 rounded-xl text-[#00C2FF]"><ShieldCheck className="w-6 h-6"/></div>
                    <div className="text-left">
                        <div className="text-white font-bold text-lg">Safe Mode</div>
                        <div className="text-xs text-gray-500 uppercase tracking-widest">Read-Only</div>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
                    <div className="p-3 bg-[#FFAC43]/20 rounded-xl text-[#FFAC43]"><Check className="w-6 h-6"/></div>
                    <div className="text-left">
                        <div className="text-white font-bold text-lg">Verified</div>
                        <div className="text-xs text-gray-500 uppercase tracking-widest">Data Source</div>
                    </div>
                </div>
            </div>
        </section>

        {/* ================= LIVE DASHBOARD ================= */}
        {error && <div className="max-w-xl mx-auto p-4 bg-red-500/10 border border-red-500/50 text-red-200 rounded-xl mb-12 text-center font-bold">{error}</div>}
        {loading && <div className="max-w-4xl mx-auto mb-20"><SkeletonLoader /></div>}

        {!loading && stats && (
          <div className="max-w-7xl mx-auto px-4 md:px-6 mb-40 animate-in fade-in slide-in-from-bottom-12 duration-1000">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
                    <div className="w-3 h-3 bg-[#00C2FF] rounded-full animate-pulse"></div>
                    Live Results
                </h2>
                <div className="px-4 py-1 rounded-full border border-white/10 text-xs font-mono text-gray-500">
                    LATENCY: 12ms
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="relative bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-10 overflow-hidden group hover:border-[#492BFF]/50 transition-colors">
                   <div className="absolute -right-10 -top-10 w-64 h-64 bg-[#492BFF]/10 rounded-full blur-[80px] group-hover:bg-[#492BFF]/20 transition-all"></div>
                   <h3 className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-[#492BFF]" /> Real Net Worth
                   </h3>
                   <p className="text-6xl md:text-7xl font-black text-white tracking-tighter">
                   ${(stats.netWorthUSD || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                   </p>
                </div>

                <div className="relative bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-10 overflow-hidden group hover:border-[#FFAC43]/50 transition-colors">
                   <div className="absolute -right-10 -top-10 w-64 h-64 bg-[#FFAC43]/10 rounded-full blur-[80px] group-hover:bg-[#FFAC43]/20 transition-all"></div>
                   <h3 className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Flame className="w-5 h-5 text-[#FFAC43]" /> Total Fees Spent
                   </h3>
                   <p className="text-6xl md:text-7xl font-black text-white tracking-tighter">
                   -${(stats.totalGasPaidUSD || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                   </p>
                </div>
              </div>

              <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-8 mb-8">
                  <ActivityChart transactions={transactions} />
              </div>

              <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] overflow-hidden">
                 {/* Terminal Style Header from Code 2 */}
                 <div className="p-6 border-b border-white/5 flex items-center gap-2">
                     <Terminal className="w-5 h-5 text-gray-400" />
                     <span className="font-mono text-sm text-gray-400">root@clearledger:~# tail -f transactions</span>
                 </div>
                 {transactions.slice(0, 5).map((tx, idx) => (
                    <div key={idx} className="p-6 flex items-center justify-between border-b border-white/5 hover:bg-white/[0.02] transition font-mono">
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${tx.to?.toLowerCase() === address.toLowerCase() ? 'bg-[#00C2FF]/10 text-[#00C2FF]' : 'bg-[#FFAC43]/10 text-[#FFAC43]'}`}>
                                {tx.to?.toLowerCase() === address.toLowerCase() ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                            </div>
                            <div>
                                <div className="text-white font-bold">{tx.hash.substring(0,12)}...</div>
                                <div className="text-xs text-gray-500 mt-1">{new Date(tx.timeStamp).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <div className="text-right">
                             <div className="text-white font-bold tracking-tight">{(Number(tx.value)/1e18).toFixed(4)} ETH</div>
                             <div className="text-xs text-gray-600 mt-1">GWEI: {tx.gasPrice ? (Number(tx.gasPrice)/1e9).toFixed(0) : '0'}</div>
                        </div>
                    </div>
                 ))}
              </div>
          </div>
        )}

        {/* ================= THE PROBLEM (Before/After) ================= */}
        <section className="py-32 relative border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6">
                <FadeIn>
                    <div className="text-center mb-20">
                        <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">Crypto Wallets Are <span className="text-[#FFAC43]">Messy.</span></h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Regular explorers show you everything, including fake "junk" tokens that make your wallet look worth millions when it's not. We fix that.
                        </p>
                    </div>
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* BEFORE */}
                    <FadeIn delay={100}>
                        <div className="relative rounded-[2.5rem] bg-[#0A0A0A] border border-red-500/30 p-8 overflow-hidden opacity-80 grayscale-[50%] hover:grayscale-0 transition-all duration-500">
                            <div className="absolute inset-0 bg-red-500/5 pointer-events-none"></div>
                            <div className="text-center mb-8 relative z-10">
                                <h3 className="text-red-400 font-bold uppercase tracking-widest mb-2">Before: Standard Explorer</h3>
                                <div className="text-4xl font-black text-white line-through decoration-red-500">$1,450,200.00</div>
                                <div className="text-red-400 text-sm font-bold mt-2">(Inflated by fake coins)</div>
                            </div>
                            <div className="space-y-3 relative z-10">
                                <div className="flex items-center justify-between p-4 bg-red-950/30 rounded-2xl border border-red-500/20">
                                    <div className="flex items-center gap-3"><AlertTriangle className="text-red-400 w-5 h-5"/><span className="font-bold text-red-300">NIKO Scam Token</span></div>
                                    <div className="text-red-300 font-bold">$1.4M+</div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-red-950/30 rounded-2xl border border-red-500/20 opacity-50">
                                    <div className="flex items-center gap-3"><AlertTriangle className="text-red-400 w-5 h-5"/><span className="font-bold text-red-300">Fake USDT</span></div>
                                    <div className="text-red-300 font-bold">$50k</div>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                    
                    {/* AFTER */}
                    <FadeIn delay={300}>
                        <div className="relative rounded-[2.5rem] bg-[#0D0D0D] border border-[#00C2FF] p-10 overflow-hidden shadow-[0_0_50px_rgba(0,194,255,0.2)] scale-105 z-10">
                            <div className="absolute inset-0 bg-[#00C2FF]/5 pointer-events-none"></div>
                            <div className="text-center mb-8 relative z-10">
                                <h3 className="text-[#00C2FF] font-bold uppercase tracking-widest mb-2">After: ClearLedger</h3>
                                <div className="text-5xl font-black text-white">$200.00</div>
                                <div className="text-[#00C2FF] text-sm font-bold mt-2">(The Real Value)</div>
                            </div>
                            <div className="space-y-3 relative z-10">
                                <div className="flex items-center justify-between p-4 bg-[#00C2FF]/10 rounded-2xl border border-[#00C2FF]/30">
                                    <div className="flex items-center gap-3"><CheckCircle2 className="text-[#00C2FF] w-6 h-6"/><span className="font-bold text-white">Ethereum (ETH)</span></div>
                                    <div className="text-white font-bold">$150.00</div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-[#00C2FF]/10 rounded-2xl border border-[#00C2FF]/30">
                                    <div className="flex items-center gap-3"><CheckCircle2 className="text-[#00C2FF] w-6 h-6"/><span className="font-bold text-white">USDC</span></div>
                                    <div className="text-white font-bold">$50.00</div>
                                </div>
                            </div>
                             <div className="absolute top-4 right-4 bg-[#00C2FF] text-black text-xs font-bold px-3 py-1 rounded-full">VERIFIED</div>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section className="py-32 relative border-t border-white/5 bg-[#080808]">
             <div className="max-w-7xl mx-auto px-6">
                 <FadeIn>
                    <div className="text-center mb-20">
                        <h2 className="text-5xl font-black mb-6 tracking-tight">How It Works</h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">Three simple steps to get the truth about any wallet.</p>
                    </div>
                 </FadeIn>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative">
                     {/* Step 1 */}
                     <FadeIn delay={100}>
                        <div className="relative z-10 bg-[#0F0F0F] p-8 rounded-[2.5rem] border border-white/10 h-full">
                            <div className="w-16 h-16 mx-auto bg-[#492BFF]/20 rounded-2xl flex items-center justify-center text-[#492BFF] mb-6 font-black text-2xl">1</div>
                            <h3 className="text-2xl font-bold text-white mb-4">Paste an Address</h3>
                            <p className="text-gray-400 font-medium">Copy any Ethereum address (0x...) from a wallet or exchange and paste it into our search bar.</p>
                        </div>
                     </FadeIn>
                     
                     {/* Connector Arrow */}
                     <div className="hidden md:block absolute top-1/2 left-[30%] transform -translate-y-1/2 z-0 text-white/10"><ArrowRightCircle className="w-12 h-12"/></div>

                     {/* Step 2 */}
                     <FadeIn delay={300}>
                        <div className="relative z-10 bg-[#0F0F0F] p-8 rounded-[2.5rem] border border-white/10 h-full shadow-[0_0_40px_rgba(0,194,255,0.1)]">
                            <div className="w-16 h-16 mx-auto bg-[#00C2FF]/20 rounded-2xl flex items-center justify-center text-[#00C2FF] mb-6 font-black text-2xl">2</div>
                            <h3 className="text-2xl font-bold text-white mb-4">We Scan & Clean</h3>
                            <p className="text-gray-400 font-medium">We scan the blockchain and automatically remove 99% of fake "spam" tokens that inflate value.</p>
                        </div>
                     </FadeIn>

                     {/* Connector Arrow */}
                     <div className="hidden md:block absolute top-1/2 right-[30%] transform -translate-y-1/2 z-0 text-white/10"><ArrowRightCircle className="w-12 h-12"/></div>

                     {/* Step 3 */}
                     <FadeIn delay={500}>
                        <div className="relative z-10 bg-[#0F0F0F] p-8 rounded-[2.5rem] border border-white/10 h-full">
                            <div className="w-16 h-16 mx-auto bg-[#FFAC43]/20 rounded-2xl flex items-center justify-center text-[#FFAC43] mb-6 font-black text-2xl">3</div>
                            <h3 className="text-2xl font-bold text-white mb-4">See Real Results</h3>
                            <p className="text-gray-400 font-medium">Instantly get the true Net Worth, see where money went, and how much was spent on gas fees.</p>
                        </div>
                     </FadeIn>
                 </div>
             </div>
        </section>

        {/* ================= VISUAL FEATURE SHOWCASE ================= */}
        <section className="py-32 relative overflow-hidden border-t border-white/5">
             <div className="max-w-7xl mx-auto px-6">
                 <FadeIn>
                    <div className="mb-20 text-center">
                        <h2 className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tighter">See What's <span className="text-[#492BFF]">Hidden</span></h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                           Most explorers lie to you by including spam tokens in your net worth. We show you the clean truth.
                        </p>
                    </div>
                 </FadeIn>

                 {/* Visual Mockups using CSS */}
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                     
                     {/* Mockup 1: Spam Filter */}
                     <FadeIn delay={100}>
                        <div className="bg-[#0F0F0F] rounded-[2rem] border border-white/10 p-8 overflow-hidden relative min-h-[400px]">
                            <div className="absolute top-0 right-0 bg-red-500/10 w-full h-full blur-[100px] pointer-events-none"></div>
                            <h3 className="relative z-10 text-2xl font-bold mb-6 flex items-center gap-3"><AlertTriangle className="text-red-500"/> Spam Detection</h3>
                            
                            {/* CSS UI Mockup */}
                            <div className="space-y-3 relative z-10 opacity-90">
                                <div className="flex items-center justify-between p-4 bg-black/50 rounded-xl border border-red-500/30">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-xs text-red-500">?</div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-300">NIKO Token</div>
                                            <div className="text-xs text-gray-500">Unverified Contract</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-gray-500 line-through">$1,450,000</div>
                                        <div className="text-xs text-red-400 font-bold">SPAM FLAGGED</div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-black/50 rounded-xl border border-white/5 opacity-40">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-500/20"></div>
                                        <div className="w-24 h-3 bg-gray-700 rounded"></div>
                                    </div>
                                    <div className="w-16 h-3 bg-gray-700 rounded"></div>
                                </div>
                            </div>
                            <p className="relative z-10 mt-8 text-gray-400 text-sm">Our engine isolates fake airdrops instantly.</p>
                        </div>
                     </FadeIn>

                     {/* Mockup 2: Gas Tracking */}
                     <FadeIn delay={200}>
                        <div className="bg-[#0F0F0F] rounded-[2rem] border border-white/10 p-8 overflow-hidden relative min-h-[400px]">
                            <div className="absolute top-0 right-0 bg-[#00C2FF]/10 w-full h-full blur-[100px] pointer-events-none"></div>
                            <h3 className="relative z-10 text-2xl font-bold mb-6 flex items-center gap-3"><Flame className="text-[#00C2FF]"/> Gas Analytics</h3>
                            
                             {/* CSS UI Mockup */}
                             <div className="relative z-10 mt-4">
                                <div className="flex items-end gap-2 h-32 mb-4 px-4 border-b border-white/10 pb-2">
                                    <div className="w-full bg-[#00C2FF]/20 h-[40%] rounded-t"></div>
                                    <div className="w-full bg-[#00C2FF]/40 h-[70%] rounded-t"></div>
                                    <div className="w-full bg-[#00C2FF] h-[90%] rounded-t shadow-[0_0_20px_#00C2FF]"></div>
                                    <div className="w-full bg-[#00C2FF]/50 h-[60%] rounded-t"></div>
                                    <div className="w-full bg-[#00C2FF]/30 h-[30%] rounded-t"></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 font-mono">
                                    <span>MON</span>
                                    <span>TUE</span>
                                    <span>WED</span>
                                    <span>THU</span>
                                    <span>FRI</span>
                                </div>
                             </div>
                             <p className="relative z-10 mt-8 text-gray-400 text-sm">Visualize exactly how much ETH you are burning on fees.</p>
                        </div>
                     </FadeIn>
                 </div>
             </div>
        </section>

        {/* ================= USE CASES ================= */}
        <section className="py-32 bg-[#020202] border-y border-white/5">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <FadeIn>
                    <h2 className="text-5xl md:text-6xl font-black mb-10 tracking-tight">ENGINEERED FOR <br /> <span className="text-[#00C2FF]">POWER USERS</span></h2>
                    <div className="space-y-8">
                        <div className="group">
                            <h4 className="text-2xl font-bold text-white mb-2 group-hover:text-[#492BFF] transition-colors">For Researchers</h4>
                            <p className="text-gray-500 text-lg">Track complex fund flows and exchange movements with crystal clear visualizations.</p>
                        </div>
                        <div className="w-full h-px bg-white/10"></div>
                        <div className="group">
                            <h4 className="text-2xl font-bold text-white mb-2 group-hover:text-[#00C2FF] transition-colors">For Security Audits</h4>
                            <p className="text-gray-500 text-lg">Instantly flag interactions with known malicious contracts or wash-trading bots.</p>
                        </div>
                        <div className="w-full h-px bg-white/10"></div>
                        <div className="group">
                            <h4 className="text-2xl font-bold text-white mb-2 group-hover:text-[#FFAC43] transition-colors">For Degen Traders</h4>
                            <p className="text-gray-500 text-lg">Calculate your true gas spend and optimize your entry points.</p>
                        </div>
                    </div>
                </FadeIn>

                <FadeIn delay={200}>
                    <div className="relative bg-[#080808] rounded-[2rem] border border-white/10 p-8 shadow-2xl overflow-hidden">
                        <div className="flex items-center gap-2 mb-6">
                             <div className="w-3 h-3 rounded-full bg-[#FF5F57]"></div>
                             <div className="w-3 h-3 rounded-full bg-[#FEBC2E]"></div>
                             <div className="w-3 h-3 rounded-full bg-[#28C840]"></div>
                        </div>
                        <div className="font-mono text-sm space-y-4">
                            <div className="text-gray-500"># Initializing Gravity Protocol...</div>
                            <div className="flex gap-2">
                                <span className="text-[#492BFF]">➜</span>
                                <span className="text-white">analyze_wallet(0xd8...96045)</span>
                            </div>
                            <div className="text-gray-400 pl-4">[+] Fetching Etherscan V2 history...</div>
                            <div className="text-gray-400 pl-4">[+] Resolving ENS...</div>
                            <div className="text-[#FFAC43] pl-4">[!] WARNING: 42 Spam Tokens Detected</div>
                            <div className="text-gray-400 pl-4">[-] Filtering noise...</div>
                            <div className="flex gap-2 mt-4">
                                <span className="text-[#00C2FF]">➜</span>
                                <span className="text-white">calc_net_worth()</span>
                            </div>
                            <div className="text-[#00C2FF] font-bold pl-4">SUCCESS: $1,420,050.23 (Verified)</div>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </section>

        {/* ================= NEW PREMIUM TESTIMONIALS ================= */}
        <section className="py-32 bg-[#020202] border-y border-white/5 relative overflow-hidden">
             {/* Subtle Grainy Noise Overlay for Texture */}
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>

             <div className="max-w-7xl mx-auto px-6 relative z-10">
                 <FadeIn>
                    <div className="text-center mb-20">
                         <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#492BFF]/30 bg-[#492BFF]/10 text-[#492BFF] text-xs font-bold uppercase tracking-widest mb-6">
                            Community Verified
                         </div>
                         <h2 className="text-5xl md:text-6xl font-black tracking-tight">
                            TRUSTED BY THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#492BFF] to-[#00C2FF]">ON-CHAIN ELITE</span>
                         </h2>
                    </div>
                 </FadeIn>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {/* Card 1: The Collector */}
                     <FadeIn delay={100}>
                        <div className="group relative p-8 rounded-[2.5rem] bg-[#0A0A0A] border border-white/10 hover:border-[#492BFF]/50 transition-all duration-500 hover:-translate-y-2">
                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-b from-[#492BFF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]"></div>
                            
                            {/* Quote Icon */}
                            <Quote className="absolute top-8 right-8 w-12 h-12 text-white/5 group-hover:text-[#492BFF]/10 transition-colors" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">A</div>
                                    <div>
                                        <div className="font-bold text-white text-lg">Alex Rivera</div>
                                        <div className="text-sm text-[#492BFF] font-medium">NFT Collector</div>
                                    </div>
                                </div>
                                <p className="text-gray-300 text-lg leading-relaxed font-medium mb-8">
                                    "I almost got scammed by a fake wallet showing $500k in assets. ClearLedger flagged 90% of it as spam instantly. <span className="text-white border-b border-[#492BFF]">Literal lifesaver.</span>"
                                </p>
                                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                     <span className="text-xs text-gray-500 font-mono">Last Scan: 2m ago</span>
                                     <div className="flex text-[#00C2FF] gap-1"><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/></div>
                                </div>
                            </div>
                        </div>
                     </FadeIn>

                     {/* Card 2: The Trader */}
                     <FadeIn delay={200}>
                        <div className="group relative p-8 rounded-[2.5rem] bg-[#0D0D0D] border border-white/10 hover:border-[#00C2FF]/50 transition-all duration-500 hover:-translate-y-2 shadow-[0_0_40px_rgba(0,194,255,0.05)]">
                            <div className="absolute inset-0 bg-gradient-to-b from-[#00C2FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]"></div>
                            <Quote className="absolute top-8 right-8 w-12 h-12 text-white/5 group-hover:text-[#00C2FF]/10 transition-colors" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">S</div>
                                    <div>
                                        <div className="font-bold text-white text-lg">Sarah K.</div>
                                        <div className="text-sm text-[#00C2FF] font-medium">DeFi Analyst</div>
                                    </div>
                                </div>
                                <p className="text-gray-300 text-lg leading-relaxed font-medium mb-8">
                                    "The <span className="text-white border-b border-[#00C2FF]">Gas Analytics</span> are elite. I realized I was burning 2 ETH/month on failed transactions. Adjusted my strategy and saved thousands."
                                </p>
                                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                     <span className="text-xs text-gray-500 font-mono">Last Scan: 12s ago</span>
                                     <div className="flex text-[#00C2FF] gap-1"><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/></div>
                                </div>
                            </div>
                        </div>
                     </FadeIn>

                     {/* Card 3: The Dev */}
                     <FadeIn delay={300}>
                        <div className="group relative p-8 rounded-[2.5rem] bg-[#0A0A0A] border border-white/10 hover:border-[#FFAC43]/50 transition-all duration-500 hover:-translate-y-2">
                            <div className="absolute inset-0 bg-gradient-to-b from-[#FFAC43]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]"></div>
                            <Quote className="absolute top-8 right-8 w-12 h-12 text-white/5 group-hover:text-[#FFAC43]/10 transition-colors" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">M</div>
                                    <div>
                                        <div className="font-bold text-white text-lg">Mike D.</div>
                                        <div className="text-sm text-[#FFAC43] font-medium">Security Researcher</div>
                                    </div>
                                </div>
                                <p className="text-gray-300 text-lg leading-relaxed font-medium mb-8">
                                    "I use this daily to audit contract deployer wallets. It's faster than Etherscan and cleaner than Debank. <span className="text-white border-b border-[#FFAC43]">Essential tooling.</span>"
                                </p>
                                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                     <span className="text-xs text-gray-500 font-mono">Last Scan: 5m ago</span>
                                     <div className="flex text-[#00C2FF] gap-1"><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/></div>
                                </div>
                            </div>
                        </div>
                     </FadeIn>
                 </div>
             </div>
        </section>
        {/* ================= PRICING ================= */}
        <section id="pricing" className="py-32 max-w-7xl mx-auto px-6">
           <FadeIn>
             <div className="text-center mb-20">
                <h2 className="text-5xl font-black mb-6 uppercase">Simple Pricing</h2>
             </div>
           </FadeIn>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <FadeIn delay={100}>
                <div className="p-10 rounded-[2rem] bg-[#0A0A0A] border border-white/10 flex flex-col hover:border-white/30 transition-all duration-300">
                   <div className="mb-4 text-gray-400 font-bold uppercase tracking-widest">Starter</div>
                   <div className="text-5xl font-black text-white mb-2">$0</div>
                   <p className="text-sm text-gray-500 mb-10">Essential tools for personal audit.</p>
                   <ul className="space-y-4 mb-10 flex-1">
                      <li className="flex items-center gap-3 text-gray-300 font-medium"><Check className="w-5 h-5 text-white" /> 5 Scans / Day</li>
                      <li className="flex items-center gap-3 text-gray-300 font-medium"><Check className="w-5 h-5 text-white" /> V2 Spam Filter</li>
                      <li className="flex items-center gap-3 text-gray-300 font-medium"><Check className="w-5 h-5 text-white" /> 30-Day History</li>
                   </ul>
                   <button className="w-full py-5 rounded-xl border border-white/20 text-white font-bold hover:bg-white hover:text-black transition-all">Start Free</button>
                </div>
              </FadeIn>

              <FadeIn delay={200}>
                <div className="relative p-10 rounded-[2rem] bg-[#0F0F0F] border border-[#492BFF] flex flex-col overflow-hidden shadow-[0_0_40px_rgba(73,43,255,0.1)]">
                   <div className="absolute top-0 right-0 bg-[#492BFF] text-white text-xs font-bold px-4 py-2 rounded-bl-xl uppercase tracking-widest">Recommended</div>
                   <div className="mb-4 text-[#492BFF] font-bold uppercase tracking-widest">Pro</div>
                   <div className="text-5xl font-black text-white mb-2">$19</div>
                   <p className="text-sm text-gray-500 mb-10">Full spectrum visibility.</p>
                   <ul className="space-y-4 mb-10 flex-1">
                      <li className="flex items-center gap-3 text-white font-bold"><Check className="w-5 h-5 text-[#492BFF]" /> Unlimited Scans</li>
                      <li className="flex items-center gap-3 text-white font-bold"><Check className="w-5 h-5 text-[#492BFF]" /> Advanced Gravity Filter</li>
                      <li className="flex items-center gap-3 text-white font-bold"><Check className="w-5 h-5 text-[#492BFF]" /> CSV Export</li>
                      <li className="flex items-center gap-3 text-white font-bold"><Check className="w-5 h-5 text-[#492BFF]" /> API Key</li>
                   </ul>
                   <button className="w-full py-5 rounded-xl bg-[#492BFF] text-white font-bold hover:bg-[#3820CC] transition-all transform hover:scale-[1.02]">Upgrade Now</button>
                </div>
              </FadeIn>
           </div>
        </section>

        {/* ================= FAQ ================= */}
        <section className="py-20 max-w-3xl mx-auto px-6 mb-20">
            <h2 className="text-3xl font-black mb-10 text-center uppercase tracking-tight">System FAQ</h2>
            <div className="space-y-4">
                {[
                    { q: "How do you know what's spam?", a: "We cross-reference tokens against a whitelist of 50,000+ verified contracts from CoinGecko and CMC. If a token isn't on the list, it's flagged as potential spam." },
                    { q: "Is my data private?", a: "Yes. ClearLedger is a read-only tool. We simply index public blockchain data. We do not store your IP or track your personal wallets." },
                    { q: "Why is my value different on other sites?", a: "Other sites often include fake airdrop tokens in your total to make it look higher. We filter those out to give you the real, spendable value." },
                    { q: "Can I use this for taxes?", a: "The 'Fees Burned' metric is highly useful for tax write-offs, but we recommend exporting the CSV and consulting a CPA for official filings." }
                ].map((faq, index) => (
                    <div key={index} className="border border-white/10 rounded-2xl bg-[#0A0A0A] overflow-hidden transition-all duration-300 hover:border-white/30">
                        <button 
                            onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
                            className="w-full p-6 flex items-center justify-between text-left"
                        >
                            <span className="font-bold text-gray-200">{faq.q}</span>
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${activeAccordion === index ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`px-6 text-gray-400 leading-relaxed overflow-hidden transition-all duration-300 ${activeAccordion === index ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                            {faq.a}
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* ================= FOOTER CTA ================= */}
        <section className="py-10 px-6">
            <div className="max-w-5xl mx-auto relative rounded-[3rem] bg-[#0A0A0A] border border-white/10 p-16 text-center overflow-hidden group hover:border-[#492BFF]/30 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-[#492BFF]/10 via-transparent to-[#00C2FF]/10 opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                
                <h2 className="relative z-10 text-5xl md:text-7xl font-black mb-8 text-white tracking-tighter">READY FOR <br /> LIFT OFF?</h2>
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className={gravityBtn}
                >
                    Launch App
                </button>
            </div>
        </section>

      </main>
      
      <Footer />
    </div>
  );
}