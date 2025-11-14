

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

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

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
  mealType: MealType;
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

export interface WaterEntry {
  date: string; // YYYY-MM-DD
  glasses: number;
}

export interface MetabolicAgeAnalysis {
  inputs: {
    weight_kg: number;
    height_cm: number;
    age_years: number;
    sex: "male" | "female";
    waist_cm: number;
    hip_cm?: number;
    neck_cm?: number;
    activity_level: "sedentary" | "light" | "moderate" | "heavy";
    bodyFatPercent: number;
    muscleMass_kg: number;
  };
  derived: {
    BMI: number;
    WHtR: number;
    BMR: number;
    MuscleIndex: number;
  };
  metabolicScore: number;
  metabolicAge_clinical: number;
  method: "clinical";
  confidence: number;
  contributors: { feature: string; impact: number }[];
  explanation: string;
  recommendation: string;
}


export interface BodyCompositionEntry {
    date: string; // YYYY-MM-DD
    bmi: number;
    bodyFatPercentage: number;
    leanBodyMass: number;
    muscleMass: number;
    proteinMass: number;
    proteinPercentage: number;
    bmr: number;
    whtr: number;
    whr: number;
    tbw: number;
    fatMass: number;
    visceralFatIndex: number;
    metabolicAgeAnalysis?: MetabolicAgeAnalysis;
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
  otherCalories: number; // This will now be populated by summing custom meals
  totalIntake: number;
  targetCalories: number;
}

export interface CustomMealLogEntry {
    id: string;
    date: string; // YYYY-MM-DD
    mealType: MealType;
    name: string;
    calories: number;
    timestamp: string; // ISO string for precise time
}


export interface VictoryPost {
    id: string;
    type: 'NSV'; // Non-Scale Victory
    text: string;
    cheers: number;
    timestamp: string;
}


// --- BioAdaptive Ayurveda Types (as per new spec) ---

export type Sku = "Gutrify" | "FiberFuel" | "ObeCalm" | "LeanPulse" | "MetaboFix";
export type PhenotypeName = "Gut-dominant" | "Stress-dominant" | "Energy-deficit" | "Appetite-dominant" | "Metabolic-sluggish" | "Balanced";

export interface UserProfile {
  id: string;
  name?: string;
  age: number;
  sex: "Male" | "Female" | "Other";
  height_cm: number;
  baseline: {
    weight_kg: number;
    waist_cm?: number;
    diet_pattern: "vegetarian" | "mixed";
    caffeine_sensitivity: "low" | "medium" | "high";
    conditions: {
      gerd?: boolean;
      ibs?: boolean;
      thyroid?: "hypo" | "hyper" | "none";
      diabetes?: boolean;
    };
    contra: {
      pregnant?: boolean;
      breastfeeding?: boolean;
      under18?: boolean;
    };
  };
  goals: string[]; // e.g., ["fat_loss", "gut_reset", "energy", "stress_sleep"]
  created_at: string;
  updated_at: string;
}

export interface DailyCheckin {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  weight_kg?: number;
  sleep_hours: number;
  sleep_quality: number; // 0-10
  stress: number; // 0-10
  hunger: number; // 0-10
  cravings: "none" | "sweet" | "salty" | "fried";
  bloating: number; // 0-10
  bowel: "regular" | "constipated" | "loose" | "irregular";
  energy: number; // 0-10
  focus: number; // 0-10
  activity: "none" | "<30" | "30_60" | ">60";
  steps?: number;
  hydration_glasses: number; // 0-12
  caffeine_today: 0 | 1 | 2;
  compliance: "yes" | "no" | "partial";
  side_effects: {
    palpitations?: boolean;
    nausea?: boolean;
    insomnia?: boolean;
    loose_stools?: boolean;
  };
  created_at: string;
}

export interface Scores {
  id: string;
  user_id: string;
  date: string;
  GLS: number;
  ACS: number;
  SCS: number;
  EDS: number;
  MSS: number;
}

export interface PlanItem {
  sku: Sku;
  dose: string;
  time: string;
  reason: string;
  caution?: string;
}

export interface DailyPlan {
  id: string;
  user_id: string;
  date: string;
  phenotype: {
    primary: PhenotypeName;
    secondary?: PhenotypeName;
  };
  scores: Scores;
  plan: PlanItem[];
  notes: string[];
  shared_pdf_path?: string;
  shared_at?: string;
  created_at: string;
}