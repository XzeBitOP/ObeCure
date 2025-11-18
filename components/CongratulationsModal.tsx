import React, { useEffect } from 'react';
import { TrophyIcon } from './icons/TrophyIcon';

interface CongratulationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  months?: number;
  achievement?: { title: string; description: string };
  quote: string;
}

const Sparkle: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
    <svg 
        width="20" 
        height="20" 
        viewBox="0 0 100 100" 
        className="absolute sparkle text-yellow-400" 
        style={style} 
        fill="currentColor"
    >
        <path d="M50 0 L61.2 38.8 L100 50 L61.2 61.2 L50 100 L38.8 61.2 L0 50 L38.8 38.8 Z" />
    </svg>
);

const CongratulationsModal: React.FC<CongratulationsModalProps> = ({ isOpen, onClose, months, achievement, quote }) => {
  
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 6000); // Auto-close after 6 seconds

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-[70] flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-gray-200 dark:border-gray-700 transform animate-bounce-in text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-24 h-24 mx-auto mb-4">
            <Sparkle style={{ top: '0%', left: '15%', animationDelay: '0.5s' }} />
            <Sparkle style={{ top: '10%', right: '5%', animationDelay: '0.7s' }} />
            <Sparkle style={{ bottom: '5%', left: '5%', animationDelay: '0.6s' }} />
            <Sparkle style={{ bottom: '15%', right: '10%', animationDelay: '0.8s' }} />
            
            {achievement ? (
                <TrophyIcon className="w-full h-full text-amber-500 animate-bounce-in" />
            ) : (
                <svg className="w-full h-full" viewBox="0 0 52 52">
                    <circle className="text-green-500" cx="26" cy="26" r="25" fill="none" strokeWidth="4" stroke="currentColor" opacity="0.2" />
                    <path className="animate-draw-check text-green-500" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" d="M14 27l5.917 4.917L38 18" />
                </svg>
            )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200">
          {achievement ? 'Achievement Unlocked!' : 'Congratulations!'}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
          {achievement ? achievement.title : `You've unlocked full access for ${months} month${months && months > 1 ? 's' : ''}!`}
        </p>

        <p className="font-handwriting text-xl text-orange-600 dark:text-orange-400 my-6">
          "{quote}"
        </p>
        
        <button
          onClick={onClose}
          className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-orange-300 dark:focus:ring-orange-800 shadow-md hover:shadow-lg active:scale-95"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default CongratulationsModal;