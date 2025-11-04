import React from 'react';
import LogSleep from './LogSleep';

const ObeCureLogo: React.FC = () => {
    return (
        <div className="flex items-center space-x-3">
             <svg width="48" height="48" viewBox="0 0 100 100" className="drop-shadow-lg">
                <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#fbbf24', stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: '#f97316', stopOpacity: 1}} />
                    </linearGradient>
                </defs>
                <circle cx="50" cy="20" r="15" fill="url(#logoGradient)" />
                <path d="M 25,40 C 10,50 10,85 30,95 L 70,95 C 90,85 90,50 75,40 C 70,55 60,65 50,65 C 40,65 30,55 25,40 Z" fill="url(#logoGradient)" />
            </svg>
            <div>
                <span className="text-3xl font-bold tracking-tight text-gray-800 dark:text-gray-200">
                    Obe<span className="text-orange-500">Cure</span>
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium -mt-1 tracking-tight">
                    Lose Fat. Keep Taste. Build Strength.
                </p>
            </div>
        </div>
    );
};


const Header: React.FC = () => {
  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
      <div className="max-w-5xl mx-auto py-4 px-4 sm:px-6 md:px-8 flex justify-between items-center">
         <ObeCureLogo />
         <div className="flex items-center space-x-4">
            <p className="hidden sm:block font-medium text-gray-600 dark:text-gray-300">Your Path to a Healthier You</p>
            <LogSleep />
         </div>
      </div>
    </header>
  );
};

export default Header;