
import React, { useState, useEffect, Suspense, lazy } from 'react';
import Header from './components/Header';
import Onboarding from './components/Onboarding';
import InstallPwaModal from './components/InstallPwaModal';
import DisclaimerModal from './components/DisclaimerModal';
import SubscriptionModalNew from './components/SubscriptionModalNew';
import CongratulationsModal from './components/CongratulationsModal';
import SubscriptionLock from './components/SubscriptionLock';
import AuthModal from './components/AuthModal';
import DailyLogModal from './components/DailyLogModal';
import ReportsView from './components/ReportsView';
import { authAPI, subscriptionAPI } from './services/api';
import { subscribeToNotifications, checkNotificationStatus } from './services/notifications';
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
import { ObeCureIcon } from './components/icons/ObeCureIcon';
import { DietPlan } from './types';
import StreakTracker from './components/StreakTracker';
import { motivationalLines } from './data/motivationalLines';
import LogSleepModal from './components/LogSleepModal';
import ProductShowcase from './components/ProductShowcase'; // Imported ProductShowcase
import InfoModal from './components/InfoModal';

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
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
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
  const [isPsychiatryModalOpen, setIsPsychiatryModalOpen] = useState(false);
  const [isDailyLogOpen, setIsDailyLogOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);

  // Data
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [streak, setStreak] = useState(0);
  const [motivationalLine, setMotivationalLine] = useState('');
  const [userAge, setUserAge] = useState<number>(0);
  const [isStandalone, setIsStandalone] = useState(false);

  // --- Effects ---

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const response = await authAPI.getMe();
          setUser(response.user);
          setIsAuthenticated(true);
          
          // Check subscription status from backend
          const subStatus = await subscriptionAPI.getStatus();
          setIsSubscribed(subStatus.is_subscribed);
        } catch (error) {
          // Token invalid, clear and show auth modal
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          setShowAuthModal(true);
        }
      } else {
        setShowAuthModal(true);
      }
    };
    
    checkAuth();

    // Setup notifications
    if (isAuthenticated) {
      const notifStatus = checkNotificationStatus();
      if (notifStatus === 'default') {
        // Ask for permission after a delay
        setTimeout(() => {
          subscribeToNotifications().then((subscribed) => {
            if (subscribed) {
              console.log('Notifications enabled');
            }
          });
        }, 5000);
      } else if (notifStatus === 'granted') {
        subscribeToNotifications();
      }
    }

    // Theme Initialization - Auto select based on system preference
    const handleThemeChange = (e: MediaQueryListEvent) => {
        setTheme(e.matches ? 'dark' : 'light');
    };
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleThemeChange);

    // Onboarding Check
    const prefs = localStorage.getItem(USER_PREFERENCES_KEY);
    if (!prefs && isAuthenticated) {
      setShowOnboarding(true);
    } else if (prefs) {
        const parsedPrefs = JSON.parse(prefs);
        if(parsedPrefs.age) setUserAge(parseInt(parsedPrefs.age));
    }

    // Disclaimer Check
    const hasSeenDisclaimer = sessionStorage.getItem('obeCureDisclaimerSeen');
    if (!hasSeenDisclaimer && prefs && isAuthenticated) {
      setIsDisclaimerOpen(true);
    }

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

    // Check Standalone Mode
    const checkStandalone = () => {
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                                 (window.navigator as any).standalone || 
                                 document.referrer.includes('android-app://');
        setIsStandalone(isStandaloneMode);
    };
    checkStandalone();
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkStandalone);

    return () => {
        mediaQuery.removeEventListener('change', handleThemeChange);
    };

  }, [isAuthenticated]);

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

  const checkSubscription = async () => {
    try {
      const status = await subscriptionAPI.getStatus();
      setIsSubscribed(status.is_subscribed);
    } catch (error) {
      console.error('Failed to check subscription:', error);
      setIsSubscribed(false);
    }
  };

  const handleAuthSuccess = (token: string, userData: any) => {
    setIsAuthenticated(true);
    setUser(userData);
    setShowAuthModal(false);
    checkSubscription();
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

  const handleSuccessfulRedeem = async (months: number) => {
      setUnlockedMonths(months);
      setIsSubscribed(true);
      setIsSubscriptionModalOpen(false);
      setIsCongratsModalOpen(true);
      // Refresh subscription status
      await checkSubscription();
  };

  const triggerHaptic = () => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(10); // Subtle 10ms vibration
      }
  };

  const handleViewChange = (view: View) => {
      triggerHaptic();
      setCurrentView(view);
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
              return <DietPlanner dietPlan={dietPlan} setDietPlan={setDietPlan} />;
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
                      {isSubscribed ? (
                          <>
                              <BodyComposition onOpenHistory={() => setIsProgressModalOpen(true)} />
                              <BloodReportEvaluator />
                          </>
                      ) : (
                          <SubscriptionLock 
                              onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)} 
                              featureName="My Body Analytics" 
                              description="Unlock comprehensive body composition tracking, metabolic age analysis, and personalized health insights." 
                              icon={<ChartBarIcon className="w-16 h-16 text-orange-500 mb-4" />} 
                          />
                      )}
                  </div>
              );
          case 'community':
              return <CommunityView />;
          case 'mind':
              return (
                  <div className="space-y-8">
                      <Faq />
                      
                      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/20 dark:border-gray-700">
                          <button 
                              onClick={() => setIsPsychiatryModalOpen(true)}
                              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 mb-6"
                          >
                              <BrainIcon className="w-8 h-8" />
                              <span className="text-lg">Consult ObeCure Psychiatry</span>
                          </button>
                          
                          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800">
                              <h4 className="font-bold text-indigo-800 dark:text-indigo-200 mb-2 flex items-center gap-2">
                                  Why Psychology?
                              </h4>
                              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                  Sustainable weight loss isn't just about food; it's about rewiring habits. Psychological support helps address emotional eating, stress triggers, and behavioral patterns, ensuring your results last a lifetime.
                              </p>
                          </div>
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
    <div className={`min-h-screen bg-transparent text-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col font-sans`}>
        <Header 
            onLogSleepClick={() => setIsLogSleepOpen(true)} 
            showInstallButton={!isStandalone}
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
                        onClick={() => handleViewChange(item.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 backdrop-blur-sm ${currentView === item.id ? 'bg-orange-500 text-white shadow-lg transform scale-105' : 'bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 hover:bg-orange-100/80 dark:hover:bg-gray-700/80 shadow-sm'}`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                    </button>
                ))}
            </div>

            <Suspense fallback={<div className="flex justify-center p-10"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div></div>}>
                {renderView()}
            </Suspense>

            {/* Footer Blocks */}
            <div className="mt-16 pb-12 border-t border-gray-200 dark:border-gray-700 pt-8 space-y-6 max-w-2xl mx-auto">
                
                {/* Instagram Card */}
                <div className="group relative overflow-hidden rounded-2xl p-[1px] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 opacity-40 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                    <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl p-5 h-full border border-transparent dark:border-gray-800">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white shadow-md group-hover:scale-110 transition-transform">
                                <InstagramIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-gray-100 text-lg leading-tight">Join the Community</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Daily tips & motivation</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3 w-full sm:w-auto">
                            <a href="https://www.instagram.com/ObeCure_official" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gray-100/80 dark:bg-gray-800/80 hover:bg-pink-50 dark:hover:bg-pink-900/20 text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 rounded-full text-sm font-medium transition-colors border border-gray-200 dark:border-gray-700 hover:border-pink-200 dark:hover:border-pink-800 backdrop-blur-sm">
                                <ObeCureIcon className="w-4 h-4" /> @ObeCure_official
                            </a>
                            <a href="https://www.instagram.com/xzecure" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gray-100/80 dark:bg-gray-800/80 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 rounded-full text-sm font-medium transition-colors border border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800 backdrop-blur-sm">
                                <span>👨🏻‍⚕️</span> @XzeCure
                            </a>
                        </div>
                    </div>
                </div>

                {/* Website Card */}
                <div className="group relative overflow-hidden rounded-2xl p-[1px] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-400 opacity-40 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                    <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl p-5 h-full border border-transparent dark:border-gray-800">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-md group-hover:scale-110 transition-transform">
                                <WebsiteIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-gray-100 text-lg leading-tight">Visit Our Websites</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Learn more & shop</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3 w-full sm:w-auto">
                            <a href="https://www.obeCure.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gray-100/80 dark:bg-gray-800/80 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-full text-sm font-medium transition-colors border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 backdrop-blur-sm">
                                <ObeCureIcon className="w-4 h-4" /> ObeCure.com
                            </a>
                            <a href="https://www.xzecure.co.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gray-100/80 dark:bg-gray-800/80 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-full text-sm font-medium transition-colors border border-gray-200 dark:border-gray-700 hover:border-cyan-200 dark:hover:border-cyan-800 backdrop-blur-sm">
                                <span>🏨</span> Xzecure.co.in
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 pb-safe z-50">
            <div className="flex justify-around items-center px-2 py-3 overflow-x-auto no-scrollbar">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => handleViewChange(item.id)}
                        className={`flex flex-col items-center justify-center min-w-[60px] transition-all duration-200 ${currentView === item.id ? 'text-orange-500 scale-110 drop-shadow-sm' : 'text-gray-400 dark:text-gray-500'}`}
                    >
                        <item.icon className="w-6 h-6" strokeWidth={currentView === item.id ? 2.5 : 2} />
                        <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Modals */}
        <AuthModal isOpen={showAuthModal} onClose={() => {}} onSuccess={handleAuthSuccess} />
        <InstallPwaModal isOpen={isInstallModalOpen} onClose={() => setIsInstallModalOpen(false)} deferredPrompt={deferredPrompt} />
        <DisclaimerModal isOpen={isDisclaimerOpen} onClose={handleDisclaimerClose} />
        <SubscriptionModalNew isOpen={isSubscriptionModalOpen} onClose={() => setIsSubscriptionModalOpen(false)} onSuccessfulRedeem={handleSuccessfulRedeem} />
        <CongratulationsModal isOpen={isCongratsModalOpen} onClose={() => setIsCongratsModalOpen(false)} months={unlockedMonths} quote="Your journey to optimal health is powered up!" />
        <LogSleepModal isOpen={isLogSleepOpen} onClose={() => setIsLogSleepOpen(false)} age={userAge} />
        <Suspense fallback={null}><ProgressModal isOpen={isProgressModalOpen} onClose={() => setIsProgressModalOpen(false)} /></Suspense>
        
        <InfoModal 
            isOpen={isPsychiatryModalOpen}
            onClose={() => setIsPsychiatryModalOpen(false)}
            title="Feature Coming Soon"
            buttonText="Okay"
        >
            <div className="text-center">
                <p className="text-lg mb-2">🧠</p>
                <p>We are currently building a dedicated team of psychiatric experts to support your journey.</p>
                <p className="mt-2 font-medium text-orange-500">Stay tuned for updates!</p>
            </div>
        </InfoModal>
    </div>
  );
};

export default App;
