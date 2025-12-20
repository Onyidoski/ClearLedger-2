// client/components/Navbar.tsx
import { Wallet } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo Area */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-600 blur-lg opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 p-2.5 rounded-xl">
              <Wallet className="w-5 h-5 text-white" />
            </div>
          </div>
          <span className="text-xl font-bold text-white tracking-tight group-hover:text-purple-200 transition">
            ClearLedger
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          <button className="hidden md:block text-sm font-medium text-gray-400 hover:text-white transition hover:scale-105">
            Features
          </button>
          <button className="hidden md:block text-sm font-medium text-gray-400 hover:text-white transition hover:scale-105">
            Pricing
          </button>
          
          <button className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <div className="relative bg-[#0A0A0A] hover:bg-[#111] text-white px-5 py-2.5 rounded-lg text-sm font-semibold border border-white/10 flex items-center gap-2 transition">
              Connect Wallet
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}