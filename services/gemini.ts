import { DietPlan, DietPreference, Sex, ActivityLevel, DietType, HealthCondition, Meal } from '../types';

const OFFLINE_DIET_PLANS: Record<string, Record<string, Record<string, DietPlan[]>>> = {
    "1400": {
        [DietPreference.VEGETARIAN]: {
            [DietType.BALANCED]: [
                {
                    meals: [
                        { name: "Breakfast", time: "10:00 AM", recipe: "1 cup Poha with vegetables, 1/2 lemon squeeze and peanuts.", calories: 350, macros: { protein: 10, carbohydrates: 60, fat: 9 } },
                        { name: "ObeCure Special Meal", time: "2:00 PM", recipe: "Based on Mini Paneer Protein Pizza: Multigrain roti (1) base, tomato puree, 50g grilled paneer, veggies, 20g mozzarella. Air fry.", calories: 380, macros: { protein: 20, carbohydrates: 45, fat: 14 } },
                        { name: "Evening Snack", time: "5:00 PM", recipe: "1 medium Apple and 10-12 Almonds.", calories: 200, macros: { protein: 5, carbohydrates: 25, fat: 10 } },
                        { name: "Dinner", time: "7:30 PM", recipe: "2 small Multigrain Rotis with 1 bowl of mixed vegetable curry and a side of cucumber-tomato salad.", calories: 470, macros: { protein: 15, carbohydrates: 75, fat: 12 } }
                    ],
                    totalCalories: 1400,
                    totalMacros: { protein: 50, carbohydrates: 205, fat: 45 }
                }
            ],
            [DietType.HIGH_PROTEIN]: [
                 {
                    meals: [
                        { name: "Breakfast", time: "10:00 AM", recipe: "3 Moong Dal Cheela (pancakes) with a side of 100g Greek Yogurt.", calories: 400, macros: { protein: 25, carbohydrates: 45, fat: 13 } },
                        { name: "ObeCure Special Meal", time: "2:00 PM", recipe: "Based on Tofu Burger: Whole wheat bun, 75g tofu patty with oats, hung curd sauce, and salad.", calories: 420, macros: { protein: 22, carbohydrates: 48, fat: 16 } },
                        { name: "Evening Snack", time: "5:00 PM", recipe: "1 scoop of whey protein in water.", calories: 120, macros: { protein: 25, carbohydrates: 3, fat: 1 } },
                        { name: "Dinner", time: "7:30 PM", recipe: "150g Paneer Bhurji with 1 small roti and green salad.", calories: 460, macros: { protein: 30, carbohydrates: 30, fat: 25 } }
                    ],
                    totalCalories: 1400,
                    totalMacros: { protein: 102, carbohydrates: 126, fat: 55 }
                }
            ]
        }
    },
    "1600": {
        [DietPreference.VEGETARIAN]: {
            [DietType.BALANCED]: [
                {
                    meals: [
                        { name: "Breakfast", time: "10:00 AM", recipe: "2 Oats Idli with 1 bowl of Sambhar.", calories: 400, macros: { protein: 15, carbohydrates: 65, fat: 9 } },
                        { name: "ObeCure Special Meal", time: "2:00 PM", recipe: "Based on Paneer Shawarma Roll: Whole wheat roti wrap with 60g paneer tikka, veggies, and hung curd garlic sauce.", calories: 400, macros: { protein: 18, carbohydrates: 45, fat: 17 } },
                        { name: "Evening Snack", time: "5:00 PM", recipe: "1 bowl of fruit salad with a sprinkle of chaat masala.", calories: 180, macros: { protein: 3, carbohydrates: 40, fat: 2 } },
                        { name: "Dinner", time: "8:00 PM", recipe: "1 bowl of brown rice with 1 bowl of Rajma (kidney bean curry) and a side of salad.", calories: 620, macros: { protein: 22, carbohydrates: 100, fat: 14 } }
                    ],
                    totalCalories: 1600,
                    totalMacros: { protein: 58, carbohydrates: 250, fat: 42 }
                }
            ]
        }
    },
     "1800": {
        [DietPreference.MEAT_ALLOWED]: {
            [DietType.HIGH_PROTEIN]: [
                {
                    meals: [
                        { name: "Breakfast", time: "9:00 AM", recipe: "4 Egg Whites scrambled with spinach and 2 slices of whole wheat toast.", calories: 400, macros: { protein: 30, carbohydrates: 35, fat: 15 } },
                        { name: "Lunch", time: "1:00 PM", recipe: "150g Grilled Chicken Breast with 1 cup of quinoa and steamed vegetables.", calories: 550, macros: { protein: 45, carbohydrates: 50, fat: 18 } },
                        { name: "Evening Snack", time: "4:30 PM", recipe: "1 scoop whey protein with an apple.", calories: 220, macros: { protein: 26, carbohydrates: 25, fat: 2 } },
                        { name: "ObeCure Special Meal", time: "7:30 PM", recipe: "Based on Protein Pasta: 60g whole wheat pasta with a sauce made from tomato, garlic, herbs, and 100g of minced chicken.", calories: 630, macros: { protein: 40, carbohydrates: 75, fat: 19 } }
                    ],
                    totalCalories: 1800,
                    totalMacros: { protein: 141, carbohydrates: 185, fat: 54 }
                }
            ]
        }
    }
};

