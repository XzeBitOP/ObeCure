import { HealthCondition } from '../types';

export interface WorkoutPlan {
  id: keyof typeof WORKOUT_PLANS_DATA;
  name: string;
  details: string[];
  exercises: string[];
  structure: {
    work: number;
    rest: number;
    rounds: number;
    roundRest?: number;
  };
  notes?: string[];
}

export const WORKOUT_PLANS_DATA: Record<string, WorkoutPlan> = {
  GENERAL: {
    id: 'GENERAL',
    name: 'General Fat Loss Workout',
    details: ['30–35 minutes', '5 days/week', '250–400 kcal burned'],
    exercises: ['Jumping jacks', 'Squats', 'Push-ups', 'Mountain climbers', 'Planks', 'Glute bridges'],
    structure: { work: 40, rest: 20, rounds: 3, roundRest: 60 },
  },
  HYPERTENSION: {
    id: 'HYPERTENSION',
    name: 'Workout for High Blood Pressure',
    details: ['25–30 minutes', '5 days/week', '180–250 kcal burned'],
    exercises: ['Step marching', 'Wall push-ups', 'Seated knee extensions', 'Standing punches', 'Side bends'],
    structure: { work: 40, rest: 20, rounds: 3 },
    notes: ['Avoid: Jumping or heavy straining'],
  },
  DIABETES: {
    id: 'DIABETES',
    name: 'Workout for Diabetes Management',
    details: ['30 minutes', '5–6 days/week', '250–350 kcal burned'],
    exercises: ['Bodyweight squats', 'Push-ups (knee version)', 'Lunges', 'Planks', 'Mountain climbers'],
    structure: { work: 45, rest: 15, rounds: 3, roundRest: 60 },
    notes: ['Best time: After meals'],
  },
  THYROID: {
    id: 'THYROID',
    name: 'Workout for Hypothyroidism',
    details: ['30 minutes', '5 days/week', '200–300 kcal burned'],
    exercises: ['Squats', 'Push-ups', 'Planks', 'Glute bridges', 'Side leg raises'],
    structure: { work: 45, rest: 15, rounds: 3, roundRest: 60 },
    notes: ['Focus on consistent, moderate intensity.'],
  },
  PCOS: {
    id: 'PCOS',
    name: 'Workout for PCOS & Insulin Resistance',
    details: ['25–30 minutes', '4–5 days/week', '200–300 kcal burned'],
    exercises: ['Air squats', 'Glute bridges', 'Step-ups', 'Planks', 'Light yoga poses'],
    structure: { work: 40, rest: 20, rounds: 3, roundRest: 60 },
    notes: ['Add: 30-min brisk walk daily'],
  },
  KNEE_PAIN: {
    id: 'KNEE_PAIN',
    name: 'Workout for Knee Pain / Arthritis',
    details: ['25–30 minutes', '5 days/week', '150–250 kcal burned'],
    exercises: ['Wall sits', 'Chair squats', 'Calf raises', 'Glute bridges', 'Arm punches'],
    structure: { work: 40, rest: 20, rounds: 3 },
    notes: ['Avoid: Jumping or deep squats'],
  },
  HEART_DISEASE: {
    id: 'HEART_DISEASE',
    name: 'Workout for Heart Health (Stable)',
    details: ['20–25 minutes', '5 days/week', '120–200 kcal burned'],
    exercises: ['Slow step-ups', 'Wall push-ups', 'Gentle yoga', 'Breathing exercises'],
    structure: { work: 30, rest: 30, rounds: 3 },
    notes: ['Keep heart rate below 70% of (220 – your age).'],
  },
};

export const getWorkoutPlanForConditions = (conditions: HealthCondition[]): WorkoutPlan => {
  if (conditions.includes(HealthCondition.HEART_DISEASE)) return WORKOUT_PLANS_DATA.HEART_DISEASE;
  if (conditions.includes(HealthCondition.KNEE_PAIN)) return WORKOUT_PLANS_DATA.KNEE_PAIN;
  if (conditions.includes(HealthCondition.HYPERTENSION)) return WORKOUT_PLANS_DATA.HYPERTENSION;
  if (conditions.includes(HealthCondition.PCOS)) return WORKOUT_PLANS_DATA.PCOS;
  if (conditions.includes(HealthCondition.DIABETES)) return WORKOUT_PLANS_DATA.DIABETES;
  if (conditions.includes(HealthCondition.THYROID)) return WORKOUT_PLANS_DATA.THYROID;
  return WORKOUT_PLANS_DATA.GENERAL;
};
