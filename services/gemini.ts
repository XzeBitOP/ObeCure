import { GoogleGenAI, Type } from '@google/genai';
import { DietPlan, DietPreference, Sex, ActivityLevel, DietType, HealthCondition } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const OBE_CURE_SPECIAL_MEALS = `
    🍕 1. Mini Paneer Protein Pizza – 380 kcal
    Recipe: Base: Multigrain roti (1 medium), Toppings: Tomato puree (2 tbsp), grilled paneer cubes (50 g), onion, capsicum, 20 g mozzarella. Method: Bake or air fry for 6–8 min.

    🍔 2. Tofu Burger – 420 kcal
    Recipe: Bun: Whole wheat bun. Patty: Crumbled tofu (75 g) + oats (2 tbsp) + herbs. Sauce: Hung curd + mustard. Add-ons: Tomato, lettuce, onion.

    🌭 3. Air-Fried Samosa – 240 kcal (2 pieces)
    Recipe: Filling: Sweet potato (100 g) + peas + spices. Wrapper: Whole wheat or phyllo sheet. Cooking: Air fry 10 min.

    🌯 4. Paneer Shawarma Roll – 400 kcal
    Recipe: Wrap: Whole wheat roti. Filling: Paneer tikka (60 g) + veggies + hung curd garlic sauce.

    🍜 5. Protein Maggi – 350 kcal
    Recipe: Base: Rice noodles (50 g dry). Add: 1/2 Maggi masala + tofu/paneer cubes (40 g) + veggies.

    🍟 6. Air-Fried Potato Wedges – 280 kcal
    Recipe: Potato: 150 g. Coat: Olive oil spray + paprika + salt. Cook: Air fry till crisp.

    🌮 7. Chickpea Nachos Bowl – 390 kcal
    Recipe: Base: Roasted chickpeas (50 g). Toppings: Salsa, hung curd dip, olives, onions.

    🍲 8. Moong Dal Chaat – 300 kcal
    Recipe: Base: Sprouted moong (1 cup). Toppings: Onion, tomato, mint chutney, sev (1 tsp).

    🌯 9. Air-Fried Paneer Frankie – 390 kcal
    Recipe: Wrap: Whole wheat roti. Filling: Paneer bhurji + onion + mint curd sauce.

    🥗 10. Bhel Puri Remix – 250 kcal
    Recipe: Base: Makhana (roasted, 1 cup) + puffed rice (½ cup). Add: Veggies, chutneys (no sugar), lemon.

    🍘 11. Oats Pizza Crackers – 280 kcal
    Recipe: Base: Oats flour crackers (homemade or store). Top: Tomato, capsicum, cheese. Bake: 5 min.

    🥪 12. Grilled Veg Sandwich – 330 kcal
    Recipe: Bread: High-protein multigrain. Filling: Paneer + veggies + hung curd.

    🧆 13. Soya Kebabs – 360 kcal (4 pieces)
    Recipe: Mix: Soya granules + oats + herbs. Cook: Grill / air fry.

    🍝 14. Protein Pasta – 410 kcal
    Recipe: Base: Whole wheat pasta (60 g dry). Sauce: Tomato + tofu + garlic + herbs.

    🍩 15. Protein Mug Cake – 200 kcal
    Recipe: Mix: 1 scoop whey + 1 tbsp cocoa + baking powder + almond milk. Microwave: 90 sec.

    🍨 16. Greek Yogurt Ice Cream – 220 kcal
    Recipe: Mix: 150 g Greek yogurt + stevia + cocoa or coffee. Freeze: 3 hrs.

    🍫 17. Peanut Butter Choco Balls – 230 kcal (2 balls)
    Recipe: Mix: Oats powder + peanut butter + stevia + cocoa.

    🍘 18. Air-Fried Cutlets – 280 kcal (2 pieces)
    Recipe: Base: Mixed veg + soya + oat crumbs.

    🍳 19. Eggless High-Protein Omelette – 250 kcal
    Recipe: Mix: Moong dal paste + onion + tomato + chilli. Cook: Non-stick pan.

    🧋 20. Protein Cold Coffee – 180 kcal
    Recipe: Blend: 1 scoop whey + 150 ml almond milk + instant coffee + ice.
`;

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
        return 2000;
    }

    // Mifflin-St Jeor equation for BMR
    const s = params.sex === Sex.MALE ? 5 : -161;
    const bmr = (10 * weight) + (6.25 * height) - (5 * age) + s;

    // Activity factor
    let activityFactor = 1.2; // Sedentary
    switch (params.activityLevel) {
        case ActivityLevel.LIGHTLY_ACTIVE:
            activityFactor = 1.375;
            break;
        case ActivityLevel.MODERATELY_ACTIVE:
            activityFactor = 1.55;
            break;
        case ActivityLevel.VERY_ACTIVE:
            activityFactor = 1.725;
            break;
    }

    const tdee = bmr * activityFactor;
    const calorieTarget = tdee * 0.775; // ~22.5% deficit for weight loss
    return Math.round(calorieTarget / 50) * 50; // Round to nearest 50
};


