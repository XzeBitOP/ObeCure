import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DietPreference, DietPlan, Sex, ActivityLevel, DietType, HealthCondition, DrKenilsNote, ProgressEntry, DailyIntake, FastingEntry, Meal } from '../types';
import { generateDietPlan, refineMeal } from '../services/gemini';
import { StarIcon } from './icons/StarIcon';
import { MagicWandIcon } from './icons/MagicWandIcon';
import { drKenilsNotes } from '../data/notes';
import DrKenilsNoteComponent from './DrKenilsNote';
import GeneratingPlan from './GeneratingPlan';
import ProgressModal from './ProgressModal';

const USER_PREFERENCES_KEY = 'obeCureUserPreferences';
const PROGRESS_DATA_KEY = 'obeCureProgressData';
const DAILY_INTAKE_KEY = 'obeCureDailyIntake';
const FASTING_DATA_KEY = 'obeCureFastingData';

const WhatsAppIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.79.52 3.48 1.45 4.93L2 22l5.3-1.52c1.38.84 2.96 1.33 4.61 1.33h.11c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zM12.04 20.35h-.09c-1.49 0-2.93-.42-4.17-1.2l-.3-.18-3.11.9.92-3.03-.2-.32c-.86-1.35-1.32-2.94-1.32-4.61 0-4.6 3.73-8.33 8.33-8.33s8.33 3.73 8.33 8.33-3.73 8.35-8.33 8.35zm4.4-5.37c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.64-1.19-1.43-1.33-1.67-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42s-.54-1.29-.74-1.77c-.2-.48-.4-.41-.54-.42-.14 0-.3 0-.46 0s-.42.06-.64.3c-.22.24-.86.84-1.06 2.04-.2 1.2.22 2.37.5 3.19.28.82 1.39 2.66 3.36 3.74 1.97 1.08 2.63 1.2 3.53 1.04.9-.16 1.52-.76 1.73-1.44.22-.68.22-1.25.16-1.44-.06-.19-.22-.3-.46-.42z"></path>
    </svg>
);