const MEAL_ALTERNATIVES: Record<string, Meal[]> = {
    'Breakfast': [
        { name: "Breakfast Alternative", recipe: "Vegetable Oats Upma (1 large bowl).", calories: 320, macros: { protein: 12, carbohydrates: 55, fat: 6 }, time: '' },
        { name: "Breakfast Alternative", recipe: "2 Moong Dal Cheela with mint chutney.", calories: 350, macros: { protein: 18, carbohydrates: 40, fat: 12 }, time: '' },
    ],
    'Lunch': [
        { name: "Lunch Alternative", recipe: "1 bowl Quinoa with chickpeas and roasted vegetables.", calories: 450, macros: { protein: 18, carbohydrates: 70, fat: 12 }, time: '' },
        { name: "Lunch Alternative", recipe: "Tofu and vegetable stir-fry with 1/2 cup brown rice.", calories: 420, macros: { protein: 20, carbohydrates: 55, fat: 13 }, time: '' },
    ],
    'Dinner': [
         { name: "Dinner Alternative", recipe: "Large bowl of Lentil and Vegetable Soup with a slice of multigrain bread.", calories: 400, macros: { protein: 20, carbohydrates: 60, fat: 8 }, time: '' },
         { name: "Dinner Alternative", recipe: "150g grilled fish with a side of sautéed green beans and carrots.", calories: 380, macros: { protein: 35, carbohydrates: 15, fat: 18 }, time: '' },
    ],
    'Evening Snack': [
        { name: "Snack Alternative", recipe: "1 cup of Greek Yogurt with berries.", calories: 150, macros: { protein: 15, carbohydrates: 12, fat: 4 }, time: '' },
        { name: "Snack Alternative", recipe: "A handful of walnuts and a pear.", calories: 250, macros: { protein: 6, carbohydrates: 25, fat: 16 }, time: '' },
    ]
};


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

const calculateCalorieTarget = (params: GenerateDietPlanParams): number => {
    const weight = parseFloat(params.patientWeight);
    const height = parseFloat(params.height);
    const age = parseFloat(params.age);

    if (isNaN(weight) || isNaN(height) || isNaN(age) || weight <= 0 || height <= 0 || age <= 0) {
        return 1600; // Return a sensible default
    }

    const s = params.sex === Sex.MALE ? 5 : -161;
    const bmr = (10 * weight) + (6.25 * height) - (5 * age) + s;

    let activityFactor = 1.2;
    switch (params.activityLevel) {
        case ActivityLevel.LIGHTLY_ACTIVE: activityFactor = 1.375; break;
        case ActivityLevel.MODERATELY_ACTIVE: activityFactor = 1.55; break;
        case ActivityLevel.VERY_ACTIVE: activityFactor = 1.725; break;
    }

    const tdee = bmr * activityFactor;
    const calorieTarget = tdee * 0.775;
    return Math.round(calorieTarget / 200) * 200; // Round to nearest 200 for our data keys
};


export const generateDietPlan = async (params: GenerateDietPlanParams): Promise<DietPlan> => {
  const calorieTarget = calculateCalorieTarget(params);
  const calorieKey = String(Math.max(1400, Math.min(1800, calorieTarget))); // Clamp to available keys

  // Fallback logic
  let plans = OFFLINE_DIET_PLANS[calorieKey]?.[params.preference]?.[params.dietType];
  if (!plans) plans = OFFLINE_DIET_PLANS[calorieKey]?.[params.preference]?.[DietType.BALANCED];
  if (!plans) plans = OFFLINE_DIET_PLANS[calorieKey]?.[DietPreference.VEGETARIAN]?.[DietType.BALANCED];
  if (!plans) plans = OFFLINE_DIET_PLANS["1600"]?.[DietPreference.VEGETARIAN]?.[DietType.BALANCED]; // Ultimate fallback

  if (!plans || plans.length === 0) {
      throw new Error("Could not find a suitable offline diet plan.");
  }
  
  const selectedPlan = plans[Math.floor(Math.random() * plans.length)];
  
  // Simulate network delay for better UX
  await new Promise(resolve => setTimeout(resolve, 500));

  return selectedPlan;
};

export interface RefineMealParams {
  mealToRefine: Meal;
  refinementType: 'Suggest Alternative' | 'Make it Quicker' | 'Lower Calories';
  fullDietPlan: DietPlan;
}

export const refineMeal = async (params: RefineMealParams): Promise<Meal> => {
    const { mealToRefine } = params;

    let mealCategory: keyof typeof MEAL_ALTERNATIVES | null = null;
    if (mealToRefine.name.toLowerCase().includes('breakfast')) mealCategory = 'Breakfast';
    else if (mealToRefine.name.toLowerCase().includes('lunch') || mealToRefine.name.toLowerCase().includes('special')) mealCategory = 'Lunch';
    else if (mealToRefine.name.toLowerCase().includes('dinner')) mealCategory = 'Dinner';
    else if (mealToRefine.name.toLowerCase().includes('snack')) mealCategory = 'Evening Snack';

    if (!mealCategory) {
        // Fallback to Lunch if type is unknown
        mealCategory = 'Lunch';
    }

    const alternatives = MEAL_ALTERNATIVES[mealCategory];
    if (!alternatives || alternatives.length === 0) {
        throw new Error(`No alternatives found for ${mealCategory}`);
    }

    // Find an alternative with a calorie count close to the original
    const sortedAlts = [...alternatives].sort((a, b) => 
        Math.abs(a.calories - mealToRefine.calories) - Math.abs(b.calories - mealToRefine.calories)
    );
    
    const newMeal = { ...sortedAlts[0] };
    newMeal.time = mealToRefine.time; // Preserve the original meal time

    // Simulate network delay for UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return newMeal;
};
