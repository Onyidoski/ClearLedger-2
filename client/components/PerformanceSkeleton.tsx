import React from 'react';

const PerformanceSkeleton = () => {
    return (
        <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] overflow-hidden animate-pulse">
            
            {/* 1. Scorecard Section (3 Grid Items) */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 bg-white/[0.02] border-b border-white/10">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/5"></div>
                        <div className="space-y-2">
                            <div className="h-3 w-20 bg-white/5 rounded"></div>
                            <div className="h-6 w-32 bg-white/10 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 2. Token List Section */}
            <div className="divide-y divide-white/5">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-6">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                            
                            {/* Token Info */}
                            <div className="flex items-center gap-4 w-full lg:w-[25%]">
                                <div className="w-12 h-12 rounded-full bg-white/5 shrink-0"></div>
                                <div className="space-y-2 w-full">
                                    <div className="h-5 w-24 bg-white/10 rounded"></div>
                                    <div className="h-3 w-16 bg-white/5 rounded"></div>
                                </div>
                            </div>

                            {/* Price Data */}
                            <div className="hidden lg:flex items-center justify-center gap-4 w-[25%]">
                                <div className="h-8 w-32 bg-white/5 rounded"></div>
                            </div>

                            {/* P/L Numbers */}
                            <div className="w-full lg:w-[25%] flex justify-end">
                                <div className="space-y-2 items-end flex flex-col">
                                    <div className="h-6 w-24 bg-white/10 rounded"></div>
                                    <div className="h-3 w-12 bg-white/5 rounded"></div>
                                </div>
                            </div>
                             <div className="w-full lg:w-[25%] flex justify-end">
                                <div className="space-y-2 items-end flex flex-col">
                                    <div className="h-8 w-28 bg-white/10 rounded"></div>
                                    <div className="h-4 w-16 bg-white/5 rounded"></div>
                                </div>
                            </div>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PerformanceSkeleton;