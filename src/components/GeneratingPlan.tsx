import React, { useState, useEffect } from 'react';
import { motivationalQuotes as quotes } from '../data/quotes';

const emojis = ['🥗', '🍎', '🏋️‍♀️', '💪', '🥦', '🏃‍♂️', '🥕', '🧘‍♀️', '🥑', '✨', '🌱', '🧡'];

const GeneratingPlan: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuote(prevQuote => {
        const currentIndex = quotes.indexOf(prevQuote);
        const nextIndex = (currentIndex + 1) % quotes.length;
        return quotes[nextIndex];
      });
    }, 3500);

    return () => clearInterval(quoteInterval);
  }, []);

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 animate-fade-in-up flex flex-col items-center justify-center text-center overflow-hidden relative min-h-[350px]">
      <div className="absolute inset-0 z-0">
        {emojis.map((emoji, index) => (
          <span
            key={index}
            className="absolute text-3xl md:text-4xl opacity-50 animate-float"
            style={{
              left: `${Math.random() * 95}%`,
              bottom: `-${20 + Math.random() * 20}px`,
              animationDuration: `${Math.random() * 5 + 8}s`,
              animationDelay: `${Math.random() * 8}s`,
            }}
            aria-hidden="true"
          >
            {emoji}
          </span>
        ))}
      </div>
      
      <div className="relative z-10 flex flex-col items-center">
        <svg className="animate-spin h-12 w-12 text-orange-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Crafting Your Personalized Plan...</h2>
        <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-sm transition-opacity duration-500 ease-in-out">
          "{currentQuote}"
        </p>
      </div>
    </div>
  );
};

export default GeneratingPlan;
