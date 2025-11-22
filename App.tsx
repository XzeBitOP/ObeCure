
import React, { useState, useEffect, Suspense, lazy } from 'react';
import Header from './components/Header';
import Onboarding from './components/Onboarding';
import InstallPwaModal from './components/InstallPwaModal';
import DisclaimerModal from './components/DisclaimerModal';
import SubscriptionModal from './components/SubscriptionModal';
import CongratulationsModal from './components/CongratulationsModal';
import SubscriptionLock from './components/SubscriptionLock';
// ThemeToggle removed
import { WebsiteIcon } from './components/icons/WebsiteIcon';
import { InstagramIcon } from './components/icons/InstagramIcon';
import { ForkAndSpoonIcon } from './components/icons/ForkAndSpoonIcon';
import { LeafIcon } from './components/icons/LeafIcon';
import { DumbbellIcon } from './components/icons/DumbbellIcon';
import { ChartBarIcon } from './components/icons/ChartBarIcon';
import { UsersIcon } from './components/icons/UsersIcon';
import { BrainIcon } from './components/icons/BrainIcon';
import { InfoIcon } from './components/icons/InfoIcon';
import { DietPlan } from './types';
import StreakTracker from './components/StreakTracker';
import { motivationalLines } from './data/motivationalLines';
import LogSleepModal from './components/LogSleepModal';
import ProductShowcase from './components/ProductShowcase'; // Imported ProductShowcase

// Lazy load heavy components
const DietPlanner = lazy(() => import('./components/DietPlanner'));
const BioAdaptivePlanner = lazy(() => import('./components/bioadaptive/BioAdaptivePlanner'));
const Workouts = lazy(() => import('./components/Workouts'));
const BodyComposition = lazy(() => import('./components/BodyComposition'));
const CommunityView = lazy(() => import('./components/CommunityView'));
const Faq = lazy(() => import('./components/Faq'));
const BloodReportEvaluator = lazy(() => import('./components/BloodReportEvaluator'));
const FeatureExplanation = lazy(() => import('./components/FeatureExplanation'));
const GamificationView = lazy(() => import('./components/GamificationView'));
const ProgressModal = lazy(() => import('./components/ProgressModal'));

const USER_PREFERENCES_KEY = 'obeCureUserPreferences';
const DIET_PLAN_KEY = 'obeCureDailyDietPlan';
const SUBSCRIPTION_KEY = 'obeCureSubscriptionExpiry';
const STREAK_KEY = 'obeCureStreak';
const LAST_LOGIN_KEY = 'obeCureLastLoginDate';

// Types
type View = 'diet' | 'bio' | 'workout' | 'stats' | 'community' | 'mind' | 'info';

