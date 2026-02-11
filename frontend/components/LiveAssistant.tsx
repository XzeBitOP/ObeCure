import React from 'react';
import { useLiveAssistant } from '../hooks/useLiveAssistant';
import { MicIcon } from './icons/MicIcon';
import { StopIcon } from './icons/StopIcon';
import { LeafIcon } from './icons/LeafIcon';

interface LiveAssistantProps {
    isSubscribed: boolean;
    onOpenSubscriptionModal: () => void;
}

const LiveAssistant: React.FC<LiveAssistantProps> = ({ isSubscribed, onOpenSubscriptionModal }) => {
    const { status, startSession, stopSession, error } = useLiveAssistant();

    const handleButtonClick = () => {
        if (status === 'active' || status === 'connecting') {
            stopSession();
        } else {
            startSession();
        }
    };
    
    if (!isSubscribed) {
        return (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center animate-fade-in-up">
                <MicIcon className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Unlock Live Wellness Assistant</h2>
                <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    This premium feature provides a real-time voice assistant to answer your diet and nutrition questions. Subscribe to start talking!
                </p>
                <button
                    onClick={onOpenSubscriptionModal}
                    className="mt-6 bg-orange-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-orange-600 transition-all duration-300 shadow-md active:scale-95"
                >
                    Subscribe Now
                </button>
            </div>
        );
    }

    const getStatusInfo = () => {
        switch (status) {
            case 'connecting':
                return { text: 'Connecting...', icon: <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>, color: 'bg-yellow-500' };
            case 'active':
                return { text: 'Listening... Tap to stop.', icon: <StopIcon className="w-12 h-12" />, color: 'bg-red-500' };
            case 'error':
                 return { text: 'Tap to retry', icon: <MicIcon className="w-12 h-12" />, color: 'bg-gray-500' };
            case 'idle':
            default:
                return { text: 'Tap to start conversation', icon: <MicIcon className="w-12 h-12" />, color: 'bg-orange-500' };
        }
    };

    const { text, icon, color } = getStatusInfo();

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 animate-fade-in">
            <div className="flex flex-col items-center justify-center text-center min-h-[400px]">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    Live Wellness Assistant
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Ask me anything about your diet, nutrition, or wellness!
                </p>

                <button
                    onClick={handleButtonClick}
                    disabled={status === 'connecting'}
                    className={`relative w-48 h-48 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-2xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-opacity-50 active:scale-95 disabled:cursor-wait ${color} ${
                        status === 'active' ? 'animate-pulse' : ''
                    } dark:focus:ring-opacity-30`}
                    aria-label={status === 'active' ? 'Stop session' : 'Start session'}
                >
                    {icon}
                </button>

                <p className="mt-6 font-semibold text-gray-700 dark:text-gray-300 h-6">
                    {text}
                </p>
                {error && <p className="mt-2 text-sm text-red-500 dark:text-red-400 max-w-sm">{error}</p>}
            </div>
        </div>
    );
};

export default LiveAssistant;