export const generateDietPlan = async (
  params: GenerateDietPlanParams
): Promise<DietPlan> => {
  const calorieTarget = calculateCalorieTarget(params);
  
  const prompt = `
    You are an expert nutritionist for an Indian obesity clinic called ObeCure.
    Your task is to create a simple, healthy, and balanced one-day Indian diet plan based on the user's specific details.

    User Details:
    - Weight: ${params.patientWeight} kg
    - Height: ${params.height} cm
    - Age: ${params.age} years
    - Sex: ${params.sex}
    - Dietary Preference: ${params.preference}
    - Diet Goal: ${params.dietType}
    - Existing Health Conditions: ${params.healthConditions.length > 0 ? params.healthConditions.join(', ') : 'None specified'}
    - Intermittent Fasting Window: Eat between ${params.fastingStartTime} and ${params.fastingEndTime}.
    - **Target Daily Calorie Intake: Approximately ${calorieTarget} kcal.**

    INSTRUCTIONS:

    1.  **Create the Diet Plan:**
        -   Generate a diet plan with Breakfast, Lunch, Dinner, and an optional Evening Snack. The total calories for all meals combined must be very close to the target of ${calorieTarget} kcal.
        -   **Crucially, all meals must be scheduled within the user's eating window: ${params.fastingStartTime} to ${params.fastingEndTime}. Provide a suggested time for each meal in the 'time' field.**
        -   The plan must be tailored to the user's health conditions and diet goal. For example: for Diabetes, use low-GI foods; for Hypertension, lower sodium; for High Protein goal, increase protein sources.
        -   The recipes should use common, easily available Indian ingredients. Keep meals simple and easy to prepare.

    2.  **Include ObeCure Special Meal:**
        -   You MUST replace one of the main meals (Lunch or Dinner) with an "ObeCure Special Meal" chosen from the provided list below.
        -   Choose exactly ONE meal from this list. Do not invent a new one.
        -   The name of this meal in the final JSON output MUST be "ObeCure Special Meal".
        -   Use the calorie count, recipe, and estimate macros for the chosen meal, then adjust other meals to meet the daily targets.

    3.  **Macronutrient Breakdown:**
        -   For each meal, provide an estimated breakdown of macronutrients (protein, carbohydrates, fat) in grams.
        -   The total macros for the day should reflect the user's Diet Goal (e.g., higher protein for 'High Protein', lower carbs for 'Low Carb').

    **List of ObeCure Special Meals:**
    ${OBE_CURE_SPECIAL_MEALS}

    Provide the final output in the specified JSON format.
    `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          meals: {
            type: Type.ARRAY,
            description: 'A list of meals for the day.',
            items: {
              type: Type.OBJECT,
              properties: {
                name: {
                  type: Type.STRING,
                  description: 'Name of the meal (e.g., Breakfast, ObeCure Special Meal).',
                },
                time: {
                    type: Type.STRING,
                    description: "The suggested time to eat the meal (e.g., '10:00 AM'), respecting the user's fasting window."
                },
                recipe: {
                  type: Type.STRING,
                  description: 'A simple recipe or list of food items for the meal.',
                },
                calories: {
                  type: Type.INTEGER,
                  description: 'Approximate calorie count for the meal.',
                },
                macros: {
                    type: Type.OBJECT,
                    description: 'Macro-nutrient breakdown for the meal.',
                    properties: {
                        protein: { type: Type.INTEGER, description: 'Protein in grams.' },
                        carbohydrates: { type: Type.INTEGER, description: 'Carbohydrates in grams.' },
                        fat: { type: Type.INTEGER, description: 'Fat in grams.' }
                    },
                    required: ['protein', 'carbohydrates', 'fat']
                }
              },
               required: ['name', 'time', 'recipe', 'calories', 'macros'],
            },
          },
          totalCalories: {
            type: Type.INTEGER,
            description: 'The sum of calories for all meals.',
          },
          totalMacros: {
            type: Type.OBJECT,
            description: 'The sum of macros for all meals.',
            properties: {
                protein: { type: Type.INTEGER, description: 'Total protein in grams.' },
                carbohydrates: { type: Type.INTEGER, description: 'Total carbohydrates in grams.' },
                fat: { type: Type.INTEGER, description: 'Total fat in grams.' }
            },
            required: ['protein', 'carbohydrates', 'fat']
          }
        },
        required: ['meals', 'totalCalories', 'totalMacros'],
      },
    },
  });

  const jsonText = response.text.trim();
  return JSON.parse(jsonText) as DietPlan;
};