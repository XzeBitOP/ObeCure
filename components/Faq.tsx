import React, { useState } from 'react';
import { faqData } from '../data/faq';

const Faq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="animate-fade-in">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 sm:text-4xl text-center mb-8">
          MindFit FAQ'S
        </h1>
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
              <button
                onClick={() => toggleFaq(index)}
                className={`w-full text-left font-semibold text-lg transition-colors duration-200 focus:outline-none ${
                  openIndex === index ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300 hover:text-orange-500'
                }`}
                 aria-expanded={openIndex === index}
              >
                {item.question}
              </button>
              {openIndex === index && (
                <div className="mt-3 text-gray-600 dark:text-gray-400 animate-fade-in space-y-2">
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
