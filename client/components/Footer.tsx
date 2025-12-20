// client/components/Footer.tsx
import { Wallet } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative mt-32 bg-[#050505] border-t border-white/5">
      {/* Top Gradient Line for separation */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-purple-600/20 p-2 rounded-lg border border-purple-500/20">
                 <Wallet className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white">ClearLedger</h3>
            </div>
            <p className="text-gray-400 text-sm leading-loose max-w-sm">
              The professional analytics platform for the decentralized web. 
              Gain clarity on your transactions, gas usage, and portfolio performance with one click.
            </p>
          </div>
          
          {/* Links Column 1 */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide text-sm uppercase">Product</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="#" className="hover:text-purple-400 transition duration-300">Analytics Dashboard</a></li>
              <li><a href="#" className="hover:text-purple-400 transition duration-300">Wallet Insights</a></li>
              <li><a href="#" className="hover:text-purple-400 transition duration-300">Pro API</a></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide text-sm uppercase">Company</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="#" className="hover:text-purple-400 transition duration-300">About Us</a></li>
              <li><a href="#" className="hover:text-purple-400 transition duration-300">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-purple-400 transition duration-300">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
          <p>© 2025 ClearLedger Analytics. Built for the future.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
             <span>Data by Etherscan</span>
             <span>Prices by CoinGecko</span>
          </div>
        </div>
      </div>
    </footer>
  );
}