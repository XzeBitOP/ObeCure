import React, { useState, useEffect, useMemo } from 'react';
import { SleepEntry } from '../types';

const SLEEP_DATA_KEY = 'obeCureSleepData';

interface LogSleepModalProps {
  isOpen: boolean;
  onClose: () => void;
  age: number;
}

interface SleepFeedback {
  emoji: string;
  color: string;
  message: string;
}

const getSleepFeedback = (age: number, hours: number): SleepFeedback | null => {
  if (hours <= 0) return null;

  let acceptable: [number, number];
  
  if (age >= 14 && age <= 17) { // Teenagers
    acceptable = [7, 11];
  } else if (age >= 18 && age <= 25) { // Young Adults
    acceptable = [6, 10];
  } else if (age >= 26 && age <= 64) { // Adults
    acceptable = [6, 9];
  } else if (age >= 65) { // Older Adults
    acceptable = [5, 9];
  } else { // Default to adult for unspecified/younger age
    acceptable = [6, 9];
  }

  if (hours < acceptable[0]) {
    return { emoji: '😩', color: 'text-blue-500', message: `Below acceptable range (${acceptable[0]}-${acceptable[1]} hrs)` };
  } else if (hours >= acceptable[0] && hours <= acceptable[1]) {
    return { emoji: '😊', color: 'text-green-500', message: `Within acceptable range (${acceptable[0]}-${acceptable[1]} hrs)` };
  } else {
    return { emoji: '😴', color: 'text-yellow-500', message: `Above acceptable range (${acceptable[0]}-${acceptable[1]} hrs)` };
  }
};


const LogSleepModal: React.FC<LogSleepModalProps> = ({ isOpen, onClose, age }) => {
  const [hours, setHours] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHours('');
      setSaveSuccess(false);
      const existingDataRaw = localStorage.getItem(SLEEP_DATA_KEY);
      if (existingDataRaw) {
        try {
            const existingData: SleepEntry[] = JSON.parse(existingDataRaw);
            const today = new Date().toISOString().split('T')[0];
            const todayEntry = existingData.find(entry => entry.date === today);
            if (todayEntry) {
              setHours(String(todayEntry.hours));
            }
        } catch (e) {
            console.error("Failed to parse sleep data", e);
        }
      }
    }
  }, [isOpen]);
  
  const feedback = useMemo(() => getSleepFeedback(age, parseFloat(hours)), [age, hours]);
  
  const handleSave = () => {
    const sleepHours = parseFloat(hours);
    if (isNaN(sleepHours) || sleepHours <= 0 || sleepHours > 24) return;

    const newEntry: SleepEntry = {
      date: new Date().toISOString().split('T')[0],
      hours: sleepHours,
    };

    const existingDataRaw = localStorage.getItem(SLEEP_DATA_KEY);
    let existingData: SleepEntry[] = existingDataRaw ? JSON.parse(existingDataRaw) : [];
    const todayEntryIndex = existingData.findIndex(entry => entry.date === newEntry.date);

    if (todayEntryIndex > -1) {
      existingData[todayEntryIndex] = newEntry;
    } else {
      existingData.push(newEntry);
    }
    localStorage.setItem(SLEEP_DATA_KEY, JSON.stringify(existingData));
    setSaveSuccess(true);
    setTimeout(() => {
        onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-sm border border-gray-200 dark:border-gray-700 transform animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Log Your Sleep
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition text-2xl">&times;</button>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">How many hours did you sleep last night?</p>
        
        <div className="relative">
             <input
                type="number"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="e.g., 7.5"
                className="w-full text-center text-4xl font-bold p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                aria-label="Hours of sleep"
            />
            {feedback && (
                <div className="absolute top-1/2 right-4 -translate-y-1/2 text-4xl animate-fade-in">
                    {feedback.emoji}
                </div>
            )}
        </div>

        {feedback && (
            <div className={`mt-3 text-center text-sm font-semibold animate-fade-in ${feedback.color}`}>
                <p>{hours} hours. {feedback.message}</p>
            </div>
        )}
        {!age && (
            <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
                Enter your age in the Diet Planner for more accurate sleep advice.
            </p>
        )}
        
        <button
          onClick={handleSave}
          disabled={!hours || saveSuccess}
          className="mt-6 w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-all duration-300 disabled:bg-orange-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          {saveSuccess ? 'Saved!' : 'Save Sleep Data'}
        </button>
      </div>
    </div>
  );
};

export default LogSleepModal;