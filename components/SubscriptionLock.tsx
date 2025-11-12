import React from 'react';

interface SubscriptionLockProps {
    onOpenSubscriptionModal: () => void;
    featureName: string;
    description: string;
    icon: React.ReactNode;
}

const SubscriptionLock: React.FC<SubscriptionLockProps> = ({ onOpenSubscriptionModal, featureName, description, icon }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center animate-fade-in-up">
            {icon}
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Unlock {featureName}</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {description}
            </p>
            <button
                onClick={onOpenSubscriptionModal}
                className="mt-6 bg-orange-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-orange-600 transition-all duration-300 shadow-md active:scale-95"
            >
                Subscribe Now
            </button>

            <a
                href="https://www.xzecure.co.in/buy"
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-6 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/30 border-2 border-dashed border-orange-400/50 hover:border-orange-500 dark:hover:border-orange-400 hover:bg-orange-100/80 dark:hover:bg-orange-900/50 transition-all duration-300 group"
            >
                <p className="font-semibold text-orange-700 dark:text-orange-300 group-hover:text-orange-800 dark:group-hover:text-orange-200 transition-colors">
                    Buy our starter pack to get 6 month free access of the app
                </p>
            </a>
        </div>
    );
};

export default SubscriptionLock;