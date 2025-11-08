import React, { useState, useEffect, useCallback } from 'react';

const BellIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const BellOffIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 17l-6-6m0 0l6-6m-6 6h18" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.73 21a2 2 0 01-3.46 0" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.607 14.607a8.04 8.04 0 01-1.328 1.328M9 17H4a2 2 0 01-2-2V7a2 2 0 012-2h1m6 0h5a2 2 0 012 2v3m-3 0V7" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
  </svg>
);


interface NotificationBellProps {
    subscriptionExpiry: number | null;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ subscriptionExpiry }) => {
    const [permission, setPermission] = useState('default');

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const postSubscriptionStatus = useCallback(() => {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SET_SUBSCRIPTION_EXPIRY',
                expiry: subscriptionExpiry
            });
        }
    }, [subscriptionExpiry]);

    useEffect(() => {
        if (permission === 'granted') {
            const swr = navigator.serviceWorker.ready;
            swr.then(() => {
                postSubscriptionStatus();
            });
        }
    }, [permission, postSubscriptionStatus]);

    const requestPermission = async () => {
        if (!('Notification' in window)) {
            alert('This browser does not support desktop notification');
            return;
        }
        if (permission === 'default') {
            const newPermission = await Notification.requestPermission();
            setPermission(newPermission);
            if (newPermission === 'granted') {
                postSubscriptionStatus();
            }
        }
    };

    const getTooltip = () => {
        switch(permission) {
            case 'granted': return 'Daily notifications are enabled.';
            case 'denied': return 'Notifications are blocked. Please enable them in your browser settings.';
            default: return 'Click to enable daily motivational notifications.';
        }
    };
    
    return (
         <div className="flex flex-col items-center">
            <button
                onClick={requestPermission}
                disabled={permission !== 'default'}
                title={getTooltip()}
                className="relative w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 font-bold text-xs shadow-inner hover:bg-gray-300 dark:hover:bg-gray-600 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 dark:focus:ring-offset-gray-800 active:scale-95 disabled:cursor-not-allowed"
            >
                {permission === 'granted' 
                    ? <BellIcon className="text-green-500"/> 
                    : <BellOffIcon className={permission === 'denied' ? 'text-red-500' : 'text-gray-500'}/>
                }
            </button>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Notifications</span>
        </div>
    );
};

export default NotificationBell;
