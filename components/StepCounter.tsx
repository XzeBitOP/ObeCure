
import React, { useState, useEffect } from 'react';
import * as stepService from '../services/googleFitService';
import SuccessToast from './SuccessToast';
import { ShoeIcon } from './icons/ShoeIcon';

interface StepCounterProps {}

const StepCounter: React.FC<StepCounterProps> = () => {
    const [steps, setSteps] = useState(0);
    const [calories, setCalories] = useState(0);
    const [distance, setDistance] = useState(0);
    const [isLogging, setIsLogging] = useState(false);
    const [inputSteps, setInputSteps] = useState('');
    const [toast, setToast] = useState<{ title: string, message: string, quote: string } | null>(null);

    const GOAL = 10000;

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const data = await stepService.fetchTodaySteps();
        setSteps(data.steps);
        setCalories(data.calories);
        setDistance(data.distance);
    };

    const handleSaveSteps = async () => {
        const newSteps = parseInt(inputSteps, 10);
        if (!isNaN(newSteps) && newSteps >= 0) {
            const data = await stepService.saveSteps(newSteps);
            setSteps(data.steps);
            setCalories(data.calories);
            setDistance(data.distance);
            setIsLogging(false);
            setInputSteps('');
            setToast({
                title: "Steps Logged!",
                message: "Great job keeping active.",
                quote: "Every step counts towards your goal."
            });
        }
    };

    const progress = Math.min(100, (steps / GOAL) * 100);
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 animate-fade-in relative overflow-hidden">
            {toast && <SuccessToast {...toast} onClose={() => setToast(null)} />}
            
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full">
                        <ShoeIcon className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-200">Daily Steps</h3>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Sync from your device</p>
                    </div>
                </div>
                {!isLogging && (
                    <button 
                        onClick={() => { setIsLogging(true); setInputSteps(String(steps || '')); }}
                        className="text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-full transition-colors shadow-sm"
                    >
                        Log Steps
                    </button>
                )}
            </div>

            {/* Main Content */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-4xl font-bold text-gray-800 dark:text-gray-100">
                        {steps.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        / {GOAL.toLocaleString()} goal
                    </p>
                    
                    <div className="flex gap-4 mt-4">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 uppercase font-semibold">Calories</span>
                            <span className="font-bold text-orange-500">{calories} <span className="text-xs text-gray-500">kcal</span></span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 uppercase font-semibold">Distance</span>
                            <span className="font-bold text-blue-500">{distance} <span className="text-xs text-gray-500">km</span></span>
                        </div>
                    </div>
                </div>

                {/* Progress Ring */}
                <div className="relative w-24 h-24 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90 drop-shadow-lg">
                        {/* Track Circle */}
                        <circle
                            cx="48" cy="48" r="40"
                            className="stroke-gray-100 dark:stroke-gray-700"
                            strokeWidth="8" fill="none"
                            strokeLinecap="round"
                        />
                        {/* Progress Circle */}
                        <circle
                            cx="48" cy="48" r="40"
                            className="stroke-cyan-400 transition-all duration-1000 ease-out"
                            strokeWidth="8" fill="none"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            style={{ filter: 'drop-shadow(0px 0px 3px rgba(34, 211, 238, 0.6))' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{Math.round(progress)}%</span>
                    </div>
                </div>
            </div>

            {/* Manual Log Input */}
            {isLogging && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 animate-fade-in-up">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Enter steps from your watch/phone:</label>
                    <div className="flex gap-2">
                        <input 
                            type="number" 
                            value={inputSteps}
                            onChange={(e) => setInputSteps(e.target.value)}
                            placeholder="e.g. 5400"
                            className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                            autoFocus
                        />
                        <button 
                            onClick={handleSaveSteps}
                            className="bg-orange-500 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            Save
                        </button>
                        <button 
                            onClick={() => setIsLogging(false)}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-2"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StepCounter;
