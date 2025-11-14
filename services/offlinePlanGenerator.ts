import { DietPreference, HealthCondition, Meal, MealType, DietType } from '../types';
import { MEAL_DATABASE, OfflineMeal } from '../data/mealDatabase';
import { OBE_CURE_SPECIAL_MEALS } from '../data/specialMeals';

const isHighProtein = (meal: OfflineMeal | Meal): boolean => {
    // Protein calories should be >= 25% of total calories
    return (meal.macros.protein * 4) >= (meal.calories * 0.25);
};

const isLowCarb = (meal: OfflineMeal | Meal): boolean => {
    // Carb calories should be <= 25% of total calories
    return (meal.macros.carbohydrates * 4) <= (meal.calories * 0.25);
};

export const findTwoMealOptions = (
    params: { preference: DietPreference, healthConditions: HealthCondition[], dietType: DietType, favoriteMealNames: string[] },
    mealType: MealType,
    calorieTarget: number,
    excludedMealIds: string[]
): Meal[] => {
    const { preference, healthConditions, dietType, favoriteMealNames } = params;

    const isRelevant = (meal: OfflineMeal): boolean => {
        const dietMatch = meal.dietPreference.includes(preference);
        const healthMatch = healthConditions.length === 0 || healthConditions.every(c => meal.healthTags.includes(c));
        return dietMatch && healthMatch;
    };
    
    let availableMeals = MEAL_DATABASE.filter(isRelevant);
    
    if (dietType === DietType.HIGH_PROTEIN || dietType === DietType.WEIGHT_GAIN) {
        availableMeals = availableMeals.filter(isHighProtein);
    } else if (dietType === DietType.LOW_CARB) {
        availableMeals = availableMeals.filter(isLowCarb);
    }

    const slotMeals = availableMeals.filter(m => m.mealType === mealType && !excludedMealIds.includes(m.id));

    if (slotMeals.length < 2) {
        const fallbackMeals = MEAL_DATABASE.filter(m => m.mealType === mealType && !excludedMealIds.includes(m.id));
        return fallbackMeals.sort(() => 0.5 - Math.random()).slice(0, 2).map(m => ({ ...m, mealType, recipe: m.recipe }));
    }

    // Prioritize favorites
    const favoriteOptions = slotMeals.filter(m => favoriteMealNames.includes(m.name));
    const nonFavoriteOptions = slotMeals.filter(m => !favoriteMealNames.includes(m.name));

    let option1: OfflineMeal | undefined;
    let option2: OfflineMeal | undefined;

    if (favoriteOptions.length > 0 && Math.random() < 0.7) { // 70% chance to show a favorite
        option1 = favoriteOptions[Math.floor(Math.random() * favoriteOptions.length)];
    }

    // Find a second distinct option
    if (option1) {
        const otherOptions = nonFavoriteOptions.length > 0 ? nonFavoriteOptions : slotMeals.filter(m => m.id !== option1!.id);
        otherOptions.sort((a, b) => Math.abs(a.calories - calorieTarget) - Math.abs(b.calories - calorieTarget));
        option2 = otherOptions[0];
    } else {
        // If no favorite was picked, just get the two best calorie matches
        slotMeals.sort((a, b) => Math.abs(a.calories - calorieTarget) - Math.abs(b.calories - calorieTarget));
        option1 = slotMeals[0];
        option2 = slotMeals.find(m => m.id !== option1.id && Math.abs(m.calories - option1.calories) > 30) || slotMeals[1];
    }
    
    const toMeal = (m: OfflineMeal): Meal => ({
        name: m.name, recipe: m.recipe, calories: m.calories, macros: m.macros, mealType: m.mealType,
    });
    
    if (!option1 || !option2) return [];

    return [toMeal(option1), toMeal(option2)];
};


export const findSwapMeal = (params: {
    preference: DietPreference,
    healthConditions: HealthCondition[],
    dietType: DietType,
    mealType: MealType,
    calorieTarget: number,
    currentPlanMeals: Meal[]
}): Meal | null => {
    const { preference, healthConditions, dietType, mealType, calorieTarget, currentPlanMeals } = params;
    
    const isRelevant = (meal: OfflineMeal): boolean => {
        const dietMatch = meal.dietPreference.includes(preference);
        const healthMatch = healthConditions.length === 0 || healthConditions.every(c => meal.healthTags.includes(c));
        const notInPlan = !currentPlanMeals.some(planMeal => planMeal.recipe === meal.recipe);
        return dietMatch && healthMatch && notInPlan;
    };

    let availableMeals = MEAL_DATABASE.filter(isRelevant);
    
    if (dietType === DietType.HIGH_PROTEIN || dietType === DietType.WEIGHT_GAIN) {
        availableMeals = availableMeals.filter(isHighProtein);
    } else if (dietType === DietType.LOW_CARB) {
        availableMeals = availableMeals.filter(isLowCarb);
    }

    const mealTypeToSwap = mealType === 'Snack' ? 'Snack' : ['Breakfast', 'Lunch', 'Dinner'].includes(mealType) ? mealType : 'Lunch'; // Default for special meals
    const potentialSwaps = availableMeals.filter(m => m.mealType === mealTypeToSwap);
    
    if (potentialSwaps.length === 0) return null;

    potentialSwaps.sort((a, b) => Math.abs(a.calories - calorieTarget) - Math.abs(b.calories - calorieTarget));

    const bestSwap = potentialSwaps[0];

    return {
        ...bestSwap,
        time: currentPlanMeals.find(m => m.mealType === mealType)?.time || 'N/A',
        mealType: mealTypeToSwap
    };
};