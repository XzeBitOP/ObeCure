import React from 'react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: { heading: string; text: string }[];
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-[70] flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl border border-gray-200 dark:border-gray-700 transform animate-bounce-in flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition text-3xl">&times;</button>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto pr-4 text-gray-600 dark:text-gray-400 space-y-4">
            {content.map((section, index) => (
                <div key={index}>
                    <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">{section.heading}</h3>
                    <p className="text-sm">{section.text}</p>
                </div>
            ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-all active:scale-95"
            >
              Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
