import { HealthCondition } from '../types';

export interface WorkoutExercise {
  name: string;
  description: string;
  position?: string;
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
  warmupDuration?: number; // in seconds
  cooldownDuration?: number; // in seconds
  notes?: string[];
}

export const WORKOUT_PLANS_DATA: Record<string, WorkoutPlan> = {
  GENERAL: {
    id: 'GENERAL',
    name: 'Workout for General Obesity',
    details: ['30–40 min', 'Improves Mobility', 'Boosts Metabolism'],
    warmupDuration: 300, // 5 min
    cooldownDuration: 300, // 5 min
    exercises: [
        { name: 'Wall Push-ups', description: 'Stand facing a wall, place hands on it, and perform a push-up motion.', position: 'Stand facing a wall.' },
        { name: 'Bodyweight Squats', description: 'Lower your hips as if sitting in a chair. Use a chair for support if needed (sit-to-stand).', position: 'Stand with feet shoulder-width apart.' },
        { name: 'Standing Knee Raises', description: 'Stand straight and lift one knee towards your chest, then alternate.', position: 'Stand straight with feet hip-width apart.' },
        { name: 'Modified Plank (on knees)', description: 'Hold a plank position with your knees on the floor. Keep your back straight.', position: 'Start on all fours, with hands under your shoulders.' },
        { name: 'Step-ups', description: 'Use a low stair or step. Step up with one foot, then the other. Alternate lead foot.', position: 'Stand in front of a low step or stair.' }
    ],
    structure: { work: 40, rest: 20, rounds: 4, roundRest: 60 },
  },
  HYPERTENSION: {
    id: 'HYPERTENSION',
    name: 'Workout for Hypertension',
    details: ['20–25 min', 'Lowers Blood Pressure', 'Relaxing'],
    warmupDuration: 180, // 3 min
    cooldownDuration: 300, // 5 min
    exercises: [
        { name: 'Wall Push-ups', description: 'Stand facing a wall, place hands on it, and perform a push-up motion.', position: 'Stand facing a wall.' },
        { name: 'Seated Toe & Heel Taps', description: 'While seated, alternate tapping your toes and then your heels on the floor.', position: 'Sit on a chair with your feet flat on the floor.' },
        { name: 'Side Stretch with Overhead Reach', description: 'Stand or sit tall. Reach one arm overhead and gently bend to the side.', position: 'Sit or stand tall.' },
        { name: 'Slow Arm Punches', description: 'Gently punch your arms forward in a slow, controlled, alternating motion.', position: 'Stand with a slight bend in your knees.' }
    ],
    structure: { work: 30, rest: 30, rounds: 3 },
    notes: ['Avoid holding your breath and high-intensity bursts.'],
  },
  DIABETES: {
    id: 'DIABETES',
    name: 'Workout for Diabetes Management',
    details: ['30 min', 'Enhances Insulin Sensitivity', 'Weight Control'],
    warmupDuration: 180, // 3 min
    cooldownDuration: 300, // 5 min
    exercises: [
        { name: 'Jumping Jacks (modified)', description: 'Step one foot out to the side while raising your arms. A low-impact version without the jump.', position: 'Stand with your feet together.' },
        { name: 'Chair Squats', description: 'Stand in front of a chair. Squat down until you lightly touch it, then stand back up.', position: 'Stand in front of a chair.' },
        { name: 'Arm Punches', description: 'Stand with feet shoulder-width apart and punch your arms forward in a controlled, alternating motion.', position: 'Stand with feet shoulder-width apart.' },
        { name: 'Standing Side Leg Raises', description: 'Stand straight and lift one leg out to the side. Alternate legs.', position: 'Stand straight, holding a wall for support.' },
        { name: 'Wall Plank', description: 'Hold a plank position with your hands against a wall. Keep your body straight.', position: 'Stand facing a wall, about arm\'s length away.' },
        { name: 'Spot Jogging', description: 'Jog lightly in place, keeping it at a comfortable pace.', position: 'Stand in place.' }
    ],
    structure: { work: 40, rest: 20, rounds: 3, roundRest: 60 },
    notes: ['Exercising after meals can help reduce blood sugar spikes.'],
  },
  THYROID: {
    id: 'THYROID',
    name: 'Workout for Hypothyroidism',
    details: ['30 min', 'Boosts Metabolism', 'Reduces Stiffness'],
    warmupDuration: 120, // 2 min
    cooldownDuration: 300, // 5 min
    exercises: [
        { name: 'Sun Salutation (Slow Pace)', description: 'Flow through a gentle sequence of yoga poses: Mountain, Upward Salute, Forward Fold, Lunge, and back.', position: 'Start in a standing position, or Mountain Pose.' },
        { name: 'Step-ups', description: 'Use a low stair or step. Step up with one foot, then the other. Alternate lead foot.', position: 'Stand in front of a low step or stair.' },
        { name: 'Seated Leg Raises', description: 'While seated, lift one straight leg up, hold for a moment, then lower. Alternate legs.', position: 'Sit upright on a chair.' },
        { name: 'Wall Plank', description: 'Hold a plank position with your hands or forearms against a wall. Keep your body straight.', position: 'Stand facing a wall, about arm\'s length away.' }
    ],
    structure: { work: 45, rest: 15, rounds: 4, roundRest: 60 },
    notes: ['Focus on consistent, moderate intensity.'],
  },
  PCOS: {
    id: 'PCOS',
    name: 'Workout for PCOS & Hormonal Balance',
    details: ['35 min', 'Improves Insulin Resistance', 'Reduces Stress'],
    warmupDuration: 300, // 5 min
    cooldownDuration: 300, // 5 min
    exercises: [
        { name: 'Squats', description: 'Stand with feet shoulder-width apart. Lower your hips as if sitting in a chair, keeping your chest up.', position: 'Stand with feet shoulder-width apart.' },
        { name: 'Standing Crunches', description: 'Stand and bring one knee up towards the opposite elbow, crunching your abs. Alternate sides.', position: 'Stand with your feet shoulder-width apart.' },
        { name: 'Glute Bridges', description: 'Lie on your back with knees bent. Lift your hips off the floor, squeezing your glutes.', position: 'Lie on your back with knees bent and feet flat.' },
        { name: 'Wall Plank Shoulder Taps', description: 'Hold a plank against a wall. Tap one shoulder with the opposite hand. Alternate.', position: 'Hold a plank position against a wall.' }
    ],
    structure: { work: 45, rest: 15, rounds: 5, roundRest: 60 },
    notes: ['Adding a 30-min brisk walk daily is highly beneficial.'],
  },
  KNEE_PAIN: {
    id: 'KNEE_PAIN',
    name: 'Workout for Arthritis / Joint Pain',
    details: ['25–30 min', 'Low Joint Stress', 'Maintains Mobility'],
    warmupDuration: 180, // 3 min
    cooldownDuration: 300, // 5 min
    exercises: [
        { name: 'Seated Leg Extensions', description: 'While seated, extend one leg straight out, squeezing your thigh muscle. Lower slowly.', position: 'Sit on a chair with your back straight.' },
        { name: 'Chair Sit-to-Stand', description: 'Sit at the edge of a chair. Stand up without using your hands, then slowly sit back down.', position: 'Sit at the edge of a sturdy chair.' },
        { name: 'Wall Slides (Arms)', description: 'Stand with your back to a wall. Slide your arms up and down the wall, like making a snow angel.', position: 'Stand with your back against a wall.' },
        { name: 'Standing Side Leg Lifts', description: 'Holding a wall for support, lift one leg out to the side. Lower slowly and repeat.', position: 'Stand straight, holding a wall for support.' }
    ],
    structure: { work: 40, rest: 20, rounds: 4, roundRest: 60 },
    notes: ['Avoid: Jumping, deep squats, lunges, kneeling planks.'],
  },
  HEART_DISEASE: {
    id: 'HEART_DISEASE',
    name: 'Workout for Heart Health (Stable)',
    details: ['20–30 min', 'Safe & Gentle', 'Improves Circulation'],
    warmupDuration: 300, // 5 min
    cooldownDuration: 300, // 5 min
    exercises: [
        { name: 'Step-Touch (Side-to-Side)', description: 'Step one foot to the side, then bring the other foot to meet it. Repeat on the other side.', position: 'Stand with your feet together.' },
        { name: 'Wall Push-ups', description: 'Stand facing a wall, place hands on it, and perform a push-up motion.', position: 'Stand facing a wall.' },
        { name: 'Seated Torso Twists', description: 'Sit on a chair and gently twist your upper body from side to side.', position: 'Sit upright on a chair.' },
        { name: 'Heel Raises (with support)', description: 'Hold onto a wall or chair. Rise up onto your toes, then slowly lower your heels.', position: 'Stand tall, holding onto a wall or chair.' }
    ],
    structure: { work: 30, rest: 30, rounds: 3, roundRest: 60 },
    notes: ['Keep heart rate low (60-70% of max). Stop if you feel dizzy or have chest pain.'],
  },
  LOW_MOBILITY: {
    id: 'LOW_MOBILITY',
    name: 'Workout for Low Mobility (Beginner)',
    details: ['10–20 min', 'Very Low Impact', 'Builds Foundational Strength'],
    warmupDuration: 120, // 2 min
    cooldownDuration: 300, // 5 min
    exercises: [
        { name: 'Seated Arm Raises', description: 'While seated, slowly raise both arms forward or to the sides, up to shoulder height.', position: 'Sit upright on a chair.' },
        { name: 'Seated Leg Lifts', description: 'While seated, lift one leg straight out in front of you. Hold briefly, then lower.', position: 'Sit upright on a chair.' },
        { name: 'Wall-Assisted Marching', description: 'Stand facing a wall for support and march gently in place.', position: 'Stand facing a wall for support.' },
        { name: 'Seated Torso Twists', description: 'Sit on a chair and gently twist your upper body from side to side.', position: 'Sit upright on a chair.' }
    ],
    structure: { work: 30, rest: 30, rounds: 2 },
    notes: ['Listen to your body. Stop if you feel any pain. Consistency is key.'],
  }
};

export const getWorkoutPlanForConditions = (conditions: HealthCondition[]): WorkoutPlan => {
  // The order defines priority. If a user has multiple, the most critical plan is chosen.
  if (conditions.includes(HealthCondition.HEART_DISEASE)) return WORKOUT_PLANS_DATA.HEART_DISEASE;
  if (conditions.includes(HealthCondition.KNEE_PAIN)) return WORKOUT_PLANS_DATA.KNEE_PAIN;
  if (conditions.includes(HealthCondition.HYPERTENSION)) return WORKOUT_PLANS_DATA.HYPERTENSION;
  if (conditions.includes(HealthCondition.PCOS)) return WORKOUT_PLANS_DATA.PCOS;
  if (conditions.includes(HealthCondition.DIABETES)) return WORKOUT_PLANS_DATA.DIABETES;
  if (conditions.includes(HealthCondition.THYROID)) return WORKOUT_PLANS_DATA.THYROID;
  
  // If no specific conditions are selected, or none match the priority list, return the general plan.
  return WORKOUT_PLANS_DATA.GENERAL;
};