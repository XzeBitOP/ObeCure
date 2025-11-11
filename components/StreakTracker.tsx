import React from 'react';

interface StreakTrackerProps {
  streak: number;
  quote: string;
}

const StreakTracker: React.FC<StreakTrackerProps> = ({ streak, quote }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 -mt-4 mb-6">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-slate-800 dark:to-slate-900 text-white rounded-xl shadow-2xl p-6 text-center animate-fade-in-up border border-orange-500/20">
        <div className="flex items-center justify-center gap-4">
          <div className="text-7xl animate-flame" style={{ textShadow: '0 0 10px #f97316' }}>🔥</div>
          <div>
            <p className="text-5xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">{streak}</p>
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">{streak > 1 ? 'Day Streak' : 'Day Streak'}</p>
          </div>
        </div>
        <p className="mt-4 text-base font-medium text-gray-300 italic">"{quote}"</p>
      </div>
    </div>
  );
};

export default StreakTracker;