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
        </div>
    );
};

export default SubscriptionLock;
