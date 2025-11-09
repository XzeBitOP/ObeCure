import React, { useState, useEffect, useMemo } from 'react';
import { BodyCompositionEntry, DailyIntake, Sex, WaterEntry, ProgressEntry } from '../types';
import * as calculator from '../services/bodyCompositionCalculator';
import PieChart from './PieChart';
import RiskBar from './RiskBar';
import SuccessToast from './SuccessToast';

const USER_PREFERENCES_KEY = 'obeCureUserPreferences';
const BODY_COMPOSITION_KEY = 'obeCureBodyComposition';
const WATER_INTAKE_KEY = 'obeCureWaterIntake';
const DAILY_INTAKE_KEY = 'obeCureDailyIntake';
const PROGRESS_DATA_KEY = 'obeCureProgressData';

interface BodyCompositionProps {
    onOpenHistory: () => void;
}

const BodyComposition: React.FC<BodyCompositionProps> = ({ onOpenHistory }) => {
    const [inputs, setInputs] = useState({ age: 0, gender: 0, height: 0, weight: 0, waist: '', neck: '', hip: '' });
    const [results, setResults] = useState<BodyCompositionEntry | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [toastInfo, setToastInfo] = useState<{ title: string; message: string; quote: string } | null>(null);
    const [dailyStats, setDailyStats] = useState<{ hydration: number, tdee: number, intake: number, target: number }>({ hydration: 0, tdee: 0, intake: 0, target: 0 });

    useEffect(() => {
        // Load base data from user preferences
        const prefsRaw = localStorage.getItem(USER_PREFERENCES_KEY);
        if (prefsRaw) {
            const prefs = JSON.parse(prefsRaw);
            
            // Calculate average weight from progress data
            const progressDataRaw = localStorage.getItem(PROGRESS_DATA_KEY);
            let currentWeight = parseFloat(prefs.patientWeight) || 0;
            if (progressDataRaw) {
                try {
                    const progressData: ProgressEntry[] = JSON.parse(progressDataRaw);
                    if (progressData.length > 0) {
                        const sortedProgress = [...progressData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                        const recentEntries = sortedProgress.slice(0, 7);
                        if (recentEntries.length > 0) {
                            const totalWeight = recentEntries.reduce((sum, entry) => sum + entry.weight, 0);
                            currentWeight = totalWeight / recentEntries.length;
                        }
                    }
                } catch (e) { console.error("Could not parse progress data for weight calculation.", e); }
            }

            const loadedInputs = {
                age: parseInt(prefs.age, 10) || 0,
                gender: prefs.sex === Sex.MALE ? 1 : 0,
                height: parseFloat(prefs.height) || 0,
                weight: currentWeight,
                waist: '', neck: '', hip: '',
            };
            setInputs(loadedInputs);

             // Calculate TDEE
            const tdee = calculator.calculateTDEE({
                weight: loadedInputs.weight,
                height: loadedInputs.height,
                age: loadedInputs.age,
                sex: prefs.sex,
                activityLevel: prefs.activityLevel
            });
            setDailyStats(prev => ({ ...prev, tdee: Math.round(tdee) }));
        }

        // Load latest body composition results
        const historyRaw = localStorage.getItem(BODY_COMPOSITION_KEY);
        if (historyRaw) {
            const history: BodyCompositionEntry[] = JSON.parse(historyRaw);
            if (history.length > 0) {
                setResults(history[history.length - 1]);
            }
        }
        
        // Load daily stats
        const today = new Date().toISOString().split('T')[0];
        const waterRaw = localStorage.getItem(WATER_INTAKE_KEY);
        if (waterRaw) {
            const waterData: WaterEntry[] = JSON.parse(waterRaw);
            const todayWater = waterData.find(e => e.date === today);
            if (todayWater) setDailyStats(prev => ({ ...prev, hydration: todayWater.glasses }));
        }

        const intakeRaw = localStorage.getItem(DAILY_INTAKE_KEY);
        if(intakeRaw) {
            const intakeData: DailyIntake[] = JSON.parse(intakeRaw);
            const todayIntake = intakeData.find(e => e.date === today);
            if(todayIntake) setDailyStats(prev => ({ ...prev, intake: todayIntake.totalIntake, target: todayIntake.targetCalories }));
        }

    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: value }));
    };

    const handleCalculate = () => {
        setError(null);
        const { age, gender, height, weight, waist, neck, hip } = inputs;
        const waistNum = parseFloat(waist);
        const neckNum = parseFloat(neck);
        const hipNum = parseFloat(hip);

        if (age <= 0 || height <= 0 || weight <= 0 || waistNum <= 0 || neckNum <= 0) {
            setError('Please fill in all required fields with valid numbers.');
            return;
        }
        if (gender === 0 && hipNum <= 0) {
            setError('Hip measurement is required for females.');
            return;
        }
        
        const calculatedResults = calculator.calculateAllMetrics({ ...inputs, waist: waistNum, neck: neckNum, hip: hipNum });
        setResults(calculatedResults);

        // Save to history
        const historyRaw = localStorage.getItem(BODY_COMPOSITION_KEY);
        let history: BodyCompositionEntry[] = historyRaw ? JSON.parse(historyRaw) : [];
        const today = new Date().toISOString().split('T')[0];
        const todayIndex = history.findIndex(e => e.date === today);
        if (todayIndex > -1) {
            history[todayIndex] = calculatedResults;
        } else {
            history.push(calculatedResults);
        }
        localStorage.setItem(BODY_COMPOSITION_KEY, JSON.stringify(history));

        setToastInfo({ title: "Analysis Complete!", message: "Your body composition has been updated.", quote: "Knowledge is the first step towards change." });
    };
    
    const VFI_SUMMARY: Record<number, string> = {
        3: 'Excellent! Your visceral fat level is very low, indicating great internal health.',
        6: 'Good. Your visceral fat is in a healthy range. Keep up your balanced lifestyle.',
        9: 'Fair. Your visceral fat is slightly elevated. Consider increasing activity and fiber.',
        13: 'Elevated. Your visceral fat is high, increasing health risks. Focus on resistance training and a high-fiber diet.',
        18: 'Very High. Your visceral fat is at a level that poses significant health risks. A structured diet and exercise plan is crucial.'
    };
    
    const pieData = results ? [
        { label: 'Fat', value: results.bodyFatPercentage, color: '#f87171' },
        { label: 'Muscle', value: (results.muscleMass / inputs.weight) * 100, color: '#fb923c' },
        { label: 'Lean (Non-Muscle)', value: ((results.leanBodyMass - results.muscleMass) / inputs.weight) * 100, color: '#a78bfa' },
    ] : [];

    return (
        <div className="space-y-8 animate-fade-in">
            {toastInfo && <SuccessToast {...toastInfo} onClose={() => setToastInfo(null)} />}
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Daily Stats</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Hydration</p>
                        <p className="text-2xl font-bold text-blue-500">{dailyStats.hydration}<span className="text-base font-medium text-gray-600 dark:text-gray-300">/8</span></p>
                    </div>
                     <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Calorie Intake</p>
                        <p className="text-2xl font-bold text-green-500">{dailyStats.intake}<span className="text-base font-medium text-gray-600 dark:text-gray-300">/{dailyStats.target}</span></p>
                    </div>
                     <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">BMI</p>
                        <p className="text-2xl font-bold text-purple-500">{results?.bmi.toFixed(1) || 'N/A'}</p>
                    </div>
                     <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">TDEE</p>
                        <p className="text-2xl font-bold text-orange-500">{dailyStats.tdee}<span className="text-base font-medium text-gray-600 dark:text-gray-300"> kcal</span></p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Body Composition Analysis</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Enter your measurements to calculate your body composition. Use a soft measuring tape for accuracy.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Waist (cm)*</label>
                        <input type="number" name="waist" value={inputs.waist} onChange={handleInputChange} placeholder="At navel" className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md border-transparent focus:ring-2 focus:ring-orange-500"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Neck (cm)*</label>
                        <input type="number" name="neck" value={inputs.neck} onChange={handleInputChange} placeholder="Below Adam's apple" className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md border-transparent focus:ring-2 focus:ring-orange-500"/>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${inputs.gender === 0 ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>Hip (cm){inputs.gender === 0 ? '*' : ''}</label>
                        <input type="number" name="hip" value={inputs.hip} onChange={handleInputChange} placeholder="Widest part" disabled={inputs.gender === 1} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md border-transparent focus:ring-2 focus:ring-orange-500 disabled:opacity-50"/>
                    </div>
                </div>
                {error && <p className="text-red-500 text-sm text-center my-2">{error}</p>}
                <button onClick={handleCalculate} className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-all active:scale-95 shadow-md">Calculate & Update</button>
            </div>

            {results && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 animate-fade-in">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">Your Results</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="flex justify-center">
                            <PieChart data={pieData} />
                        </div>
                        <div className="space-y-3 text-sm">
                           <div className="flex justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded"><strong>Body Fat:</strong> <span className="font-bold">{results.bodyFatPercentage.toFixed(1)}%</span></div>
                           <div className="flex justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded"><strong>Lean Body Mass:</strong> <span className="font-bold">{results.leanBodyMass.toFixed(1)} kg</span></div>
                           <div className="flex justify-between p-2 bg-orange-50 dark:bg-orange-900/20 rounded"><strong>Muscle Mass:</strong> <span className="font-bold">{results.muscleMass.toFixed(1)} kg</span></div>
                           <div className="flex justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded"><strong>Protein Mass:</strong> <span className="font-bold">{results.proteinMass.toFixed(1)} kg ({results.proteinPercentage.toFixed(1)}%)</span></div>
                        </div>
                    </div>
                     <div className="mt-6">
                        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 text-center mb-2">Visceral Fat Index (VFI)</h3>
                        <RiskBar value={results.visceralFatIndex} maxValue={20} />
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-3 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">{VFI_SUMMARY[results.visceralFatIndex as keyof typeof VFI_SUMMARY]}</p>
                    </div>
                </div>
            )}
             <div className="mt-8">
                <button
                    onClick={onOpenHistory}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl active:scale-95 transform hover:-translate-y-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    <span>View Detailed History Chart</span>
                </button>
            </div>
        </div>
    );
};

export default BodyComposition;