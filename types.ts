
export enum DietPreference {
  VEGETARIAN = 'Vegetarian',
  VEGAN = 'Vegan',
  MEAT_ALLOWED = 'Meat Allowed (Non-Vegetarian)',
}

export enum Sex {
  MALE = 'Male',
  FEMALE = 'Female',
}

export enum ActivityLevel {
  SEDENTARY = 'Sedentary (little or no exercise)',
  LIGHTLY_ACTIVE = 'Lightly active (exercise 1-3 days/week)',
  MODERATELY_ACTIVE = 'Moderately active (exercise 3-5 days/week)',
  VERY_ACTIVE = 'Very active (exercise 6-7 days/week)',
}

export enum DietType {
  BALANCED = 'Balanced',
  HIGH_PROTEIN = 'High Protein',
  LOW_CARB = 'Low Carb',
  WEIGHT_GAIN = 'Weight Gain',
}

export enum HealthCondition {
  DIABETES = 'Type 2 Diabetes',
  HYPERTENSION = 'Hypertension (High BP)',
  PCOS = 'PCOS (Polycystic Ovary Syndrome)',
  CHOLESTEROL = 'High Cholesterol (Dyslipidemia)',
  THYROID = 'Thyroid (Hypothyroidism)',
  KNEE_PAIN = 'Knee Pain / Arthritis',
  HEART_DISEASE = 'Heart Disease (Stable)',
}


export interface Macros {
  protein: number;
  carbohydrates: number;
  fat: number;
}

export interface Meal {
  name: string;
  recipe: string;
  calories: number;
  macros: Macros;
  time?: string;
}

export interface DietPlan {
  meals: Meal[];
  totalCalories: number;
  totalMacros: Macros;
}

export interface DrKenilsNote {
  title: string;
  text: string;
}

export interface ProgressEntry {
  date: string;
  weight: number;
  bmi: number;
}

export interface SleepEntry {
  date: string; // YYYY-MM-DD
  hours: number;
}

export interface FastingEntry {
  date: string; // YYYY-MM-DD
  startTime: string; // e.g., "10:00 AM"
  endTime: string; // e.g., "6:00 PM"
  duration: number; // in hours
}

export interface WorkoutLogEntry {
  date: string; // YYYY-MM-DD
  name: string; // e.g., "General Fat Loss Workout"
  duration: number; // in minutes
}

export interface LoggedMeal {
  name: string;
  calories: number;
}

export interface DailyIntake {
  date: string; // YYYY-MM-DD
  loggedMeals: LoggedMeal[];
  otherCalories: number;
  totalIntake: number;
  targetCalories: number;
}