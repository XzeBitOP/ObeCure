import React, { useState, useEffect } from 'react';
import { ClipboardListIcon } from './icons/ClipboardListIcon'; // Reusing an icon for copy button

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

// --- VALIDATION LOGIC ---

const validateRedeemCode = (code: string): number => {
    if (!code || code.length !== 14) return 0;
    
    const upperCode = code.toUpperCase();

    // 1. New "Contains" Logic (Hidden Rules)
    // 12 Months: Must contain '1', 'Y', and '2'
    if (upperCode.includes('1') && upperCode.includes('Y') && upperCode.includes('2')) return 12;
    
    // 6 Months: Must contain '6' and 'M'
    if (upperCode.includes('6') && upperCode.includes('M')) return 6;

    // 1 Month: Must contain '1' and 'M'
    if (upperCode.includes('1') && upperCode.includes('M')) return 1;

    // 2. Legacy Suffix Logic (Standard)
    // Code ends in specific 3-digit markers
    if (upperCode.endsWith('099')) return 1;
    if (upperCode.endsWith('499')) return 6;
    if (upperCode.endsWith('999')) return 12;
    
    return 0;
};

// Generates a standard Suffix-based code for admin use
const generateNewCode = (months: number): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let base = '';
    // Generate 11 random characters
    for (let i = 0; i < 11; i++) {
        base += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Append specific suffix based on duration
    if (months === 1) return base + '099';
    if (months === 6) return base + '499';
    if (months === 12) return base + '999';
    
    return base + '099'; // Fallback
};


