import React, { useRef, useEffect } from 'react';
import LogSleep from './LogSleep';
import NotificationBell from './NotificationBell';
import { InstallIcon } from './icons/InstallIcon';

const ObeCureLogo: React.FC = () => {
    return (
        <div className="flex items-center space-x-3">
             <svg width="48" height="48" viewBox="0 0 100 100" className="drop-shadow-lg">
                <circle cx="50" cy="26" r="12" fill="#f97316" />
                <path d="M 30,42 C 18,50 18,78 34,86 L 66,86 C 82,78 82,50 70,42 C 66,54 58,62 50,62 C 42,62 34,54 30,42 Z" fill="#f97316" />
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
  isNotificationOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onLogSleepClick, showInstallButton, onInstallClick, isNotificationUnread, onToggleNotification, isNotificationOpen }) => {
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        if (isNotificationOpen) {
          onToggleNotification();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen, onToggleNotification]);
    
  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
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
            <div className="relative" ref={notificationRef}>
                <NotificationBell
                    isUnread={isNotificationUnread}
                    onToggle={onToggleNotification}
                />
                {isNotificationOpen && (
                    <div className="absolute top-full right-0 mt-3 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 animate-dropdown origin-top-right">
                        <div className="flex justify-between items-center p-3 border-b border-gray-100 dark:border-gray-700">
                            <h4 className="font-bold text-gray-800 dark:text-gray-200">Notifications</h4>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            <a href="https://forms.gle/EpgrzJT9PaA57G6B9" target="_blank" rel="noopener noreferrer" className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <p className="font-semibold text-orange-600 dark:text-orange-400">Consultation Recommended</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Please visit an ObeCure clinic for a consultation before starting your plan to ensure the best results.
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-right">Just now</p>
                            </a>
                        </div>
                    </div>
                )}
            </div>
            <LogSleep onLogSleepClick={onLogSleepClick} />
         </div>
      </div>
    </header>
  );
};

export default Header;