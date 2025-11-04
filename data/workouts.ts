import { HealthCondition } from '../types';

export interface WorkoutExercise {
  name: string;
  description: string;
}

export interface WorkoutPlan {
  id: keyof typeof WORKOUT_PLANS_DATA;
  name: string;
  details: string[];
  exercises: WorkoutExercise[];
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
    exercises: [
        { name: 'Jumping jacks', description: 'Stand with feet together, hands at sides. Jump, spreading feet wide while bringing arms overhead. Jump back to start.' },
        { name: 'Squats', description: 'Stand with feet shoulder-width apart. Lower your hips as if sitting in a chair, keeping your chest up and back straight. Return to standing.' },
        { name: 'Push-ups', description: 'Start in a plank position. Lower your body until your chest nearly touches the floor. Push back up to the starting position. Keep your body in a straight line.' },
        { name: 'Mountain climbers', description: 'Start in a plank position. Bring one knee towards your chest, then switch legs in a running motion. Keep your core engaged.' },
        { name: 'Planks', description: 'Hold a push-up position, resting on your forearms or hands. Keep your body in a straight line from head to heels. Engage your core.' },
        { name: 'Glute bridges', description: 'Lie on your back with knees bent, feet flat on the floor. Lift your hips off the floor until your body forms a straight line from shoulders to knees.' }
    ],
    structure: { work: 40, rest: 20, rounds: 3, roundRest: 60 },
  },
  HYPERTENSION: {
    id: 'HYPERTENSION',
    name: 'Workout for High Blood Pressure',
    details: ['25–30 minutes', '5 days/week', '180–250 kcal burned'],
    exercises: [
        { name: 'Step marching', description: 'March in place, lifting your knees high. A low-impact cardio exercise to get your heart rate up.' },
        { name: 'Wall push-ups', description: 'Stand facing a wall. Place hands on the wall slightly wider than your shoulders. Lean in, bending elbows, then push back to start.' },
        { name: 'Seated knee extensions', description: 'Sit on a chair. Extend one leg straight out in front of you, squeezing your thigh muscle. Lower it back down slowly.' },
        { name: 'Standing punches', description: 'Stand with feet shoulder-width apart, knees slightly bent. Punch your arms forward, alternating, with controlled motion.' },
        { name: 'Side bends', description: 'Stand with feet hip-width apart. Slowly bend your torso to one side, reaching your hand down your leg. Return to center and switch sides.' }
    ],
    structure: { work: 40, rest: 20, rounds: 3 },
    notes: ['Avoid: Jumping or heavy straining'],
  },
  DIABETES: {
    id: 'DIABETES',
    name: 'Workout for Diabetes Management',
    details: ['30 minutes', '5–6 days/week', '250–350 kcal burned'],
    exercises: [
        { name: 'Bodyweight squats', description: 'Stand with feet shoulder-width apart. Lower your hips as if sitting in a chair, keeping your chest up and back straight. Return to standing.' },
        { name: 'Push-ups (knee version)', description: 'Same as a standard push-up, but with your knees on the ground to reduce difficulty. Keep a straight line from your head to your knees.' },
        { name: 'Lunges', description: 'Step forward with one leg and lower your hips until both knees are bent at a 90-degree angle. Push back to the starting position and switch legs.' },
        { name: 'Planks', description: 'Hold a push-up position, resting on your forearms or hands. Keep your body in a straight line from head to heels. Engage your core.' },
        { name: 'Mountain climbers', description: 'Start in a plank position. Bring one knee towards your chest, then switch legs in a running motion. Keep your core engaged.' }
    ],
    structure: { work: 45, rest: 15, rounds: 3, roundRest: 60 },
    notes: ['Best time: After meals'],
  },
  THYROID: {
    id: 'THYROID',
    name: 'Workout for Hypothyroidism',
    details: ['30 minutes', '5 days/week', '200–300 kcal burned'],
    exercises: [
        { name: 'Squats', description: 'Stand with feet shoulder-width apart. Lower your hips as if sitting in a chair, keeping your chest up and back straight. Return to standing.' },
        { name: 'Push-ups', description: 'Start in a plank position. Lower your body until your chest nearly touches the floor. Push back up to the starting position. Keep your body in a straight line.' },
        { name: 'Planks', description: 'Hold a push-up position, resting on your forearms or hands. Keep your body in a straight line from head to heels. Engage your core.' },
        { name: 'Glute bridges', description: 'Lie on your back with knees bent, feet flat on the floor. Lift your hips off the floor until your body forms a straight line from shoulders to knees.' },
        { name: 'Side leg raises', description: 'Lie on your side with legs straight. Slowly raise your top leg as high as you can without bending your torso. Lower it back down.' }
    ],
    structure: { work: 45, rest: 15, rounds: 3, roundRest: 60 },
    notes: ['Focus on consistent, moderate intensity.'],
  },
  PCOS: {
    id: 'PCOS',
    name: 'Workout for PCOS & Insulin Resistance',
    details: ['25–30 minutes', '4–5 days/week', '200–300 kcal burned'],
    exercises: [
        { name: 'Air squats', description: 'Stand with feet shoulder-width apart. Lower your hips as if sitting in a chair, keeping your chest up and back straight. Return to standing.' },
        { name: 'Glute bridges', description: 'Lie on your back with knees bent, feet flat on the floor. Lift your hips off the floor until your body forms a straight line from shoulders to knees.' },
        { name: 'Step-ups', description: 'Using a sturdy chair or step, step up with one foot, then the other. Step back down. Alternate your lead foot.' },
        { name: 'Planks', description: 'Hold a push-up position, resting on your forearms or hands. Keep your body in a straight line from head to heels. Engage your core.' },
        { name: 'Light yoga poses', description: 'Perform gentle stretches like Cat-Cow, Child\'s Pose, or a gentle spinal twist to improve flexibility and relaxation.' }
    ],
    structure: { work: 40, rest: 20, rounds: 3, roundRest: 60 },
    notes: ['Add: 30-min brisk walk daily'],
  },
  KNEE_PAIN: {
    id: 'KNEE_PAIN',
    name: 'Workout for Knee Pain / Arthritis',
    details: ['25–30 minutes', '5 days/week', '150–250 kcal burned'],
    exercises: [
        { name: 'Wall sits', description: 'Lean against a wall with your feet shoulder-width apart. Slide down until your knees are at a 90-degree angle, as if sitting in a chair.' },
        { name: 'Chair squats', description: 'Stand in front of a chair. Squat down until you lightly touch the chair, then stand back up without using your hands.' },
        { name: 'Calf raises', description: 'Stand with feet flat on the floor. Raise your heels up as high as you can, squeezing your calf muscles. Lower them back down.' },
        { name: 'Glute bridges', description: 'Lie on your back with knees bent, feet flat on the floor. Lift your hips off the floor until your body forms a straight line from shoulders to knees.' },
        { name: 'Arm punches', description: 'Stand with feet shoulder-width apart, knees slightly bent. Punch your arms forward, alternating, with controlled motion.' }
    ],
    structure: { work: 40, rest: 20, rounds: 3 },
    notes: ['Avoid: Jumping or deep squats'],
  },
  HEART_DISEASE: {
    id: 'HEART_DISEASE',
    name: 'Workout for Heart Health (Stable)',
    details: ['20–25 minutes', '5 days/week', '120–200 kcal burned'],
    exercises: [
        { name: 'Slow step-ups', description: 'Using a sturdy chair or step, step up with one foot, then the other. Step back down. Alternate your lead foot.' },
        { name: 'Wall push-ups', description: 'Stand facing a wall. Place hands on the wall slightly wider than your shoulders. Lean in, bending elbows, then push back to start.' },
        { name: 'Gentle yoga', description: 'Perform gentle stretches like Cat-Cow, Child\'s Pose, or a gentle spinal twist to improve flexibility and relaxation.' },
        { name: 'Breathing exercises', description: 'Focus on deep, controlled breathing. Inhale slowly through your nose for 4 counts, hold for 4, and exhale slowly through your mouth for 6.' }
    ],
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
