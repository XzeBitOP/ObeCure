import React from 'react';

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>
);

interface LogSleepProps {
    onLogSleepClick: () => void;
}

const LogSleep: React.FC<LogSleepProps> = ({ onLogSleepClick }) => {
    return (
        <div className="flex flex-col items-center">
            <button
                onClick={onLogSleepClick}
                className="relative w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 font-bold text-xs shadow-inner hover:bg-gray-300 dark:hover:bg-gray-600 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 dark:focus:ring-offset-gray-800 active:scale-95"
                aria-label="Log Sleep"
            >
                <div className="absolute w-6 h-6 text-yellow-400 dark:text-yellow-300">
                    <MoonIcon />
                </div>
                <span className="relative z-10 font-bold text-gray-800 dark:text-gray-200">Zzz</span>
            </button>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Log Sleep</span>
        </div>
    );
};

export default LogSleep;