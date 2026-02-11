import React from 'react';

const GeneratingBioPlan: React.FC = () => {
    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center animate-fade-in min-h-[400px] flex flex-col justify-center items-center">
            <svg width="150" height="150" viewBox="0 0 200 200">
                {/* Data lines weaving */}
                <path
                    className="zen-lines"
                    d="M 20,100 C 40,20 80,20 100,100 S 160,180 180,100"
                    stroke="#fb923c"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    style={{ animationDelay: '0s' }}
                />
                <path
                    className="zen-lines"
                    d="M 20,100 Q 60,180 100,100 T 180,100"
                    stroke="#4ade80"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    style={{ animationDelay: '0.2s' }}
                />
                <path
                    className="zen-lines"
                    d="M 20,100 C 40,150 70,50 100,100 S 150,180 180,100"
                    stroke="#60a5fa"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    style={{ animationDelay: '0.4s' }}
                />

                {/* Sprouting plant */}
                <g className="zen-plant">
                    <path
                        d="M 100,120 V 60"
                        stroke="#84cc16"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />
                    <path
                        d="M 100,80 C 80,70 80,50 100,40"
                        stroke="#84cc16"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                    />
                     <path
                        d="M 100,70 C 120,60 120,40 100,30"
                        stroke="#84cc16"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                    />
                </g>
            </svg>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6">
                Analyzing your essence...
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
                Crafting your path to balance.
            </p>
        </div>
    );
};

export default GeneratingBioPlan;
