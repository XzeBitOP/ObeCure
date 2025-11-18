import React from 'react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  buttonText?: string;
  size?: 'md' | 'lg' | 'xl';
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, title, children, buttonText = 'OK', size = 'md' }) => {
  if (!isOpen) {
    return null;
  }
  
  const sizeClasses = {
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-2xl'
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 w-full ${sizeClasses[size]} border border-gray-200 dark:border-gray-700 transform animate-fade-in-up`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">{title}</h2>
        <div className="text-gray-600 dark:text-gray-400 mb-6">{children}</div>
        <button
          onClick={onClose}
          className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-all duration-300 active:scale-95"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default InfoModal;