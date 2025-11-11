import React, { useState } from 'react';
import { MealType } from '../types';

interface LogMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLog: (name: string, calories: number, mealType: MealType) => void;
}

const LogMealModal: React.FC<LogMealModalProps> = ({ isOpen, onClose, onLog }) => {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [mealType, setMealType] = useState<MealType>('Snack');

  const handleLog = () => {
    const caloriesNum = parseInt(calories, 10);
    if (name.trim() && !isNaN(caloriesNum) && caloriesNum > 0) {
      onLog(name, caloriesNum, mealType);
      setName('');
      setCalories('');
      setMealType('Snack');
    }
  };

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
            <input id="mealName" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Handful of Cashews" className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="calories" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Calories (kcal)</label>
              <input id="calories" type="number" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="e.g., 180" className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
                <label htmlFor="mealType" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Meal Type</label>
                <select id="mealType" value={mealType} onChange={(e) => setMealType(e.target.value as MealType)} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400">
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