import React from 'react';
import LogSleep from './LogSleep';
import NotificationBell from './NotificationBell';
import { InstallIcon } from './icons/InstallIcon';

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
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-800 dark:text-gray-200">
                    Obe<span className="text-orange-500">Cure</span>
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium -mt-1 tracking-tight">
                    Lose Fat. Keep Taste. Build Strength.
                </p>
            </div>
        </div>
    );
};

interface HeaderProps {
  onLogSleepClick: () => void;
  showInstallButton: boolean;
  onInstallClick: () => void;
  isNotificationUnread: boolean;
  onToggleNotification: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogSleepClick, showInstallButton, onInstallClick, isNotificationUnread, onToggleNotification }) => {
  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
      <div className="max-w-5xl mx-auto py-4 px-4 sm:px-6 md:px-8 flex justify-between items-center">
         <ObeCureLogo />
         <div className="flex items-center space-x-1 sm:space-x-4">
            <p className="hidden md:block font-medium text-gray-600 dark:text-gray-300">Your Path to a Healthier You</p>
            {showInstallButton && (
                <div className="flex flex-col items-center">
                    <button
                        onClick={onInstallClick}
                        className="relative w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 shadow-inner hover:bg-gray-300 dark:hover:bg-gray-600 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 dark:focus:ring-offset-gray-800 active:scale-95"
                        aria-label="Install App"
                    >
                        <InstallIcon className="w-6 h-6 text-orange-500" />
                    </button>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Install App</span>
                </div>
            )}
            <NotificationBell
                isUnread={isNotificationUnread}
                onToggle={onToggleNotification}
            />
            <LogSleep onLogSleepClick={onLogSleepClick} />
         </div>
      </div>
    </header>
  );
};

export default Header;