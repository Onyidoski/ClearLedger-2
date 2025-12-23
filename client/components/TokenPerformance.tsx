import React from 'react';
import { TrendingUp, TrendingDown, Target, Award, DollarSign } from 'lucide-react';

interface TokenData {
    symbol: string;
    name: string;
    balance: number;
    currentPrice: number;
    avgBuyPrice: number;
    unrealizedPL_USD: number;
    unrealizedPL_Percentage: number;
    realizedPL_USD: number;
    isProfitable: boolean;
}

interface PerformanceStats {
    totalRealizedPL: number;
    totalUnrealizedPL: number;
    winRate: number;
    bestPerformer: string;
    bestPerformerValue: number;
}

interface Props {
    data: TokenData[];
    stats?: PerformanceStats; // New Prop
    isLoading: boolean;
}

const TokenPerformance: React.FC<Props> = ({ data, stats, isLoading }) => {
    if (isLoading) {
        return (
            <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-8 animate-pulse">
                <div className="h-8 bg-white/5 rounded w-1/3 mb-6"></div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-white/5 rounded-xl"></div>)}
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-8 text-center">
                <p className="text-gray-500">No sufficient trading history found for performance analysis.</p>
            </div>
        );
    }

    return (
        <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] overflow-hidden">
            
            {/* --- 1. NEW: TRADER SCORECARD --- */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 bg-white/[0.02] border-b border-white/10">
                    
                    {/* Metric 1: Win Rate */}
                    <div className="p-6 flex items-center gap-4">
                        <div className={`p-3 rounded-full ${stats.winRate >= 50 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            <Target className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">Win Rate</div>
                            <div className="text-2xl font-black text-white">{stats.winRate.toFixed(0)}%</div>
                        </div>
                    </div>

                    {/* Metric 2: Net P/L (Realized + Unrealized) */}
                    <div className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-[#492BFF]/10 text-[#492BFF]">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Net P/L</div>
                            <div className={`text-2xl font-black ${(stats.totalRealizedPL + stats.totalUnrealizedPL) >= 0 ? 'text-[#492BFF]' : 'text-red-500'}`}>
                                {(stats.totalRealizedPL + stats.totalUnrealizedPL) >= 0 ? '+' : ''}
                                ${(stats.totalRealizedPL + stats.totalUnrealizedPL).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </div>
                        </div>
                    </div>

                    {/* Metric 3: Best Asset */}
                    <div className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-yellow-500/10 text-yellow-500">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">Best Asset</div>
                            <div className="text-2xl font-black text-white">
                                {stats.bestPerformer} <span className="text-sm text-green-500 font-normal">(+${stats.bestPerformerValue.toLocaleString(undefined, { maximumFractionDigits: 0 })})</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- 2. Token List --- */}
            <div className="divide-y divide-white/5">
                {data.map((token, idx) => (
                    <div key={idx} className="p-6 hover:bg-white/[0.02] transition group">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                            
                            {/* Token Info */}
                            <div className="flex items-center gap-4 w-full lg:w-[25%]">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center font-bold text-gray-400 border border-white/10 shrink-0 text-xl">
                                    {token.symbol[0]}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-xl truncate">{token.name}</h4>
                                    <div className="text-xs text-gray-500 font-mono truncate mt-1">
                                        {token.balance.toFixed(4)} {token.symbol}
                                    </div>
                                </div>
                            </div>

                            {/* Price Data */}
                            <div className="hidden lg:flex items-center justify-center gap-4 w-[25%] text-sm font-mono text-gray-400">
                                <div className="text-center">
                                    <div className="text-[10px] uppercase tracking-wider mb-1">Avg Buy</div>
                                    <div className="text-white">${token.avgBuyPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                </div>
                                <div className="text-gray-600">→</div>
                                <div className="text-center">
                                    <div className="text-[10px] uppercase tracking-wider mb-1">Current</div>
                                    <div className="text-white">${token.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                </div>
                            </div>

                            {/* Realized P/L */}
                            <div className="w-full lg:w-[25%] flex flex-row lg:flex-col justify-between lg:justify-center lg:items-end text-right border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0">
                                <span className="lg:hidden text-gray-500 text-xs font-bold uppercase">Realized Gain</span>
                                <div>
                                    <div className={`text-xl font-bold tracking-tight ${token.realizedPL_USD >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {token.realizedPL_USD >= 0 ? '+' : ''}{token.realizedPL_USD.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
                                    </div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Banked Profit</div>
                                </div>
                            </div>

                            {/* Unrealized P/L */}
                            <div className="w-full lg:w-[25%] flex flex-row lg:flex-col justify-between lg:justify-center lg:items-end text-right border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0">
                                <span className="lg:hidden text-gray-500 text-xs font-bold uppercase">Unrealized</span>
                                <div>
                                    <div className={`text-2xl font-black tracking-tight ${token.unrealizedPL_USD >= 0 ? 'text-[#00C2FF]' : 'text-red-500'}`}>
                                        {token.unrealizedPL_USD >= 0 ? '+' : ''}{token.unrealizedPL_USD.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
                                    </div>
                                    <div className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md mt-1 ${token.unrealizedPL_USD >= 0 ? 'bg-[#00C2FF]/10 text-[#00C2FF]' : 'bg-red-500/10 text-red-500'}`}>
                                        {token.unrealizedPL_USD >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {token.unrealizedPL_Percentage.toFixed(2)}%
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TokenPerformance;