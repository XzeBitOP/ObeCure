import React, { useState, useEffect } from 'react';

const ExpirationNotice: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const expirationDate = new Date('2026-01-01T00:00:00Z').getTime();

        const calculateTime = () => {
            const now = new Date().getTime();
            const distance = expirationDate - now;

            if (distance < 0) {
                setIsExpired(true);
                setTimeLeft(null);
                if(interval) clearInterval(interval);
            } else {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft({ days, hours, minutes, seconds });
                setIsExpired(false);
            }
        };

        calculateTime(); // Initial calculation
        const interval = setInterval(calculateTime, 1000);

        return () => clearInterval(interval);
    }, []);

    if (isExpired) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 z-[100] flex justify-center items-center p-4 animate-fade-in" role="dialog" aria-modal="true">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-red-300 dark:border-red-700 text-center animate-fade-in-up">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                        Preview Has Expired
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Thank you for using the ObeCure Assistant preview. Please upgrade to the full version or contact ObeCure for further assistance.
                    </p>
                </div>
            </div>
        );
    }

    if (!timeLeft) {
        return null; // Don't show anything while calculating for the first time
    }

    return (
        <div className="bg-yellow-400/80 dark:bg-yellow-800/80 text-yellow-900 dark:text-yellow-200 text-xs sm:text-sm font-semibold p-2 text-center shadow-md">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-center items-center gap-x-4 gap-y-1">
                 <p>
                    <span className="font-bold">PREVIEW VERSION:</span> This app will stop functioning on Jan 1, 2026.
                </p>
                <div className="flex items-center gap-x-2 font-mono" aria-live="polite">
                    <span>{String(timeLeft.days).padStart(2, '0')}d</span>
                    <span>:</span>
                    <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
                    <span>:</span>
                    <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
                    <span>:</span>
                    <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
                </div>
            </div>
        </div>
    );
};

export default ExpirationNotice;
