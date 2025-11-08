import React, { useState, useEffect } from 'react';
import { ShareIcon } from './icons/ShareIcon';
import { MoreVerticalIcon } from './icons/MoreVerticalIcon';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any; // BeforeInstallPromptEvent
}

const InstallPwaModal: React.FC<InstallPwaModalProps> = ({ isOpen, onClose, deferredPrompt }) => {
  const [os, setOs] = useState<'ios' | 'android' | 'other'>('other');

  useEffect(() => {
    if (isOpen) {
        const userAgent = window.navigator.userAgent.toLowerCase();
        // The `standalone` property is non-standard but used by iOS to detect if the app is running as a PWA.
        if (/iphone|ipad|ipod/.test(userAgent) && !(window.navigator as any).standalone) {
            setOs('ios');
        } else if (/android/.test(userAgent)) {
            setOs('android');
        }
    }
  }, [isOpen]);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult: { outcome: 'accepted' | 'dismissed' }) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        onClose();
      });
    } else {
        onClose();
    }
  };

  if (!isOpen) {
    return null;
  }
  
  const IosInstructions = () => (
    <>
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Install on your iPhone</h3>
      <ol className="text-left space-y-4 text-gray-600 dark:text-gray-400">
        <li className="flex items-center">
          <span className="font-bold text-orange-500 mr-2">1.</span>
          <span>Tap the <ShareIcon className="inline-block w-5 h-5 align-text-bottom" /> button in your browser's toolbar.</span>
        </li>
        <li className="flex items-center">
          <span className="font-bold text-orange-500 mr-2">2.</span>
          <span>Scroll down and tap 'Add to Home Screen'.</span>
        </li>
        <li className="flex items-center">
          <span className="font-bold text-orange-500 mr-2">3.</span>
          <span>Tap 'Add' in the top right corner.</span>
        </li>
      </ol>
       <button onClick={onClose} className="mt-6 w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-all active:scale-95">
          Got It
        </button>
    </>
  );

  const AndroidInstructions = () => (
     <>
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Install on your Android</h3>
       <ol className="text-left space-y-4 text-gray-600 dark:text-gray-400">
         <li className="flex items-center">
           <span className="font-bold text-orange-500 mr-2">1.</span>
           <span>Tap the <MoreVerticalIcon className="inline-block w-5 h-5 align-text-bottom" /> button in your browser's top corner.</span>
         </li>
         <li className="flex items-center">
           <span className="font-bold text-orange-500 mr-2">2.</span>
           <span>Tap 'Install app' or 'Add to Home Screen'.</span>
         </li>
         <li className="flex items-center">
           <span className="font-bold text-orange-500 mr-2">3.</span>
           <span>Follow the on-screen instructions.</span>
         </li>
       </ol>
        {deferredPrompt ? (
            <button onClick={handleInstallClick} className="mt-6 w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-all active:scale-95">
                Install App
            </button>
        ) : (
             <button onClick={onClose} className="mt-6 w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-all active:scale-95">
                Got It
            </button>
        )}
    </>
  );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-sm border border-gray-200 dark:border-gray-700 transform animate-fade-in-up text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-2">
            <div />
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition text-2xl -mt-2">&times;</button>
        </div>
        
        {os === 'ios' && <IosInstructions />}
        {os === 'android' && <AndroidInstructions />}
        {os === 'other' && (deferredPrompt ? <AndroidInstructions /> : <IosInstructions />) /* Fallback for desktop or other browsers */}
        
      </div>
    </div>
  );
};

export default InstallPwaModal;
