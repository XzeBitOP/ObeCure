import { WorkoutProgram } from '../types';

export const WORKOUT_PROGRAMS_DATA: WorkoutProgram[] = [
    {
        id: 'BEGINNER_3_DAY',
        name: 'Foundation Fitness',
        description: 'A 4-week program to build a solid fitness base, improve mobility, and kickstart your metabolism. Focuses on low-impact movements.',
        durationWeeks: 4,
        daysPerWeek: 3,
        intensity: 'Low',
        schedule: [
            'GENERAL',      // Day 1: Full Body Strength
            null,           // Day 2 (Rest)
            'HEART_DISEASE',// Day 3: Gentle Cardio & Circulation
            null,           // Day 4 (Rest)
            'KNEE_PAIN',    // Day 5: Joint-Friendly Strength
            null,           // Day 6 (Rest)
            null,           // Day 7 (Rest)
        ],
    },
    {
        id: 'INTERMEDIATE_4_DAY',
        name: 'Metabolic Boost',
        description: 'A 4-week program to challenge your muscles, improve hormonal balance, and enhance cardiovascular health with moderate intensity.',
        durationWeeks: 4,
        daysPerWeek: 4,
        intensity: 'Moderate',
        schedule: [
            'GENERAL',      // Day 1: Full Body
            'PCOS',         // Day 2: Strength & Core
            null,           // Day 3 (Rest)
            'DIABETES',     // Day 4: Full Body Circuit
            'THYROID',      // Day 5: Metabolism Boost
            null,           // Day 6 (Rest)
            null,           // Day 7 (Rest)
        ],
    },
    {
        id: 'INTERMEDIATE_5_DAY',
        name: 'Active Lifestyle',
        description: 'A balanced 4-week program for those who enjoy moving more frequently, mixing strength days with active recovery.',
        durationWeeks: 4,
        daysPerWeek: 5,
        intensity: 'Moderate',
        schedule: [
            'GENERAL',      // Day 1: Full Body Strength
            'DIABETES',     // Day 2: Circuit Training
            null,           // Day 3 (Rest)
            'PCOS',         // Day 4: Core & Strength
            'HYPERTENSION', // Day 5: Low-Intensity Cardio
            'KNEE_PAIN',    // Day 6: Active Recovery & Mobility
            null,           // Day 7 (Rest)
        ],
    },
];