const DietPlanner: React.FC = () => {
  const [patientName, setPatientName] = useState<string>('');
  const [patientWeight, setPatientWeight] = useState<string>('');
  const [targetWeight, setTargetWeight] = useState<string>('');
  const [height, setHeight] = useState<string>(''); // Always in cm
  const [age, setAge] = useState<string>('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [heightFt, setHeightFt] = useState<string>('');
  const [heightIn, setHeightIn] = useState<string>('');
  const [sex, setSex] = useState<Sex>(Sex.FEMALE);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(ActivityLevel.LIGHTLY_ACTIVE);
  const [preference, setPreference] = useState<DietPreference>(DietPreference.VEGETARIAN);
  const [dietType, setDietType] = useState<DietType>(DietType.BALANCED);
  const [healthConditions, setHealthConditions] = useState<HealthCondition[]>([]);
  const [fastingStartHour, setFastingStartHour] = useState<string>('10');
  const [fastingStartPeriod, setFastingStartPeriod] = useState<string>('AM');
  const [fastingEndHour, setFastingEndHour] = useState<string>('6');
  const [fastingEndPeriod, setFastingEndPeriod] = useState<string>('PM');

  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [drKenilsNote, setDrKenilsNote] = useState<DrKenilsNote | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);

  const [checkedMeals, setCheckedMeals] = useState<Record<string, boolean>>({});
  const [otherCalories, setOtherCalories] = useState<string>('');
  const [logSuccess, setLogSuccess] = useState<boolean>(false);

  const [refiningMealIndex, setRefiningMealIndex] = useState<number | null>(null);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const refineMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const savedPrefsRaw = localStorage.getItem(USER_PREFERENCES_KEY);
      if (savedPrefsRaw) {
        const savedPrefs = JSON.parse(savedPrefsRaw);
        setPatientName(savedPrefs.patientName || '');
        setPatientWeight(savedPrefs.patientWeight || '');
        setTargetWeight(savedPrefs.targetWeight || '');
        setHeight(savedPrefs.height || '');
        setAge(savedPrefs.age || '');
        setSex(savedPrefs.sex || Sex.FEMALE);
        setActivityLevel(savedPrefs.activityLevel || ActivityLevel.LIGHTLY_ACTIVE);
        setPreference(savedPrefs.preference || DietPreference.VEGETARIAN);
        setDietType(savedPrefs.dietType || DietType.BALANCED);
        setHealthConditions(savedPrefs.healthConditions || []);
        setFastingStartHour(savedPrefs.fastingStartHour || '10');
        setFastingStartPeriod(savedPrefs.fastingStartPeriod || 'AM');
        setFastingEndHour(savedPrefs.fastingEndHour || '6');
        setFastingEndPeriod(savedPrefs.fastingEndPeriod || 'PM');
        setHeightUnit(savedPrefs.heightUnit || 'cm');
        setHeightFt(savedPrefs.heightFt || '');
        setHeightIn(savedPrefs.heightIn || '');
      }
    } catch (e) {
      console.error("Failed to parse user preferences from localStorage", e);
    }
  }, []);

  useEffect(() => {
    const prefsToSave = {
      patientName, patientWeight, targetWeight, height, age, sex, activityLevel, preference, dietType, healthConditions,
      fastingStartHour, fastingStartPeriod, fastingEndHour, fastingEndPeriod,
      heightUnit, heightFt, heightIn
    };
    localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(prefsToSave));
  }, [patientName, patientWeight, targetWeight, height, age, sex, activityLevel, preference, dietType, healthConditions, fastingStartHour, fastingStartPeriod, fastingEndHour, fastingEndPeriod, heightUnit, heightFt, heightIn]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (refineMenuRef.current && !refineMenuRef.current.contains(event.target as Node)) {
        setRefiningMealIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cmToFtIn = (cm: number) => {
    if (isNaN(cm) || cm <= 0) return { ft: '', in: '' };
    const totalInches = cm / 2.54;
    let feet = Math.floor(totalInches / 12);
    let inches = Math.round(totalInches % 12);
    if (inches === 12) {
        feet += 1;
        inches = 0;
    }
    return { ft: String(feet), in: String(inches) };
  };

  const ftInToCm = (ft: number, inch: number) => {
      if (isNaN(ft) && isNaN(inch)) return '';
      const ftVal = isNaN(ft) ? 0 : ft;
      const inVal = isNaN(inch) ? 0 : inch;
      const totalInches = (ftVal * 12) + inVal;
      if (totalInches === 0) return '';
      return String(Math.round(totalInches * 2.54));
  };

  const handleHeightUnitChange = (unit: 'cm' | 'ft') => {
      if (unit === heightUnit) return;
      if (unit === 'ft') {
          const cm = parseFloat(height);
          const { ft, in: inch } = cmToFtIn(cm);
          setHeightFt(ft);
          setHeightIn(inch);
      } else {
          const ft = parseFloat(heightFt);
          const inch = parseFloat(heightIn);
          const cm = ftInToCm(ft, inch);
          setHeight(cm);
      }
      setHeightUnit(unit);
  };

  const handleHeightCmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHeight(e.target.value);
  };

  const handleHeightFtInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      const currentFt = id === 'heightFt' ? value : heightFt;
      const currentIn = id === 'heightIn' ? value : heightIn;
      
      setHeightFt(currentFt);
      setHeightIn(currentIn);

      const cm = ftInToCm(parseFloat(currentFt), parseFloat(currentIn));
      setHeight(cm);
  };

  const handleConditionChange = (condition: HealthCondition) => {
    setHealthConditions(prev =>
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };
  
  const calculateBmi = (weightKg: number, heightCm: number): number => {
      if (!weightKg || !heightCm || heightCm === 0) return 0;
      const heightM = heightCm / 100;
      const bmi = weightKg / (heightM * heightM);
      return parseFloat(bmi.toFixed(2));
  };

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) {
      return { value: bmi, category: 'Underweight', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300', risk: null };
    } else if (bmi >= 18.5 && bmi <= 22.9) {
      return { value: bmi, category: 'Normal', color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300', risk: null };
    } else if (bmi >= 23.0 && bmi <= 24.9) {
      return { value: bmi, category: 'Overweight', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300', risk: null };
    } else if (bmi >= 25.0 && bmi <= 29.9) {
      return { value: bmi, category: 'Obese I', color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300', risk: 'High risk for diabetes, hypertension' };
    } else { // bmi >= 30.0
      return { value: bmi, category: 'Obese II', color: 'bg-red-200 text-red-900 dark:bg-red-900/60 dark:text-red-200 ring-2 ring-red-500 animate-pulse', risk: 'High risk for diabetes, hypertension' };
    }
  };

  const bmiResult = useMemo(() => {
    const weightNum = parseFloat(patientWeight);
    const heightNum = parseFloat(height);
    const ageNum = parseFloat(age);

    if (weightNum > 0 && heightNum > 0 && ageNum > 0) {
        const bmi = calculateBmi(weightNum, heightNum);
        return getBmiCategory(bmi);
    }
    return null;
  }, [patientWeight, height, age]);

  const handleGeneratePlan = async () => {
    if (!patientWeight || !height || !age) {
        setError("Please fill in Weight, Height, and Age fields.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setDietPlan(null);
    setDrKenilsNote(null);
    try {
      const fastingStartTime = `${fastingStartHour}:00 ${fastingStartPeriod}`;
      const fastingEndTime = `${fastingEndHour}:00 ${fastingEndPeriod}`;

      const plan = await generateDietPlan({ patientWeight, height, age, sex, activityLevel, preference, healthConditions, dietType, fastingStartTime, fastingEndTime });
      setDietPlan(plan);
      const initialCheckedState = plan.meals.reduce((acc, meal) => {
        acc[meal.name] = true; // Default to all checked
        return acc;
      }, {} as Record<string, boolean>);
      setCheckedMeals(initialCheckedState);
      setOtherCalories('');
      setLogSuccess(false);

      const randomNote = drKenilsNotes[Math.floor(Math.random() * drKenilsNotes.length)];
      setDrKenilsNote(randomNote);

      const weightNum = parseFloat(patientWeight);
      const heightNum = parseFloat(height);
      if (weightNum > 0 && heightNum > 0) {
        const bmi = calculateBmi(weightNum, heightNum);
        const newProgressEntry: ProgressEntry = {
          date: new Date().toISOString().split('T')[0],
          weight: weightNum,
          bmi: bmi,
        };
        const existingDataRaw = localStorage.getItem(PROGRESS_DATA_KEY);
        let existingData: ProgressEntry[] = existingDataRaw ? JSON.parse(existingDataRaw) : [];
        const todayEntryIndex = existingData.findIndex(entry => entry.date === newProgressEntry.date);
        if (todayEntryIndex > -1) {
          existingData[todayEntryIndex] = newProgressEntry;
        } else {
          existingData.push(newProgressEntry);
        }
        localStorage.setItem(PROGRESS_DATA_KEY, JSON.stringify(existingData));
      }

      // Log Fasting Data
      const to24Hour = (hour: number, period: string) => {
          if (period === 'PM' && hour < 12) return hour + 12;
          if (period === 'AM' && hour === 12) return 0; // Midnight
          return hour;
      };
      const startHour24 = to24Hour(parseInt(fastingStartHour), fastingStartPeriod);
      const endHour24 = to24Hour(parseInt(fastingEndHour), fastingEndPeriod);
      let duration = endHour24 - startHour24;
      if (duration < 0) duration += 24;
      
      const newFastingEntry: FastingEntry = {
          date: new Date().toISOString().split('T')[0],
          startTime: fastingStartTime,
          endTime: fastingEndTime,
          duration: duration,
      };
      const existingFastingRaw = localStorage.getItem(FASTING_DATA_KEY);
      let existingFastingData: FastingEntry[] = existingFastingRaw ? JSON.parse(existingFastingRaw) : [];
      const todayFastingIndex = existingFastingData.findIndex(entry => entry.date === newFastingEntry.date);
      if (todayFastingIndex > -1) {
          existingFastingData[todayFastingIndex] = newFastingEntry;
      } else {
          existingFastingData.push(newFastingEntry);
      }
      localStorage.setItem(FASTING_DATA_KEY, JSON.stringify(existingFastingData));


    } catch (err) {
      console.error(err);
      setError('Sorry, we couldn\'t generate a diet plan. The model may be unavailable. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMealCheckChange = (mealName: string) => {
    setCheckedMeals(prev => ({
        ...prev,
        [mealName]: !prev[mealName]
    }));
  };

  const handleLogIntake = () => {
    if (!dietPlan) return;
    
    const eatenMeals = dietPlan.meals.filter(meal => checkedMeals[meal.name]);
    const loggedMealsCalories = eatenMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const otherCals = parseInt(otherCalories) || 0;
    const totalIntake = loggedMealsCalories + otherCals;

    const newIntakeEntry: DailyIntake = {
        date: new Date().toISOString().split('T')[0],
        loggedMeals: eatenMeals.map(({ name, calories }) => ({ name, calories })),
        otherCalories: otherCals,
        totalIntake: totalIntake,
        targetCalories: dietPlan.totalCalories,
    };

    const existingDataRaw = localStorage.getItem(DAILY_INTAKE_KEY);
    let existingData: DailyIntake[] = existingDataRaw ? JSON.parse(existingDataRaw) : [];
    const todayEntryIndex = existingData.findIndex(entry => entry.date === newIntakeEntry.date);

    if (todayEntryIndex > -1) {
        existingData[todayEntryIndex] = newIntakeEntry;
    } else {
        existingData.push(newIntakeEntry);
    }

    localStorage.setItem(DAILY_INTAKE_KEY, JSON.stringify(existingData));
    setLogSuccess(true);
    setTimeout(() => setLogSuccess(false), 4000);
  };

  const handleRefineMeal = async (mealIndex: number, refinementType: 'Suggest Alternative' | 'Make it Quicker' | 'Lower Calories') => {
    if (!dietPlan || isRefining) return;
    
    const originalMeal = dietPlan.meals[mealIndex];
    setIsRefining(true);
    
    try {
        const refined = await refineMeal({
            mealToRefine: originalMeal,
            refinementType,
            fullDietPlan: dietPlan
        });

        const updatedMeals = [...dietPlan.meals];
        // Make refined meal inherit checkbox state if name is same
        const oldCheckedState = checkedMeals[originalMeal.name];
        updatedMeals[mealIndex] = refined;

        const updatedCheckedMeals = { ...checkedMeals };
        if (originalMeal.name !== refined.name) {
            delete updatedCheckedMeals[originalMeal.name];
        }
        updatedCheckedMeals[refined.name] = oldCheckedState ?? true;
        setCheckedMeals(updatedCheckedMeals);

        const totalCalories = updatedMeals.reduce((sum, meal) => sum + meal.calories, 0);
        const totalMacros = updatedMeals.reduce((acc, meal) => ({
            protein: acc.protein + meal.macros.protein,
            carbohydrates: acc.carbohydrates + meal.macros.carbohydrates,
            fat: acc.fat + meal.macros.fat
        }), { protein: 0, carbohydrates: 0, fat: 0 });

        setDietPlan({
            ...dietPlan,
            meals: updatedMeals,
            totalCalories,
            totalMacros
        });
    } catch (err) {
        console.error("Failed to refine meal:", err);
        setError('Sorry, we couldn\'t refine the meal. Please try again.');
    } finally {
        setIsRefining(false);
        setRefiningMealIndex(null);
    }
  };

  const getShareText = () => {
    if (!dietPlan) return '';
    
    let shareText = `*ObeCure Diet Plan for ${patientName || 'Patient'} (${patientWeight} kg)*\n\n`;
    shareText += `*Eating Window:* ${fastingStartHour}:00 ${fastingStartPeriod} - ${fastingEndHour}:00 ${fastingEndPeriod}\n`;
    shareText += `*Target: ~${dietPlan.totalCalories} kcal*\n`;
    shareText += `*Macros (P/C/F): ${dietPlan.totalMacros.protein}g / ${dietPlan.totalMacros.carbohydrates}g / ${dietPlan.totalMacros.fat}g*\n\n`;

    dietPlan.meals.forEach(meal => {
        const isSpecial = meal.name.includes('ObeCure Special Meal');
        shareText += `*${isSpecial ? '⭐ ' : ''}${meal.name}* (${meal.time ? `~${meal.time}` : ''} | ~${meal.calories} kcal):\n`;
        shareText += `${meal.recipe}\n`;
        shareText += `(P: ${meal.macros.protein}g, C: ${meal.macros.carbohydrates}g, F: ${meal.macros.fat}g)\n\n`;
    });
    if(drKenilsNote) {
        shareText += `*Dr. Kenil's Note:*\n_${drKenilsNote.text}_\n\n`;
    }
    shareText += `Generated by ObeCure Diet Assistant.`;
    return encodeURIComponent(shareText);
  };
  
  const formInputClass = "w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition";
  const formLabelClass = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2";

  return (
    <div className="animate-fade-in">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 sm:text-4xl text-center">Personalized Diet Planner</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400 mb-8 text-center max-w-prose mx-auto">
            Enter your details and let our AI create a customized Indian diet plan just for you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-2">
            <label htmlFor="patientName" className={formLabelClass}>Patient Name</label>
            <input id="patientName" type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="e.g., Anjali Sharma" className={formInputClass}/>
          </div>
          <div>
            <label htmlFor="patientWeight" className={formLabelClass}>Weight (kg)<span className="text-red-500">*</span></label>
            <input id="patientWeight" type="number" value={patientWeight} onChange={(e) => setPatientWeight(e.target.value)} placeholder="e.g., 75" required className={formInputClass}/>
          </div>
          <div>
            <label htmlFor="targetWeight" className={formLabelClass}>Target Weight (kg)</label>
            <input id="targetWeight" type="number" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} placeholder="e.g., 65" className={formInputClass}/>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Height<span className="text-red-500">*</span></label>
                <div className="flex items-center text-xs font-semibold bg-gray-100 dark:bg-gray-700/50 rounded-full p-0.5 transition-all">
                    <button onClick={() => handleHeightUnitChange('cm')} className={`px-3 py-1 rounded-full transition-all text-xs ${heightUnit === 'cm' ? 'bg-white dark:bg-gray-600 text-orange-600 dark:text-orange-400 shadow' : 'text-gray-500 dark:text-gray-400'}`}>cm</button>
                    <button onClick={() => handleHeightUnitChange('ft')} className={`px-3 py-1 rounded-full transition-all text-xs ${heightUnit === 'ft' ? 'bg-white dark:bg-gray-600 text-orange-600 dark:text-orange-400 shadow' : 'text-gray-500 dark:text-gray-400'}`}>ft/in</button>
                </div>
            </div>
            {heightUnit === 'cm' ? (
                <input id="height" type="number" value={height} onChange={handleHeightCmChange} placeholder="e.g., 165" required className={formInputClass}/>
            ) : (
                <div className="flex gap-2">
                    <input id="heightFt" type="number" value={heightFt} onChange={handleHeightFtInChange} placeholder="ft" required className={`${formInputClass} text-center`} />
                    <input id="heightIn" type="number" value={heightIn} onChange={handleHeightFtInChange} placeholder="in" required className={`${formInputClass} text-center`} />
                </div>
            )}
          </div>
           <div>
            <label htmlFor="age" className={formLabelClass}>Age<span className="text-red-500">*</span></label>
            <input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g., 30" required className={formInputClass}/>
          </div>
          <div className="lg:col-span-2">
            <label htmlFor="sex" className={formLabelClass}>Sex</label>
            <select id="sex" value={sex} onChange={(e) => setSex(e.target.value as Sex)} className={formInputClass}>
              {Object.values(Sex).map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>
          
          <div className="lg:col-span-4">
            <label htmlFor="activityLevel" className={formLabelClass}>Activity Level</label>
            <select id="activityLevel" value={activityLevel} onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)} className={formInputClass}>
              {Object.values(ActivityLevel).map((level) => (<option key={level} value={level}>{level}</option>))}
            </select>
          </div>
           <div className="lg:col-span-2">
            <label htmlFor="preference" className={formLabelClass}>Food Preference</label>
            <select id="preference" value={preference} onChange={(e) => setPreference(e.target.value as DietPreference)} className={formInputClass}>
              {Object.values(DietPreference).map((pref) => (<option key={pref} value={pref}>{pref}</option>))}
            </select>
          </div>
           <div className="lg:col-span-2">
            <label htmlFor="dietType" className={formLabelClass}>Diet Goal</label>
            <select id="dietType" value={dietType} onChange={(e) => setDietType(e.target.value as DietType)} className={formInputClass}>
              {Object.values(DietType).map((type) => (<option key={type} value={type}>{type}</option>))}
            </select>
          </div>
           <div className="lg:col-span-4">
                <label className={formLabelClass}>Intermittent Fasting Window (optional)</label>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Start Eating At</span>
                        <div className="flex gap-2 mt-1">
                            <select value={fastingStartHour} onChange={(e) => setFastingStartHour(e.target.value)} className={formInputClass}>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(h => <option key={`start-h-${h}`} value={h}>{h}</option>)}
                            </select>
                            <select value={fastingStartPeriod} onChange={(e) => setFastingStartPeriod(e.target.value)} className={formInputClass}>
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Stop Eating At</span>
                        <div className="flex gap-2 mt-1">
                            <select value={fastingEndHour} onChange={(e) => setFastingEndHour(e.target.value)} className={formInputClass}>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(h => <option key={`end-h-${h}`} value={h}>{h}</option>)}
                            </select>
                            <select value={fastingEndPeriod} onChange={(e) => setFastingEndPeriod(e.target.value)} className={formInputClass}>
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {bmiResult && (
          <div className={`my-6 p-4 rounded-lg text-center transition-all duration-300 animate-fade-in ${bmiResult.color}`}>
            <p className="font-bold text-lg">
              Your BMI: <span className="text-2xl">{bmiResult.value}</span>
            </p>
            <p className="font-semibold">{bmiResult.category}</p>
            {bmiResult.risk && <p className="text-sm mt-1">{bmiResult.risk}</p>}
          </div>
        )}

        <div className="mb-6">
            <label className={formLabelClass}>Existing Health Conditions (optional)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-4 gap-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                {Object.values(HealthCondition).map((condition) => (
                <label key={condition} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                    <input type="checkbox" checked={healthConditions.includes(condition)} onChange={() => handleConditionChange(condition)} className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"/>
                    <span>{condition}</span>
                </label>
                ))}
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={handleGeneratePlan} disabled={isLoading} className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-all duration-300 disabled:bg-orange-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-md hover:shadow-lg dark:hover:bg-orange-600 flex-grow active:scale-[0.98]">
              {isLoading ? (
                <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Generating...</span></>
              ) : ( <span>Generate Diet Plan</span> )}
            </button>
            <button onClick={() => setIsProgressModalOpen(true)} className="w-full sm:w-auto bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-3 px-6 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg active:scale-[0.98]">
                <span>Show My Progress</span>
            </button>
        </div>
      </div>
      
      {isProgressModalOpen && <ProgressModal isOpen={isProgressModalOpen} onClose={() => setIsProgressModalOpen(false)} />}

      {error && (
        <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg w-full text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {isLoading && <GeneratingPlan />}

      {dietPlan && !isLoading && (
        <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 animate-fade-in">
            <div className="flex justify-between items-start mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Your Custom Diet Plan</h2>
                     <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {patientName && <p><strong>Patient:</strong> {patientName}</p>}
                          {patientWeight && <p><strong>Weight:</strong> {patientWeight} kg</p>}
                          <p><strong>Eating Window:</strong> {`${fastingStartHour}:00 ${fastingStartPeriod}`} - {`${fastingEndHour}:00 ${fastingEndPeriod}`}</p>
                      </div>
                    <p className="mt-2 font-semibold text-orange-600">{dietPlan.totalCalories} kcal / day</p>
                    <p className="text-xs font-mono tracking-wide text-gray-500 dark:text-gray-400">
                        P: {dietPlan.totalMacros.protein}g | C: {dietPlan.totalMacros.carbohydrates}g | F: {dietPlan.totalMacros.fat}g
                    </p>
                </div>
                 <a href={`https://wa.me/?text=${getShareText()}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-green-600 transition-colors shadow-sm shrink-0">
                    <WhatsAppIcon className="w-5 h-5" />
                    <span>Share</span>
                </a>
            </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dietPlan.meals.map((meal, index) => {
              const isSpecial = meal.name.includes('ObeCure Special Meal');
              return (
                <div key={`${meal.name}-${index}`} className="relative">
                    <label 
                        style={{ animationDelay: `${index * 80}ms` }}
                        className={`block p-4 rounded-lg border transition-all cursor-pointer opacity-0 animate-fade-in-up h-full ${isSpecial ? 'bg-orange-100/80 dark:bg-orange-900/20 border-orange-300 dark:border-orange-800 shadow-md' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700'}`}>
                        <div className="flex items-start justify-between">
                            <div className="pr-12">
                                <h3 className={`font-bold text-lg mb-1 flex items-center gap-2 ${isSpecial ? 'text-orange-700 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {isSpecial && <StarIcon className="w-5 h-5 text-yellow-500" />}
                                    {meal.name}
                                </h3>
                                {meal.time && <p className="text-xs font-semibold text-orange-600 dark:text-orange-500 mb-2">Suggested Time: {meal.time}</p>}
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{meal.recipe}</p>
                            </div>
                            <input type="checkbox" checked={!!checkedMeals[meal.name]} onChange={() => handleMealCheckChange(meal.name)} className="h-5 w-5 rounded border-gray-300 text-orange-500 focus:ring-orange-400 shrink-0 ml-4 mt-1"/>
                        </div>
                        <div className="flex justify-between items-center text-sm mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                            <p className={`font-semibold ${isSpecial ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-300'}`}>{meal.calories} kcal</p>
                            <p className="font-mono tracking-wide text-xs text-gray-500 dark:text-gray-400">
                                P:{meal.macros.protein} C:{meal.macros.carbohydrates} F:{meal.macros.fat}
                            </p>
                        </div>
                  </label>
                  <div className="absolute top-3 right-12">
                    <button onClick={() => setRefiningMealIndex(refiningMealIndex === index ? null : index)} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label="Refine meal">
                      <MagicWandIcon className="w-5 h-5" />
                    </button>
                    {refiningMealIndex === index && (
                      <div ref={refineMenuRef} className="absolute z-10 top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 animate-fade-in text-sm">
                        <p className="font-semibold p-2 border-b dark:border-gray-700 text-gray-600 dark:text-gray-300">AI Refine:</p>
                        {(['Suggest Alternative', 'Make it Quicker', 'Lower Calories'] as const).map(type => (
                          <button key={type} onClick={() => handleRefineMeal(index, type)} disabled={isRefining} className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-200">
                            {isRefining ? 'Refining...' : type}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
            )})}
          </div>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2">Log Other Intake</h3>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <input type="number" value={otherCalories} onChange={(e) => setOtherCalories(e.target.value)} placeholder="Calories from other food" className={`${formInputClass} flex-grow`}/>
              <button onClick={handleLogIntake} className="w-full sm:w-auto bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors duration-300 shadow-md">
                Log Today's Intake
              </button>
            </div>
             {logSuccess && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2 text-center sm:text-left animate-fade-in">
                  Successfully logged today's intake! Check your progress.
                </p>
             )}
          </div>

          {drKenilsNote && <DrKenilsNoteComponent note={drKenilsNote} />}
        </div>
      )}
    </div>
  );
};

export default DietPlanner;
