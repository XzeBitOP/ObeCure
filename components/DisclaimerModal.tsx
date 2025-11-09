import React from 'react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4 animate-fade-in"
      aria-labelledby="disclaimer-title"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-gray-200 dark:border-gray-700 transform animate-bounce-in"
        role="document"
      >
        <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center mr-4 shrink-0">
                <svg className="w-6 h-6 text-orange-500 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h2 id="disclaimer-title" className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Important Disclaimer
            </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This application provides AI-generated diet and workout suggestions. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or another qualified health provider with any questions you may have regarding a medical condition.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-orange-300 dark:focus:ring-orange-800 shadow-md hover:shadow-lg active:scale-95"
          aria-label="Acknowledge and close disclaimer"
        >
          I Understand
        </button>
      </div>
    </div>
  );
};

export default DisclaimerModal;