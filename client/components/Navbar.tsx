"use client";

import { useState, useEffect } from 'react';
import { Wallet, Menu, X } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // 1. Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Lock Body Scroll when Mobile Menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return (
    <>
      {/* Navbar Header */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${isScrolled
          ? 'h-20 bg-[#050505]/50 backdrop-blur-sm'
          : 'h-24 bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between relative">

          {/* 1. LEFT: Logo */}
          <Link href="/" className="flex items-center gap-3 group relative z-50" onClick={() => setIsOpen(false)}>
            <div className={`p-2 rounded-xl transition-all duration-300 ${isScrolled ? 'bg-[#492BFF]' : 'bg-white/10'
              }`}>
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-white group-hover:text-gray-300 transition-colors">
              ClearLedger
            </span>
          </Link>

          {/* 2. CENTER: Floating Island Navigation (Smaller Size) */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center gap-1 bg-[#0A0A0A] border border-white/10 rounded-full px-1.5 py-1.5 shadow-2xl backdrop-blur-xl">
              <Link
                href="/features"
                className="px-5 py-2 rounded-full text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 uppercase tracking-wide"
              >
                Features
              </Link>
              <Link
                href="/#pricing"
                className="px-5 py-2 rounded-full text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 uppercase tracking-wide"
              >
                Pricing
              </Link>
            </div>
          </div>

          {/* 3. RIGHT: Connect Button & Mobile Hamburger */}
          <div className="flex items-center gap-4">
            {/* Connect Wallet Button */}
            <button className={`hidden md:block px-5 py-2 rounded-full font-bold text-xs transition-all hover:scale-105 shadow-lg ${isScrolled
              ? 'bg-white text-black hover:bg-gray-200'
              : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
              }`}>
              Connect Wallet
            </button>

            {/* Mobile Hamburger Button */}
            <button
              className="md:hidden relative z-50 p-2 text-gray-400 hover:text-white transition-colors focus:outline-none"
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className="relative w-6 h-6">
                <Menu
                  className={`absolute inset-0 w-6 h-6 transition-all duration-300 transform ${isOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
                    }`}
                />
                <X
                  className={`absolute inset-0 w-6 h-6 transition-all duration-300 transform ${isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
                    }`}
                />
              </div>
            </button>
          </div>

        </div>
      </nav>

      {/* Full Screen Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-[#050505] md:hidden transition-all duration-500 ease-in-out flex flex-col justify-center items-center gap-8 ${isOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-5 invisible pointer-events-none'
          }`}
      >
        <div className="absolute top-[20%] right-[-10%] w-[300px] h-[300px] bg-[#492BFF]/20 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[20%] left-[-10%] w-[300px] h-[300px] bg-[#00C2FF]/20 blur-[100px] rounded-full pointer-events-none"></div>

        <Link
          href="/features"
          onClick={() => setIsOpen(false)}
          className={`text-3xl font-black text-white hover:text-[#492BFF] transition-all duration-300 transform ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} delay-100`}
        >
          FEATURES
        </Link>
        <Link
          href="/#pricing"
          onClick={() => setIsOpen(false)}
          className={`text-3xl font-black text-white hover:text-[#00C2FF] transition-all duration-300 transform ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} delay-200`}
        >
          PRICING
        </Link>

        <div className={`mt-8 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} transition-all duration-300 delay-300`}>
          <button className="bg-white text-black px-10 py-4 rounded-full font-bold text-base shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform">
            Connect Wallet
          </button>
        </div>
      </div>
    </>
  );
}