import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Header from './components/Header';
import DietPlanner from './components/DietPlanner';
import Workouts from './components/LiveAssistant';
import DisclaimerModal from './components/DisclaimerModal';
import Faq from './components/Faq';
import { WebsiteIcon } from './components/icons/WebsiteIcon';
import { InstagramIcon } from './components/icons/InstagramIcon';
import LogSleepModal from './components/LogSleepModal';
import ProgressModal from './components/ProgressModal';

type View = 'planner' | 'workouts' | 'faq';

const USER_PREFERENCES_KEY = 'obeCureUserPreferences';

const App: React.FC = () => {
  const [view, setView] = useState<View>('planner');
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(true);
  const [isLogSleepModalOpen, setIsLogSleepModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [userAge, setUserAge] = useState(0);

  const navRef = useRef<HTMLDivElement>(null);
  const plannerButtonRef = useRef<HTMLButtonElement>(null);
  const workoutsButtonRef = useRef<HTMLButtonElement>(null);
  const faqButtonRef = useRef<HTMLButtonElement>(null);
  const [bubbleStyle, setBubbleStyle] = useState({ opacity: 0 });

  useLayoutEffect(() => {
    const updateBubble = () => {
      let targetButton: React.RefObject<HTMLButtonElement> | null = null;
      if (view === 'planner') targetButton = plannerButtonRef;
      else if (view === 'workouts') targetButton = workoutsButtonRef;
      else if (view === 'faq') targetButton = faqButtonRef;

      if (targetButton?.current) {
        const { offsetLeft, offsetWidth } = targetButton.current;
        if (offsetWidth > 0) { // Prevent setting style if button not rendered correctly
          setBubbleStyle({
            left: `${offsetLeft}px`,
            width: `${offsetWidth}px`,
            opacity: 1,
          });
        }
      }
    };
    
    // The document.fonts.ready promise resolves once fonts are loaded.
    // This is crucial to get the correct width of the buttons after custom fonts are applied, preventing an initial glitch.
    document.fonts.ready.then(updateBubble);

    window.addEventListener('resize', updateBubble);
    return () => window.removeEventListener('resize', updateBubble);
  }, [view]);


  useEffect(() => {
    // This effect fetches the user's age from local storage when the modal is about to open
    // to provide accurate sleep advice.
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

  const handleCloseDisclaimer = () => {
    setShowDisclaimer(false);
  };


  return (
    <div className="min-h-screen bg-orange-50/50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <DisclaimerModal isOpen={showDisclaimer} onClose={handleCloseDisclaimer} />
      <LogSleepModal
        isOpen={isLogSleepModalOpen}
        onClose={() => setIsLogSleepModalOpen(false)}
        age={userAge}
      />
      <ProgressModal isOpen={isProgressModalOpen} onClose={() => setIsProgressModalOpen(false)} />
      <Header onLogSleepClick={() => setIsLogSleepModalOpen(true)} />
      <main className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
        <div ref={navRef} className="relative flex justify-center mb-8 bg-orange-100/80 dark:bg-gray-800 rounded-full p-1 max-w-md sm:max-w-lg mx-auto shadow-inner">
          <div
            className="absolute top-1 bottom-1 bg-white dark:bg-gray-700 rounded-full shadow transition-all duration-300 ease-in-out"
            style={bubbleStyle}
            role="presentation"
          ></div>
          <button
            ref={plannerButtonRef}
            onClick={() => setView('planner')}
            className={`relative z-10 w-1/3 py-2 px-4 rounded-full text-sm sm:text-base font-semibold transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50 ${
              view === 'planner'
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-orange-500/70 dark:hover:text-orange-400/70'
            }`}
          >
            Diet Planner
          </button>
          <button
            ref={workoutsButtonRef}
            onClick={() => setView('workouts')}
            className={`relative z-10 w-1/3 py-2 px-4 rounded-full text-sm sm:text-base font-semibold transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50 ${
              view === 'workouts'
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-orange-500/70 dark:hover:text-orange-400/70'
            }`}
          >
            Workouts
          </button>
           <button
            ref={faqButtonRef}
            onClick={() => setView('faq')}
            className={`relative z-10 w-1/3 py-2 px-4 rounded-full text-sm sm:text-base font-semibold transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50 ${
              view === 'faq'
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-orange-500/70 dark:hover:text-orange-400/70'
            }`}
          >
            MindFit FAQ'S
          </button>
        </div>

        {view === 'planner' && <DietPlanner onShowProgress={() => setIsProgressModalOpen(true)} />}
        {view === 'workouts' && <Workouts />}
        {view === 'faq' && <Faq />}
      </main>
      <footer className="text-center p-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 dark:from-orange-600 dark:via-amber-500 dark:to-orange-600 py-3 mb-6 overflow-hidden rounded-lg shadow-lg animate-gradient-pulse">
            <p className="animate-marquee text-white text-sm font-semibold whitespace-nowrap [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">
              <span className="font-bold text-yellow-200">Doctor certified</span> Wellness supplement and <span className="font-bold text-yellow-200">Ayurvedic product</span> coming soon...&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <span className="font-bold text-yellow-200">Doctor certified</span> Wellness supplement and <span className="font-bold text-yellow-200">Ayurvedic product</span> coming soon...&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </p>
          </div>
          <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 font-handwriting">
                  Connect with us
              </h3>
              <div className="flex justify-center items-center space-x-4 sm:space-x-6">
                  <a href="https://www.xzecure.co.in" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all duration-300 transform hover:scale-110 opacity-0 animate-fade-in-up" style={{animationDelay: '200ms'}}>
                      <WebsiteIcon className="w-8 h-8"/>
                      <span className="text-xs mt-1">Website</span>
                  </a>
                  <a href="https://www.instagram.com/xzecure" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all duration-300 transform hover:scale-110 opacity-0 animate-fade-in-up" style={{animationDelay: '400ms'}}>
                      <InstagramIcon className="w-8 h-8"/>
                      <span className="text-xs mt-1">@xzecure</span>
                  </a>
                  <a href="https://www.instagram.com/askdr.xze" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all duration-300 transform hover:scale-110 opacity-0 animate-fade-in-up" style={{animationDelay: '600ms'}}>
                      <InstagramIcon className="w-8 h-8"/>
                      <span className="text-xs mt-1">@askdr.xze</span>
                  </a>
                  <a href="https://www.instagram.com/Xzeveda" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all duration-300 transform hover:scale-110 opacity-0 animate-fade-in-up" style={{animationDelay: '800ms'}}>
                      <InstagramIcon className="w-8 h-8"/>
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