const App: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentView, setCurrentView] = useState<View>('diet');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [unlockedMonths, setUnlockedMonths] = useState(0);
  
  // Modals
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isCongratsModalOpen, setIsCongratsModalOpen] = useState(false);
  const [isLogSleepOpen, setIsLogSleepOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Data
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [streak, setStreak] = useState(0);
  const [motivationalLine, setMotivationalLine] = useState('');
  const [userAge, setUserAge] = useState<number>(0);

  // --- Effects ---

  useEffect(() => {
    // Theme Initialization - Auto select based on system preference
    const handleThemeChange = (e: MediaQueryListEvent) => {
        setTheme(e.matches ? 'dark' : 'light');
    };
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleThemeChange);

    // Onboarding Check
    const prefs = localStorage.getItem(USER_PREFERENCES_KEY);
    if (!prefs) {
      setShowOnboarding(true);
    } else {
        const parsedPrefs = JSON.parse(prefs);
        if(parsedPrefs.age) setUserAge(parseInt(parsedPrefs.age));
    }

    // Disclaimer Check
    const hasSeenDisclaimer = sessionStorage.getItem('obeCureDisclaimerSeen');
    if (!hasSeenDisclaimer && prefs) {
      setIsDisclaimerOpen(true);
    }

    // Subscription Check
    checkSubscription();

    // Diet Plan Load
    const planRaw = localStorage.getItem(DIET_PLAN_KEY);
    if (planRaw) {
      try {
        const planData = JSON.parse(planRaw);
        const today = new Date().toISOString().split('T')[0];
        if (planData.date === today) {
          setDietPlan(planData.plan);
        }
      } catch (e) { console.error("Plan parse error", e); }
    }

    // Streak Calculation
    updateStreak();

    // Motivational Line
    setMotivationalLine(motivationalLines[Math.floor(Math.random() * motivationalLines.length)]);

    // PWA Prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    return () => {
        mediaQuery.removeEventListener('change', handleThemeChange);
    };

  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const updateStreak = () => {
      const today = new Date().toISOString().split('T')[0];
      const lastLogin = localStorage.getItem(LAST_LOGIN_KEY);
      const currentStreak = parseInt(localStorage.getItem(STREAK_KEY) || '0');

      if (lastLogin !== today) {
          if (lastLogin) {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStr = yesterday.toISOString().split('T')[0];
              
              if (lastLogin === yesterdayStr) {
                  const newStreak = currentStreak + 1;
                  setStreak(newStreak);
                  localStorage.setItem(STREAK_KEY, String(newStreak));
              } else if (lastLogin !== today) {
                  setStreak(1);
                  localStorage.setItem(STREAK_KEY, '1');
              }
          } else {
              setStreak(1);
              localStorage.setItem(STREAK_KEY, '1');
          }
          localStorage.setItem(LAST_LOGIN_KEY, today);
      } else {
          setStreak(currentStreak);
      }
  };

  const checkSubscription = () => {
    const expiryTimestamp = localStorage.getItem(SUBSCRIPTION_KEY);
    if (expiryTimestamp) {
        if (new Date().getTime() < parseInt(expiryTimestamp)) {
            setIsSubscribed(true);
        } else {
            setIsSubscribed(false);
            localStorage.removeItem(SUBSCRIPTION_KEY);
        }
    } else {
        setIsSubscribed(false);
    }
  };

  const handleInstallClick = () => {
    setIsInstallModalOpen(true);
  };

  const handleDisclaimerClose = () => {
    setIsDisclaimerOpen(false);
    sessionStorage.setItem('obeCureDisclaimerSeen', 'true');
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setIsDisclaimerOpen(true);
    // Refresh user data from storage after onboarding
    const prefs = localStorage.getItem(USER_PREFERENCES_KEY);
    if(prefs) {
        const parsedPrefs = JSON.parse(prefs);
        if(parsedPrefs.age) setUserAge(parseInt(parsedPrefs.age));
    }
  };

  const handleSuccessfulRedeem = (months: number) => {
      setUnlockedMonths(months);
      setIsSubscribed(true);
      setIsSubscriptionModalOpen(false);
      setIsCongratsModalOpen(true);
  };

  // --- Navigation Items ---
  const navItems: { id: View, label: string, icon: React.ElementType }[] = [
      { id: 'diet', label: 'Diet', icon: ForkAndSpoonIcon },
      { id: 'bio', label: 'BioAdaptive', icon: LeafIcon },
      { id: 'workout', label: 'Workout', icon: DumbbellIcon },
      { id: 'stats', label: 'My Body', icon: ChartBarIcon },
      { id: 'community', label: 'Community', icon: UsersIcon },
      { id: 'mind', label: 'MindFit', icon: BrainIcon },
      { id: 'info', label: 'Info', icon: InfoIcon },
  ];

  // --- Render Content ---
  const renderView = () => {
      switch (currentView) {
          case 'diet':
              return <DietPlanner isSubscribed={isSubscribed} onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)} dietPlan={dietPlan} setDietPlan={setDietPlan} />;
          case 'bio':
              return (
                  <div className="space-y-8">
                      {isSubscribed ? <BioAdaptivePlanner /> : <SubscriptionLock onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)} featureName="BioAdaptive Ayurveda™" description="Unlock personalized daily herbal and lifestyle plans tailored to your unique metabolic phenotype." icon={<LeafIcon className="w-16 h-16 text-green-500 mb-4" />} />}
                      <ProductShowcase />
                  </div>
              );
          case 'workout':
              return <Workouts />;
          case 'stats':
              return (
                  <div className="space-y-8">
                      <BodyComposition onOpenHistory={() => setIsProgressModalOpen(true)} />
                      <BloodReportEvaluator />
                  </div>
              );
          case 'community':
              return <CommunityView />;
          case 'mind':
              return (
                  <div className="space-y-8">
                      <Faq />
                      
                      {/* Victory Wall Link */}
                      <div 
                        onClick={() => setCurrentView('community')}
                        className="cursor-pointer bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-700/50 transition-all transform hover:-translate-y-1"
                      >
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 text-center mb-2">Victory Wall</h2>
                        <p className="text-center text-gray-500 dark:text-gray-400">Join the community & share your wins!</p>
                      </div>

                      {/* Info Link */}
                      <div 
                        onClick={() => setCurrentView('info')}
                        className="cursor-pointer p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                      >
                        <InfoIcon className="w-6 h-6 text-orange-500" />
                        <span className="font-bold text-gray-700 dark:text-gray-200">How ObeCure Works: A Guide for Everyone & Doctors</span>
                      </div>
                  </div>
              );
          case 'info':
              return <FeatureExplanation />;
          default:
              return null;
      }
  };

  if (showOnboarding) {
      return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col font-sans`}>
        <Header 
            onLogSleepClick={() => setIsLogSleepOpen(true)} 
            showInstallButton={!!deferredPrompt}
            onInstallClick={handleInstallClick}
            isNotificationUnread={false} // Todo: implement logic
            onToggleNotification={() => setIsNotificationOpen(!isNotificationOpen)}
            isNotificationOpen={isNotificationOpen}
        />

        <main className="flex-grow container mx-auto px-4 pb-24 pt-6 max-w-5xl">
            <StreakTracker streak={streak} quote={motivationalLine} />
            
            {/* Desktop/Tablet Navigation (Top) */}
            <div className="hidden md:flex justify-center gap-4 mb-8 flex-wrap">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${currentView === item.id ? 'bg-orange-500 text-white shadow-md transform scale-105' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-gray-700'}`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                    </button>
                ))}
            </div>

            <Suspense fallback={<div className="flex justify-center p-10"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div></div>}>
                {renderView()}
            </Suspense>

            {/* Footer Links */}
            <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 pb-8 border-t border-gray-200 dark:border-gray-700 pt-8">
                  <a href="https://www.obeCure.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all duration-300 transform hover:scale-110 active:scale-95 opacity-0 animate-fade-in-up" style={{animationDelay: '200ms'}}>
                      <WebsiteIcon className="w-7 h-7 sm:w-8 sm:h-8"/>
                      <span className="text-xs mt-1">ObeCure</span>
                  </a>
                  <a href="https://www.xzecure.co.in" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all duration-300 transform hover:scale-110 active:scale-95 opacity-0 animate-fade-in-up" style={{animationDelay: '400ms'}}>
                      <WebsiteIcon className="w-7 h-7 sm:w-8 sm:h-8"/>
                      <span className="text-xs mt-1">Xzecure</span>
                  </a>
                  <a href="https://www.instagram.com/ObeCure_official" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all duration-300 transform hover:scale-110 active:scale-95 opacity-0 animate-fade-in-up" style={{animationDelay: '600ms'}}>
                      <InstagramIcon className="w-7 h-7 sm:w-8 sm:h-8"/>
                      <span className="text-xs mt-1">@ObeCure_official</span>
                  </a>
                  <a href="https://www.instagram.com/askdr.xze" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all duration-300 transform hover:scale-110 active:scale-95 opacity-0 animate-fade-in-up" style={{animationDelay: '800ms'}}>
                      <InstagramIcon className="w-7 h-7 sm:w-8 sm:h-8"/>
                      <span className="text-xs mt-1">@askdr.xze</span>
                  </a>
            </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-safe z-50">
            <div className="flex justify-around items-center px-2 py-3 overflow-x-auto no-scrollbar">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id)}
                        className={`flex flex-col items-center justify-center min-w-[60px] transition-all duration-200 ${currentView === item.id ? 'text-orange-500 scale-110' : 'text-gray-400 dark:text-gray-500'}`}
                    >
                        <item.icon className="w-6 h-6" strokeWidth={currentView === item.id ? 2.5 : 2} />
                        <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Modals */}
        <InstallPwaModal isOpen={isInstallModalOpen} onClose={() => setIsInstallModalOpen(false)} deferredPrompt={deferredPrompt} />
        <DisclaimerModal isOpen={isDisclaimerOpen} onClose={handleDisclaimerClose} />
        <SubscriptionModal isOpen={isSubscriptionModalOpen} onClose={() => setIsSubscriptionModalOpen(false)} onSuccessfulRedeem={handleSuccessfulRedeem} />
        <CongratulationsModal isOpen={isCongratsModalOpen} onClose={() => setIsCongratsModalOpen(false)} months={unlockedMonths} quote="Your journey to optimal health is powered up!" />
        <LogSleepModal isOpen={isLogSleepOpen} onClose={() => setIsLogSleepOpen(false)} age={userAge} />
        <Suspense fallback={null}><ProgressModal isOpen={isProgressModalOpen} onClose={() => setIsProgressModalOpen(false)} /></Suspense>
    </div>
  );
};

export default App;
