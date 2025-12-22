"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  // Added missing icons 👇
  ArrowRight, ShieldCheck, Zap, Globe, FileText, 
  BarChart3, Lock, Search, MousePointer2, ChevronRight,
  Download, Database, Layers, Check, Flame 
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// --- Shared Components ---
const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, []);

  return (
    <div ref={ref} className={`transition-all duration-700 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

export default function FeaturesPage() {
  // --- Design Tokens ---
  const heroGradient = "bg-clip-text text-transparent bg-gradient-to-r from-[#492BFF] via-[#00C2FF] to-[#FFAC43] animate-gradient bg-[length:200%_auto]";
  const gravityBtn = "relative bg-white text-black font-bold px-10 py-4 rounded-full hover:bg-[#F2F2F2] transition-all transform hover:-translate-y-1 shadow-[0_10px_30px_rgba(255,255,255,0.1)] inline-flex items-center gap-2";

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#492BFF]/30 overflow-x-hidden">
      
      {/* Background FX */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      <div className="fixed top-[10%] right-[0%] w-[600px] h-[600px] bg-[#492BFF]/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>

      <Navbar />

      <main className="relative z-10 pt-32 pb-20">
        
        {/* ================= HEADER ================= */}
        <section className="text-center px-6 mb-32 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-widest mb-8">
                System Capabilities
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8">
                Built for <span className={heroGradient}>Truth Seekers</span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
                ClearLedger isn't just a block explorer. It's a forensic analytics engine designed to separate signal from noise.
            </p>
        </section>

        {/* ================= DEEP DIVE 1: THE SPAM ENGINE ================= */}
        <section className="py-20 px-6 border-y border-white/5 bg-[#080808]">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <FadeIn>
                    <div className="relative">
                        {/* Visual: Spam Filter UI */}
                        <div className="bg-[#0F0F0F] border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 bg-red-500/10 w-64 h-64 blur-[80px]"></div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#492BFF]/20 flex items-center justify-center text-[#492BFF]"><ShieldCheck className="w-5 h-5"/></div>
                                        <div>
                                            <div className="font-bold text-white">USDC</div>
                                            <div className="text-xs text-gray-500">Verified Asset</div>
                                        </div>
                                    </div>
                                    <div className="text-green-400 font-mono text-sm">✓ INCLUDED</div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500"><Lock className="w-5 h-5"/></div>
                                        <div>
                                            <div className="font-bold text-red-200">MuskElonCoin</div>
                                            <div className="text-xs text-red-400">Unverified Contract</div>
                                        </div>
                                    </div>
                                    <div className="text-red-400 font-mono text-sm">✕ BLOCKED</div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#492BFF]/20 flex items-center justify-center text-[#492BFF]"><ShieldCheck className="w-5 h-5"/></div>
                                        <div>
                                            <div className="font-bold text-white">Ethereum</div>
                                            <div className="text-xs text-gray-500">Native Token</div>
                                        </div>
                                    </div>
                                    <div className="text-green-400 font-mono text-sm">✓ INCLUDED</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </FadeIn>

                <FadeIn delay={200}>
                    <div className="pl-0 lg:pl-10">
                        <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500 mb-6">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h2 className="text-4xl font-black mb-6">We Clean The Mess.</h2>
                        <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                            Wallets are often "dusted" with fake tokens that claim to be worth millions but have zero liquidity.
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-gray-300">
                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center"><Check className="w-3 h-3"/></div>
                                <span>Filters 99.8% of wash-trading spam</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center"><Check className="w-3 h-3"/></div>
                                <span>Uses Cloudflare-backed verified lists</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center"><Check className="w-3 h-3"/></div>
                                <span>Shows your "True Liquidity" value</span>
                            </li>
                        </ul>
                    </div>
                </FadeIn>
            </div>
        </section>

        {/* ================= DEEP DIVE 2: GAS ANALYTICS ================= */}
        <section className="py-20 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Text First on Desktop */}
                <FadeIn>
                    <div className="pr-0 lg:pr-10">
                        <div className="w-12 h-12 bg-[#00C2FF]/20 rounded-2xl flex items-center justify-center text-[#00C2FF] mb-6">
                            <Flame className="w-6 h-6" />
                        </div>
                        <h2 className="text-4xl font-black mb-6">Know Your Costs.</h2>
                        <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                            How much ETH have you burned on failed transactions or high gas fees? We calculate the lifetime cost of operating your wallet.
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-gray-300">
                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center"><Check className="w-3 h-3"/></div>
                                <span>Tracks every Gwei spent since day 1</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center"><Check className="w-3 h-3"/></div>
                                <span>Includes failed transaction costs</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center"><Check className="w-3 h-3"/></div>
                                <span>Vital for tax reporting</span>
                            </li>
                        </ul>
                    </div>
                </FadeIn>

                <FadeIn delay={200}>
                    <div className="relative">
                        {/* Visual: Gas Chart UI */}
                        <div className="bg-[#0F0F0F] border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 left-0 bg-[#00C2FF]/10 w-64 h-64 blur-[80px]"></div>
                            
                            <div className="text-center mb-8">
                                <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Lifetime Gas Burned</div>
                                <div className="text-5xl font-black text-white">-2.45 ETH</div>
                                <div className="text-sm text-[#00C2FF] mt-2">≈ $6,200 USD</div>
                            </div>

                            <div className="flex items-end justify-center gap-3 h-32 border-b border-white/10 pb-4">
                                <div className="w-8 bg-[#00C2FF]/20 h-[30%] rounded-t-lg"></div>
                                <div className="w-8 bg-[#00C2FF]/40 h-[50%] rounded-t-lg"></div>
                                <div className="w-8 bg-[#00C2FF] h-[80%] rounded-t-lg shadow-[0_0_15px_#00C2FF]"></div>
                                <div className="w-8 bg-[#00C2FF]/60 h-[40%] rounded-t-lg"></div>
                                <div className="w-8 bg-[#00C2FF]/30 h-[20%] rounded-t-lg"></div>
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-2 px-4">
                                <span>2021</span>
                                <span>2022</span>
                                <span>2023</span>
                                <span>2024</span>
                                <span>2025</span>
                            </div>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </section>

        {/* ================= BENTO GRID FEATURES ================= */}
        <section className="py-32 px-6 border-t border-white/5 bg-[#0A0A0A]">
            <div className="max-w-7xl mx-auto">
                <FadeIn>
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black mb-6">Complete Visibility</h2>
                        <p className="text-gray-400">Everything you need to audit an address.</p>
                    </div>
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1: CSV Export */}
                    <FadeIn delay={100}>
                        <div className="col-span-1 md:col-span-2 bg-[#0F0F0F] border border-white/10 rounded-[2rem] p-8 hover:border-[#492BFF]/30 transition group relative overflow-hidden h-full">
                            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-100 transition duration-500 transform group-hover:scale-110">
                                <FileText className="w-32 h-32 text-[#492BFF]" />
                            </div>
                            <div className="relative z-10">
                                <div className="w-10 h-10 bg-[#492BFF]/20 rounded-xl flex items-center justify-center text-[#492BFF] mb-6"><Download className="w-5 h-5"/></div>
                                <h3 className="text-2xl font-bold text-white mb-2">Export to CSV</h3>
                                <p className="text-gray-400 max-w-sm">Download full transaction histories and gas reports in a clean CSV format compatible with Excel and Google Sheets.</p>
                            </div>
                        </div>
                    </FadeIn>

                    {/* Card 2: Multi-Chain */}
                    <FadeIn delay={200}>
                        <div className="bg-[#0F0F0F] border border-white/10 rounded-[2rem] p-8 hover:border-white/30 transition group h-full">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-6"><Globe className="w-5 h-5"/></div>
                            <h3 className="text-xl font-bold text-white mb-2">Multi-Chain Ready</h3>
                            <p className="text-gray-400 text-sm">Currently optimized for Ethereum Mainnet. L2 support (Arbitrum, Optimism, Base) arriving Q2 2026.</p>
                        </div>
                    </FadeIn>

                    {/* Card 3: Real Time */}
                    <FadeIn delay={300}>
                        <div className="bg-[#0F0F0F] border border-white/10 rounded-[2rem] p-8 hover:border-white/30 transition group h-full">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 mb-6"><Zap className="w-5 h-5"/></div>
                            <h3 className="text-xl font-bold text-white mb-2">Mempool Sync</h3>
                            <p className="text-gray-400 text-sm">We don't cache data for hours. When you click "Analyze," we hit the blockchain nodes live.</p>
                        </div>
                    </FadeIn>

                    {/* Card 4: Security */}
                    <FadeIn delay={400}>
                        <div className="col-span-1 md:col-span-2 bg-[#0F0F0F] border border-white/10 rounded-[2rem] p-8 hover:border-green-500/30 transition group relative overflow-hidden h-full">
                             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-green-500/10 rounded-full blur-[50px]"></div>
                             <div className="relative z-10">
                                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400 mb-6"><Lock className="w-5 h-5"/></div>
                                <h3 className="text-2xl font-bold text-white mb-2">100% Read-Only</h3>
                                <p className="text-gray-400 max-w-sm">We never ask you to connect your wallet. Simply search a public address. Your private keys stay private, always.</p>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </section>

        {/* ================= CTA ================= */}
        <section className="py-20 px-6 text-center">
            <FadeIn>
                <div className="max-w-3xl mx-auto bg-gradient-to-r from-[#0F0F0F] to-[#1a1a1a] border border-white/10 rounded-[3rem] p-16">
                    <h2 className="text-4xl font-black mb-6">Ready to see the truth?</h2>
                    <p className="text-gray-400 mb-10 text-lg">No sign-up required. Just paste an address and go.</p>
                    <Link href="/analyze" className={gravityBtn}>
                        <MousePointer2 className="w-5 h-5" />
                        Start Analyzing
                    </Link>
                </div>
            </FadeIn>
        </section>

      </main>
      
      <Footer />
    </div>
  );
}