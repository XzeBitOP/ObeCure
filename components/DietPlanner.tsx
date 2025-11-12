import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DietPreference, DietPlan, Sex, ActivityLevel, DietType, HealthCondition, DrKenilsNote, ProgressEntry, DailyIntake, FastingEntry, Meal, WaterEntry, CustomMealLogEntry, MealType } from '../types';
import { generateOfflineDietPlan as generateDietPlan, findSwapMeal } from '../services/offlinePlanGenerator';
import { StarIcon } from './icons/StarIcon';
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
import { SwapIcon } from './icons/SwapIcon';
import { OBE_CURE_SPECIAL_MEALS } from '../data/specialMeals';
import { WaterIcon } from './icons/WaterIcon';
import { HeartIcon } from './icons/HeartIcon';
import LogMealModal from './LogMealModal';
import { HistoryIcon } from './icons/HistoryIcon';
import MealHistoryModal from './MealHistoryModal';


const USER_PREFERENCES_KEY = 'obeCureUserPreferences';
const PROGRESS_DATA_KEY = 'obeCureProgressData';
const DAILY_INTAKE_KEY = 'obeCureDailyIntake';
const FASTING_DATA_KEY = 'obeCureFastingData';
const WATER_INTAKE_KEY = 'obeCureWaterIntake';
const FAVORITE_MEALS_KEY = 'obeCureFavoriteMeals';
const MANUAL_MEAL_LOG_KEY = 'obeCureManualMealLog';
const DIET_PLAN_KEY = 'obeCureDailyDietPlan';


// FIX: Add missing getActivityFactor function
const getActivityFactor = (level: ActivityLevel): number => {
    switch (level) {
        case ActivityLevel.SEDENTARY: return 1.2;
        case ActivityLevel.LIGHTLY_ACTIVE: return 1.375;
        case ActivityLevel.MODERATELY_ACTIVE: return 1.55;
        case ActivityLevel.VERY_ACTIVE: return 1.725;
        default: return 1.375;
    }
};

interface DietPlannerProps {
  isSubscribed: boolean;
  onOpenSubscriptionModal: () => void;
  dietPlan: DietPlan | null;
  setDietPlan: (plan: DietPlan | null) => void;
}

