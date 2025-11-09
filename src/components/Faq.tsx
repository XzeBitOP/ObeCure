import React, { useState } from 'react';
import { faqData } from '../data/faq';

type FaqState = 'collapsed' | 'animating' | 'expanded';

const Faq: React.FC = () => {
  const [faqState, setFaqState] = useState<FaqState>('collapsed');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleMainToggle = () => {
    if (faqState === 'collapsed') {
      setFaqState('animating');
      setTimeout(() => {
        setFaqState('expanded');
      }, 2000);
    } else {
      setFaqState('collapsed');
      setOpenIndex(null); // Reset open question when collapsing the whole section
    }
  };

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (faqState === 'collapsed') {
    return (
      <div className="animate-fade-in text-center">
        <button
          onClick={handleMainToggle}
          aria-expanded="false"
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 w-full hover:bg-orange-50/50 dark:hover:bg-gray-700/50 transition-colors duration-300 transform hover:-translate-y-1"
        >
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 sm:text-4xl">
            MindFit FAQ'S
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Click to reveal insights</p>
        </button>
      </div>
    );
  }

  if (faqState === 'animating') {
    return (
      <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center animate-fade-in" aria-live="polite">
        <div className="text-9xl animate-bounce-in" role="img" aria-label="Brain emoji">🧠</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <button onClick={handleMainToggle} className="w-full text-center mb-8" aria-expanded="true">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 sm:text-4xl">
              MindFit FAQ'S
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Click to collapse</p>
        </button>
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
              <button
                onClick={() => toggleQuestion(index)}
                className={`w-full text-left font-semibold text-lg transition-colors duration-200 focus:outline-none flex justify-between items-center ${
                  openIndex === index ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300 hover:text-orange-500'
                }`}
                 aria-expanded={openIndex === index}
              >
                <span>{item.question}</span>
                <span className={`transform transition-transform duration-300 text-orange-500 ${openIndex === index ? 'rotate-180' : 'rotate-0'}`}>▼</span>
              </button>
              {openIndex === index && (
                <div className="mt-3 text-gray-600 dark:text-gray-400 animate-fade-in space-y-2 pr-4">
                  {item.answer.map((part, i) => (
                    <p key={i}>{part}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Faq;
