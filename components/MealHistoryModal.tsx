import React, { useState, useEffect } from 'react';
import { DailyIntake, CustomMealLogEntry } from '../types';

const DAILY_INTAKE_KEY = 'obeCureDailyIntake';
const MANUAL_MEAL_LOG_KEY = 'obeCureManualMealLog';

interface MealHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CombinedLog {
    date: string;
    plannedMeals: { name: string, calories: number }[];
    customMeals: CustomMealLogEntry[];
    totalCalories: number;
    targetCalories: number;
}

const MealHistoryModal: React.FC<MealHistoryModalProps> = ({ isOpen, onClose }) => {
    const [history, setHistory] = useState<CombinedLog[]>([]);

    useEffect(() => {
        if (isOpen) {
            const intakeRaw = localStorage.getItem(DAILY_INTAKE_KEY);
            const customRaw = localStorage.getItem(MANUAL_MEAL_LOG_KEY);
            const intakeHistory: DailyIntake[] = intakeRaw ? JSON.parse(intakeRaw) : [];
            const customHistory: CustomMealLogEntry[] = customRaw ? JSON.parse(customRaw) : [];
            
            const combinedLogs: { [date: string]: CombinedLog } = {};

            const today = new Date();
            for (let i = 0; i < 7; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];

                const intakeForDay = intakeHistory.find(d => d.date === dateStr);
                const customForDay = customHistory.filter(d => d.date === dateStr);

                if (intakeForDay || customForDay.length > 0) {
                     const customCalories = customForDay.reduce((sum, meal) => sum + meal.calories, 0);
                     combinedLogs[dateStr] = {
                        date: dateStr,
                        plannedMeals: intakeForDay?.loggedMeals || [],
                        customMeals: customForDay || [],
                        totalCalories: intakeForDay?.totalIntake || customCalories,
                        targetCalories: intakeForDay?.targetCalories || 0,
                    };
                }
            }
            
            setHistory(Object.values(combinedLogs).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
    }, [isOpen]);

    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-lg border border-gray-200 dark:border-gray-700 transform animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Meal Log History (Last 7 Days)</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition text-2xl">&times;</button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
                    {history.length > 0 ? history.map(log => (
                        <div key={log.date} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                            <h3 className="font-bold text-lg text-orange-600 dark:text-orange-400 border-b border-gray-200 dark:border-gray-600 pb-2 mb-2">
                                {new Date(log.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', month: 'short', day: 'numeric' })}
                            </h3>
                            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                {log.plannedMeals.map((meal, i) => (
                                    <div key={`plan-${i}`} className="flex justify-between"><span>{meal.name}</span> <span className="font-semibold">{meal.calories} kcal</span></div>
                                ))}
                                {log.customMeals.map((meal, i) => (
                                     <div key={`custom-${i}`} className="flex justify-between"><span><i>{meal.name} ({meal.mealType})</i></span> <span className="font-semibold">{meal.calories} kcal</span></div>
                                ))}
                            </div>
                            <div className="flex justify-between font-bold text-gray-800 dark:text-gray-200 mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                                <span>Total: {log.totalCalories} kcal</span>
                                {log.targetCalories > 0 && <span className="text-sm text-gray-500">Target: {log.targetCalories} kcal</span>}
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">No meals logged in the last 7 days.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MealHistoryModal;