import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DietPreference, DietPlan, Sex, ActivityLevel, DietType, HealthCondition, DrKenilsNote, ProgressEntry, DailyIntake, FastingEntry, Meal, WaterEntry, CustomMealLogEntry, MealType } from '../types';
import { findTwoMealOptions, findSwapMeal } from '../services/offlinePlanGenerator';
import { drKenilsNotes } from '../data/notes';
import DrKenilsNoteComponent from './DrKenilsNote';
import GeneratingPlan from './GeneratingPlan';
import SuccessToast from './SuccessToast';
import { motivationalQuotes } from '../data/quotes';
import { CheckIcon } from './icons/CheckIcon';
import { BreakfastIcon } from './icons/BreakfastIcon';
import { LunchIcon } from './icons/LunchIcon';
import { DinnerIcon } from './icons/DinnerIcon';
import { SnackIcon } from './icons/SnackIcon';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { OBE_CURE_SPECIAL_MEALS } from '../data/specialMeals';
import { WaterIcon } from './icons/WaterIcon';
import LogMealModal from './LogMealModal';
import { HistoryIcon } from './icons/HistoryIcon';
import MealHistoryModal from './MealHistoryModal';
import { SwapIcon } from './icons/SwapIcon';
import { HeartIcon } from './icons/HeartIcon';


const USER_PREFERENCES_KEY = 'obeCureUserPreferences';
const PROGRESS_DATA_KEY = 'obeCureProgressData';
const DAILY_INTAKE_KEY = 'obeCureDailyIntake';
const FASTING_DATA_KEY = 'obeCureFastingData';
const WATER_INTAKE_KEY = 'obeCureWaterIntake';
const MANUAL_MEAL_LOG_KEY = 'obeCureManualMealLog';
const DIET_PLAN_KEY = 'obeCureDailyDietPlan';
const FAVORITE_MEALS_KEY = 'obeCureFavoriteMeals';


const getActivityFactor = (level: ActivityLevel): number => {
    switch (level) {
        case ActivityLevel.SEDENTARY: return 1.2;
        case ActivityLevel.LIGHTLY_ACTIVE: return 1.375;
        case ActivityLevel.MODERATELY_ACTIVE: return 1.55;
        case ActivityLevel.VERY_ACTIVE: return 1.725;
        default: return 1.375;
    }
};

type GenerationStep = 'form' | 'selecting' | 'done';

interface DietPlannerProps {
  isSubscribed: boolean;
  onOpenSubscriptionModal: () => void;
  dietPlan: DietPlan | null;
  setDietPlan: (plan: DietPlan | null) => void;
}

