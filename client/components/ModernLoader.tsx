import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

const LOADING_STEPS = [
    "Establishing secure connection...",
    "Fetching wallet balances...",
    "Analyzing transaction history...",
    "Calculating Realized P/L (FIFO)...",
    "Identifying spam assets...",
    "Compiling financial insights..."
];

const ModernLoader = () => {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (currentStep >= LOADING_STEPS.length) return;

        // Progress slightly faster for a snappy feel
        const timer = setTimeout(() => {
            setCurrentStep(prev => prev + 1);
        }, 400); // 400ms per step

        return () => clearTimeout(timer);
    }, [currentStep]);

    const progress = Math.min((currentStep / LOADING_STEPS.length) * 100, 100);

    return (
        <div className="w-full max-w-md mx-auto mt-12 mb-20">
            {/* Glass Card */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#492BFF] to-transparent opacity-50"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#492BFF]/5 rounded-full blur-3xl -z-10"></div>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#492BFF]/10 text-[#492BFF] mb-4 relative">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <div className="absolute inset-0 rounded-full border border-[#492BFF]/20 animate-ping"></div>
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Analyzing Portfolio</h3>
                    <p className="text-gray-500 text-sm mt-1">Please wait while we crunch the numbers</p>
                </div>

                {/* Steps List */}
                <div className="space-y-4 relative z-10">
                    {LOADING_STEPS.map((step, idx) => {
                        const isCompleted = idx < currentStep;
                        const isCurrent = idx === currentStep;
                        const isPending = idx > currentStep;

                        return (
                            <div 
                                key={idx} 
                                className={`flex items-center gap-4 transition-all duration-300 ${
                                    isPending ? 'opacity-30 blur-[1px]' : 'opacity-100'
                                }`}
                            >
                                {/* Icon Status */}
                                <div className="shrink-0">
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    ) : isCurrent ? (
                                        <div className="w-5 h-5 rounded-full border-2 border-[#492BFF] border-t-transparent animate-spin"></div>
                                    ) : (
                                        <Circle className="w-5 h-5 text-gray-700" />
                                    )}
                                </div>

                                {/* Text */}
                                <span className={`text-sm font-medium ${isCompleted ? 'text-gray-400' : 'text-white'}`}>
                                    {step}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Progress Bar */}
                <div className="mt-8 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-[#492BFF] transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default ModernLoader;