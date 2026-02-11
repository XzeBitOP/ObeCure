import React, { useState, useEffect } from 'react';
import { motivationalQuotes as quotes } from '../data/quotes';

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
    <div className="mt-8 animate-fade-in-up">
      {/* Header Skeleton */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 mb-6 text-center relative overflow-hidden">
         {/* Shimmer Effect Overlay */}
         <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 dark:via-gray-600/20 to-transparent z-10"></div>
         
         <div className="flex justify-center mb-4">
            <div className="h-12 w-12 bg-orange-200 dark:bg-orange-900/50 rounded-full animate-pulse"></div>
         </div>
         <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-3 animate-pulse"></div>
         <p className="text-gray-500 dark:text-gray-400 text-sm italic transition-opacity duration-500">"{currentQuote}"</p>
      </div>

      {/* Meal Cards Skeleton Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-gray-300 dark:border-gray-600 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-gray-100/50 dark:via-gray-600/20 to-transparent z-10"></div>
                
                <div className="flex items-start">
                    <div className="mr-4 mt-1">
                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6 animate-pulse"></div>
                        </div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3 animate-pulse"></div>
                        
                        <div className="flex gap-2 mt-2">
                            <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-12 animate-pulse"></div>
                            <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-12 animate-pulse"></div>
                            <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-12 animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default GeneratingPlan;