const DietPlanner: React.FC<DietPlannerProps> = ({ isSubscribed, onOpenSubscriptionModal, dietPlan: finalDietPlan, setDietPlan: setFinalDietPlan }) => {
  const [formStep, setFormStep] = useState(1);
  const [generationStep, setGenerationStep] = useState<GenerationStep>('form');
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

  const [drKenilsNote, setDrKenilsNote] = useState<DrKenilsNote | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState<number | null>(null);
  
  const [mealOptions, setMealOptions] = useState<Meal[] | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [animatingOutIndex, setAnimatingOutIndex] = useState<number | null>(null);
  const [currentSelectionIndex, setCurrentSelectionIndex] = useState(0);
  const [calorieTarget, setCalorieTarget] = useState(0);
  const [builtPlan, setBuiltPlan] = useState<Meal[]>([]);
  const [favoriteMeals, setFavoriteMeals] = useState<string[]>([]);


  const [checkedMeals, setCheckedMeals] = useState<Record<string, boolean>>({});
  const [waterGlasses, setWaterGlasses] = useState<number>(0);
  const [toastInfo, setToastInfo] = useState<{ title: string; message: string; quote: string; } | null>(null);
  const [isLogging, setIsLogging] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);
  
  const [isLogMealModalOpen, setIsLogMealModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  const resultsRef = useRef<HTMLDivElement>(null);

  // --- Refs for auto-scrolling and focus management ---
  const formContainerRef = useRef<HTMLDivElement>(null);
  const patientNameRef = useRef<HTMLInputElement>(null);
  const patientWeightRef = useRef<HTMLInputElement>(null);
  const ageRef = useRef<HTMLInputElement>(null);
  const heightCmRef = useRef<HTMLInputElement>(null);
  const heightFtRef = useRef<HTMLInputElement>(null);
  const heightInRef = useRef<HTMLInputElement>(null);
  const sexRef = useRef<HTMLSelectElement>(null);
  const nextButton1Ref = useRef<HTMLButtonElement>(null);

  const targetWeightRef = useRef<HTMLInputElement>(null);
  const activityLevelRef = useRef<HTMLSelectElement>(null);
  const dietTypeRef = useRef<HTMLSelectElement>(null);
  const nextButton2Ref = useRef<HTMLButtonElement>(null);

  const preferenceRef = useRef<HTMLSelectElement>(null);
  const generateButtonRef = useRef<HTMLButtonElement>(null);

  const plannerTitle = useMemo(() => {
    const firstName = patientName.trim().split(' ')[0];
    if (firstName) {
        const possessive = firstName.toLowerCase().endsWith('s') ? "'" : "'s";
        return `${firstName}${possessive} Personalized Diet Planner`;
    }
    return 'Personalized Diet Planner';
  }, [patientName]);

  useEffect(() => {
    try {
      const savedPrefsRaw = localStorage.getItem(USER_PREFERENCES_KEY);
      const savedPrefs = savedPrefsRaw ? JSON.parse(savedPrefsRaw) : {};

      const favsRaw = localStorage.getItem(FAVORITE_MEALS_KEY);
      setFavoriteMeals(favsRaw ? JSON.parse(favsRaw) : []);

      setPatientName(savedPrefs.patientName || '');
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
      
      const progressDataRaw = localStorage.getItem(PROGRESS_DATA_KEY);
      let initialWeight = savedPrefs.patientWeight || '';
      
      if (progressDataRaw) {
          const progressData: ProgressEntry[] = JSON.parse(progressDataRaw);
          if (progressData.length > 0) {
              const sortedProgress = [...progressData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              const recentEntries = sortedProgress.slice(0, 7);
              if (recentEntries.length > 0) {
                  const totalWeight = recentEntries.reduce((sum, entry) => sum + entry.weight, 0);
                  const avgWeight = totalWeight / recentEntries.length;
                  initialWeight = avgWeight.toFixed(1);
              }
          }
      }
      setPatientWeight(initialWeight);

      const waterDataRaw = localStorage.getItem(WATER_INTAKE_KEY);
      if (waterDataRaw) {
          const waterData: WaterEntry[] = JSON.parse(waterDataRaw);
          const today = new Date().toISOString().split('T')[0];
          const todayEntry = waterData.find(e => e.date === today);
          if (todayEntry) {
              setWaterGlasses(todayEntry.glasses);
          }
      }
    } catch (e) {
      console.error("Failed to parse data from localStorage", e);
    }
  }, []);
  
  useEffect(() => {
      if (finalDietPlan) {
        setGenerationStep('done');
        setBuiltPlan(finalDietPlan.meals);
      }
  }, [finalDietPlan]);

    useEffect(() => {
        if (builtPlan.length > 0) {
            setCheckedMeals(prev => {
                const newCheckedState = { ...prev };
                builtPlan.forEach(meal => {
                    if (newCheckedState[meal.recipe] === undefined) {
                        newCheckedState[meal.recipe] = true;
                    }
                });
                return newCheckedState;
            });
        }
    }, [builtPlan]);

  useEffect(() => {
    const prefsToSave = {
      patientName, patientWeight, targetWeight, height, age, sex, activityLevel, preference, dietType, healthConditions,
      fastingStartHour, fastingStartPeriod, fastingEndHour, fastingEndPeriod,
      heightUnit, heightFt, heightIn
    };
    localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(prefsToSave));
  }, [patientName, patientWeight, targetWeight, height, age, sex, activityLevel, preference, dietType, healthConditions, fastingStartHour, fastingStartPeriod, fastingEndHour, fastingEndPeriod, heightUnit, heightFt, heightIn]);

  useEffect(() => {
    if (isLoading || generationStep === 'selecting') {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [isLoading, generationStep]);

   useEffect(() => {
    const weightNum = parseFloat(patientWeight);
    const targetNum = parseFloat(targetWeight);
    const heightNum = parseFloat(height);
    const ageNum = parseFloat(age);

    if (weightNum > 0 && targetNum > 0 && weightNum > targetNum && heightNum > 0 && ageNum > 0 && dietType !== DietType.WEIGHT_GAIN) {
        const bmr = (10 * weightNum) + (6.25 * heightNum) - (5 * ageNum) + (sex === Sex.MALE ? 5 : -161);
        const tdee = bmr * getActivityFactor(activityLevel);
        const dailyDeficit = 500;
        const weightToLose = weightNum - targetNum;
        const totalDeficitNeeded = weightToLose * 7700;
        if (dailyDeficit > 0) {
            const days = Math.round(totalDeficitNeeded / dailyDeficit);
            setEstimatedDuration(days);
        } else {
            setEstimatedDuration(null);
        }
    } else {
        setEstimatedDuration(null);
    }
  }, [patientWeight, targetWeight, height, age, sex, activityLevel, dietType, formStep]);


    // --- Auto-scroll and Focus Logic ---
    const focusAndScroll = (ref: React.RefObject<HTMLElement>) => {
        if (ref.current) {
            ref.current.focus({ preventScroll: true });
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, nextRef: React.RefObject<HTMLElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            focusAndScroll(nextRef);
        }
    };

    useEffect(() => {
        if (generationStep === 'form') {
            let focusRef: React.RefObject<HTMLElement> | null = null;
            if (formStep === 1) focusRef = patientNameRef;
            else if (formStep === 2) focusRef = targetWeightRef;
            else if (formStep === 3) focusRef = preferenceRef;

            if (focusRef?.current && formContainerRef.current) {
                formContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setTimeout(() => focusRef!.current?.focus(), 400); // Delay for scroll animation
            }
        }
    }, [formStep, generationStep]);

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
      return { value: bmi, category: 'Obese I', color: 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-white', risk: 'High risk for diabetes, hypertension' };
    } else {
      return { value: bmi, category: 'Obese II', color: 'bg-red-200 text-white dark:bg-red-800 ring-1 ring-white/80 animate-pulse', risk: 'High risk for diabetes, hypertension' };
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
  }, [patientWeight, height, age, formStep]);

  const mealSlotsToFill: (MealType | 'Special')[] = useMemo(() => {
      let slots: (MealType | 'Special')[] = dietType === DietType.WEIGHT_GAIN 
        ? ['Breakfast', 'Snack', 'Lunch', 'Snack', 'Dinner'] 
        : ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
      
      if (dietType !== DietType.WEIGHT_GAIN) {
          const specialIndex = Math.random() > 0.5 ? 1 : 2; // Replace Lunch or Dinner
          slots[specialIndex] = 'Special';
      }
      return slots;
  }, [dietType]);

  const generateOptionsForIndex = async (index: number, currentMeals: Meal[], totalTarget: number) => {
        if (index >= mealSlotsToFill.length) {
            finishPlanGeneration(currentMeals);
            return;
        }

        const slotType = mealSlotsToFill[index];
        const remainingCalories = totalTarget - currentMeals.reduce((sum, meal) => sum + meal.calories, 0);
        const remainingSlots = mealSlotsToFill.length - index;
        const slotCalorieTarget = remainingCalories / remainingSlots;

        let options: Meal[] = [];
        if (slotType === 'Special') {
            const specialMealsCopy = [...OBE_CURE_SPECIAL_MEALS];
            const option1 = specialMealsCopy.splice(Math.floor(Math.random() * specialMealsCopy.length), 1)[0];
            const option2 = specialMealsCopy.splice(Math.floor(Math.random() * specialMealsCopy.length), 1)[0];
            options = [option1, option2].map(m => ({ ...m, time: 'N/A', mealType: 'Lunch' })); // Placeholder type, will be corrected
        } else {
            options = findTwoMealOptions({ preference, healthConditions, dietType, favoriteMealNames: favoriteMeals }, slotType, slotCalorieTarget, currentMeals.map(m => m.recipe));
        }

        if (options.length < 2) {
            setError("Couldn't find enough meal options. Please try adjusting your preferences.");
            setGenerationStep('form');
            setFormStep(3);
            return;
        }
        setMealOptions(options);
    };
    
    const handleSelectOption = (selectedMeal: Meal, optionIndex: number) => {
        setSelectedOptionIndex(optionIndex);
        setAnimatingOutIndex(1 - optionIndex); // Animate the other card

// FIX: Refactored meal type and time assignment to be type-safe.
// The original logic was reusing a variable for different purposes, causing type errors.
        setTimeout(() => {
            const timeMap: Record<string, string> = { 'Breakfast': '09:00 AM', 'Lunch': '01:00 PM', 'Dinner': '08:00 PM', 'Snack1': '11:00 AM', 'Snack2': '04:00 PM' };
            const slotType = mealSlotsToFill[currentSelectionIndex];
            let finalMealType: MealType;
            let timeKey: string;

            if (slotType === 'Snack') {
                finalMealType = 'Snack';
                timeKey = builtPlan.some(m => m.mealType === 'Snack') ? 'Snack2' : 'Snack1';
            } else if (slotType === 'Special') {
                finalMealType = builtPlan.some(m => m.mealType === 'Lunch') ? 'Dinner' : 'Lunch';
                timeKey = finalMealType;
            } else {
                finalMealType = slotType;
                timeKey = slotType;
            }
            
            const mealWithTime: Meal = { ...selectedMeal, mealType: finalMealType, time: timeMap[timeKey] };

            const newPlan = [...builtPlan, mealWithTime];
            setBuiltPlan(newPlan);
            
            const nextIndex = currentSelectionIndex + 1;
            setCurrentSelectionIndex(nextIndex);
            setMealOptions(null);
            setSelectedOptionIndex(null);
            setAnimatingOutIndex(null);

            generateOptionsForIndex(nextIndex, newPlan, calorieTarget);
        }, 500); // Wait for evaporate animation
    };

    const finishPlanGeneration = (finalMeals: Meal[]) => {
        const totalCalories = finalMeals.reduce((sum, meal) => sum + meal.calories, 0);
        const totalMacros = finalMeals.reduce((totals, meal) => ({
            protein: totals.protein + meal.macros.protein,
            carbohydrates: totals.carbohydrates + meal.macros.carbohydrates,
            fat: totals.fat + meal.macros.fat,
        }), { protein: 0, carbohydrates: 0, fat: 0 });

        const finalPlanObject: DietPlan = { meals: finalMeals, totalCalories, totalMacros };
        setFinalDietPlan(finalPlanObject);

        const planDataToSave = { date: new Date().toISOString().split('T')[0], plan: finalPlanObject };
        localStorage.setItem(DIET_PLAN_KEY, JSON.stringify(planDataToSave));

        const randomNote = drKenilsNotes[Math.floor(Math.random() * drKenilsNotes.length)];
        setDrKenilsNote(randomNote);

        setGenerationStep('done');
    };

    const handleBeginGeneration = () => {
        setIsLoading(true);
        setError(null);
        setDrKenilsNote(null);
        
        setTimeout(() => {
            try {
                // Calculate total target
                const weightNum = parseFloat(patientWeight);
                const heightNum = parseFloat(height);
                const ageNum = parseFloat(age);
                const bmr = (10 * weightNum) + (6.25 * heightNum) - (5 * ageNum) + (sex === Sex.MALE ? 5 : -161);
                const tdee = bmr * getActivityFactor(activityLevel);
                const target = dietType === DietType.WEIGHT_GAIN ? tdee + 400 : tdee - 500;
                setCalorieTarget(target);

                // Start selection process
                setBuiltPlan([]);
                setCurrentSelectionIndex(0);
                setGenerationStep('selecting');
                generateOptionsForIndex(0, [], target);
            } catch (err) {
                 setError('An unexpected error occurred. Please check your inputs.');
            } finally {
                setIsLoading(false);
            }
        }, 1000);
    };

    const handleSaveWeight = () => {
        const weightNum = parseFloat(patientWeight);
        const heightNum = parseFloat(height);

        if (isNaN(weightNum) || weightNum <= 0) {
            setToastInfo({ title: "Invalid Weight", message: "Please enter a valid weight.", quote: "Every detail matters." });
            return;
        }

        const todayStr = new Date().toISOString().split('T')[0];
        const newBmi = calculateBmi(weightNum, heightNum);

        const newEntry: ProgressEntry = {
            date: todayStr,
            weight: weightNum,
            bmi: newBmi,
        };

        try {
            const progressDataRaw = localStorage.getItem(PROGRESS_DATA_KEY);
            let progressData: ProgressEntry[] = progressDataRaw ? JSON.parse(progressDataRaw) : [];
            
            // Remove any existing entry for today before adding the new one
            progressData = progressData.filter(e => e.date !== todayStr);
            progressData.push(newEntry);
            
            progressData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            localStorage.setItem(PROGRESS_DATA_KEY, JSON.stringify(progressData));

            setToastInfo({ title: "Weight Saved!", message: `Your weight of ${weightNum.toFixed(1)} kg has been logged.`, quote: "One step at a time." });
        } catch(e) {
            console.error("Could not save progress data.", e);
            setToastInfo({ title: "Error", message: "Could not save your weight.", quote: "Please try again." });
        }
    };

  const handleMealCheckChange = (mealRecipe: string) => {
    setCheckedMeals(prev => ({ ...prev, [mealRecipe]: !prev[mealRecipe] }));
  };
  
  const handleWaterChange = (amount: number) => {
    setWaterGlasses(prev => {
        const newAmount = Math.max(0, prev + amount);
        const today = new Date().toISOString().split('T')[0];
        try {
            const waterDataRaw = localStorage.getItem(WATER_INTAKE_KEY);
            let waterData: WaterEntry[] = waterDataRaw ? JSON.parse(waterDataRaw) : [];
            const todayIndex = waterData.findIndex(e => e.date === today);
            if (todayIndex > -1) {
                waterData[todayIndex].glasses = newAmount;
            } else {
                waterData.push({ date: today, glasses: newAmount });
            }
            localStorage.setItem(WATER_INTAKE_KEY, JSON.stringify(waterData));
        } catch(e) { console.error("Could not save water intake.", e); }
        
        return newAmount;
    });
  };

  const handleLogCustomMeal = (mealName: string, calories: number, mealType: MealType) => {
      const newEntry: CustomMealLogEntry = {
          id: crypto.randomUUID(),
          date: new Date().toISOString().split('T')[0],
          mealType,
          name: mealName,
          calories,
          timestamp: new Date().toISOString(),
      };
      
      try {
        const existingLogsRaw = localStorage.getItem(MANUAL_MEAL_LOG_KEY);
        let existingLogs: CustomMealLogEntry[] = existingLogsRaw ? JSON.parse(existingLogsRaw) : [];
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

        const updatedLogs = [...existingLogs, newEntry].filter(log => log.date >= sevenDaysAgoStr);
        
        localStorage.setItem(MANUAL_MEAL_LOG_KEY, JSON.stringify(updatedLogs));

        setToastInfo({ title: "Meal Logged!", message: `${mealName} has been added to your daily log.`, quote: "Every entry is a step toward awareness." });
      } catch (e) {
        console.error("Could not save custom meal log", e);
        setError("Could not save your custom meal. Please try again.");
      }
      setIsLogMealModalOpen(false);
  };

  const handleLogIntake = () => {
    if (!finalDietPlan) return;
    setIsLogging(true);
    setLogSuccess(false);
    
    setTimeout(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const eatenMeals = finalDietPlan.meals.filter(meal => checkedMeals[meal.recipe] ?? true);
        const loggedMealsCalories = eatenMeals.reduce((sum, meal) => sum + meal.calories, 0);
        
        const customMealsRaw = localStorage.getItem(MANUAL_MEAL_LOG_KEY);
        let customCaloriesToday = 0;
        if (customMealsRaw) {
            try {
                const allCustomMeals: CustomMealLogEntry[] = JSON.parse(customMealsRaw);
                customCaloriesToday = allCustomMeals
                    .filter(m => m.date === todayStr)
                    .reduce((sum, meal) => sum + meal.calories, 0);
            } catch (e) { console.error("Could not parse custom meal logs", e); }
        }

        const totalIntake = loggedMealsCalories + customCaloriesToday;

        const newIntakeEntry: DailyIntake = { 
            date: todayStr, 
            loggedMeals: eatenMeals.map(({ name, calories }) => ({ name, calories })), 
            otherCalories: customCaloriesToday, 
            totalIntake: totalIntake, 
            targetCalories: finalDietPlan.totalCalories 
        };

        try {
            const existingIntakeRaw = localStorage.getItem(DAILY_INTAKE_KEY);
            let existingIntake: DailyIntake[] = existingIntakeRaw ? JSON.parse(existingIntakeRaw) : [];
            const filteredIntake = existingIntake.filter(entry => entry.date !== todayStr);
            
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

            const updatedIntake = [newIntakeEntry, ...filteredIntake].filter(entry => entry.date >= sevenDaysAgoStr);
            localStorage.setItem(DAILY_INTAKE_KEY, JSON.stringify(updatedIntake));
        } catch(e) { console.error("Could not save daily intake", e) }
        
        setIsLogging(false);
        setLogSuccess(true);

        setTimeout(() => {
            setLogSuccess(false);
            const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
            setToastInfo({ title: "Intake Logged!", message: "You've successfully logged your planned meals for today. Great job!", quote: randomQuote });
        }, 2000);
    }, 1000);
  };

  const getShareText = () => {
    if (!finalDietPlan) return '';
    let shareText = `*ObeCure Diet Plan for ${patientName || 'Patient'} (${patientWeight} kg)*\n\n`;
    shareText += `*Eating Window:* ${fastingStartHour}:00 ${fastingStartPeriod} - ${fastingEndHour}:00 ${fastingEndPeriod}\n`;
    shareText += `*Target: ~${finalDietPlan.totalCalories} kcal*\n`;
    shareText += `*Macros (P/C/F): ${finalDietPlan.totalMacros.protein}g / ${finalDietPlan.totalMacros.carbohydrates}g / ${finalDietPlan.totalMacros.fat}g*\n\n`;
    finalDietPlan.meals.forEach(meal => {
        const isSpecial = meal.name.includes('ObeCure Special Meal');
        shareText += `*${isSpecial ? '⭐ ' : ''}${meal.name}* (${meal.time ? `~${meal.time}` : ''} | ~${meal.calories} kcal):\n`;
        shareText += `${meal.recipe}\n`;
        shareText += `(P: ${meal.macros.protein}g, C: ${meal.macros.carbohydrates}g, F: ${meal.macros.fat}g)\n\n`;
    });
    if(drKenilsNote) { shareText += `*Dr. Kenil's Note:*\n_${drKenilsNote.text}_\n\n`; }
    shareText += `Generated by ObeCure Diet Assistant.`;
    return encodeURIComponent(shareText);
  };

  const getMealIcon = (time?: string) => {
    if (!time) return SnackIcon;
    const hour = parseInt(time.split(':')[0]);
    const period = time.slice(-2);
    if ((hour < 12 && period === 'AM') || (hour === 12 && period === 'AM')) return BreakfastIcon;
    if ((hour >= 12 || hour < 4) && period === 'PM') return LunchIcon;
    if (hour >= 7 && period === 'PM') return DinnerIcon;
    return SnackIcon;
  };

  const handleToggleFavorite = (mealName: string) => {
    const newFavorites = favoriteMeals.includes(mealName)
        ? favoriteMeals.filter(name => name !== mealName)
        : [...favoriteMeals, mealName];
    setFavoriteMeals(newFavorites);
    localStorage.setItem(FAVORITE_MEALS_KEY, JSON.stringify(newFavorites));
    const toastTitle = newFavorites.includes(mealName) ? "Added to Favorites!" : "Removed from Favorites";
    setToastInfo({ title: toastTitle, message: `${mealName} has been updated in your favorites list.`, quote: "Your preferences help us learn!" });
  };
  
  const handleSwapMeal = (mealIndex: number) => {
    if (!finalDietPlan) return;
    const mealToSwap = finalDietPlan.meals[mealIndex];
    const newMeal = findSwapMeal({
        preference, healthConditions, dietType,
        mealType: mealToSwap.mealType,
        calorieTarget: mealToSwap.calories,
        currentPlanMeals: finalDietPlan.meals
    });

    if (newMeal) {
        const newMeals = [...finalDietPlan.meals];
        newMeals[mealIndex] = newMeal;

        const totalCalories = newMeals.reduce((sum, meal) => sum + meal.calories, 0);
        const totalMacros = newMeals.reduce((totals, meal) => ({
            protein: totals.protein + meal.macros.protein,
            carbohydrates: totals.carbohydrates + meal.macros.carbohydrates,
            fat: totals.fat + meal.macros.fat,
        }), { protein: 0, carbohydrates: 0, fat: 0 });

        const newPlan = { ...finalDietPlan, meals: newMeals, totalCalories, totalMacros };
        setFinalDietPlan(newPlan);
        setToastInfo({ title: "Meal Swapped!", message: `${mealToSwap.name} was swapped with ${newMeal.name}.`, quote: "Variety is the spice of life!" });
    } else {
        setToastInfo({ title: "Swap Failed", message: "Couldn't find a suitable replacement meal right now. Please try again later.", quote: "Sometimes the first choice is the best choice." });
    }
  };


  const validateStep = (currentStep: number): React.RefObject<HTMLElement> | null => {
    if (currentStep === 1) {
        if (!patientWeight.trim()) return patientWeightRef;
        if (!height.trim()) return heightUnit === 'cm' ? heightCmRef : heightFtRef;
        if (!age.trim()) return ageRef;
    }
    return null;
  };

  const handleNext = () => {
      const invalidFieldRef = validateStep(formStep);
      if (invalidFieldRef) {
        setError("Please fill in all required (*) fields before proceeding.");
        focusAndScroll(invalidFieldRef);
        setTimeout(() => setError(null), 3000);
      } else {
        if(error) setError(null);
        setFormStep(prev => prev < 3 ? prev + 1 : prev);
      }
  };
  const handleBack = () => setFormStep(prev => prev > 1 ? prev - 1 : prev);
  
  const formInputClass = "w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition";
  const formLabelClass = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2";

  return (
    <div className="animate-fade-in">
       {toastInfo && (
          <SuccessToast
            title={toastInfo.title}
            message={toastInfo.message}
            quote={toastInfo.quote}
            onClose={() => setToastInfo(null)}
          />
        )}
        <LogMealModal 
            isOpen={isLogMealModalOpen} 
            onClose={() => setIsLogMealModalOpen(false)} 
            onLog={handleLogCustomMeal} 
        />
        <MealHistoryModal
            isOpen={isHistoryModalOpen}
            onClose={() => setIsHistoryModalOpen(false)}
        />

      {generationStep === 'form' && (
      <div ref={formContainerRef} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 scroll-mt-20">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200 text-center">{plannerTitle}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400 mb-8 text-center max-w-prose mx-auto">
            {formStep === 1 && "Let's start with your basic information to create your profile."}
            {formStep === 2 && "Now, tell us about your health goals and any existing conditions."}
            {formStep === 3 && "Finally, let's set your dietary and fasting preferences."}
        </p>

        <div className="mb-8">
            <div className="flex justify-between mb-1">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Step {formStep} of 3</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(formStep / 3) * 100}%` }}></div>
            </div>
        </div>
        
        <div className="min-h-[400px]">
          {formStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
              <div className="md:col-span-2">
                <label htmlFor="patientName" className={formLabelClass}>Patient Name</label>
                <input ref={patientNameRef} onKeyDown={e => handleKeyDown(e, patientWeightRef)} id="patientName" type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="e.g., Anjali Sharma" className={formInputClass}/>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="patientWeight" className={formLabelClass}>Current Weight (kg)<span className="text-red-500">*</span></label>
                <div className="flex items-center gap-2">
                    <input ref={patientWeightRef} onKeyDown={e => handleKeyDown(e, ageRef)} id="patientWeight" type="number" value={patientWeight} onChange={(e) => setPatientWeight(e.target.value)} placeholder="e.g., 75" required className={formInputClass}/>
                    <button onClick={handleSaveWeight} className="bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-all active:scale-95 shadow-md">
                        Save
                    </button>
                </div>
              </div>
              <div>
                 <label htmlFor="age" className={formLabelClass}>Age<span className="text-red-500">*</span></label>
                 <input ref={ageRef} onKeyDown={e => handleKeyDown(e, heightUnit === 'cm' ? heightCmRef : heightFtRef)} id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g., 30" required className={formInputClass}/>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Height<span className="text-red-500">*</span></label>
                    <div className="flex items-center text-xs font-semibold bg-gray-100 dark:bg-gray-700/50 rounded-full p-0.5 transition-all">
                        <button onClick={() => handleHeightUnitChange('cm')} className={`px-3 py-1 rounded-full transition-all text-xs active:scale-95 ${heightUnit === 'cm' ? 'bg-white dark:bg-gray-600 text-orange-600 dark:text-orange-400 shadow' : 'text-gray-500 dark:text-gray-400'}`}>cm</button>
                        <button onClick={() => handleHeightUnitChange('ft')} className={`px-3 py-1 rounded-full transition-all text-xs active:scale-95 ${heightUnit === 'ft' ? 'bg-white dark:bg-gray-600 text-orange-600 dark:text-orange-400 shadow' : 'text-gray-500 dark:text-gray-400'}`}>ft/in</button>
                    </div>
                </div>
                {heightUnit === 'cm' ? ( <input ref={heightCmRef} onKeyDown={e => handleKeyDown(e, sexRef)} id="height" type="number" value={height} onChange={handleHeightCmChange} placeholder="e.g., 165" required className={formInputClass}/> ) : (
                    <div className="flex gap-2">
                        <input ref={heightFtRef} onKeyDown={e => handleKeyDown(e, heightInRef)} id="heightFt" type="number" value={heightFt} onChange={handleHeightFtInChange} placeholder="ft" required className={`${formInputClass} text-center`} />
                        <input ref={heightInRef} onKeyDown={e => handleKeyDown(e, sexRef)} id="heightIn" type="number" value={heightIn} onChange={handleHeightFtInChange} placeholder="in" required className={`${formInputClass} text-center`} />
                    </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label htmlFor="sex" className={formLabelClass}>Sex</label>
                <select ref={sexRef} onKeyDown={e => handleKeyDown(e, nextButton1Ref)} id="sex" value={sex} onChange={(e) => setSex(e.target.value as Sex)} className={formInputClass}>
                  {Object.values(Sex).map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
            </div>
          )}

          {formStep === 2 && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
                <div className="md:col-span-2">
                    <label htmlFor="targetWeight" className={formLabelClass}>Target Weight (kg)</label>
                    <input ref={targetWeightRef} onKeyDown={e => handleKeyDown(e, activityLevelRef)} id="targetWeight" type="number" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} placeholder="e.g., 65" className={formInputClass}/>
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="activityLevel" className={formLabelClass}>Activity Level</label>
                    <select ref={activityLevelRef} onKeyDown={e => handleKeyDown(e, dietTypeRef)} id="activityLevel" value={activityLevel} onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)} className={formInputClass}>
                    {Object.values(ActivityLevel).map((level) => (<option key={level} value={level}>{level}</option>))}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="dietType" className={formLabelClass}>Diet Goal</label>
                    <select ref={dietTypeRef} onKeyDown={e => handleKeyDown(e, nextButton2Ref)} id="dietType" value={dietType} onChange={(e) => setDietType(e.target.value as DietType)} className={formInputClass}>
                    {Object.values(DietType).map((type) => (<option key={type} value={type}>{type}</option>))}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className={formLabelClass}>Existing Health Conditions (optional)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        {Object.values(HealthCondition).map((condition) => (
                        <label key={condition} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                            <input type="checkbox" checked={healthConditions.includes(condition)} onChange={() => handleConditionChange(condition)} className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"/>
                            <span>{condition}</span>
                        </label>
                        ))}
                    </div>
                </div>
            </div>
          )}

          {formStep === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
                <div className="md:col-span-2">
                    <label htmlFor="preference" className={formLabelClass}>Food Preference</label>
                    <select ref={preferenceRef} onKeyDown={e => handleKeyDown(e, generateButtonRef)} id="preference" value={preference} onChange={(e) => setPreference(e.target.value as DietPreference)} className={formInputClass}>
                    {Object.values(DietPreference).map((pref) => (<option key={pref} value={pref}>{pref}</option>))}
                    </select>
                </div>
                <div className="md:col-span-2">
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
                <div className="md:col-span-2 space-y-4">
                    {bmiResult && (
                        <div className={`p-4 rounded-lg text-center transition-all duration-300 animate-fade-in ${bmiResult.color}`}>
                            <p className="font-bold text-base sm:text-lg"> Your BMI: <span className="text-xl sm:text-2xl">{bmiResult.value}</span> </p>
                            <p className="font-semibold">{bmiResult.category}</p>
                            {bmiResult.risk && <p className="text-sm mt-1">{bmiResult.risk}</p>}
                        </div>
                    )}
                    {estimatedDuration !== null && (
                        <div className="p-4 rounded-lg text-center transition-all duration-300 animate-fade-in bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300">
                            <p className="font-bold text-base sm:text-lg"> Target can be achieved in ~ <span className="text-xl sm:text-2xl">{estimatedDuration}</span> Days </p>
                            <p className="text-xs mt-1">(Estimate based on your profile and a consistent daily calorie deficit.)</p>
                        </div>
                    )}
                </div>
            </div>
          )}
        </div>
        
        {error && <div className="mt-4 text-sm text-center text-red-500 animate-fade-in">{error}</div>}

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row-reverse gap-4">
          {formStep < 3 && (
            <button ref={formStep === 1 ? nextButton1Ref : nextButton2Ref} onClick={handleNext} className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-all duration-300 active:scale-95 shadow-md">Next Step &rarr;</button>
          )}

          {formStep === 3 && (
            <div className="flex flex-col sm:flex-row gap-4 w-full">
                <button ref={generateButtonRef} onClick={handleBeginGeneration} disabled={isLoading} className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-all duration-300 disabled:bg-orange-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-md hover:shadow-lg dark:hover:bg-orange-600 flex-grow active:scale-95">
                {isLoading ? (
                    <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Generating...</span></>
                ) : ( <span>Build My Diet Plan</span> )}
                </button>
            </div>
          )}
          {formStep > 1 && (
            <button onClick={handleBack} className="w-full sm:w-auto bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-3 px-6 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 active:scale-95 shadow-md">&larr; Back</button>
          )}
        </div>
      </div>
      )}

       <div ref={resultsRef} className="mt-8">
        {isLoading && <GeneratingPlan />}

        {generationStep === 'selecting' && (
            <div className="animate-fade-in-up">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 text-center">
                        Choose Your {mealSlotsToFill[currentSelectionIndex] === 'Special' ? 'Special Meal' : mealSlotsToFill[currentSelectionIndex]}
                    </h2>
                    <p className="text-center text-gray-500 dark:text-gray-400 mt-1">Step {currentSelectionIndex + 1} of {mealSlotsToFill.length}</p>
                </div>
                {mealOptions && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {mealOptions.map((meal, index) => (
                             <div 
                                key={index} 
                                onClick={() => handleSelectOption(meal, index)}
                                className={`p-6 rounded-lg shadow-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-xl hover:border-orange-500 hover:-translate-y-1 ${ animatingOutIndex === index ? 'animate-evaporate' : 'animate-fade-in-up'} ${selectedOptionIndex === index ? 'border-orange-500 scale-105' : 'border-transparent bg-gray-50 dark:bg-gray-700/50'}`}
                             >
                                <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200">{meal.name}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{meal.recipe}</p>
                                <div className="text-xs mt-2 flex flex-wrap gap-x-3 gap-y-1 text-gray-500 dark:text-gray-400">
                                    <span>🔥 {meal.calories} kcal</span>
                                    <span>💪 P: {meal.macros.protein}g</span>
                                    <span>🍞 C: {meal.macros.carbohydrates}g</span>
                                    <span>🥑 F: {meal.macros.fat}g</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
        
        {error && !isLoading && generationStep === 'form' && (
            <div className="mt-8 bg-red-50 dark:bg-red-900/20 p-6 rounded-xl shadow-lg border border-red-200 dark:border-red-700 text-center">
                <h3 className="text-xl font-bold text-red-600 dark:text-red-400">Oops!</h3>
                <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
                <button onClick={() => setFormStep(3)} className="mt-4 bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-all">
                    &larr; Go Back and Adjust
                </button>
            </div>
        )}
        {generationStep === 'done' && finalDietPlan && !isLoading && (
            <div className="animate-fade-in-up">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div>
                        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-3">Today's Meal Plan</h3>
                        <div className="space-y-4">
                            {finalDietPlan.meals.map((meal, index) => {
                                const Icon = getMealIcon(meal.time);
                                const isSpecial = meal.name.includes('Special');
                                return (
                                <div 
                                    key={index} 
                                    className={`relative p-6 rounded-lg shadow-sm border-l-4 transition-all duration-300 ${isSpecial ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-400' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600'}`}
                                >
                                    <div className="flex items-start">
                                        <div className="mr-4 mt-1">
                                            <Icon className={`w-6 h-6 ${isSpecial ? 'text-amber-500' : 'text-gray-500'}`} />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200">{meal.name}</h4>
                                                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{meal.time}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{meal.recipe}</p>
                                            <div className="text-xs mt-2 flex flex-wrap gap-x-3 gap-y-1 text-gray-500 dark:text-gray-400">
                                                <span>🔥 {meal.calories} kcal</span>
                                                <span>💪 P: {meal.macros.protein}g</span>
                                                <span>🍞 C: {meal.macros.carbohydrates}g</span>
                                                <span>🥑 F: {meal.macros.fat}g</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute top-2 right-2 flex items-center gap-1">
                                      <button onClick={() => handleToggleFavorite(meal.name)} className="p-1 text-gray-400 hover:text-orange-500 transition-colors"><HeartIcon isFavorite={favoriteMeals.includes(meal.name)} /></button>
                                      <button onClick={() => handleSwapMeal(index)} className="p-1 text-gray-400 hover:text-orange-500 transition-colors"><SwapIcon className="w-5 h-5"/></button>
                                      <input type="checkbox" checked={checkedMeals[meal.recipe] ?? true} onChange={() => handleMealCheckChange(meal.recipe)} className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400 ml-1"/>
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>
                    <div>
                         <div className="sticky top-20 z-10">
                             <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 text-center mb-4">
                                <h4 className="font-bold text-orange-800 dark:text-orange-200">Total Intake</h4>
                                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{finalDietPlan.totalCalories} kcal</p>
                                <div className="text-xs mt-1 flex justify-center gap-x-3 text-orange-700 dark:text-orange-300">
                                    <span>P: {finalDietPlan.totalMacros.protein}g</span>
                                    <span>C: {finalDietPlan.totalMacros.carbohydrates}g</span>
                                    <span>F: {finalDietPlan.totalMacros.fat}g</span>
                                </div>
                             </div>
                             
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                                <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-2 text-center">Daily Water Intake</h4>
                                <div className="flex items-center justify-center gap-3">
                                    <button onClick={() => handleWaterChange(-1)} className="w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-700 text-blue-800 dark:text-blue-100 font-bold">-</button>
                                    <WaterIcon className="w-8 h-8 text-blue-500" />
                                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-300 w-12 text-center">{waterGlasses}</span>
                                    <button onClick={() => handleWaterChange(1)} className="w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-700 text-blue-800 dark:text-blue-100 font-bold">+</button>
                                </div>
                                <p className="text-xs text-center text-blue-600 dark:text-blue-400 mt-2">({(waterGlasses * 0.25).toFixed(2)} / 3.0 Liters)</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                               <button onClick={() => setIsLogMealModalOpen(true)} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg font-semibold text-gray-700 dark:text-gray-200 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition">Log Other Food</button>
                               <button onClick={() => setIsHistoryModalOpen(true)} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg font-semibold text-gray-700 dark:text-gray-200 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2">
                                    <HistoryIcon className="w-5 h-5" />
                                    <span>Log History</span>
                                </button>
                            </div>

                             <button onClick={handleLogIntake} disabled={isLogging || logSuccess} className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-all flex items-center justify-center space-x-2 disabled:bg-green-300">
                                {isLogging ? 'Logging...' : logSuccess ? <>Logged <CheckIcon className="w-5 h-5 ml-2"/></> : 'Log Today\'s Intake'}
                             </button>
                             <a href={`https://wa.me/?text=${getShareText()}`} target="_blank" rel="noopener noreferrer" className="mt-3 w-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-bold py-3 px-4 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all flex items-center justify-center space-x-2">
                                <WhatsAppIcon className="w-5 h-5"/>
                                <span>Share Plan</span>
                            </a>
                         </div>
                    </div>
                </div>
                
                {drKenilsNote && <DrKenilsNoteComponent note={drKenilsNote} />}
            </div>
        )}
      </div>
    </div>
  );
};

export default DietPlanner;