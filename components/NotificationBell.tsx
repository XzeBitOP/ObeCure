import React from 'react';

const BellIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

interface NotificationBellProps {
    isUnread: boolean;
    onToggle: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ isUnread, onToggle }) => {
    return (
        <div className="flex flex-col items-center">
            <button
                onClick={onToggle}
                title="View notifications"
                className="relative w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 shadow-inner hover:bg-gray-300 dark:hover:bg-gray-600 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 dark:focus:ring-offset-gray-800 active:scale-95"
            >
                <BellIcon className="text-orange-500 w-6 h-6"/> 
                {isUnread && <span className="absolute top-2 right-2 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>}
            </button>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Notifications</span>
        </div>
    );
};

export default NotificationBell;