import React, { useState, useEffect, useMemo } from 'react';
import { BodyCompositionEntry, DailyIntake, Sex, WaterEntry, ProgressEntry, ActivityLevel } from '../types';
import * as calculator from '../services/bodyCompositionCalculator';
import PieChart from './PieChart';
import SuccessToast from './SuccessToast';

const USER_PREFERENCES_KEY = 'obeCureUserPreferences';
const BODY_COMPOSITION_KEY = 'obeCureBodyComposition';
const WATER_INTAKE_KEY = 'obeCureWaterIntake';
const DAILY_INTAKE_KEY = 'obeCureDailyIntake';
const PROGRESS_DATA_KEY = 'obeCureProgressData';

const StatCard: React.FC<{ title: string; value: string; unit: string; description?: string; colorClass?: string; size?: 'normal' | 'large' }> = 
({ title, value, unit, description, colorClass = 'text-orange-500', size = 'normal' }) => (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-center h-full flex flex-col justify-center">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
        <p className={`${size === 'large' ? 'text-4xl' : 'text-3xl'} font-bold ${colorClass} my-1`}>
            {value} <span className={`${size === 'large' ? 'text-xl' : 'text-lg'} font-medium text-gray-600 dark:text-gray-300`}>{unit}</span>
        </p>
        {description && <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>}
    </div>
);


