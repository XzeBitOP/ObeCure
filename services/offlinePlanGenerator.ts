import { DietPlan, DietPreference, Sex, ActivityLevel, DietType, HealthCondition, Meal } from '../types';
import { MEAL_DATABASE, OfflineMeal, MealType } from '../data/mealDatabase';
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

const isHighProtein = (meal: OfflineMeal): boolean => {
    // Protein calories should be >= 25% of total calories
    return (meal.macros.protein * 4) >= (meal.calories * 0.25);
};

const isLowCarb = (meal: OfflineMeal): boolean => {
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
    const calorieTarget = tdee - 500; // Standard 500 calorie deficit for weight loss

    // 2. Filter meal database
    const recentlyUsed = getRecentlyUsedMeals();
    
    const isRelevant = (meal: OfflineMeal): boolean => {
        const dietMatch = meal.dietPreference.includes(preference);
        const healthMatch = healthConditions.length === 0 || healthConditions.every(c => meal.healthTags.includes(c));
        return dietMatch && healthMatch;
    };

    let availableMeals = MEAL_DATABASE.filter(isRelevant);

    // Prioritize meals based on Diet Goal
    if (dietType === DietType.HIGH_PROTEIN) {
        const highProteinMeals = availableMeals.filter(isHighProtein);
        // Only use this subset if it provides a reasonable number of options
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
    
    // 3.1. MUST include one ObeCure Special Meal for Lunch or Dinner
    const specialMeal = { ...OBE_CURE_SPECIAL_MEALS[Math.floor(Math.random() * OBE_CURE_SPECIAL_MEALS.length)] };
    const specialMealSlot = Math.random() > 0.5 ? 'Lunch' : 'Dinner';
    
    planMeals.push({ ...specialMeal, time: specialMealSlot === 'Lunch' ? '01:00 PM' : '08:00 PM'});
    
    const mealSlots: MealType[] = ['Breakfast', 'Snack'];
    if (specialMealSlot === 'Lunch') {
        mealSlots.push('Dinner');
    } else {
        mealSlots.push('Lunch');
    }

    const calorieDistribution = {
        Breakfast: 0.25,
        Lunch: 0.35,
        Dinner: 0.30,
        Snack: 0.10,
    };

    // 3.2 Select other meals
    for (const slot of mealSlots) {
        const slotCalorieTarget = calorieTarget * calorieDistribution[slot];
        const slotMeals = filteredForVariety.filter(m => m.mealType === slot && !usedMealIdsInPlan.includes(m.id));
        const bestMeal = findBestMeal(slotMeals, slotCalorieTarget, 150);

        if (bestMeal) {
            planMeals.push({
                name: bestMeal.name,
                recipe: bestMeal.recipe,
                calories: bestMeal.calories,
                macros: bestMeal.macros,
                time: slot === 'Breakfast' ? '09:00 AM' : slot === 'Snack' ? '04:00 PM' : '01:00 PM', // Simplified time
            });
            usedMealIdsInPlan.push(bestMeal.id);
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
    const mealTimeOrder: Record<string, number> = { '09:00 AM': 1, '01:00 PM': 2, '04:00 PM': 3, '08:00 PM': 4 };
    planMeals.sort((a, b) => mealTimeOrder[a.time || ''] - mealTimeOrder[b.time || '']);
    
    saveRecentlyUsedMeals(usedMealIdsInPlan);
    
    return {
        meals: planMeals,
        totalCalories,
        totalMacros,
    };
};