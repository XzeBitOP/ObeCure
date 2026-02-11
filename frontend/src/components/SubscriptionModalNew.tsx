import React, { useState } from 'react';
import { subscriptionAPI } from '../services/api';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccessfulRedeem: (durationInMonths: number) => void;
}

type Plan = {
    name: string;
    months: number;
    price: number;
    isBestValue?: boolean;
    description: string;
};

const plans: Plan[] = [
    { name: '1 Month', months: 1, price: 69, description: 'Perfect for trying out' },
    { name: '6 Months', months: 6, price: 399, description: 'Most popular choice', isBestValue: true },
    { name: '1 Year', months: 12, price: 799, description: 'Best value for money' },
];

const UPI_ID = 'xzecure2022@ybl';
const WHATSAPP_NUMBER = '+916355137969';
const SUPPORT_NUMBER = '+916355137969';

const SubscriptionModalNew: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSuccessfulRedeem }) => {
    const [activeTab, setActiveTab] = useState<'plans' | 'redeem'>('plans');
    const [selectedPlan, setSelectedPlan] = useState<Plan>(plans[1]);
    const [redeemCode, setRedeemCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handlePayWithUPI = (plan: Plan) => {
        // Create UPI payment link
        const upiLink = `upi://pay?pa=${UPI_ID}&pn=ObeCure&am=${plan.price}&cu=INR&tn=ObeCure ${plan.name} Subscription`;
        
        // Try to open UPI app
        window.location.href = upiLink;
        
        // Show WhatsApp message after a delay
        setTimeout(() => {
            const message = encodeURIComponent(
                `Hi! I've just made a payment of ₹${plan.price} for ObeCure ${plan.name} subscription. Please find my payment screenshot attached.`
            );
            window.open(`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${message}`, '_blank');
        }, 2000);
    };

    const copyUPI = () => {
        navigator.clipboard.writeText(UPI_ID);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRedeemCode = async () => {
        if (!redeemCode.trim()) {
            setError('Please enter a redeem code');
            return;
        }

        if (redeemCode.trim().length !== 14) {
            setError('Redeem code must be 14 characters');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await subscriptionAPI.redeemCode(redeemCode.trim());
            setSuccess(response.message);
            setTimeout(() => {
                onSuccessfulRedeem(response.duration_months);
                onClose();
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Invalid redeem code. Please check and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative animate-fade-in-up">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-white/80 dark:bg-gray-800/80 rounded-full p-2"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-8 text-white text-center rounded-t-2xl">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-full mb-4">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Unlock Premium Features</h2>
                    <p className="text-white/90">Access BioAdaptive & My Body Analytics</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('plans')}
                        className={`flex-1 py-4 px-6 font-semibold transition-all ${
                            activeTab === 'plans'
                                ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-50/50 dark:bg-orange-900/20'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        Subscribe Now
                    </button>
                    <button
                        onClick={() => setActiveTab('redeem')}
                        className={`flex-1 py-4 px-6 font-semibold transition-all ${
                            activeTab === 'redeem'
                                ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-50/50 dark:bg-orange-900/20'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        Redeem Code
                    </button>
                </div>

                <div className="p-8">
                    {activeTab === 'plans' ? (
                        <>
                            {/* Plans Grid */}
                            <div className="grid gap-4 mb-6">
                                {plans.map((plan) => (
                                    <div
                                        key={plan.months}
                                        onClick={() => setSelectedPlan(plan)}
                                        className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                                            selectedPlan.months === plan.months
                                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg scale-[1.02]'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700'
                                        }`}
                                    >
                                        {plan.isBestValue && (
                                            <div className="absolute -top-3 right-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                                🔥 BEST VALUE
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{plan.name}</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{plan.description}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-3xl font-bold text-orange-500">₹{plan.price}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    ₹{Math.round(plan.price / plan.months)}/month
                                                </div>
                                            </div>
                                        </div>
                                        {selectedPlan.months === plan.months && (
                                            <div className="absolute top-4 left-4 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Payment Instructions */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
                                <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Payment Instructions
                                </h4>
                                <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                    <li className="flex gap-2">
                                        <span className="font-bold text-blue-500">1.</span>
                                        <span>Click "Pay with UPI" button below</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="font-bold text-blue-500">2.</span>
                                        <span>Complete payment of <strong>₹{selectedPlan.price}</strong> to UPI ID: <strong>{UPI_ID}</strong></span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="font-bold text-blue-500">3.</span>
                                        <span>Take a screenshot of successful payment</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="font-bold text-blue-500">4.</span>
                                        <span>Send screenshot to WhatsApp: <strong>{WHATSAPP_NUMBER}</strong></span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="font-bold text-blue-500">5.</span>
                                        <span>Receive your 14-digit redeem code within 24 hours</span>
                                    </li>
                                </ol>
                            </div>

                            {/* UPI ID Display */}
                            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">UPI ID</p>
                                        <p className="font-mono font-bold text-lg text-gray-800 dark:text-gray-100">{UPI_ID}</p>
                                    </div>
                                    <button
                                        onClick={copyUPI}
                                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        {copied ? (
                                            <>
                                                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-sm text-green-500">Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-sm">Copy</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Pay Button */}
                            <button
                                onClick={() => handlePayWithUPI(selectedPlan)}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-3 mb-4"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                Pay ₹{selectedPlan.price} with UPI
                            </button>

                            {/* Refund Policy */}
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                <p className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                    <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <span>
                                        <strong>Refund Policy:</strong> If payment is deducted but you don't receive the code, 
                                        call us at <strong>{SUPPORT_NUMBER}</strong> to claim a full refund.
                                    </span>
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Redeem Code Section */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Enter Your 14-Digit Redeem Code
                                    </label>
                                    <input
                                        type="text"
                                        value={redeemCode}
                                        onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                                        maxLength={14}
                                        placeholder="XXXX-XXXX-XXXX"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all font-mono text-lg text-center tracking-wider"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        Enter the code you received after payment verification
                                    </p>
                                </div>

                                {error && (
                                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        {success}
                                    </div>
                                )}

                                <button
                                    onClick={handleRedeemCode}
                                    disabled={loading || redeemCode.length !== 14}
                                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-4 px-6 rounded-xl hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Redeeming...
                                        </span>
                                    ) : (
                                        'Redeem Code'
                                    )}
                                </button>

                                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">How it works:</h4>
                                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                        <li className="flex gap-2">
                                            <span>•</span>
                                            <span>Code contains <strong>'Y'</strong> → 1 Year access</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span>•</span>
                                            <span>Code contains <strong>'6'</strong> → 6 Months access</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span>•</span>
                                            <span>Code contains <strong>'1'</strong> → 1 Month access</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionModalNew;