const BodyComposition: React.FC<{ onOpenHistory: () => void; }> = ({ onOpenHistory }) => {
    const [inputs, setInputs] = useState({ age: 0, gender: 0, height: 0, weight: 0, waist: '', neck: '', hip: '', ethnicity: 'South Asian', smoker: 'no', alcohol: 'no', tg: '', hdl: '', activityLevel: ActivityLevel.LIGHTLY_ACTIVE });
    const [results, setResults] = useState<BodyCompositionEntry | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [toastInfo, setToastInfo] = useState<{ title: string; message: string; quote: string; } | null>(null);
    const [dailyStats, setDailyStats] = useState<{ hydration: number, tdee: number, bmr: number, intake: number, target: number }>({ hydration: 0, tdee: 0, bmr: 0, intake: 0, target: 0 });

    // FIX: Added missing handleInputChange function to handle form state updates.
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        let prefs: any = {};
        const prefsRaw = localStorage.getItem(USER_PREFERENCES_KEY);
        if (prefsRaw) {
            prefs = JSON.parse(prefsRaw);
        }

        const progressDataRaw = localStorage.getItem(PROGRESS_DATA_KEY);
        let currentWeight = parseFloat(prefs.patientWeight) || 0;
        if (progressDataRaw) {
            try {
                const progressData: ProgressEntry[] = JSON.parse(progressDataRaw);
                if (progressData.length > 0) {
                    const sortedProgress = [...progressData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    const recentEntries = sortedProgress.slice(0, 7);
                    if (recentEntries.length > 0) {
                        currentWeight = recentEntries.reduce((sum, entry) => sum + entry.weight, 0) / recentEntries.length;
                    }
                }
            } catch (e) { console.error("Could not parse progress data for weight calculation.", e); }
        }

        const loadedInputs = {
            age: parseInt(prefs.age, 10) || 0,
            gender: prefs.sex === Sex.MALE ? 1 : 0,
            height: parseFloat(prefs.height) || 0,
            weight: currentWeight,
            waist: prefs.waist || '',
            neck: prefs.neck || '',
            hip: prefs.hip || '',
            ethnicity: prefs.ethnicity || 'South Asian',
            smoker: prefs.smoker || 'no',
            alcohol: prefs.alcohol || 'no',
            tg: prefs.tg || '',
            hdl: prefs.hdl || '',
            activityLevel: prefs.activityLevel || ActivityLevel.LIGHTLY_ACTIVE,
        };
        setInputs(loadedInputs);

        if (loadedInputs.age > 0 && loadedInputs.weight > 0 && loadedInputs.height > 0) {
            const tdee = calculator.calculateTDEE({ weight: loadedInputs.weight, height: loadedInputs.height, age: loadedInputs.age, sex: prefs.sex, activityLevel: loadedInputs.activityLevel });
            const bmr = loadedInputs.gender === 1 ? (10 * loadedInputs.weight) + (6.25 * loadedInputs.height) - (5 * loadedInputs.age) + 5 : (10 * loadedInputs.weight) + (6.25 * loadedInputs.height) - (5 * loadedInputs.age) - 161;
            setDailyStats(prev => ({ ...prev, tdee: Math.round(tdee), bmr: Math.round(bmr) }));
        }

        const historyRaw = localStorage.getItem(BODY_COMPOSITION_KEY);
        if (historyRaw) {
            try {
                const history: BodyCompositionEntry[] = JSON.parse(historyRaw);
                if (history.length > 0) {
                    const latestEntry = history[history.length - 1];
                     // Only set results if they are from today, otherwise prompt for recalculation.
                    if (latestEntry.date === new Date().toISOString().split('T')[0]) {
                        setResults(latestEntry);
                    }
                }
            } catch (e) { console.error("Could not parse body composition history.", e) }
        }
        
        const today = new Date().toISOString().split('T')[0];
        const waterRaw = localStorage.getItem(WATER_INTAKE_KEY);
        if (waterRaw) {
            try {
                const waterData: WaterEntry[] = JSON.parse(waterRaw);
                const todayWater = waterData.find(e => e.date === today);
                if (todayWater) setDailyStats(prev => ({ ...prev, hydration: todayWater.glasses }));
            } catch(e) { console.error("Could not parse water intake.", e)}
        }

        const intakeRaw = localStorage.getItem(DAILY_INTAKE_KEY);
        if(intakeRaw) {
            try {
                const intakeData: DailyIntake[] = JSON.parse(intakeRaw);
                const todayIntake = intakeData.find(e => e.date === today);
                if(todayIntake) setDailyStats(prev => ({ ...prev, intake: todayIntake.totalIntake, target: todayIntake.targetCalories }));
            } catch(e) { console.error("Could not parse daily intake.", e)}
        }

    }, []);

    useEffect(() => {
        try {
            const savedPrefsRaw = localStorage.getItem(USER_PREFERENCES_KEY);
            const savedPrefs = savedPrefsRaw ? JSON.parse(savedPrefsRaw) : {};
            const newPrefs = {
                ...savedPrefs,
                waist: inputs.waist,
                neck: inputs.neck,
                hip: inputs.hip,
                ethnicity: inputs.ethnicity,
                smoker: inputs.smoker,
                alcohol: inputs.alcohol,
                tg: inputs.tg,
                hdl: inputs.hdl,
            };
            localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(newPrefs));
        } catch (e) {
            console.error("Failed to save body composition inputs", e);
        }
    }, [inputs]);

    const handleCalculate = () => {
        setError(null);
        const { age, gender, height, weight, waist, neck, hip, tg, hdl, activityLevel } = inputs;
        const waistNum = parseFloat(waist);
        const neckNum = parseFloat(neck);
        const hipNum = parseFloat(hip);
        const tgNum = tg ? parseFloat(tg) : undefined;
        const hdlNum = hdl ? parseFloat(hdl) : undefined;

        if (age <= 0 || height <= 0 || weight <= 0) {
             setError('Please ensure age, height, and weight are filled in the Diet Planner tab.');
             return;
        }

        if (!waistNum || waistNum <= 0 || !neckNum || neckNum <= 0 || !hipNum || hipNum <= 0) {
            setError('Please fill in waist, hip, and neck measurements.');
            return;
        }
        
        const calculatedResults = calculator.calculateAllMetrics({ ...inputs, weight, waist: waistNum, neck: neckNum, hip: hipNum, tg: tgNum, hdl: hdlNum, activityLevel });
        setResults(calculatedResults);

        const today = new Date().toISOString().split('T')[0];

        // Save full body composition data (limited to 15)
        const historyRaw = localStorage.getItem(BODY_COMPOSITION_KEY);
        let history: BodyCompositionEntry[] = historyRaw ? JSON.parse(historyRaw) : [];
        const todayIndex = history.findIndex(e => e.date === today);
        if (todayIndex > -1) {
            history[todayIndex] = calculatedResults;
        } else {
            history.push(calculatedResults);
        }
        history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (history.length > 15) {
            history = history.slice(history.length - 15);
        }
        localStorage.setItem(BODY_COMPOSITION_KEY, JSON.stringify(history));

        // Save simple progress data for chart (limited to 15)
        const newProgressEntry: ProgressEntry = {
            date: today,
            weight: weight,
            bmi: calculatedResults.bmi,
        };
        const progressHistoryRaw = localStorage.getItem(PROGRESS_DATA_KEY);
        let progressHistory: ProgressEntry[] = progressHistoryRaw ? JSON.parse(progressHistoryRaw) : [];
        const progressTodayIndex = progressHistory.findIndex(e => e.date === today);
        if (progressTodayIndex > -1) {
            progressHistory[progressTodayIndex] = newProgressEntry;
        } else {
            progressHistory.push(newProgressEntry);
        }
        progressHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (progressHistory.length > 15) {
            progressHistory = progressHistory.slice(progressHistory.length - 15);
        }
        localStorage.setItem(PROGRESS_DATA_KEY, JSON.stringify(progressHistory));

        setToastInfo({ title: "Progress Logged!", message: "Your body composition has been updated.", quote: "Knowledge is the first step towards change." });
    };
    
    const pieData = (results && inputs.weight > 0) ? [
        { label: 'Fat', value: results.bodyFatPercentage, color: '#f87171' },
        { label: 'Muscle', value: (results.muscleMass / inputs.weight) * 100, color: '#fb923c' },
        { label: 'Lean (Non-Muscle)', value: ((results.leanBodyMass - results.muscleMass) / inputs.weight) * 100, color: '#a78bfa' },
    ] : [];

    return (
        <div className="space-y-6 animate-fade-in">
            {toastInfo && <SuccessToast {...toastInfo} onClose={() => setToastInfo(null)} />}
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Daily Dashboard</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <StatCard title="BMR" value={String(results?.bmr || dailyStats.bmr || 'N/A')} unit="kcal" description="Resting Energy" colorClass="text-purple-500" />
                    <StatCard title="TDEE" value={String(dailyStats.tdee || 'N/A')} unit="kcal" description="Active Energy" colorClass="text-orange-500"/>
                    <StatCard title="Intake" value={String(dailyStats.intake)} unit="kcal" description={`Target: ${dailyStats.target}`} colorClass="text-green-500"/>
                    <StatCard title="BMI" value={results?.bmi.toFixed(1) || 'N/A'} unit="" description="Body Mass Index" colorClass="text-indigo-500"/>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Body Composition Analysis</h2>
                <p className="text-center text-sm font-semibold text-orange-500 bg-orange-50 dark:bg-orange-900/30 py-2 px-4 rounded-lg mb-4">We are 92% accurate to DEXA scan</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="space-y-4">
                         <div className="grid grid-cols-3 gap-2">
                            <div><label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Waist (cm)*</label><input type="number" name="waist" value={inputs.waist} onChange={handleInputChange} className="w-full p-2 text-sm bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-orange-400" /></div>
                            <div><label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Hip (cm)*</label><input type="number" name="hip" value={inputs.hip} onChange={handleInputChange} className="w-full p-2 text-sm bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-orange-400" /></div>
                            <div><label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Neck (cm)*</label><input type="number" name="neck" value={inputs.neck} onChange={handleInputChange} className="w-full p-2 text-sm bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-orange-400" /></div>
                         </div>
                         <div className="grid grid-cols-3 gap-2">
                             <div><label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Ethnicity</label><select name="ethnicity" value={inputs.ethnicity} onChange={handleInputChange} className="w-full p-2 text-sm bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-orange-400"><option>South Asian</option><option>East Asian</option><option>Caucasian</option><option>African</option><option>Hispanic</option><option>Other</option></select></div>
                            <div><label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Smoker</label><select name="smoker" value={inputs.smoker} onChange={handleInputChange} className="w-full p-2 text-sm bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-orange-400"><option value="no">No</option><option value="yes">Yes</option></select></div>
                            <div><label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Alcohol</label><select name="alcohol" value={inputs.alcohol} onChange={handleInputChange} className="w-full p-2 text-sm bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-orange-400"><option value="no">No</option><option value="yes">Yes</option></select></div>
                         </div>
                         <details className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-sm">
                            <summary className="font-semibold cursor-pointer">Optional: Add Lab Data for VAI</summary>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <div><label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Triglycerides</label><input type="number" name="tg" value={inputs.tg} onChange={handleInputChange} placeholder="mg/dL" className="w-full p-2 text-sm bg-white dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-orange-400" /></div>
                                <div><label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">HDL-C</label><input type="number" name="hdl" value={inputs.hdl} onChange={handleInputChange} placeholder="mg/dL" className="w-full p-2 text-sm bg-white dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-orange-400" /></div>
                            </div>
                         </details>
                         {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                         <button onClick={handleCalculate} className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition">Log My Progress</button>
                    </div>
                    {results && <PieChart data={pieData} />}
                </div>
            </div>

            {results && (
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up">
                    <StatCard title="Body Fat %" value={results.bodyFatPercentage.toFixed(1)} unit="%" colorClass="text-red-500" size="large" />
                    <StatCard title="Muscle Mass" value={results.muscleMass.toFixed(1)} unit="kg" colorClass="text-orange-500" size="large" />
                    <StatCard title="Lean Mass" value={results.leanBodyMass.toFixed(1)} unit="kg" colorClass="text-purple-500" size="large"/>
                    <StatCard title="Body Water" value={results.tbw.toFixed(1)} unit="L" colorClass="text-blue-500" size="large"/>
                </div>
            )}
            
            {results?.metabolicAgeAnalysis && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 animate-fade-in-up">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">Metabolic Health</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="flex flex-col items-center">
                            <StatCard 
                                title="Metabolic Age" 
                                value={String(results.metabolicAgeAnalysis.metabolicAge_clinical)} 
                                unit="yrs" 
                                description={`Chronological Age: ${inputs.age}`} 
                                colorClass="text-teal-500"
                                size="large"
                            />
                            <div className="w-full mt-4">
                                <label className="block text-center text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Calculation Confidence</label>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                    <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${results.metabolicAgeAnalysis.confidence * 100}%` }}></div>
                                </div>
                                {results.metabolicAgeAnalysis.confidence < 0.6 && <p className="text-xs text-center text-yellow-600 dark:text-yellow-400 mt-2">Measure waist at navel & be hydrated. Uploading device readings can improve accuracy.</p>}
                            </div>
                        </div>
                        <div className="text-sm">
                            <p className="text-gray-600 dark:text-gray-400">{results.metabolicAgeAnalysis.explanation}</p>
                            <h4 className="font-semibold mt-4 mb-2 text-gray-700 dark:text-gray-300">Recommendations:</h4>
                            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                                {results.metabolicAgeAnalysis.recommendation.split('$$').map((rec, i) => rec && <li key={i}>{rec}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {results && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 animate-fade-in-up">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">Health Risk Indicators</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        <StatCard title="Waist/Height Ratio" value={results.whtr.toFixed(2)} unit="" description="< 0.5 is ideal" />
                        <StatCard title="Waist/Hip Ratio" value={results.whr.toFixed(2)} unit="" description={inputs.gender === 1 ? '< 0.9 ideal' : '< 0.85 ideal'} />
                        <StatCard 
                            title="Visceral Fat Index" 
                            value={results.visceralFatIndex.toFixed(0)} 
                            unit="" 
                            description="< 9 is ideal" 
                            colorClass={results.visceralFatIndex >= 13 ? 'text-red-500' : results.visceralFatIndex >= 9 ? 'text-yellow-500' : 'text-green-500'}
                        />
                    </div>
                </div>
            )}

            <button onClick={onOpenHistory} className="w-full text-center py-3 font-semibold text-gray-600 dark:text-gray-400 hover:text-orange-500 transition">
                View Full Progress History &rarr;
            </button>
        </div>
    );
};

export default BodyComposition;
