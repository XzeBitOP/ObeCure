import React, { useState, useEffect } from 'react';
import { BodyCompositionEntry, DailyIntake, Sex, WaterEntry, ProgressEntry, ActivityLevel, DietPreference, DietType, HealthCondition } from '../types';
import * as calculator from '../services/bodyCompositionCalculator';
import PieChart from './PieChart';
import SuccessToast from './SuccessToast';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import TrendGraph from './TrendGraph';

const USER_PREFERENCES_KEY = 'obeCureUserPreferences';
const BODY_COMPOSITION_KEY = 'obeCureBodyComposition';
const WATER_INTAKE_KEY = 'obeCureWaterIntake';
const DAILY_INTAKE_KEY = 'obeCureDailyIntake';
const PROGRESS_DATA_KEY = 'obeCureProgressData';

const StatCard: React.FC<{ title: string; value: string; unit: string; description?: string; colorClass?: string; size?: 'normal' | 'large' }> = 
({ title, value, unit, description, colorClass = 'text-orange-500', size = 'normal' }) => (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg text-center h-full flex flex-col justify-center">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
        <p className={`${size === 'large' ? 'text-4xl' : 'text-2xl'} font-bold ${colorClass} my-1`}>
            {value} <span className={`${size === 'large' ? 'text-xl' : 'text-base'} font-medium text-gray-600 dark:text-gray-300`}>{unit}</span>
        </p>
        {description && <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>}
    </div>
);

const AccordionSection: React.FC<{ title: string; children: React.ReactNode, defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    return (
        <details open={defaultOpen} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700 transition-all duration-300 open:shadow-md group">
            <summary className="p-4 font-semibold cursor-pointer flex justify-between items-center text-gray-700 dark:text-gray-300">
                {title}
                <ChevronDownIcon className="w-5 h-5 transition-transform duration-300 transform-gpu group-open:rotate-180" />
            </summary>
            <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
                {children}
            </div>
        </details>
    );
};


