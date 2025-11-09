import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Header from './components/Header';
import DietPlanner from './components/DietPlanner';
import Workouts from './components/Workouts';
import DisclaimerModal from './components/DisclaimerModal';
import Faq from './components/Faq';
import { WebsiteIcon } from './components/icons/WebsiteIcon';
import { InstagramIcon } from './components/icons/InstagramIcon';
import LogSleepModal from './components/LogSleepModal';
import ProgressModal from './components/ProgressModal';
import SubscriptionModal from './components/SubscriptionModal';
import CongratulationsModal from './components/CongratulationsModal';
import BioAdaptivePlanner from './components/bioadaptive/BioAdaptivePlanner';
import { LeafIcon } from './components/icons/LeafIcon';
import Onboarding from './components/Onboarding';
import InstallPwaModal from './components/InstallPwaModal';
import BodyComposition from './components/BodyComposition';
import { ChartBarIcon } from './components/icons/ChartBarIcon';

type View = 'planner' | 'ayurveda' | 'workouts' | 'progress';

const USER_PREFERENCES_KEY = 'obeCureUserPreferences';
const SUBSCRIPTION_KEY = 'obeCureSubscriptionExpiry';

const products = [
  {
    name: 'Gutrify®',
    use: 'For gut load, bloating, constipation',
    textColor: 'text-green-800 dark:text-green-300',
    bgColor: 'bg-green-100 dark:bg-green-900/40',
    borderColor: 'border-green-500'
  },
  {
    name: 'FiberFuel®',
    use: 'For satiety, bowel rhythm',
    textColor: 'text-yellow-800 dark:text-yellow-300',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/40',
    borderColor: 'border-yellow-500'
  },
  {
    name: 'ObeCalm®',
    use: 'For stress & sleep balance',
    textColor: 'text-blue-800 dark:text-blue-300',
    bgColor: 'bg-blue-100 dark:bg-blue-900/40',
    borderColor: 'border-blue-500'
  },
  {
    name: 'LeanPulse®',
    use: 'For energy & focus',
    textColor: 'text-red-800 dark:text-red-300',
    bgColor: 'bg-red-100 dark:bg-red-900/40',
    borderColor: 'border-red-500'
  },
  {
    name: 'MetaboFix®',
    use: 'For basal metabolism support',
    textColor: 'text-purple-800 dark:text-purple-300',
    bgColor: 'bg-purple-100 dark:bg-purple-900/40',
    borderColor: 'border-purple-500'
  }
];