const DietPlanner: React.FC<DietPlannerProps> = ({ isSubscribed, onOpenSubscriptionModal, dietPlan, setDietPlan }) => {
  const [step, setStep] = useState(1);
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

  const [checkedMeals, setCheckedMeals] = useState<Record<string, boolean>>({});
  const [expandedMealIndex, setExpandedMealIndex] = useState<number | null>(null);
  const [waterGlasses, setWaterGlasses] = useState<number>(0);
  const [toastInfo, setToastInfo] = useState<{ title: string; message: string; quote: string; } | null>(null);
  const [isLogging, setIsLogging] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);
  
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [favoriteMeals, setFavoriteMeals] = useState<string[]>([]);
  const [isLogMealModalOpen, setIsLogMealModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const timerIdsRef = useRef<number[]>([]);
  
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

      const savedFavoritesRaw = localStorage.getItem(FAVORITE_MEALS_KEY);
      if (savedFavoritesRaw) {
        setFavoriteMeals(JSON.parse(savedFavoritesRaw));
      }

    } catch (e) {
      console.error("Failed to parse data from localStorage", e);
    }
  }, []);
  
    useEffect(() => {
        if (dietPlan) {
            // When a new plan is loaded, initialize all meals as checked
            // but don't overwrite existing checked state for meals that are still in the plan
            setCheckedMeals(prev => {
                const newCheckedState = { ...prev };
                dietPlan.meals.forEach(meal => {
                    // If a meal is new to the checked state object, default it to checked.
                    if (newCheckedState[meal.recipe] === undefined) {
                        newCheckedState[meal.recipe] = true;
                    }
                });
                return newCheckedState;
            });
        }
    }, [dietPlan]);

  useEffect(() => {
    const prefsToSave = {
      patientName, patientWeight, targetWeight, height, age, sex, activityLevel, preference, dietType, healthConditions,
      fastingStartHour, fastingStartPeriod, fastingEndHour, fastingEndPeriod,
      heightUnit, heightFt, heightIn
    };
    localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(prefsToSave));
  }, [patientName, patientWeight, targetWeight, height, age, sex, activityLevel, preference, dietType, healthConditions, fastingStartHour, fastingStartPeriod, fastingEndHour, fastingEndPeriod, heightUnit, heightFt, heightIn]);

  useEffect(() => {
    if (isLoading) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [isLoading]);

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
  }, [patientWeight, targetWeight, height, age, sex, activityLevel, dietType, step]);

    useEffect(() => {
    return () => {
        timerIdsRef.current.forEach(clearTimeout);
        timerIdsRef.current = [];
    };
    }, [dietPlan]);

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
        let focusRef: React.RefObject<HTMLElement> | null = null;
        if (step === 1) focusRef = patientNameRef;
        else if (step === 2) focusRef = targetWeightRef;
        else if (step === 3) focusRef = preferenceRef;

        if (focusRef?.current && formContainerRef.current) {
            formContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => focusRef!.current?.focus(), 400); // Delay for scroll animation
        }
    }, [step]);


    const scheduleMealReminders = (plan: DietPlan) => {
        timerIdsRef.current.forEach(clearTimeout);
        timerIdsRef.current = [];

        navigator.serviceWorker.ready.then(registration => {
            if (!registration) return;

            const scheduleNotification = (title: string, body: string, time: string, tag: string) => {
                const timeParts = time.match(/(\d+):(\d+)\s*(AM|PM)/);
                if (!timeParts) return;

                let [_, hourStr, minuteStr, period] = timeParts;
                let hour = parseInt(hourStr, 10);

                if (period.toUpperCase() === 'PM' && hour < 12) hour += 12;
                if (period.toUpperCase() === 'AM' && hour === 12) hour = 0;

                const targetTime = new Date();
                targetTime.setHours(hour, parseInt(minuteStr, 10), 0, 0);

                const delay = targetTime.getTime() - new Date().getTime();

                if (delay > 0) {
                    const timerId = setTimeout(() => {
                        registration.showNotification(title, { body, icon: '/logo.svg', tag });
                    }, delay);
                    timerIdsRef.current.push(timerId);
                }
            };
            
            plan.meals.forEach(meal => {
                if (meal.time) {
                    scheduleNotification(
                        `Time for ${meal.mealType}!`,
                        `It's time to have your ${meal.name.toLowerCase()}. Enjoy!`,
                        meal.time,
                        `meal-${meal.mealType.toLowerCase()}`
                    );
                }
            });
            
            scheduleNotification(
                'Time to Rest Up!',
                `Don't forget to log your sleep tonight to keep your progress on track.`,
                '09:30 PM',
                'sleep-reminder'
            );

            setToastInfo({ title: "Reminders Set!", message: "We'll notify you for your meals and sleep log today.", quote: "Consistency is key to success!" });
        });
    };

    const handleEnableNotifications = async () => {
        setShowNotificationPrompt(false);
        if (!('Notification' in window)) {
            alert('This browser does not support desktop notification');
            return;
        }
        
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            if (dietPlan) {
                scheduleMealReminders(dietPlan);
            }
        } else {
            setToastInfo({ title: "Notifications Blocked", message: "You can enable them in your browser settings if you change your mind.", quote: "Every choice is a step forward." });
        }
    };

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
  }, [patientWeight, height, age, step]);

  const handleGeneratePlan = () => {
    setIsLoading(true);
    setError(null);
    setDrKenilsNote(null);
    setExpandedMealIndex(null);

    setTimeout(() => {
        try {
            const fastingStartTime = `${fastingStartHour}:00 ${fastingStartPeriod}`;
            const fastingEndTime = `${fastingEndHour}:00 ${fastingEndPeriod}`;
            const plan = generateDietPlan({ patientWeight, height, age, sex, activityLevel, preference, healthConditions, dietType, fastingStartTime, fastingEndTime, favoriteMeals });
            if (!plan || plan.meals.length === 0) {
              setError('Sorry, we couldn\'t find a suitable diet plan with the selected criteria. Please try different options.');
              setIsLoading(false);
              return;
            }
            setDietPlan(plan);
            const planDataToSave = {
                date: new Date().toISOString().split('T')[0],
                plan: plan,
            };
            localStorage.setItem(DIET_PLAN_KEY, JSON.stringify(planDataToSave));

            const randomNote = drKenilsNotes[Math.floor(Math.random() * drKenilsNotes.length)];
            setDrKenilsNote(randomNote);
            const weightNum = parseFloat(patientWeight);
            const heightNum = parseFloat(height);
            if (weightNum > 0 && heightNum > 0) {
                const bmi = calculateBmi(weightNum, heightNum);
                const newProgressEntry: ProgressEntry = { date: new Date().toISOString().split('T')[0], weight: weightNum, bmi: bmi };
                const existingDataRaw = localStorage.getItem(PROGRESS_DATA_KEY);
                let existingData: ProgressEntry[] = existingDataRaw ? JSON.parse(existingDataRaw) : [];
                const todayEntryIndex = existingData.findIndex(entry => entry.date === newProgressEntry.date);
                if (todayEntryIndex > -1) { existingData[todayEntryIndex] = newProgressEntry; } else { existingData.push(newProgressEntry); }
                localStorage.setItem(PROGRESS_DATA_KEY, JSON.stringify(existingData));
            }
            const to24Hour = (hour: number, period: string) => {
                if (period === 'PM' && hour < 12) return hour + 12;
                if (period === 'AM' && hour === 12) return 0;
                return hour;
            };
            const startHour24 = to24Hour(parseInt(fastingStartHour), fastingStartPeriod);
            const endHour24 = to24Hour(parseInt(fastingEndHour), fastingEndPeriod);
            let duration = endHour24 - startHour24;
            if (duration < 0) duration += 24;
            const newFastingEntry: FastingEntry = { date: new Date().toISOString().split('T')[0], startTime: fastingStartTime, endTime: fastingEndTime, duration: duration };
            const existingFastingRaw = localStorage.getItem(FASTING_DATA_KEY);
            let existingFastingData: FastingEntry[] = existingFastingRaw ? JSON.parse(existingFastingRaw) : [];
            const todayFastingIndex = existingFastingData.findIndex(entry => entry.date === newFastingEntry.date);
            if (todayFastingIndex > -1) { existingFastingData[todayFastingIndex] = newFastingEntry; } else { existingFastingData.push(newFastingEntry); }
            localStorage.setItem(FASTING_DATA_KEY, JSON.stringify(existingFastingData));

            if ('Notification' in window) {
                if (Notification.permission === 'default') {
                    setShowNotificationPrompt(true);
                } else if (Notification.permission === 'granted') {
                    scheduleMealReminders(plan);
                }
            }
        } catch (err) {
            console.error(err);
            setError('An unexpected error occurred while generating the plan. Please check your inputs.');
        } finally {
            setIsLoading(false);
        }
    }, 5000);
  };

  const handleMealCheckChange = (mealRecipe: string) => {
    setCheckedMeals(prev => ({ ...prev, [mealRecipe]: !prev[mealRecipe] }));
  };

  const handleToggleFavorite = (meal: Meal) => {
    const recipeId = meal.recipe;
    setFavoriteMeals(prev => {
        const newFavorites = prev.includes(recipeId)
            ? prev.filter(id => id !== recipeId)
            : [...prev, recipeId];
        localStorage.setItem(FAVORITE_MEALS_KEY, JSON.stringify(newFavorites));
        return newFavorites;
    });
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
    if (!dietPlan) return;
    setIsLogging(true);
    setLogSuccess(false);
    
    setTimeout(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const eatenMeals = dietPlan.meals.filter(meal => checkedMeals[meal.recipe] ?? true);
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
            targetCalories: dietPlan.totalCalories 
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

    const handleSwapMeal = (mealIndexToSwap: number) => {
        if (!isSubscribed) {
            onOpenSubscriptionModal();
            return;
        }
        if (!dietPlan) return;

        const mealToSwap = dietPlan.meals[mealIndexToSwap];
        let newMeal: Meal | null = null;

        if (mealToSwap.name === 'ObeCure Special Meal') {
            const otherSpecialMeals = OBE_CURE_SPECIAL_MEALS.filter(m => m.recipe !== mealToSwap.recipe);
            if (otherSpecialMeals.length > 0) {
                const randomSpecialMeal = otherSpecialMeals[Math.floor(Math.random() * otherSpecialMeals.length)];
                newMeal = {
                    ...randomSpecialMeal,
                    time: mealToSwap.time,
                    mealType: mealToSwap.mealType,
                };
            }
        } else {
            newMeal = findSwapMeal(mealToSwap, dietPlan.meals, { preference, healthConditions, dietType, mealType: mealToSwap.mealType, favoriteMeals });
        }

        if (newMeal) {
            const newMeals = [...dietPlan.meals];
            newMeals[mealIndexToSwap] = newMeal;

            const newTotalCalories = newMeals.reduce((sum, meal) => sum + meal.calories, 0);
            const newTotalMacros = newMeals.reduce((totals, meal) => ({
                protein: totals.protein + meal.macros.protein,
                carbohydrates: totals.carbohydrates + meal.macros.carbohydrates,
                fat: totals.fat + meal.macros.fat,
            }), { protein: 0, carbohydrates: 0, fat: 0 });
            
            const newPlan = {
                meals: newMeals,
                totalCalories: newTotalCalories,
                totalMacros: newTotalMacros
            };
            setDietPlan(newPlan);
            const planDataToSave = {
                date: new Date().toISOString().split('T')[0],
                plan: newPlan,
            };
            localStorage.setItem(DIET_PLAN_KEY, JSON.stringify(planDataToSave));
        } else {
             setToastInfo({ title: "No Swap Found", message: "Could not find a suitable alternative meal for your criteria. Try again later!", quote: "Variety is the spice of life, but consistency is the main course." });
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

  const validateStep = (currentStep: number): React.RefObject<HTMLElement> | null => {
    if (currentStep === 1) {
        if (!patientWeight.trim()) return patientWeightRef;
        if (!height.trim()) return heightUnit === 'cm' ? heightCmRef : heightFtRef;
        if (!age.trim()) return ageRef;
    }
    return null;
  };

  const handleNext = () => {
      const invalidFieldRef = validateStep(step);
      if (invalidFieldRef) {
        setError("Please fill in all required (*) fields before proceeding.");
        focusAndScroll(invalidFieldRef);
        setTimeout(() => setError(null), 3000);
      } else {
        if(error) setError(null);
        setStep(prev => prev < 3 ? prev + 1 : prev);
      }
  };
  const handleBack = () => setStep(prev => prev > 1 ? prev - 1 : prev);
  
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
      <div ref={formContainerRef} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 scroll-mt-20">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200 text-center">{plannerTitle}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400 mb-8 text-center max-w-prose mx-auto">
            {step === 1 && "Let's start with your basic information to create your profile."}
            {step === 2 && "Now, tell us about your health goals and any existing conditions."}
            {step === 3 && "Finally, let's set your dietary and fasting preferences."}
        </p>

        <div className="mb-8">
            <div className="flex justify-between mb-1">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Step {step} of 3</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
            </div>
        </div>
        
        <div className="min-h-[400px]">
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
              <div className="lg:col-span-2">
                <label htmlFor="patientName" className={formLabelClass}>Patient Name</label>
                <input ref={patientNameRef} onKeyDown={e => handleKeyDown(e, patientWeightRef)} id="patientName" type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="e.g., Anjali Sharma" className={formInputClass}/>
              </div>
              <div>
                <label htmlFor="patientWeight" className={formLabelClass}>Weight (kg)<span className="text-red-500">*</span></label>
                <input ref={patientWeightRef} onKeyDown={e => handleKeyDown(e, ageRef)} id="patientWeight" type="number" value={patientWeight} onChange={(e) => setPatientWeight(e.target.value)} placeholder="e.g., 75" required className={formInputClass}/>
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
              <div className="lg:col-span-3">
                <label htmlFor="sex" className={formLabelClass}>Sex</label>
                <select ref={sexRef} onKeyDown={e => handleKeyDown(e, nextButton1Ref)} id="sex" value={sex} onChange={(e) => setSex(e.target.value as Sex)} className={formInputClass}>
                  {Object.values(Sex).map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
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

          {step === 3 && (
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
          {step < 3 && (
            <button ref={step === 1 ? nextButton1Ref : nextButton2Ref} onClick={handleNext} className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-all duration-300 active:scale-95 shadow-md">Next Step &rarr;</button>
          )}

          {step === 3 && (
            <div className="flex flex-col sm:flex-row gap-4 w-full">
                <button ref={generateButtonRef} onClick={handleGeneratePlan} disabled={isLoading} className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-all duration-300 disabled:bg-orange-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-md hover:shadow-lg dark:hover:bg-orange-600 flex-grow active:scale-95">
                {isLoading ? (
                    <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Generating...</span></>
                ) : ( <span>Generate Diet Plan</span> )}
                </button>
            </div>
          )}
          {step > 1 && (
            <button onClick={handleBack} className="w-full sm:w-auto bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-3 px-6 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 active:scale-95 shadow-md">&larr; Back</button>
          )}
        </div>
      </div>
       <div ref={resultsRef} className="mt-8">
        {isLoading && <GeneratingPlan />}
        {error && !isLoading && (
            <div className="mt-8 bg-red-50 dark:bg-red-900/20 p-6 rounded-xl shadow-lg border border-red-200 dark:border-red-700 text-center">
                <h3 className="text-xl font-bold text-red-600 dark:text-red-400">Oops!</h3>
                <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
                <button onClick={() => setStep(3)} className="mt-4 bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-all">
                    &larr; Go Back and Adjust
                </button>
            </div>
        )}
        {dietPlan && !isLoading && (
            <div className="animate-fade-in-up">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div>
                        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-3">Today's Meal Plan</h3>
                        <div className="space-y-4">
                            {dietPlan.meals.map((meal, index) => {
                                const Icon = getMealIcon(meal.time);
                                const isSpecial = meal.name.includes('Special');
                                const isExpanded = expandedMealIndex === index;
                                return (
                                <div 
                                    key={index} 
                                    onClick={() => setExpandedMealIndex(isExpanded ? null : index)}
                                    className={`relative p-6 rounded-lg shadow-sm border-l-4 transition-all duration-300 cursor-pointer ${isSpecial ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-400' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600'}`}
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
                                    {isExpanded && (
                                        <div 
                                            className="absolute top-2 right-2 flex items-center gap-1 animate-fade-in"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                           <button onClick={() => handleToggleFavorite(meal)} title={favoriteMeals.includes(meal.recipe) ? 'Remove from favorites' : 'Add to favorites'}>
                                               <HeartIcon isFavorite={favoriteMeals.includes(meal.recipe)} className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
                                           </button>
                                           <button onClick={() => handleSwapMeal(index)} title="Swap this meal">
                                               <SwapIcon className="w-5 h-5 text-gray-400 hover:text-orange-500 transition-colors"/>
                                           </button>
                                            <input type="checkbox" checked={checkedMeals[meal.recipe] ?? true} onChange={() => handleMealCheckChange(meal.recipe)} className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400 ml-1"/>
                                        </div>
                                    )}
                                </div>
                            )})}
                        </div>
                    </div>
                    <div>
                         <div className="sticky top-20 z-10">
                             <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 text-center mb-4">
                                <h4 className="font-bold text-orange-800 dark:text-orange-200">Total Intake</h4>
                                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{dietPlan.totalCalories} kcal</p>
                                <div className="text-xs mt-1 flex justify-center gap-x-3 text-orange-700 dark:text-orange-300">
                                    <span>P: {dietPlan.totalMacros.protein}g</span>
                                    <span>C: {dietPlan.totalMacros.carbohydrates}g</span>
                                    <span>F: {dietPlan.totalMacros.fat}g</span>
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
                
                {showNotificationPrompt && (
                    <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center border border-yellow-200 dark:border-yellow-700">
                        <p className="font-semibold text-yellow-800 dark:text-yellow-200">Want meal reminders?</p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">Enable notifications to get alerts for your meals and sleep log.</p>
                        <div className="mt-3 flex justify-center gap-4">
                            <button onClick={handleEnableNotifications} className="bg-yellow-400 text-yellow-900 font-bold py-2 px-4 rounded-lg text-sm">Enable</button>
                            <button onClick={() => setShowNotificationPrompt(false)} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg text-sm">Maybe Later</button>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default DietPlanner;