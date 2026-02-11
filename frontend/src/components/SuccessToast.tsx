import React, { useEffect } from 'react';

interface SuccessToastProps {
  title: string;
  message: string;
  quote: string;
  onClose: () => void;
}

const SuccessToast: React.FC<SuccessToastProps> = ({ title, message, quote, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 6000); // Auto-close after 6 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-5 right-5 z-50 w-full max-w-sm animate-fade-in-up">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 border-l-4 border-green-500 dark:border-green-600">
        <div className="flex items-start">
          <div className="shrink-0 pt-0.5">
            {/* Green checkmark icon */}
            <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{message}</p>
            <p className="mt-3 text-xs italic text-gray-500 dark:text-gray-500 border-t border-gray-200 dark:border-gray-700 pt-2">"{quote}"</p>
          </div>
          <div className="ml-4 shrink-0 flex">
            <button
              onClick={onClose}
              className="inline-flex text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              {/* Close icon */}
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessToast;
