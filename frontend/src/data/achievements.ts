import { Achievement } from '../types';

export const achievementsList: Achievement[] = [
    { id: 'FIRST_LOGIN', title: 'Day One', description: 'You started your journey. Welcome!', criteria: { type: 'streak', value: 1 } },
    { id: 'STREAK_3', title: 'Getting Started', description: 'Logged in for 3 consecutive days.', criteria: { type: 'streak', value: 3 } },
    { id: 'STREAK_7', title: 'Week Warrior', description: 'Logged in for 7 consecutive days!', criteria: { type: 'streak', value: 7 } },
    { id: 'STREAK_30', title: 'Month Mover', description: 'Logged in for 30 consecutive days!', criteria: { type: 'streak', value: 30 } },
    { id: 'FIRST_WORKOUT', title: 'First Sweat', description: 'Completed your first workout.', criteria: { type: 'workouts_completed', value: 1 } },
    { id: 'WORKOUTS_10', title: 'Workout Warrior', description: 'Completed 10 workouts.', criteria: { type: 'workouts_completed', value: 10 } },
    { id: 'FIRST_DIET_LOG', title: 'Mindful Eater', description: 'Logged your first day of meals.', criteria: { type: 'diet_logs', value: 1 } },
    { id: 'DIET_LOGS_25', title: 'Consistent Eater', description: 'Logged meals for 25 days.', criteria: { type: 'diet_logs', value: 25 } },
    { id: 'WEIGHT_LOG_5', title: 'On the Board', description: 'Logged your weight 5 times.', criteria: { type: 'weight_logs', value: 5 } },
    { id: 'WEIGHT_LOSS_2KG', title: 'Making Moves', description: 'Lost your first 2 kgs!', criteria: { type: 'weight_lost', value: 2 } },
    { id: 'WEIGHT_LOSS_5KG', title: 'Milestone Maker', description: 'Lost 5 kgs! Amazing progress.', criteria: { type: 'weight_lost', value: 5 } },
    { id: 'COMMUNITY_POST', title: 'Community Builder', description: 'Shared your first victory on the wall.', criteria: { type: 'community_posts', value: 1 } },
];