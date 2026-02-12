import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
    onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Animate progress bar from 0 to 100 over 2 seconds
        const duration = 2000; // 2 seconds
        const steps = 50;
        const increment = 100 / steps;
        const stepDuration = duration / steps;

        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += increment;
            if (currentProgress >= 100) {
                currentProgress = 100;
                clearInterval(interval);
                setTimeout(onComplete, 200); // Small delay after reaching 100%
            }
            setProgress(currentProgress);
        }, stepDuration);

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 animate-gradient-pulse">
            {/* Logo */}
            <div className="mb-8 animate-bounce-in">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-3xl shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform">
                    <svg className="w-20 h-20 md:w-24 md:h-24 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </div>
            </div>

            {/* App Name */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 animate-fade-in-up">
                ObeCure
            </h1>
            <p className="text-white/90 text-lg md:text-xl mb-12 animate-fade-in-up font-light">
                Your Health, Your Way
            </p>

            {/* Progress Bar Container */}
            <div className="w-64 md:w-80 h-2 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
                <div
                    className="h-full bg-gradient-to-r from-white to-orange-200 rounded-full transition-all duration-100 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Loading Text */}
            <p className="text-white/80 text-sm mt-4 animate-pulse">
                Loading your wellness journey...
            </p>
        </div>
    );
};

export default SplashScreen;
