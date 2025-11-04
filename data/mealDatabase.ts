import { DietPreference, HealthCondition, Macros } from '../types';

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

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
    mealType: 'Breakfast',
    dietPreference: [DietPreference.VEGETARIAN, DietPreference.VEGAN],
    healthTags: [HealthCondition.DIABETES, HealthCondition.CHOLESTEROL, HealthCondition.HEART_DISEASE, HealthCondition.PCOS]
  },
  {
    id: 'B02',
    name: 'Moong Dal Chilla',
    recipe: '2 medium chillas made from moong dal batter, with a filling of 25g crumbled paneer. Cook with minimal oil.',
    calories: 300,
    macros: { protein: 15, carbohydrates: 30, fat: 12 },
    mealType: 'Breakfast',
    dietPreference: [DietPreference.VEGETARIAN],
    healthTags: [HealthCondition.DIABETES, HealthCondition.PCOS, HealthCondition.HYPERTENSION]
  },
  {
    id: 'B03',
    name: 'Vegetable Poha',
    recipe: '1 cup Poha cooked with mustard seeds, onions, peas, and potatoes. Garnish with lemon juice and coriander.',
    calories: 280,
    macros: { protein: 6, carbohydrates: 55, fat: 4 },
    mealType: 'Breakfast',
    dietPreference: [DietPreference.VEGETARIAN, DietPreference.VEGAN],
    healthTags: [HealthCondition.CHOLESTEROL, HealthCondition.KNEE_PAIN]
  },
  {
    id: 'B04',
    name: 'Egg Bhurji & Toast',
    recipe: '2 scrambled eggs with onion, tomato, and spices. Served with 2 slices of whole wheat toast.',
    calories: 350,
    macros: { protein: 18, carbohydrates: 30, fat: 16 },
    mealType: 'Breakfast',
    dietPreference: [DietPreference.MEAT_ALLOWED],
    healthTags: [HealthCondition.DIABETES, HealthCondition.THYROID, HealthCondition.PCOS]
  },
  {
    id: 'B05',
    name: 'Besan Chilla',
    recipe: '2 medium chillas made from gram flour (besan) batter with chopped tomatoes and onions.',
    calories: 260,
    macros: { protein: 12, carbohydrates: 28, fat: 10 },
    mealType: 'Breakfast',
    dietPreference: [DietPreference.VEGETARIAN, DietPreference.VEGAN],
    healthTags: [HealthCondition.DIABETES, HealthCondition.PCOS]
  },
  {
    id: 'B06',
    name: 'Greek Yogurt with Fruits',
    recipe: '150g of Greek yogurt topped with 1/2 cup of mixed berries and 1 tbsp of chia seeds.',
    calories: 220,
    macros: { protein: 16, carbohydrates: 20, fat: 8 },
    mealType: 'Breakfast',
    dietPreference: [DietPreference.VEGETARIAN],
    healthTags: [HealthCondition.HEART_DISEASE, HealthCondition.CHOLESTEROL, HealthCondition.THYROID]
  },
   {
    id: 'B07',
    name: 'Tofu Scramble',
    recipe: '100g crumbled tofu sautéed with turmeric, onions, bell peppers, and spinach.',
    calories: 250,
    macros: { protein: 20, carbohydrates: 8, fat: 16 },
    mealType: 'Breakfast',
    dietPreference: [DietPreference.VEGAN, DietPreference.VEGETARIAN],
    healthTags: [HealthCondition.PCOS, HealthCondition.DIABETES, HealthCondition.THYROID],
  },
  {
    id: 'B08',
    name: 'Ragi Dosa',
    recipe: '2 medium Ragi (finger millet) dosas served with 2 tbsp of coconut chutney.',
    calories: 290,
    macros: { protein: 7, carbohydrates: 45, fat: 9 },
    mealType: 'Breakfast',
    dietPreference: [DietPreference.VEGETARIAN, DietPreference.VEGAN],
    healthTags: [HealthCondition.DIABETES, HealthCondition.CHOLESTEROL],
  },

  // Lunches
  {
    id: 'L01',
    name: 'Rajma Chawal',
    recipe: '1 cup cooked Rajma (kidney beans) curry with 1 cup of brown rice and a side salad.',
    calories: 450,
    macros: { protein: 15, carbohydrates: 75, fat: 10 },
    mealType: 'Lunch',
    dietPreference: [DietPreference.VEGETARIAN, DietPreference.VEGAN],
    healthTags: [HealthCondition.HYPERTENSION, HealthCondition.CHOLESTEROL]
  },
  {
    id: 'L02',
    name: 'Chicken Curry & Roti',
    recipe: '100g chicken breast in a tomato-onion curry. Served with 2 whole wheat rotis and a cucumber salad.',
    calories: 500,
    macros: { protein: 30, carbohydrates: 45, fat: 20 },
    mealType: 'Lunch',
    dietPreference: [DietPreference.MEAT_ALLOWED],
    healthTags: [HealthCondition.THYROID, HealthCondition.PCOS]
  },
  {
    id: 'L03',
    name: 'Mixed Vegetable Sabzi',
    recipe: '1.5 cups of mixed vegetables (cauliflower, beans, carrots) sabzi with 2 whole wheat rotis and 1 bowl of dal.',
    calories: 420,
    macros: { protein: 14, carbohydrates: 60, fat: 13 },
    mealType: 'Lunch',
    dietPreference: [DietPreference.VEGETARIAN, DietPreference.VEGAN],
    healthTags: [HealthCondition.DIABETES, HealthCondition.HEART_DISEASE, HealthCondition.KNEE_PAIN]
  },
  {
    id: 'L04',
    name: 'Fish Curry & Rice',
    recipe: '100g grilled fish in a light coconut-based curry with 1 cup of steamed rice.',
    calories: 480,
    macros: { protein: 25, carbohydrates: 50, fat: 20 },
    mealType: 'Lunch',
    dietPreference: [DietPreference.MEAT_ALLOWED],
    healthTags: [HealthCondition.THYROID, HealthCondition.HEART_DISEASE]
  },
  {
    id: 'L05',
    name: 'Paneer Butter Masala (Healthy)',
    recipe: '75g paneer in a tomato-cashew gravy (use yogurt instead of cream). Serve with 2 rotis.',
    calories: 480,
    macros: { protein: 20, carbohydrates: 50, fat: 22 },
    mealType: 'Lunch',
    dietPreference: [DietPreference.VEGETARIAN],
    healthTags: [HealthCondition.PCOS]
  },
  {
    id: 'L06',
    name: 'Quinoa Pulao',
    recipe: '1 cup cooked quinoa with mixed vegetables (peas, carrots, beans) and 50g of tofu or paneer.',
    calories: 400,
    macros: { protein: 16, carbohydrates: 60, fat: 10 },
    mealType: 'Lunch',
    dietPreference: [DietPreference.VEGETARIAN, DietPreference.VEGAN],
    healthTags: [HealthCondition.DIABETES, HealthCondition.CHOLESTEROL, HealthCondition.PCOS]
  },
  {
    id: 'L07',
    name: 'Soya Chunk Curry',
    recipe: '1 cup soya chunk curry with 2 whole wheat rotis and a side of yogurt.',
    calories: 430,
    macros: { protein: 25, carbohydrates: 55, fat: 12 },
    mealType: 'Lunch',
    dietPreference: [DietPreference.VEGETARIAN, DietPreference.VEGAN],
    healthTags: [HealthCondition.PCOS, HealthCondition.THYROID],
  },
   {
    id: 'L08',
    name: 'Lentil Soup and Salad',
    recipe: 'A large bowl of thick lentil and vegetable soup, with a side green salad with a light vinaigrette.',
    calories: 350,
    macros: { protein: 18, carbohydrates: 50, fat: 8 },
    mealType: 'Lunch',
    dietPreference: [DietPreference.VEGETARIAN, DietPreference.VEGAN],
    healthTags: [HealthCondition.DIABETES, HealthCondition.CHOLESTEROL, HealthCondition.HYPERTENSION, HealthCondition.HEART_DISEASE],
  },

  // Dinners
  {
    id: 'D01',
    name: 'Dal Tadka & Sabzi',
    recipe: '1 bowl of yellow dal tadka, 1 cup of lauki (bottle gourd) sabzi, and 1 whole wheat roti.',
    calories: 350,
    macros: { protein: 12, carbohydrates: 50, fat: 10 },
    mealType: 'Dinner',
    dietPreference: [DietPreference.VEGETARIAN, DietPreference.VEGAN],
    healthTags: [HealthCondition.DIABETES, HealthCondition.CHOLESTEROL, HealthCondition.HYPERTENSION]
  },
  {
    id: 'D02',
    name: 'Grilled Chicken Salad',
    recipe: '100g grilled chicken breast on a bed of mixed greens, cucumber, tomatoes with a lemon-herb dressing.',
    calories: 400,
    macros: { protein: 35, carbohydrates: 10, fat: 22 },
    mealType: 'Dinner',
    dietPreference: [DietPreference.MEAT_ALLOWED],
    healthTags: [HealthCondition.DIABETES, HealthCondition.PCOS, HealthCondition.THYROID]
  },
  {
    id: 'D03',
    name: 'Khichdi',
    recipe: '1.5 cups of moong dal and rice khichdi with a side of plain yogurt.',
    calories: 380,
    macros: { protein: 15, carbohydrates: 65, fat: 7 },
    mealType: 'Dinner',
    dietPreference: [DietPreference.VEGETARIAN],
    healthTags: [HealthCondition.KNEE_PAIN, HealthCondition.HEART_DISEASE]
  },
  {
    id: 'D04',
    name: 'Paneer Tikka',
    recipe: '100g of paneer marinated in yogurt and spices, grilled with bell peppers and onions.',
    calories: 320,
    macros: { protein: 20, carbohydrates: 15, fat: 20 },
    mealType: 'Dinner',
    dietPreference: [DietPreference.VEGETARIAN],
    healthTags: [HealthCondition.DIABETES, HealthCondition.PCOS, HealthCondition.HYPERTENSION]
  },
  {
    id: 'D05',
    name: 'Vegetable Soup',
    recipe: 'A large bowl of mixed vegetable clear soup. Can add 50g of shredded chicken or tofu for protein.',
    calories: 250,
    macros: { protein: 10, carbohydrates: 30, fat: 8 },
    mealType: 'Dinner',
    dietPreference: [DietPreference.VEGETARIAN, DietPreference.VEGAN, DietPreference.MEAT_ALLOWED],
    healthTags: [HealthCondition.DIABETES, HealthCondition.KNEE_PAIN, HealthCondition.HYPERTENSION, HealthCondition.CHOLESTEROL, HealthCondition.HEART_DISEASE]
  },
  {
    id: 'D06',
    name: 'Baingan Bharta & Roti',
    recipe: '1 cup of roasted eggplant mash with spices, served with 1-2 whole wheat rotis.',
    calories: 330,
    macros: { protein: 8, carbohydrates: 45, fat: 12 },
    mealType: 'Dinner',
    dietPreference: [DietPreference.VEGETARIAN, DietPreference.VEGAN],
    healthTags: [HealthCondition.CHOLESTEROL, HealthCondition.DIABETES],
  },
  {
    id: 'D07',
    name: 'Oats Idli',
    recipe: '3-4 steamed oats idlis served with a bowl of sambar.',
    calories: 300,
    macros: { protein: 11, carbohydrates: 50, fat: 6 },
    mealType: 'Dinner',
    dietPreference: [DietPreference.VEGETARIAN],
    healthTags: [HealthCondition.HEART_DISEASE, HealthCondition.DIABETES, HealthCondition.HYPERTENSION],
  },

  // Snacks
  {
    id: 'S01',
    name: 'Roasted Makhana',
    recipe: '1 cup of fox nuts (makhana) roasted with a tsp of ghee and a pinch of salt.',
    calories: 150,
    macros: { protein: 5, carbohydrates: 25, fat: 4 },
    mealType: 'Snack',
    dietPreference: [DietPreference.VEGETARIAN],
    healthTags: [HealthCondition.DIABETES, HealthCondition.PCOS, HealthCondition.HYPERTENSION, HealthCondition.KNEE_PAIN]
  },
  {
    id: 'S02',
    name: 'Handful of Almonds',
    recipe: 'A handful (around 15-20) of raw almonds.',
    calories: 180,
    macros: { protein: 7, carbohydrates: 7, fat: 15 },
    mealType: 'Snack',
    dietPreference: [DietPreference.VEGETARIAN, DietPreference.VEGAN],
    healthTags: [HealthCondition.DIABETES, HealthCondition.PCOS, HealthCondition.THYROID, HealthCondition.CHOLESTEROL, HealthCondition.HEART_DISEASE]
  },
  {
    id: 'S03',
    name: 'Apple with Peanut Butter',
    recipe: '1 medium apple sliced, with 1 tablespoon of unsweetened peanut butter.',
    calories: 200,
    macros: { protein: 5, carbohydrates: 25, fat: 9 },
    mealType: 'Snack',
    dietPreference: [DietPreference.VEGETARIAN, DietPreference.VEGAN],
    healthTags: [HealthCondition.CHOLESTEROL, HealthCondition.PCOS]
  },
  {
    id: 'S04',
    name: 'Sprouts Chaat',
    recipe: '1 cup of mixed sprouts with chopped onion, tomato, and a squeeze of lemon.',
    calories: 120,
    macros: { protein: 8, carbohydrates: 20, fat: 1 },
    mealType: 'Snack',
    dietPreference: [DietPreference.VEGETARIAN, DietPreference.VEGAN],
    healthTags: [HealthCondition.DIABETES, HealthCondition.CHOLESTEROL, HealthCondition.HYPERTENSION, HealthCondition.HEART_DISEASE, HealthCondition.PCOS]
  },
  {
    id: 'S05',
    name: 'Buttermilk (Chaas)',
    recipe: 'A glass of buttermilk seasoned with roasted cumin powder and mint.',
    calories: 80,
    macros: { protein: 4, carbohydrates: 6, fat: 4 },
    mealType: 'Snack',
    dietPreference: [DietPreference.VEGETARIAN],
    healthTags: [HealthCondition.HYPERTENSION, HealthCondition.KNEE_PAIN]
  },
  {
    id: 'S06',
    name: 'Boiled Egg',
    recipe: '1-2 hard-boiled eggs sprinkled with black pepper.',
    calories: 150,
    macros: { protein: 12, carbohydrates: 1, fat: 10 },
    mealType: 'Snack',
    dietPreference: [DietPreference.MEAT_ALLOWED],
    healthTags: [HealthCondition.DIABETES, HealthCondition.PCOS, HealthCondition.THYROID],
  },
];
