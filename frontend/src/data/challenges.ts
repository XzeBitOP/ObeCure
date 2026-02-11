import { Challenge } from '../types';

export const challengePool: Omit<Challenge, 'current' | 'completed'>[] = [
    { id: 'WORKOUTS_3', title: 'Complete 3 Workouts', goal: 3, unit: 'workouts' },
    { id: 'WORKOUTS_4', title: 'Complete 4 Workouts', goal: 4, unit: 'workouts' },
    { id: 'DIET_LOG_5', title: 'Log Meals for 5 Days', goal: 5, unit: 'days' },
    { id: 'DIET_LOG_7', title: 'Log Meals Every Day', goal: 7, unit: 'days' },
    { id: 'WATER_50', title: 'Drink 50 Glasses of Water', goal: 50, unit: 'glasses' },
    { id: 'SLEEP_49', title: 'Sleep 49 Hours This Week', goal: 49, unit: 'hours' },
];