const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSuccessfulRedeem }) => {
    const [redeemCode, setRedeemCode] = useState('');
    const [validationMessage, setValidationMessage] = useState<string | null>(null);
    const [currentPlanIndex, setCurrentPlanIndex] = useState(0);
    const [touchStartX, setTouchStartX] = useState<number | null>(null);

    // Admin Generator State
    const [titleClickCount, setTitleClickCount] = useState(0);
    const [showAdmin, setShowAdmin] = useState(false);
    const [adminSelectedPlan, setAdminSelectedPlan] = useState(1);
    const [generatedCode, setGeneratedCode] = useState('');

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

        // Handle temporary preview code (Legacy)
        if (code === 'PREVIEWMODE123') {
            const expiryDate = new Date('2026-01-01T00:00:00Z');
            if (new Date() > expiryDate) {
                setValidationMessage('This preview code has expired.');
                return;
            }
            onSuccessfulRedeem(2); // Grant 2 months access
            return; 
        }

        if (code.length !== 14) {
            setValidationMessage('Invalid code format. Must be 14 characters.');
            return;
        }

        const usedCodes = getUsedCodes();
        if (usedCodes.includes(code)) {
            setValidationMessage('This code has already been redeemed.');
            return;
        }

        const months = validateRedeemCode(code);

        if (months > 0) {
            saveUsedCode(code);
            onSuccessfulRedeem(months);
        } else {
            setValidationMessage('This code is not valid. Please check for typos.');
        }
    };

    // Admin Access
    const handleTitleClick = () => {
        setTitleClickCount(prev => {
            const newCount = prev + 1;
            if (newCount >= 5) {
                setShowAdmin(true);
                return 0;
            }
            return newCount;
        });
        // Reset count after 3 seconds of inactivity
        setTimeout(() => setTitleClickCount(0), 3000);
    };

    const handleGenerateCode = () => {
        const code = generateNewCode(adminSelectedPlan);
        setGeneratedCode(code);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedCode);
        alert("Code copied!");
    };
  
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-xs border border-gray-200 dark:border-slate-700 transform animate-bounce-in flex flex-col max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start">
                    <div onClick={handleTitleClick} className="select-none cursor-default">
                         <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                            Unlock Full Access
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose a plan to continue your health journey.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition text-2xl -mt-2">&times;</button>
                </div>
                
                <div className="relative mt-4">
                    <div 
                        className="overflow-hidden"
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${currentPlanIndex * 100}%)` }}>
                            {plans.map((plan) => (
                                <div key={plan.months} className="flex-shrink-0 w-full px-1">
                                    <div className={`relative p-4 rounded-2xl border-2 text-center transition-all duration-300 h-full flex flex-col justify-between ${plan.isBestValue ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-transparent bg-gray-50 dark:bg-slate-900'}`}>
                                        {plan.isBestValue && <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">BEST VALUE</div>}
                                        
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mt-2">{plan.name}</h3>
                                            <p className="my-2">
                                                <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">₹{plan.discountedPrice}</span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400"> / {plan.months} mo</span>
                                            </p>
                                            <p className="text-sm text-gray-400 dark:text-gray-500 line-through">₹{plan.originalPrice}</p>
                                        </div>

                                        <ul className="text-left my-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                            <li className="flex items-center gap-2">
                                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                                <span>Personalized AI Diet Plans</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                                <span>BioAdaptive Ayurveda™ Plans</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                                <span>Custom Workout Routines</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                                <span>Detailed Progress Analytics</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                                <span>WhatsApp Plan Sharing</span>
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
                    
                    <button onClick={goToPrevPlan} disabled={currentPlanIndex === 0} className="absolute top-1/2 -translate-y-1/2 -left-2 p-1 bg-white dark:bg-gray-700 rounded-full shadow-md disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                        <ChevronLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                    </button>
                    <button onClick={goToNextPlan} disabled={currentPlanIndex === plans.length - 1} className="absolute top-1/2 -translate-y-1/2 -right-2 p-1 bg-white dark:bg-gray-700 rounded-full shadow-md disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                        <ChevronRightIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                    </button>
                </div>

                {currentPlanIndex < plans.findIndex(p => p.isBestValue) && (
                    <div className="text-center mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1 animate-pulse">
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

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 text-center tracking-wide">Have a Code?</h3>
                    <div className="flex flex-col sm:flex-row gap-2 mt-3 max-w-md mx-auto">
                        <input
                            type="text"
                            value={redeemCode}
                            onChange={(e) => setRedeemCode(e.target.value)}
                            placeholder="Enter redeem code"
                            maxLength={14}
                            className="flex-grow w-full px-4 py-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition uppercase text-sm font-mono"
                        />
                        <button onClick={handleRedeemCode} className="w-full sm:w-auto bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-all shadow-md active:scale-95 text-sm">
                            Redeem
                        </button>
                    </div>
                    {validationMessage && (
                        <p className={`mt-2 text-center text-xs font-medium text-red-600 dark:text-red-400`}>
                            {validationMessage}
                        </p>
                    )}
                </div>

                {/* Hidden Admin Generator */}
                {showAdmin && (
                    <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-600">
                        <h4 className="font-bold text-slate-700 dark:text-slate-200 text-center mb-2">👑 Admin Generator</h4>
                        <div className="flex gap-2 mb-2">
                            <select 
                                value={adminSelectedPlan} 
                                onChange={(e) => setAdminSelectedPlan(parseInt(e.target.value))}
                                className="flex-1 p-2 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600"
                            >
                                <option value={1}>1 Month</option>
                                <option value={6}>6 Months</option>
                                <option value={12}>12 Months</option>
                            </select>
                            <button 
                                onClick={handleGenerateCode}
                                className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
                            >
                                Generate
                            </button>
                        </div>
                        {generatedCode && (
                             <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded border border-slate-300 dark:border-slate-600">
                                <span className="font-mono font-bold text-green-600 dark:text-green-400 tracking-wider select-all">{generatedCode}</span>
                                <button onClick={copyToClipboard} className="text-slate-500 hover:text-blue-500">
                                    <ClipboardListIcon className="w-5 h-5" />
                                </button>
                             </div>
                        )}
                        <p className="text-[10px] text-slate-500 text-center mt-1">Tap 'Unlock Full Access' title 5x to toggle this.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubscriptionModal;