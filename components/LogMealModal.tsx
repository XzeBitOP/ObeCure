import React, { useState, useEffect } from 'react';
import { MealType } from '../types';
import { foodCalorieDatabase } from '../data/foodCalorieDatabase';

interface LogMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLog: (name: string, calories: number, mealType: MealType) => void;
}

// Levenshtein distance function for fuzzy matching
const levenshteinDistance = (a: string, b: string): number => {
    const an = a ? a.length : 0;
    const bn = b ? b.length : 0;
    if (an === 0) return bn;
    if (bn === 0) return an;
    const matrix = Array(bn + 1);
    for (let i = 0; i <= bn; ++i) {
        matrix[i] = [i];
    }
    const a_i = Array(an);
    for (let i = 0; i < an; ++i) {
        a_i[i] = a.charCodeAt(i);
    }
    const b_j = Array(bn);
    for (let j = 0; j < bn; ++j) {
        b_j[j] = b.charCodeAt(j);
    }
    for (let i = 1; i <= an; ++i) {
        matrix[0][i] = i;
        for (let j = 1; j <= bn; ++j) {
            const cost = a_i[i - 1] === b_j[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j-1][i] + 1,
                matrix[j][i-1] + 1,
                matrix[j-1][i-1] + cost
            );
        }
    }
    return matrix[bn][an];
};


const findBestMatch = (query: string) => {
    if (!query || query.length < 3) return null;

    const normalizedQuery = query.toLowerCase().trim();
    let bestMatch = null;
    let minDistance = Infinity;

    for (const food of foodCalorieDatabase) {
        // Simple word-based matching in addition to Levenshtein
        const foodNameParts = food.name.toLowerCase().split(' ');
        if (foodNameParts.some(part => normalizedQuery.includes(part)) || normalizedQuery.split(' ').some(part => food.name.toLowerCase().includes(part))) {
             const distance = levenshteinDistance(normalizedQuery, food.name.toLowerCase());
            if (distance < minDistance) {
                minDistance = distance;
                bestMatch = food;
            }
        }
    }
    
    // A more lenient threshold: accept if distance is less than half the query length
    // or if one string is a substring of another.
    if (bestMatch && (minDistance < normalizedQuery.length / 1.5 || bestMatch.name.toLowerCase().includes(normalizedQuery) || normalizedQuery.includes(bestMatch.name.toLowerCase()))) {
        return bestMatch;
    }

    return null;
};

const ThinkingAnimation = () => {
    const emojis = ['🤔', '💭', '🧠', '💬'];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setIndex(prevIndex => (prevIndex + 1) % emojis.length);
        }, 400); // Cycle emojis every 400ms
        return () => clearInterval(intervalId);
    }, []);

    return <span className="text-2xl">{emojis[index]}</span>;
};


const LogMealModal: React.FC<LogMealModalProps> = ({ isOpen, onClose, onLog }) => {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [mealType, setMealType] = useState<MealType>('Snack');
  const [suggestedCalories, setSuggestedCalories] = useState<number | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const handleLog = () => {
    const caloriesNum = parseInt(calories, 10);
    if (name.trim() && !isNaN(caloriesNum) && caloriesNum > 0) {
      onLog(name, caloriesNum, mealType);
    }
  };

  useEffect(() => {
    let thinkingTimer: number;

    const debounceHandler = setTimeout(() => {
        if (name && name.length >= 3) {
            setIsThinking(true);
            setCalories('');
            setSuggestedCalories(null);

            thinkingTimer = window.setTimeout(() => {
                const match = findBestMatch(name);
                if (match) {
                    setCalories(String(match.calories));
                    setSuggestedCalories(match.calories);
                }
                setIsThinking(false);
            }, 2000); // 2-second thinking time
        } else {
            setSuggestedCalories(null);
            setIsThinking(false);
        }
    }, 500); // 500ms debounce after user stops typing

    return () => {
        clearTimeout(debounceHandler);
        clearTimeout(thinkingTimer);
    };
  }, [name]);

  const handleCaloriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCalories(e.target.value);
    setSuggestedCalories(null);
  };

  // Reset state on close
  useEffect(() => {
    if (!isOpen) {
        setName('');
        setCalories('');
        setMealType('Snack');
        setSuggestedCalories(null);
        setIsThinking(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-sm border border-gray-200 dark:border-gray-700 transform animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Log Custom Food</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition text-2xl">&times;</button>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Enter the details of the food you ate that wasn't on your plan.</p>
        <div className="space-y-4">
          <div>
            <label htmlFor="mealName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Food Name</label>
            <input id="mealName" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Aloo Kachori" className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="calories" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Calories (kcal)</label>
                <div className="relative h-[40px]">
                    {isThinking ? (
                        <div className="w-full h-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center animate-pulse">
                            <ThinkingAnimation />
                        </div>
                    ) : (
                        <input 
                            id="calories" 
                            type="number" 
                            value={calories} 
                            onChange={handleCaloriesChange} 
                            placeholder="e.g., 240" 
                            className={`w-full h-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400 ${suggestedCalories ? 'text-cyan-500 dark:text-cyan-400 font-bold' : ''}`}
                        />
                    )}
                </div>
            </div>
            <div>
                <label htmlFor="mealType" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Meal Type</label>
                <select id="mealType" value={mealType} onChange={(e) => setMealType(e.target.value as MealType)} className="w-full h-[40px] px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400">
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snack">Snack</option>
                </select>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
            <button onClick={handleLog} className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-all disabled:bg-orange-300" disabled={!name.trim() || !calories || parseInt(calories, 10) <= 0}>Log Food</button>
            <button onClick={onClose} className="w-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition">Cancel</button>
        </div>
      </div>
    </div>
  );
};
export default LogMealModal;