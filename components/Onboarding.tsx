import React, { useState, useEffect, useRef } from 'react';
import SubscriptionModal from './SubscriptionModal';
import CongratulationsModal from './CongratulationsModal';
import { Sex } from '../types';
import { YouTubeIcon } from './icons/YouTubeIcon';

const motivationalQuotes = [
    "You don’t need to be perfect — just persistent.",
    "Every step counts. Even this one.",
    "Transform from within. One choice at a time.",
    "You’re not alone — ObeCure walks with you.",
    "It’s not about losing weight. It’s about gaining control.",
    "Your story of change begins today.",
    "Small actions. Big difference. Lifelong results.",
    "Because feeling good is the real goal.",
    "Science meets self-care — welcome to ObeCure.",
    "Strong body. Calm mind. Clear path.",
];

const USER_PREFERENCES_KEY = 'obeCureUserPreferences';
const SUBSCRIPTION_KEY = 'obeCureSubscriptionExpiry';

interface OnboardingProps {
  onComplete: () => void;
}

const SplashLogo: React.FC = () => {
    return (
        <div className="flex flex-col items-center space-y-4">
             <svg width="128" height="128" viewBox="0 0 100 100" className="drop-shadow-lg">
                <defs>
                    <linearGradient id="logoGradientSplash" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#fbbf24', stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: '#f97316', stopOpacity: 1}} />
                    </linearGradient>
                </defs>
                <circle cx="50" cy="20" r="15" fill="url(#logoGradientSplash)" />
                <path d="M 25,40 C 10,50 10,85 30,95 L 70,95 C 90,85 90,50 75,40 C 70,55 60,65 50,65 C 40,65 30,55 25,40 Z" fill="url(#logoGradientSplash)" />
            </svg>
            <span className="text-5xl sm:text-6xl font-bold tracking-tight text-gray-200">
                Obe<span className="text-orange-500">Cure</span>
            </span>
        </div>
    );
};


const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState('splash');
  const [quote, setQuote] = useState('');

  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    sex: Sex.FEMALE,
    phone: '',
    patientWeight: '',
  });

  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isCongratsModalOpen, setIsCongratsModalOpen] = useState(false);
  const [unlockedMonths, setUnlockedMonths] = useState(0);
  
  const patientNameRef = useRef<HTMLInputElement>(null);
  const ageRef = useRef<HTMLInputElement>(null);
  const sexRef = useRef<HTMLSelectElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const patientWeightRef = useRef<HTMLInputElement>(null);
  const beginButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    const timer = setTimeout(() => {
      setStep('form');
    }, 5000);
    return () => clearTimeout(timer);
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const focusAndScroll = (ref: React.RefObject<HTMLElement>) => {
    if (ref.current) {
        ref.current.focus({ preventScroll: true });
        ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, nextRef: React.RefObject<HTMLElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        focusAndScroll(nextRef);
    }
  };

  const handleBegin = () => {
    if (!formData.age) {
        alert("Please fill in your age to begin.");
        focusAndScroll(ageRef);
        return;
    }
    if (!formData.patientWeight) {
        alert("Please fill in your current weight to begin.");
        focusAndScroll(patientWeightRef);
        return;
    }

    let prefsToSave: any = {};
    try {
        const savedPrefsRaw = localStorage.getItem(USER_PREFERENCES_KEY);
        if (savedPrefsRaw) {
            prefsToSave = JSON.parse(savedPrefsRaw);
        }
    } catch(e) { console.error("Could not parse existing prefs"); }

    prefsToSave = { ...prefsToSave, ...formData };
    
    localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(prefsToSave));
    onComplete();
  };

  const handleSubscribe = (durationInMonths: number) => {
    const now = new Date();
    const expiryDate = new Date(now.setMonth(now.getMonth() + durationInMonths));
    const expiryTimestamp = expiryDate.getTime();
    localStorage.setItem(SUBSCRIPTION_KEY, String(expiryTimestamp));
  };

  const handleSuccessfulRedeem = (durationInMonths: number) => {
    handleSubscribe(durationInMonths);
    setIsSubscriptionModalOpen(false);
    setUnlockedMonths(durationInMonths);
    setIsCongratsModalOpen(true);
  };


  if (step === 'splash') {
    return (
      <div className="min-h-screen w-full flex flex-col justify-between items-center bg-gray-900 text-gray-800 dark:text-gray-200 p-8 text-center animate-fade-in">
        <div />
        <div className="flex flex-col items-center">
            <div className="relative mb-8 animate-glowing-body">
                 <SplashLogo />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-200 dark:text-gray-200">
                Your Journey to a Healthier You Starts Here.
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-gray-400 dark:text-gray-400 max-w-lg">
                Not a diet. Not a punishment.<br/>A promise to your future self.
            </p>
            <p className="mt-12 text-lg font-handwriting text-orange-500 dark:text-orange-400 animate-fade-in">
                "{quote}"
            </p>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-400 max-w-md">
            Designed by doctors. Built for real people.<br/>Welcome to your new metabolic life.
        </p>
      </div>
    );
  }

  return (
    <>
      <SubscriptionModal 
            isOpen={isSubscriptionModalOpen}
            onClose={() => setIsSubscriptionModalOpen(false)}
            onSuccessfulRedeem={handleSuccessfulRedeem}
        />
      <CongratulationsModal
          isOpen={isCongratsModalOpen}
          onClose={() => setIsCongratsModalOpen(false)}
          months={unlockedMonths}
          quote="Your journey starts now! Let's get your profile set up."
        />
      <div className="min-h-screen flex items-center justify-center bg-orange-50/50 dark:bg-gray-900 p-4 animate-fade-in">
          <div className="w-full max-w-md">
              <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 text-center">Welcome to ObeCure</h1>
                  <p className="mt-2 text-gray-600 dark:text-gray-400 mb-6 text-center">Let's get your profile started.</p>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Name</label>
                          <input ref={patientNameRef} onKeyDown={e => handleKeyDown(e, ageRef)} type="text" name="patientName" value={formData.patientName} onChange={handleInputChange} placeholder="e.g., Anjali Sharma" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Age*</label>
                              <input ref={ageRef} onKeyDown={e => handleKeyDown(e, sexRef)} type="number" name="age" value={formData.age} onChange={handleInputChange} placeholder="e.g., 30" required className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400" />
                          </div>
                          <div>
                              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Sex*</label>
                              <select ref={sexRef} onKeyDown={e => handleKeyDown(e, phoneRef)} name="sex" value={formData.sex} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400">
                                  {Object.values(Sex).map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                          <input ref={phoneRef} onKeyDown={e => handleKeyDown(e, patientWeightRef)} type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Optional" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400" />
                      </div>
                      <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Current Weight (kg)*</label>
                          <input ref={patientWeightRef} onKeyDown={e => handleKeyDown(e, beginButtonRef)} type="number" name="patientWeight" value={formData.patientWeight} onChange={handleInputChange} placeholder="e.g., 75" required className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400" />
                      </div>
                  </div>

                  <div className="mt-6 space-y-3">
                      <button ref={beginButtonRef} onClick={handleBegin} className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-all active:scale-95 shadow-md">Let's Begin &rarr;</button>
                      <button onClick={() => setIsSubscriptionModalOpen(true)} className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-3 px-6 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95">Redeem Subscription &rarr;</button>
                      <a 
                          href="https://www.youtube.com/@Obecure" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-all active:scale-95 shadow-md"
                      >
                          <YouTubeIcon className="w-6 h-6" />
                          <span>Watch Tutorial</span>
                      </a>
                  </div>
              </div>
          </div>
      </div>
    </>
  );
};

export default Onboarding;