const App: React.FC = () => {
    const [isOnboardingComplete, setIsOnboardingComplete] = useState(() => {
        try {
            const savedPrefsRaw = localStorage.getItem(USER_PREFERENCES_KEY);
            if (savedPrefsRaw) {
                const savedPrefs = JSON.parse(savedPrefsRaw);
                // Check for a key that would be saved by onboarding, like age.
                return !!savedPrefs.age;
            }
        } catch (e) {
            console.error("Failed to check for user preferences", e);
        }
        return false;
    });

  const [view, setView] = useState<View>('planner');
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(true);
  const [isLogSleepModalOpen, setIsLogSleepModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [userAge, setUserAge] = useState(0);

  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [subscriptionExpiry, setSubscriptionExpiry] = useState<number | null>(null);

  const [isCongratsModalOpen, setIsCongratsModalOpen] = useState(false);
  const [unlockedMonths, setUnlockedMonths] = useState(0);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);

  const navRef = useRef<HTMLDivElement>(null);
  const plannerButtonRef = useRef<HTMLButtonElement>(null);
  const ayurvedaButtonRef = useRef<HTMLButtonElement>(null);
  const workoutsButtonRef = useRef<HTMLButtonElement>(null);
  const progressButtonRef = useRef<HTMLButtonElement>(null);
  const [bubbleStyle, setBubbleStyle] = useState({ opacity: 0, left: 0, width: 0 });

  useEffect(() => {
    const expiryTimestamp = localStorage.getItem(SUBSCRIPTION_KEY);
    if (expiryTimestamp) {
        const expiry = parseInt(expiryTimestamp, 10);
        if (expiry > Date.now()) {
            setSubscriptionExpiry(expiry);
        } else {
            localStorage.removeItem(SUBSCRIPTION_KEY);
            setSubscriptionExpiry(null);
        }
    }
  }, []);

  const isSubscribed = subscriptionExpiry ? subscriptionExpiry > Date.now() : false;
  
  const handleOpenSubscriptionModal = () => setIsSubscriptionModalOpen(true);
  
  const handleSubscribe = (durationInMonths: number) => {
      const now = new Date();
      const expiryDate = new Date(now.setMonth(now.getMonth() + durationInMonths));
      const expiryTimestamp = expiryDate.getTime();
      
      localStorage.setItem(SUBSCRIPTION_KEY, String(expiryTimestamp));
      setSubscriptionExpiry(expiryTimestamp);
  };

  const handleSuccessfulRedeem = (durationInMonths: number) => {
    handleSubscribe(durationInMonths);
    setIsSubscriptionModalOpen(false);
    setUnlockedMonths(durationInMonths);
    setIsCongratsModalOpen(true);
  };
  
    const handleOnboardingComplete = () => {
        setIsOnboardingComplete(true);
        // After onboarding, we might have a new subscription, so re-check it.
        const expiryTimestamp = localStorage.getItem(SUBSCRIPTION_KEY);
        if (expiryTimestamp) {
            const expiry = parseInt(expiryTimestamp, 10);
            if (expiry > Date.now()) {
                setSubscriptionExpiry(expiry);
            }
        }
    };


  useLayoutEffect(() => {
    const updateBubble = () => {
      let targetButton: React.RefObject<HTMLButtonElement> | null = null;
      if (view === 'planner') targetButton = plannerButtonRef;
      else if (view === 'ayurveda') targetButton = ayurvedaButtonRef;
      else if (view === 'workouts') targetButton = workoutsButtonRef;
      else if (view === 'progress') targetButton = progressButtonRef;


      if (targetButton?.current) {
        const { offsetLeft, offsetWidth } = targetButton.current;
        if (offsetWidth > 0) { // Prevent setting style if button not rendered correctly
          setBubbleStyle({
            left: offsetLeft,
            width: offsetWidth,
            opacity: 1,
          });
        }
      }
    };
    
    // Ensure fonts are loaded before calculating position
    document.fonts.ready.then(updateBubble);

    // Recalculate on resize
    window.addEventListener('resize', updateBubble);
    
    // Also run on initial load after a short delay to ensure rendering is complete
    const timeoutId = setTimeout(updateBubble, 100);

    return () => {
      window.removeEventListener('resize', updateBubble);
      clearTimeout(timeoutId);
    }
  }, [view]);


  useEffect(() => {
    if (isLogSleepModalOpen) {
        try {
            const savedPrefsRaw = localStorage.getItem(USER_PREFERENCES_KEY);
            if (savedPrefsRaw) {
                const savedPrefs = JSON.parse(savedPrefsRaw);
                setUserAge(parseInt(savedPrefs.age, 10) || 0);
            } else {
                setUserAge(0);
            }
        } catch (e) {
            console.error("Failed to parse user preferences for age", e);
            setUserAge(0);
        }
    }
  }, [isLogSleepModalOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      if (mediaQuery.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        if (!window.matchMedia('(display-mode: standalone)').matches) {
            setShowInstallButton(true);
        }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    const isStandalone = ('standalone' in window.navigator && (window.navigator as any).standalone) || window.matchMedia('(display-mode: standalone)').matches;

    if (isIos && !isStandalone) {
        setShowInstallButton(true);
    }

    return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
}, []);

  const handleCloseDisclaimer = () => {
    setShowDisclaimer(false);
  };
  
  const handleInstallClick = () => {
      setIsInstallModalOpen(true);
  };


  if (!isOnboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-orange-50/50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <DisclaimerModal isOpen={showDisclaimer} onClose={handleCloseDisclaimer} />
      <LogSleepModal
        isOpen={isLogSleepModalOpen}
        onClose={() => setIsLogSleepModalOpen(false)}
        age={userAge}
      />
      <ProgressModal isOpen={isProgressModalOpen} onClose={() => setIsProgressModalOpen(false)} />
       <SubscriptionModal 
            isOpen={isSubscriptionModalOpen}
            onClose={() => setIsSubscriptionModalOpen(false)}
            onSuccessfulRedeem={handleSuccessfulRedeem}
        />
        <CongratulationsModal
          isOpen={isCongratsModalOpen}
          onClose={() => setIsCongratsModalOpen(false)}
          months={unlockedMonths}
          quote="Your journey is a testament to your commitment. We're honored to be a part of it. Keep shining!"
        />
        <InstallPwaModal 
            isOpen={isInstallModalOpen}
            onClose={() => setIsInstallModalOpen(false)}
            deferredPrompt={deferredPrompt}
        />
      <Header 
        onLogSleepClick={() => setIsLogSleepModalOpen(true)} 
        subscriptionExpiry={subscriptionExpiry}
        showInstallButton={showInstallButton}
        onInstallClick={handleInstallClick}
        />
      <main className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
        <div ref={navRef} className="relative flex justify-center mb-8 bg-orange-100/80 dark:bg-gray-800 rounded-full p-1 max-w-md sm:max-w-xl mx-auto shadow-inner">
          <div
            className="absolute top-1 bottom-1 bg-white dark:bg-gray-700 rounded-full shadow transition-all duration-300 ease-in-out"
            style={bubbleStyle}
            role="presentation"
          ></div>
          <button
            ref={plannerButtonRef}
            onClick={() => setView('planner')}
            className={`relative z-10 w-1/4 py-2 px-3 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50 active:scale-95 flex items-center justify-center gap-1 ${
              view === 'planner'
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-orange-500/70 dark:hover:text-orange-400/70'
            }`}
          >
            Diet Plan
          </button>
          <button
            ref={ayurvedaButtonRef}
            onClick={() => setView('ayurveda')}
            className={`relative z-10 w-1/4 py-2 px-3 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50 active:scale-95 flex items-center justify-center gap-1 ${
              view === 'ayurveda'
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-orange-500/70 dark:hover:text-orange-400/70'
            }`}
          >
            <LeafIcon className="w-4 h-4" /> Ayurveda
          </button>
          <button
            ref={workoutsButtonRef}
            onClick={() => setView('workouts')}
            className={`relative z-10 w-1/4 py-2 px-3 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50 active:scale-95 ${
              view === 'workouts'
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-orange-500/70 dark:hover:text-orange-400/70'
            }`}
          >
            Workouts
          </button>
           <button
            ref={progressButtonRef}
            onClick={() => setView('progress')}
            className={`relative z-10 w-1/4 py-2 px-3 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50 active:scale-95 flex items-center justify-center gap-1 ${
              view === 'progress'
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-orange-500/70 dark:hover:text-orange-400/70'
            }`}
          >
            <ChartBarIcon className="w-4 h-4" /> My Progress
          </button>
        </div>

        {view === 'planner' && <DietPlanner isSubscribed={isSubscribed} onOpenSubscriptionModal={handleOpenSubscriptionModal} />}
        {view === 'ayurveda' && <BioAdaptivePlanner isSubscribed={isSubscribed} onOpenSubscriptionModal={handleOpenSubscriptionModal} />}
        {view === 'workouts' && <Workouts />}
        {view === 'progress' && <BodyComposition onOpenHistory={() => setIsProgressModalOpen(true)}/>}
      </main>

      <footer className="text-center p-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 dark:from-orange-600 dark:via-amber-500 dark:to-orange-600 py-3 mb-6 overflow-hidden rounded-lg shadow-lg animate-gradient-pulse">
            <p className="animate-marquee text-white text-sm font-semibold whitespace-nowrap [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">
              <span className="font-bold text-yellow-200">Doctor certified</span> Wellness supplement and <span className="font-bold text-yellow-200">Ayurvedic product</span> coming soon...&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <span className="font-bold text-yellow-200">Doctor certified</span> Wellness supplement and <span className="font-bold text-yellow-200">Ayurvedic product</span> coming soon...&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pb-8">
            <Faq />
          </div>

          <div className="max-w-5xl mx-auto mb-12 px-4">
            <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-6 font-handwriting text-center">
              Our Upcoming BioAdaptive Products
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {products.map((product, index) => (
                <div 
                  key={product.name} 
                  className={`p-4 rounded-lg shadow-sm border-l-4 opacity-0 animate-fade-in-up ${product.bgColor} ${product.borderColor}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <h4 className={`font-bold text-lg ${product.textColor}`}>{product.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{product.use}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 font-handwriting">
                  Connect with us
              </h3>
              <div className="flex justify-center items-center space-x-4 sm:space-x-6">
                  <a href="https://www.xzecure.co.in" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all duration-300 transform hover:scale-110 active:scale-95 opacity-0 animate-fade-in-up" style={{animationDelay: '200ms'}}>
                      <WebsiteIcon className="w-7 h-7 sm:w-8 sm:h-8"/>
                      <span className="text-xs mt-1">Website</span>
                  </a>
                  <a href="https://www.instagram.com/xzecure" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all duration-300 transform hover:scale-110 active:scale-95 opacity-0 animate-fade-in-up" style={{animationDelay: '400ms'}}>
                      <InstagramIcon className="w-7 h-7 sm:w-8 sm:h-8"/>
                      <span className="text-xs mt-1">@xzecure</span>
                  </a>
                  <a href="https://www.instagram.com/askdr.xze" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all duration-300 transform hover:scale-110 active:scale-95 opacity-0 animate-fade-in-up" style={{animationDelay: '600ms'}}>
                      <InstagramIcon className="w-7 h-7 sm:w-8 sm:h-8"/>
                      <span className="text-xs mt-1">@askdr.xze</span>
                  </a>
                  <a href="https://www.instagram.com/Xzeveda" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all duration-300 transform hover:scale-110 active:scale-95 opacity-0 animate-fade-in-up" style={{animationDelay: '800ms'}}>
                      <InstagramIcon className="w-7 h-7 sm:w-8 sm:h-8"/>
                      <span className="text-xs mt-1">@Xzeveda</span>
                  </a>
              </div>
          </div>
          <p>&copy; {new Date().getFullYear()} ObeCure. All rights reserved.</p>
          <p className="mt-1">Disclaimer: This is not medical advice. Consult a healthcare professional before starting any diet or workout plan.</p>
      </footer>
    </div>
  );
};

export default App;