const BodyComposition: React.FC<{ onOpenHistory: () => void; }> = ({ onOpenHistory }) => {
    const [inputs, setInputs] = useState({
        patientName: '',
        age: '',
        sex: Sex.FEMALE,
        height: '',
        weight: '',
        targetWeight: '',
        waist: '',
        neck: '',
        hip: '',
        ethnicity: 'South Asian',
        smoker: 'no',
        alcohol: 'no',
        tg: '',
        hdl: '',
        activityLevel: ActivityLevel.LIGHTLY_ACTIVE,
        preference: DietPreference.VEGETARIAN,
        dietType: DietType.BALANCED,
        healthConditions: [] as HealthCondition[],
        fastingStartHour: '10',
        fastingStartPeriod: 'AM',
        fastingEndHour: '6',
        fastingEndPeriod: 'PM',
    });
    const [results, setResults] = useState<BodyCompositionEntry | null>(null);
    const [history, setHistory] = useState<BodyCompositionEntry[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [toastInfo, setToastInfo] = useState<{ title: string; message: string; quote: string; } | null>(null);
    const [dailyStats, setDailyStats] = useState<{ hydration: number, tdee: number, bmr: number, intake: number, target: number }>({ hydration: 0, tdee: 0, bmr: 0, intake: 0, target: 0 });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: value }));
    };

    const handleConditionChange = (condition: HealthCondition) => {
        setInputs(prev => ({
            ...prev,
            healthConditions: prev.healthConditions.includes(condition)
                ? prev.healthConditions.filter(c => c !== condition)
                : [...prev.healthConditions, condition]
        }));
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
                    currentWeight = progressData[progressData.length - 1].weight;
                }
            } catch (e) { console.error("Could not parse progress data for weight calculation.", e); }
        }

        const loadedInputs = {
            patientName: prefs.patientName || '',
            age: prefs.age || '',
            sex: prefs.sex || Sex.FEMALE,
            height: prefs.height || '',
            weight: currentWeight > 0 ? currentWeight.toFixed(1) : '',
            targetWeight: prefs.targetWeight || '',
            waist: prefs.waist || '',
            neck: prefs.neck || '',
            hip: prefs.hip || '',
            ethnicity: prefs.ethnicity || 'South Asian',
            smoker: prefs.smoker || 'no',
            alcohol: prefs.alcohol || 'no',
            tg: prefs.tg || '',
            hdl: prefs.hdl || '',
            activityLevel: prefs.activityLevel || ActivityLevel.LIGHTLY_ACTIVE,
            preference: prefs.preference || DietPreference.VEGETARIAN,
            dietType: prefs.dietType || DietType.BALANCED,
            healthConditions: prefs.healthConditions || [],
            fastingStartHour: prefs.fastingStartHour || '10',
            fastingStartPeriod: 'AM',
            fastingEndHour: '6',
            fastingEndPeriod: 'PM',
        };
        setInputs(loadedInputs);

        const ageNum = parseInt(loadedInputs.age, 10);
        const heightNum = parseFloat(loadedInputs.height);
        const weightNum = parseFloat(loadedInputs.weight);
        
        if (ageNum > 0 && weightNum > 0 && heightNum > 0) {
            const tdee = calculator.calculateTDEE({ weight: weightNum, height: heightNum, age: ageNum, sex: loadedInputs.sex as Sex, activityLevel: loadedInputs.activityLevel as ActivityLevel });
            const bmr = loadedInputs.sex === Sex.MALE ? (10 * weightNum) + (6.25 * heightNum) - (5 * ageNum) + 5 : (10 * weightNum) + (6.25 * heightNum) - (5 * ageNum) - 161;
            setDailyStats(prev => ({ ...prev, tdee: Math.round(tdee), bmr: Math.round(bmr) }));
        }

        const historyRaw = localStorage.getItem(BODY_COMPOSITION_KEY);
        if (historyRaw) {
            try {
                const historyData: BodyCompositionEntry[] = JSON.parse(historyRaw);
                setHistory(historyData);
                if (historyData.length > 0) {
                    const latestEntry = historyData[historyData.length - 1];
                    // Auto-load latest results if they are from today and match current weight
                    if (latestEntry.date === new Date().toISOString().split('T')[0] && parseFloat(loadedInputs.weight) === parseFloat(latestEntry.metabolicAgeAnalysis?.inputs.weight_kg.toFixed(1) || '0')) {
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

    const handleSaveAndCalculate = () => {
        setError(null);
        
        try {
            localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(inputs));
        } catch (e) {
            console.error("Failed to save body composition inputs", e);
            setError("Could not save profile data.");
            return;
        }

        const { age, sex, height, weight, waist, neck, hip, tg, hdl, activityLevel, dietType } = inputs;
        const ageNum = parseInt(age, 10);
        const heightNum = parseFloat(height);
        const weightNum = parseFloat(weight);
        const waistNum = parseFloat(waist);
        const neckNum = parseFloat(neck);
        const hipNum = parseFloat(hip);
        const tgNum = tg ? parseFloat(tg) : undefined;
        const hdlNum = hdl ? parseFloat(hdl) : undefined;

        if (ageNum <= 0 || heightNum <= 0 || weightNum <= 0) {
             setError('Please ensure age, height, and weight are filled in.');
             return;
        }

        if (!waistNum || waistNum <= 0 || !neckNum || neckNum <= 0 || !hipNum || hipNum <= 0) {
            setError('Please fill in waist, hip, and neck measurements for an accurate analysis.');
            return;
        }
        
        const calculatedResults = calculator.calculateAllMetrics({ 
            age: ageNum,
            gender: sex === Sex.MALE ? 1 : 0,
            height: heightNum,
            weight: weightNum,
            waist: waistNum, 
            neck: neckNum, 
            hip: hipNum, 
            tg: tgNum, 
            hdl: hdlNum, 
            activityLevel,
            dietType,
            ethnicity: inputs.ethnicity
        });
        setResults(calculatedResults);
        
        const tdee = calculator.calculateTDEE({ weight: weightNum, height: heightNum, age: ageNum, sex: sex as Sex, activityLevel: activityLevel as ActivityLevel });
        setDailyStats(prev => ({ ...prev, tdee: Math.round(tdee) }));

        const today = new Date().toISOString().split('T')[0];
        
        const historyRaw = localStorage.getItem(BODY_COMPOSITION_KEY);
        let updatedHistory: BodyCompositionEntry[] = historyRaw ? JSON.parse(historyRaw) : [];
        const todayIndex = updatedHistory.findIndex(e => e.date === today);
        if (todayIndex > -1) { updatedHistory[todayIndex] = calculatedResults; } else { updatedHistory.push(calculatedResults); }
        updatedHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (updatedHistory.length > 30) { updatedHistory = updatedHistory.slice(updatedHistory.length - 30); }
        localStorage.setItem(BODY_COMPOSITION_KEY, JSON.stringify(updatedHistory));
        setHistory(updatedHistory);

        const newProgressEntry: ProgressEntry = { date: today, weight: weightNum, bmi: calculatedResults.bmi };
        const progressHistoryRaw = localStorage.getItem(PROGRESS_DATA_KEY);
        let progressHistory: ProgressEntry[] = progressHistoryRaw ? JSON.parse(progressHistoryRaw) : [];
        const progressTodayIndex = progressHistory.findIndex(e => e.date === today);
        if (progressTodayIndex > -1) { progressHistory[progressTodayIndex] = newProgressEntry; } else { progressHistory.push(newProgressEntry); }
        progressHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (progressHistory.length > 30) { progressHistory = progressHistory.slice(progressHistory.length - 30); }
        localStorage.setItem(PROGRESS_DATA_KEY, JSON.stringify(progressHistory));

        setToastInfo({ title: "Profile Saved & Calculated!", message: "Your body composition has been updated.", quote: "Knowledge is the first step towards change." });
    };
    
    const pieData = (results && parseFloat(inputs.weight) > 0) ? [
        { label: 'Fat', value: results.bodyFatPercentage, color: '#f87171' },
        { label: 'Muscle', value: results.muscleRate, color: '#fb923c' },
        { label: 'Other (Bone/Water)', value: Math.max(0, 100 - results.bodyFatPercentage - results.muscleRate), color: '#a78bfa' },
    ] : [];

    const isHighBmi = results && results.bmi >= 23;
    const isHighBodyFat = results && (inputs.sex === Sex.MALE ? results.bodyFatPercentage > 25 : results.bodyFatPercentage > 32);
    const isHighWHR = results && (inputs.sex === Sex.MALE ? results.whr > 0.9 : results.whr > 0.85);
    const isHighWHtR = results && results.whtr > 0.5;

    const riskColor = (score: number) => score > 75 ? 'animate-glowing-red text-red-500' : score > 50 ? 'animate-glowing-yellow text-yellow-500' : 'text-green-500';

    const formInputClass = "w-full p-2 text-sm bg-white dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-orange-400";
    const formLabelClass = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1";

    return (
        <div className="space-y-6 animate-fade-in">
            {toastInfo && <SuccessToast {...toastInfo} onClose={() => setToastInfo(null)} />}
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">My Body Profile & Metrics</h2>
                <div className="space-y-4">
                    <AccordionSection title="Personal Profile" defaultOpen={true}>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div><label className={formLabelClass}>Name</label><input type="text" name="patientName" value={inputs.patientName} onChange={handleInputChange} className={formInputClass} /></div>
                            <div><label className={formLabelClass}>Age*</label><input type="number" name="age" value={inputs.age} onChange={handleInputChange} required className={formInputClass} /></div>
                            <div><label className={formLabelClass}>Sex*</label><select name="sex" value={inputs.sex} onChange={handleInputChange} className={formInputClass}>{Object.values(Sex).map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                            <div><label className={formLabelClass}>Height (cm)*</label><input type="number" name="height" value={inputs.height} onChange={handleInputChange} required className={formInputClass} /></div>
                            <div><label className={formLabelClass}>Weight (kg)*</label><input type="number" name="weight" value={inputs.weight} onChange={handleInputChange} required className={formInputClass} /></div>
                            <div><label className={formLabelClass}>Target Wt. (kg)</label><input type="number" name="targetWeight" value={inputs.targetWeight} onChange={handleInputChange} className={formInputClass} /></div>
                        </div>
                    </AccordionSection>
                    <AccordionSection title="Body Measurements (for accuracy)">
                        <div className="grid grid-cols-3 gap-4">
                            <div><label className={formLabelClass}>Waist (cm)*</label><input type="number" name="waist" value={inputs.waist} onChange={handleInputChange} required className={formInputClass} /></div>
                            <div><label className={formLabelClass}>Hip (cm)*</label><input type="number" name="hip" value={inputs.hip} onChange={handleInputChange} required className={formInputClass} /></div>
                            <div><label className={formLabelClass}>Neck (cm)*</label><input type="number" name="neck" value={inputs.neck} onChange={handleInputChange} required className={formInputClass} /></div>
                        </div>
                    </AccordionSection>
                    <AccordionSection title="Diet & Lifestyle">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div><label className={formLabelClass}>Activity Level</label><select name="activityLevel" value={inputs.activityLevel} onChange={handleInputChange} className={formInputClass}>{Object.values(ActivityLevel).map(a=><option key={a} value={a}>{a}</option>)}</select></div>
                             <div><label className={formLabelClass}>Food Preference</label><select name="preference" value={inputs.preference} onChange={handleInputChange} className={formInputClass}>{Object.values(DietPreference).map(p=><option key={p} value={p}>{p}</option>)}</select></div>
                             <div><label className={formLabelClass}>Diet Goal</label><select name="dietType" value={inputs.dietType} onChange={handleInputChange} className={formInputClass}>{Object.values(DietType).map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                        </div>
                    </AccordionSection>
                </div>
                {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
                <button onClick={handleSaveAndCalculate} className="w-full mt-6 bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition shadow-md active:scale-95">Save Profile & Recalculate</button>
            </div>

            {results && (
                <div className="space-y-6">
                    <AccordionSection title="Key Metrics" defaultOpen={true}>
                         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <StatCard title="BMI" value={results.bmi.toFixed(1)} unit="" description={results.obesityGrade} colorClass={`text-indigo-500 ${isHighBmi ? 'animate-glowing-indigo' : ''}`} size="large" />
                            <StatCard title="Body Fat" value={results.bodyFatPercentage.toFixed(1)} unit="%" colorClass={`text-red-500 ${isHighBodyFat ? 'animate-glowing-red' : ''}`} size="large" />
                            <StatCard title="Muscle Rate" value={results.muscleRate.toFixed(1)} unit="%" colorClass="text-orange-500" size="large" />
                            {results.metabolicAgeAnalysis && <StatCard title="Metabolic Age" value={String(results.metabolicAgeAnalysis.metabolicAge_clinical)} unit="yrs" description={`Actual: ${inputs.age}`} colorClass="text-teal-500" size="large" />}
                        </div>
                    </AccordionSection>

                    <AccordionSection title="Metabolic Profile" defaultOpen={true}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                            <StatCard title="Basal Metabolic Rate" value={String(results.bmr)} unit="kcal" description="Energy your body burns at complete rest." />
                            <StatCard title="Ideal Weight" value={results.idealWeight.toFixed(1)} unit="kg" description="Healthy weight for your height." />
                            <StatCard title="Daily Energy Needs" value={String(dailyStats.tdee)} unit="kcal" description="Estimated calories for maintenance." />
                        </div>
                    </AccordionSection>
                    
                    <AccordionSection title="Health & Risk Indicators" defaultOpen={true}>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <StatCard title="Metabolic Risk" value={String(results.metabolicRiskScore)} unit="/ 100" colorClass={riskColor(results.metabolicRiskScore)} description={results.metabolicRiskScore > 75 ? 'High Risk' : results.metabolicRiskScore > 50 ? 'Moderate Risk' : 'Low Risk'} />
                            <StatCard title="Visceral Fat" value={String(results.visceralFatIndex)} unit="index" colorClass={results.visceralFatIndex >= 13 ? 'text-red-500' : results.visceralFatIndex >= 9 ? 'text-yellow-500' : 'text-green-500'} description={results.visceralFatIndex >= 9 ? 'High' : 'Healthy'}/>
                            <StatCard title="Waist-Hip Ratio" value={results.whr.toFixed(2)} unit="" colorClass={isHighWHR ? 'text-yellow-500' : 'text-green-500'} description={isHighWHR ? 'High Risk' : 'Low Risk'}/>
                            <StatCard title="Waist-Height Ratio" value={results.whtr.toFixed(2)} unit="" colorClass={isHighWHtR ? 'text-yellow-500' : 'text-green-500'} description={isHighWHtR ? 'High Risk' : 'Low Risk'} />
                        </div>
                    </AccordionSection>
                    
                     <AccordionSection title="Fitness & Hydration Goals">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <StatCard title="FFMI" value={results.ffmi.toFixed(1)} unit="" description={results.ffmiClassification} />
                            <StatCard title="Protein Req." value={`${results.dailyProteinRequirement.low}-${results.dailyProteinRequirement.high}`} unit="g/day" />
                            <StatCard title="Water Req." value={results.dailyWaterRequirement.toFixed(1)} unit="Liters" />
                            <StatCard title="Ideal Fat %" value={`${results.idealBodyFatPercentageRange[0]}-${results.idealBodyFatPercentageRange[1]}`} unit="%" />
                        </div>
                     </AccordionSection>

                    <AccordionSection title="Body Composition Breakdown">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <PieChart data={pieData} />
                            <div className="grid grid-cols-2 gap-3">
                                <StatCard title="Fat Mass" value={results.fatMass.toFixed(1)} unit="kg" />
                                <StatCard title="Muscle Mass" value={results.muscleMass.toFixed(1)} unit="kg" />
                                <StatCard title="Weight w/o Fat" value={results.leanBodyMass.toFixed(1)} unit="kg" />
                                <StatCard title="Protein Mass" value={results.proteinMass.toFixed(1)} unit="kg" />
                                <StatCard title="Bone Mass" value={results.boneMass.toFixed(1)} unit="kg" />
                                <StatCard title="Body Water" value={results.bodyWaterPercentage.toFixed(1)} unit="%" />
                            </div>
                        </div>
                    </AccordionSection>

                    <AccordionSection title="Body Shape & Type">
                        <div className="grid grid-cols-2 gap-4">
                           <StatCard title="Body Type" value={results.bodyType} unit="" />
                           <StatCard title="Body Shape" value={results.bodyShape} unit={results.bodyShape === 'Android (Apple)' ? '🍎' : '🍐'} />
                        </div>
                    </AccordionSection>

                    {history.length > 1 && (
                        <AccordionSection title="Fat vs Muscle Trend" defaultOpen={true}>
                           <TrendGraph history={history} />
                        </AccordionSection>
                    )}
                </div>
            )}
            <button onClick={onOpenHistory} className="w-full text-center py-3 font-semibold text-gray-600 dark:text-gray-400 hover:text-orange-500 transition">
                View Full Progress History &rarr;
            </button>
        </div>
    );
};

export default BodyComposition;