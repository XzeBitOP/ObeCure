import React, { useState } from 'react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessfulRedeem: (durationInMonths: number) => void;
}

type Plan = {
    name: string;
    months: number;
    originalPrice: number;
    discountedPrice: number;
    isBestValue?: boolean;
};

const plans: Plan[] = [
    { name: '1 Month Access', months: 1, originalPrice: 99, discountedPrice: 69 },
    { name: '6 Months Access', months: 6, originalPrice: 499, discountedPrice: 399 },
    { name: '1 Year Access', months: 12, originalPrice: 999, discountedPrice: 799, isBestValue: true },
];

const USED_REDEEM_CODES_KEY = 'obeCureUsedRedeemCodes';

const ChevronLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);


const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSuccessfulRedeem }) => {
    const [redeemCode, setRedeemCode] = useState('');
    const [validationMessage, setValidationMessage] = useState<string | null>(null);
    const [currentPlanIndex, setCurrentPlanIndex] = useState(0);
    const [touchStartX, setTouchStartX] = useState<number | null>(null);

    const goToNextPlan = () => {
        setCurrentPlanIndex((prevIndex) => Math.min(prevIndex + 1, plans.length - 1));
    };

    const goToPrevPlan = () => {
        setCurrentPlanIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    };
    
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStartX(e.touches[0].clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX === null) return;
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;

        if (diff > 50) { // Swiped left
            goToNextPlan();
        } else if (diff < -50) { // Swiped right
            goToPrevPlan();
        }
        setTouchStartX(null);
    };


    const handlePay = (plan: Plan) => {
        const text = encodeURIComponent(`I would like to subscribe to the ObeCure ${plan.name} for ₹${plan.discountedPrice}.`);
        window.open(`https://wa.me/916355137969?text=${text}`, '_blank');
    };

    const getUsedCodes = (): string[] => {
        try {
            const codesRaw = localStorage.getItem(USED_REDEEM_CODES_KEY);
            return codesRaw ? JSON.parse(codesRaw) : [];
        } catch (e) {
            console.error("Failed to parse used redeem codes", e);
            return [];
        }
    };

    const saveUsedCode = (newCode: string) => {
        const currentCodes = getUsedCodes();
        const updatedCodes = [...new Set([newCode, ...currentCodes])];
        localStorage.setItem(USED_REDEEM_CODES_KEY, JSON.stringify(updatedCodes));
    };

    const handleRedeemCode = () => {
        const code = redeemCode.trim().toUpperCase();
        setValidationMessage(null);

        if (code.length !== 14 || !/^[A-Z0-9]{14}$/.test(code)) {
            setValidationMessage('Invalid code format. Must be 14 alphanumeric characters.');
            return;
        }

        const usedCodes = getUsedCodes();
        if (usedCodes.includes(code)) {
            setValidationMessage('This code has already been redeemed.');
            return;
        }

        let months = 0;
        if (code.endsWith('099')) {
            months = 1;
        } else if (code.endsWith('499')) {
            months = 6;
        } else if (code.endsWith('999')) {
            months = 12;
        }

        if (months > 0) {
            saveUsedCode(code);
            onSuccessfulRedeem(months);
        } else {
            setValidationMessage('This code is not valid. Please try again.');
        }
    };
  
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-gray-200 dark:border-gray-700 transform animate-bounce-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start">
                    <div>
                         <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                            Unlock Full Access
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose a plan to continue your health journey.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition text-2xl -mt-2">&times;</button>
                </div>
                
                <div className="relative mt-6">
                    <div 
                        className="overflow-hidden"
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${currentPlanIndex * 100}%)` }}>
                            {plans.map((plan) => (
                                <div key={plan.months} className="flex-shrink-0 w-full px-1">
                                    <div className={`relative p-6 rounded-2xl border-2 text-center transition-all duration-300 h-full flex flex-col justify-between min-h-[320px] ${plan.isBestValue ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'}`}>
                                        {plan.isBestValue && <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">BEST VALUE</div>}
                                        
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mt-2">{plan.name}</h3>
                                            <p className="my-2">
                                                <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">₹{plan.discountedPrice}</span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400"> / {plan.months} mo</span>
                                            </p>
                                            <p className="text-sm text-gray-400 dark:text-gray-500 line-through">₹{plan.originalPrice}</p>
                                        </div>

                                        <ul className="text-left my-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                            <li className="flex items-center gap-2">
                                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                                <span>Personalized Diet Plans</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                                <span>Custom Workout Routines</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                                <span>Track Your Progress</span>
                                            </li>
                                        </ul>

                                        <button onClick={() => handlePay(plan)} className="mt-auto w-full bg-green-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-600 transition-all text-base active:scale-95 shadow">
                                            Contact to Pay
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <button onClick={goToPrevPlan} disabled={currentPlanIndex === 0} className="absolute top-1/2 -translate-y-1/2 -left-4 p-1 bg-white dark:bg-gray-700 rounded-full shadow-md disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                        <ChevronLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                    </button>
                    <button onClick={goToNextPlan} disabled={currentPlanIndex === plans.length - 1} className="absolute top-1/2 -translate-y-1/2 -right-4 p-1 bg-white dark:bg-gray-700 rounded-full shadow-md disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                        <ChevronRightIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                    </button>
                </div>

                {currentPlanIndex < plans.findIndex(p => p.isBestValue) && (
                    <div className="text-center mt-3 text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1 animate-pulse">
                        <span>Slide to get best plan</span>
                        <ChevronRightIcon className="w-4 h-4" />
                    </div>
                )}

                <div className="flex justify-center gap-2 mt-4">
                    {plans.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentPlanIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${currentPlanIndex === index ? 'bg-orange-500 scale-125' : 'bg-gray-300 dark:bg-gray-600'}`}
                            aria-label={`Go to plan ${index + 1}`}
                        />
                    ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 text-center tracking-wide">Have a Code?</h3>
                    <div className="flex flex-col sm:flex-row gap-2 mt-3 max-w-md mx-auto">
                        <input
                            type="text"
                            value={redeemCode}
                            onChange={(e) => setRedeemCode(e.target.value)}
                            placeholder="Enter 14-character code"
                            maxLength={14}
                            className="flex-grow w-full px-4 py-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition uppercase"
                            style={{fontFamily: 'monospace', textTransform: 'uppercase'}}
                        />
                        <button onClick={handleRedeemCode} className="w-full sm:w-auto bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-all shadow-md active:scale-95">
                            Redeem
                        </button>
                    </div>
                    {validationMessage && (
                        <p className={`mt-2 text-center text-sm font-medium text-red-600 dark:text-red-400`}>
                            {validationMessage}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionModal;