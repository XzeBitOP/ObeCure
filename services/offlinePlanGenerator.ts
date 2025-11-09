import { DietPlan, DietPreference, Sex, ActivityLevel, DietType, HealthCondition, Meal, MealType } from '../types';
import { MEAL_DATABASE, OfflineMeal } from '../data/mealDatabase';
import { OBE_CURE_SPECIAL_MEALS } from '../data/specialMeals';

const RECENTLY_USED_MEALS_KEY = 'obeCureRecentlyUsedMeals';
const HISTORY_SIZE = 50; // Store more meal IDs to ensure greater variety across sessions

export interface GenerateDietPlanParams {
  patientWeight: string;
  height: string;
  age: string;
  sex: Sex;
  activityLevel: ActivityLevel;
  preference: DietPreference;
  healthConditions: HealthCondition[];
  dietType: DietType;
  fastingStartTime: string;
  fastingEndTime: string;
}

const getActivityFactor = (level: ActivityLevel): number => {
    switch (level) {
        case ActivityLevel.SEDENTARY: return 1.2;
        case ActivityLevel.LIGHTLY_ACTIVE: return 1.375;
        case ActivityLevel.MODERATELY_ACTIVE: return 1.55;
        case ActivityLevel.VERY_ACTIVE: return 1.725;
        default: return 1.375;
    }
};

const getRecentlyUsedMeals = (): string[] => {
    try {
        const stored = localStorage.getItem(RECENTLY_USED_MEALS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
};

const saveRecentlyUsedMeals = (newMealIds: string[]) => {
    const existing = getRecentlyUsedMeals();
    const updated = [...newMealIds, ...existing]; // Prepend new meals
    const uniqueIds = [...new Set(updated)]; // Ensure uniqueness
    const pruned = uniqueIds.slice(0, HISTORY_SIZE); // Keep the most recent N unique meals
    localStorage.setItem(RECENTLY_USED_MEALS_KEY, JSON.stringify(pruned));
};

const findBestMeal = (
    availableMeals: OfflineMeal[],
    calorieTarget: number,
    variance: number = 100
): OfflineMeal | null => {
    if (availableMeals.length === 0) return null;

    let bestFit: OfflineMeal | null = null;
    let smallestDiff = Infinity;

    for (const meal of availableMeals) {
        const diff = Math.abs(meal.calories - calorieTarget);
        if (diff < smallestDiff) {
            smallestDiff = diff;
            bestFit = meal;
        }
    }
    // Only return if it's within acceptable variance, otherwise pick a random one to ensure variety
    return smallestDiff <= variance ? bestFit : availableMeals[Math.floor(Math.random() * availableMeals.length)];
};

const isHighProtein = (meal: OfflineMeal | Meal): boolean => {
    // Protein calories should be >= 25% of total calories
    return (meal.macros.protein * 4) >= (meal.calories * 0.25);
};

const isLowCarb = (meal: OfflineMeal | Meal): boolean => {
    // Carb calories should be <= 25% of total calories
    return (meal.macros.carbohydrates * 4) <= (meal.calories * 0.25);
};

export const generateOfflineDietPlan = (
  params: GenerateDietPlanParams
): DietPlan | null => {
    const { patientWeight, height, age, sex, activityLevel, preference, healthConditions, dietType } = params;

    const weightKg = parseFloat(patientWeight);
    const heightCm = parseFloat(height);
    const ageYrs = parseFloat(age);

    if (isNaN(weightKg) || isNaN(heightCm) || isNaN(ageYrs)) {
        throw new Error("Invalid numeric inputs for weight, height, or age.");
    }
    
    // 1. Calculate Calorie Target
    const bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYrs) + (sex === Sex.MALE ? 5 : -161);
    const tdee = bmr * getActivityFactor(activityLevel);
    
    let calorieTarget: number;
    if (dietType === DietType.WEIGHT_GAIN) {
        calorieTarget = tdee + 400; // ~400 calorie surplus for weight gain
    } else {
        calorieTarget = tdee - 500; // Standard 500 calorie deficit for weight loss
    }

    // 2. Filter meal database
    const recentlyUsed = getRecentlyUsedMeals();
    
    const isRelevant = (meal: OfflineMeal): boolean => {
        const dietMatch = meal.dietPreference.includes(preference);
        const healthMatch = healthConditions.length === 0 || healthConditions.every(c => meal.healthTags.includes(c));
        return dietMatch && healthMatch;
    };

    let availableMeals = MEAL_DATABASE.filter(isRelevant);

    // Prioritize meals based on Diet Goal
    if (dietType === DietType.HIGH_PROTEIN || dietType === DietType.WEIGHT_GAIN) {
        const highProteinMeals = availableMeals.filter(isHighProtein);
        if (highProteinMeals.length >= 10) {
            availableMeals = highProteinMeals;
        }
    } else if (dietType === DietType.LOW_CARB) {
        const lowCarbMeals = availableMeals.filter(isLowCarb);
        if (lowCarbMeals.length >= 10) {
            availableMeals = lowCarbMeals;
        }
    }
    
    let filteredForVariety = availableMeals.filter(m => !recentlyUsed.includes(m.id));

    // Fallback if variety filter removes too many options
    if (filteredForVariety.length < 10) {
        filteredForVariety = availableMeals;
    }

    // 3. Select meals
    const planMeals: Meal[] = [];
    const usedMealIdsInPlan: string[] = [];
    let remainingCalories = calorieTarget;

    const mealSlotsToFill: (MealType | 'Special')[] = dietType === DietType.WEIGHT_GAIN 
// FIX: Changed meal type strings to lowercase to match the MealType enum.
        ? ['breakfast', 'snack', 'lunch', 'snack', 'dinner'] 
        : ['breakfast', 'Special', 'dinner', 'snack']; // Special replaces Lunch or Dinner

    if (dietType !== DietType.WEIGHT_GAIN) {
        // Randomly decide if the special meal is Lunch or Dinner
        if (Math.random() > 0.5) {
// FIX: Changed 'Lunch' to 'lunch' to match the MealType enum.
           mealSlotsToFill[1] = 'lunch';
           mealSlotsToFill.splice(2, 0, 'Special');
        }
    }

    let snackCount = 0;
    for (const slot of mealSlotsToFill) {
        if (slot === 'Special') {
            const specialMeal = { ...OBE_CURE_SPECIAL_MEALS[Math.floor(Math.random() * OBE_CURE_SPECIAL_MEALS.length)] };
// FIX: Changed 'Lunch' to 'lunch' to match the MealType enum.
            const time = mealSlotsToFill.includes('lunch') ? '08:00 PM' : '01:00 PM'; // Assign to the slot that's missing
// FIX: Changed 'Lunch' and 'Dinner' to 'lunch' and 'dinner' respectively.
            const mealType: MealType = time === '01:00 PM' ? 'lunch' : 'dinner';
            planMeals.push({ ...specialMeal, time, mealType });
            remainingCalories -= specialMeal.calories;
            continue;
        }

        const numRemainingSlots = mealSlotsToFill.length - planMeals.length;
        const slotCalorieTarget = remainingCalories / (numRemainingSlots > 0 ? numRemainingSlots : 1);
        
        const slotMeals = filteredForVariety.filter(m => m.mealType === slot && !usedMealIdsInPlan.includes(m.id));
        const bestMeal = findBestMeal(slotMeals, slotCalorieTarget, dietType === DietType.WEIGHT_GAIN ? 200 : 150);

        if (bestMeal) {
            let time: string;
// FIX: Changed 'Snack' to 'snack' to match the MealType enum.
            if (slot === 'snack') {
                time = snackCount === 0 ? '04:00 PM' : '11:00 AM';
                snackCount++;
            } else {
// FIX: Changed timeMap keys to lowercase to match the MealType enum.
                const timeMap: { [key in MealType]?: string } = { breakfast: '09:00 AM', lunch: '01:00 PM', dinner: '08:00 PM' };
                time = timeMap[slot] || 'N/A';
            }

            planMeals.push({
                name: bestMeal.name,
                recipe: bestMeal.recipe,
                calories: bestMeal.calories,
                macros: bestMeal.macros,
                time,
                mealType: bestMeal.mealType
            });
            usedMealIdsInPlan.push(bestMeal.id);
            remainingCalories -= bestMeal.calories;
        }
    }

    if (planMeals.length < 3) return null; // Not enough meals found

    // 4. Finalize and return
    const totalCalories = planMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalMacros = planMeals.reduce((totals, meal) => ({
        protein: totals.protein + meal.macros.protein,
        carbohydrates: totals.carbohydrates + meal.macros.carbohydrates,
        fat: totals.fat + meal.macros.fat,
    }), { protein: 0, carbohydrates: 0, fat: 0 });

    // Sort meals by time for display
    const mealTimeOrder: Record<string, number> = { '09:00 AM': 1, '11:00 AM': 2, '01:00 PM': 3, '04:00 PM': 4, '08:00 PM': 5 };
    planMeals.sort((a, b) => mealTimeOrder[a.time || ''] - mealTimeOrder[b.time || '']);
    
    saveRecentlyUsedMeals(usedMealIdsInPlan);
    
    return {
        meals: planMeals,
        totalCalories,
        totalMacros,
    };
};

export const findSwapMeal = (
    mealToReplace: Meal,
    currentPlanMeals: Meal[],
    params: { preference: DietPreference, healthConditions: HealthCondition[], dietType: DietType, mealType: MealType }
): Meal | null => {
    const { preference, healthConditions, dietType, mealType } = params;

    const isRelevant = (meal: OfflineMeal): boolean => {
        const dietMatch = meal.dietPreference.includes(preference);
        const healthMatch = healthConditions.length === 0 || healthConditions.every(c => meal.healthTags.includes(c));
        return dietMatch && healthMatch;
    };

    let availableMeals = MEAL_DATABASE.filter(m => m.mealType === mealType && isRelevant(m));

    const currentMealRecipes = currentPlanMeals.map(m => m.recipe);
    availableMeals = availableMeals.filter(m => !currentMealRecipes.includes(m.recipe));

    if (availableMeals.length === 0) return null;

    if (dietType === DietType.HIGH_PROTEIN) {
        const highProteinSwaps = availableMeals.filter(isHighProtein);
        if (highProteinSwaps.length > 0) availableMeals = highProteinSwaps;
    } else if (dietType === DietType.LOW_CARB) {
        const lowCarbSwaps = availableMeals.filter(isLowCarb);
        if (lowCarbSwaps.length > 0) availableMeals = lowCarbSwaps;
    }
    
    const bestFit = findBestMeal(availableMeals, mealToReplace.calories, 100);

    if (bestFit) {
        return {
            ...bestFit,
            time: mealToReplace.time
        };
    }
    
    return null;
};
