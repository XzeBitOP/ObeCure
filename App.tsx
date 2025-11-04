import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DietPlanner from './components/DietPlanner';
import Workouts from './components/LiveAssistant';
import DisclaimerModal from './components/DisclaimerModal';
import Faq from './components/Faq';
import { WebsiteIcon } from './components/icons/WebsiteIcon';
import { InstagramIcon } from './components/icons/InstagramIcon';

type View = 'planner' | 'workouts' | 'faq';

const App: React.FC = () => {
  const [view, setView] = useState<View>('planner');
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(true);

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
      <Header />
      <main className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
        <div className="flex justify-center mb-8 bg-orange-100/80 dark:bg-gray-800 rounded-full p-1 max-w-md sm:max-w-lg mx-auto shadow-inner">
          <button
            onClick={() => setView('planner')}
            className={`w-1/3 py-2 px-4 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50 active:scale-[0.97] ${
              view === 'planner'
                ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow'
                : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-orange-200/50 dark:hover:bg-gray-700/50'
            }`}
          >
            Diet Planner
          </button>
          <button
            onClick={() => setView('workouts')}
            className={`w-1/3 py-2 px-4 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50 active:scale-[0.97] ${
              view === 'workouts'
                ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow'
                : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-orange-200/50 dark:hover:bg-gray-700/50'
            }`}
          >
            Workouts
          </button>
           <button
            onClick={() => setView('faq')}
            className={`w-1/3 py-2 px-4 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50 active:scale-[0.97] ${
              view === 'faq'
                ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow'
                : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-orange-200/50 dark:hover:bg-gray-700/50'
            }`}
          >
            MindFit FAQ'S
          </button>
        </div>

        {view === 'planner' && <DietPlanner />}
        {view === 'workouts' && <Workouts />}
        {view === 'faq' && <Faq />}
      </main>
      <footer className="text-center p-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="bg-gray-800 dark:bg-black py-3 mb-6 overflow-hidden">
            <p className="animate-marquee text-white text-sm font-semibold whitespace-nowrap">
              <span className="text-amber-400">Doctor certified</span> Wellness supplement and <span className="text-amber-400">Ayurvedic product</span> coming soon...&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <span className="text-amber-400">Doctor certified</span> Wellness supplement and <span className="text-amber-400">Ayurvedic product</span> coming soon...&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
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