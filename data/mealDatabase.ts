

import { DietPreference, HealthCondition, Macros, MealType } from '../types';

export interface OfflineMeal {
  id: string;
  name: string;
  recipe: string;
  calories: number;
  macros: Macros;
  mealType: MealType;
  dietPreference: DietPreference[];
  healthTags: HealthCondition[];
}

export const MEAL_DATABASE: OfflineMeal[] = [
  // Breakfasts
  {
    id: 'B01',
    name: 'Masala Oats',
    recipe: 'Cook 40g of oats with water/milk. Add chopped carrots, peas, onions. Season with turmeric, cumin, and salt.',
    calories: 250,
    macros: { protein: 8, carbohydrates: 40, fat: 6 },
    mealType: 'breakfast',
    dietPreference: [DietPreference.VEGETARIAN, DietPreference.VEGAN],
    healthTags: [HealthCondition.DIABETES, HealthCondition.CHOLESTEROL, HealthCondition.HEART_DISEASE, HealthCondition.PCOS]
  },
  {
    id: 'B02',
    name: 'Moong Dal Chilla',
    recipe: '2 medium chillas made from moong dal batter, with a filling of 25g crumbled paneer. Cook with minimal oil.',
    calories: 300,
    macros: { protein: 15, carbohydrates: 30, fat: 12 },
    mealType: 'breakfast',
    dietPreference: [DietPreference.VEGETARIAN],
    healthTags: [HealthCondition.DIABETES, HealthCondition.PCOS, HealthCondition.HYPERTENSION]
  },
  {
    id: 'B03',
    name: 'Vegetable Poha',
    recipe: '1 cup Poha cooked with mustard seeds, onions, peas, and potatoes. Garnish with lemon juice and coriander.',
    calories: 280,
    macros: { protein: 6, carbohydrates: 55, fat: 4 },
    mealType: 'breakfast',
    dietPreference: [DietPreference.VEGETARIAN, DietPreference.VEGAN],
    healthTags: [HealthCondition.CHOLESTEROL, HealthCondition.KNEE_PAIN]
  },
  {
    id: 'B04',
    name: 'Egg Bhurji & Toast',
    recipe: '2 scrambled eggs with onion, tomato, and spices. Served with 2 slices of whole wheat toast.',
    calories: 350,
    macros: { protein: 18, carbohydrates: 30, fat: 16 },
    mealType: 'breakfast',
    dietPreference: [DietPreference.MEAT_ALLOWED],
    healthTags: [HealthCondition.DIABETES, HealthCondition.THYROID, HealthCondition.PCOS]
  },
  {
    id: 'B05',
    name: 'Besan Chilla',
    recipe: '2 medium chillas made from gram flour (besan) batter with chopped tomatoes and onions.',
    calories: 260,
    macros: { protein: 12, carbohydrates: 28, fat: 10 },
    mealType: 'breakfast',
    dietPreference: [DietPreference.VEGETARIAN, DietPreference.VEGAN],
    healthTags: [HealthCondition.DIABETES, HealthCondition.PCOS]
  },
  {
    id: 'B06',
    name: 'Greek Yogurt with Fruits',
    recipe: '150g of Greek yogurt topped with 1/2 cup of mixed berries and 1 tbsp of chia seeds.',
    calories: 220,
    macros: { protein: 16, carbohydrates: 20, fat: 8 },
    mealType: 'breakfast',
    dietPreference: [DietPreference.VEGETARIAN],
    healthTags: [HealthCondition.HEART_DISEASE, HealthCondition.CHOLESTEROL, HealthCondition.THYROID]
  },
   {
    id: 'B07',
    name: 'Tofu Scramble',
    recipe: '100g crumbled tofu sautéed with turmeric, onions, bell peppers, and spinach.',
    calories: 250,
    macros: { protein: 20, carbohydrates: 8, fat: 16 },
    mealType: 'breakfast',
    dietPreference: [DietPreference.VEGAN, DietPreference.VEGETARIAN],
    healthTags: [HealthCondition.PCOS, HealthCondition.DIABETES, HealthCondition.THYROID],
  },
  {
    id: 'B08',
    name: 'Ragi Dosa',
    recipe: '2 medium Ragi (finger millet) dosas served with 2 tbsp of coconut chutney.',
    calories: 290,
    macros: { protein: 7, carbohydrates: 45, fat: 9 },
    mealType: 'breakfast',
    dietPreference: [DietPreference.VEGETARIAN, DietPreference.VEGAN],
    healthTags: [HealthCondition.DIABETES, HealthCondition.CHOLESTEROL],
  },
  {
    id: 'B09',
    name: 'Paneer Bhurji & Toast',
    recipe: '100g paneer scrambled with onions and tomatoes. Served with 2 whole wheat toasts.',
    calories: 380,
    macros: { protein: 22, carbohydrates: 30, fat: 18 },
    mealType: 'breakfast',
    dietPreference: [DietPreference.VEGETARIAN],
    healthTags: [HealthCondition.PCOS, HealthCondition.THYROID, HealthCondition.DIABETES],
  },
  {
    id: 'B10',
    name: 'Spinach & Banana Smoothie',
    recipe: '1 cup spinach, 1 banana, 1 scoop whey protein, 150ml almond milk.',
    calories: 320,
    macros: { protein: 25, carbohydrates: 35, fat: 9 },
    mealType: 'breakfast',
    dietPreference: [DietPreference.VEGETARIAN],
    healthTags: [HealthCondition.HEART_DISEASE, HealthCondition.THYROID],
  },
  {
    id: 'B11',
    name: 'Vegetable Uttapam',
    recipe: '2 medium rice and lentil pancakes with onion, tomato, and capsicum topping.',
    calories: 310,
    macros: { protein: 9, carbohydrates: 50, fat: 8 },
    mealType: 'breakfast',
    dietPreference: [DietPreference.VEGETARIAN, DietPreference.VEGAN],
    healthTags: [HealthCondition.CHOLESTEROL, HealthCondition.HYPERTENSION],
  },
  {
    id: 'B12',
    name: 'Thepla with Curd',
    recipe: '2 medium multigrain theplas with 100g of plain curd.',
    calories: 340,
    macros: { protein: 12, carbohydrates: 45, fat: 12 },
    mealType: 'breakfast',
    dietPreference: [DietPreference.VEGETARIAN],
    healthTags: [HealthCondition.KNEE_PAIN],
  },
  {
    id: 'B13',
    name: 'Oats Cheela',
    recipe: '2 medium cheelas made from oats flour, filled with grated veggies.',
    calories: 280,
    macros: { protein: 12, carbohydrates: 35, fat: 10 },
    mealType: 'breakfast',
    dietPreference: [DietPreference.VEGETARIAN],
    healthTags: [HealthCondition.DIABETES, HealthCondition.PCOS, HealthCondition.CHOLESTEROL],
  },
  {
    id: 'B14',
    name: 'Idli Sambar',
    recipe: '4 steamed rice idlis with a bowl of vegetable sambar.',
    calories: 350,
    macros: { protein: 12, carbohydrates: 65, fat: 4 },
    mealType: 'breakfast',
    dietPreference: [DietPreference.VEGETARIAN, DietPreference.VEGAN],
    healthTags: [HealthCondition.HEART_DISEASE, HealthCondition.HYPERTENSION],
  },
  {
    id: 'B15',
    name: 'Chia Seed Pudding',
    recipe: '2 tbsp chia seeds soaked overnight in 150ml almond milk, topped with berries.',
    calories: 240,
    macros: { protein: 8, carbohydrates: 20, fat: 14 },
    mealType: 'breakfast',
    dietPreference: [DietPreference.VEGAN, DietPreference.VEGETARIAN],
    healthTags: [HealthCondition.PCOS, HealthCondition.CHOLESTEROL, HealthCondition.DIABETES],
  },
  {
    id: 'B16',
    name: 'Avocado Toast',
    recipe: '1 slice of whole wheat toast topped with 1/2 mashed avocado, lemon juice, and chili flakes.',
    calories: 260,
    macros: { protein: 7, carbohydrates: 25, fat: 15 },
    mealType: 'breakfast',
    dietPreference: [DietPreference.VEGAN, DietPreference.VEGETARIAN],
    healthTags: [HealthCondition.HEART_DISEASE, HealthCondition.CHOLESTEROL, HealthCondition.PCOS],
  },
  {
    id: 'B17',
    name: 'Ragi & Veggie Upma',
    recipe: '1 cup of ragi flour cooked as upma with mustard seeds, onions, carrots, and peas.',
    calories: 290,
    macros: { protein: 9, carbohydrates: 50, fat: 7 },
    mealType: 'breakfast',
    dietPreference: [DietPreference.VEGAN, DietPreference.VEGETARIAN],
    healthTags: [HealthCondition.DIABETES, HealthCondition.CHOLESTEROL, HealthCondition.HYPERTENSION],
  },
  {
    id: 'B18',
    name: 'Sattu Paratha & Curd',
    recipe: '2 small parathas made with sattu (roasted gram flour) filling, served with 100g of curd.',
    calories: 380,
    macros: { protein: 18, carbohydrates: 50, fat: 12 },
    mealType: 'breakfast',
    dietPreference: [DietPreference.VEGETARIAN],
    healthTags: [HealthCondition.DIABETES],
  },
  {
    id: 'B19',
    name: 'Spinach & Mushroom Omelette',
    recipe: '3-egg omelette with sautéed spinach, mushrooms, and onions. Cook with minimal oil.',
    calories: 320,
// FIX: Completed the macros object which was missing carbohydrates and fat properties.
    macros: { protein: 20, carbohydrates: 4, fat: 25 },
    mealType: 'breakfast',
    dietPreference: [DietPreference.MEAT_ALLOWED],
    healthTags: [HealthCondition.PCOS, HealthCondition.DIABETES, HealthCondition.THYROID],
  },
];
