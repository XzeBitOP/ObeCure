import { ActivityLevel, BodyCompositionEntry, Sex } from '../types';

interface CalculationInputs {
    age: number;
    gender: number; // 0 for female, 1 for male
    height: number; // cm
    weight: number; // kg
    waist: number; // cm
    neck: number; // cm
    hip: number; // cm, required for female
}

// Re-export for use in the UI
export const calculateBmi = (weightKg: number, heightCm: number): number => {
    if (!weightKg || !heightCm || heightCm === 0) return 0;
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    return parseFloat(bmi.toFixed(2));
};

const getActivityFactor = (level: ActivityLevel): number => {
    switch (level) {
        case ActivityLevel.SEDENTARY: return 1.2;
        case ActivityLevel.LIGHTLY_ACTIVE: return 1.375;
        case ActivityLevel.MODERATELY_ACTIVE: return 1.55;
        case ActivityLevel.VERY_ACTIVE: return 1.725;
        default: return 1.375;
    }
};

export const calculateTDEE = (params: { weight: number, height: number, age: number, sex: Sex, activityLevel: ActivityLevel }) => {
     const bmr = (10 * params.weight) + (6.25 * params.height) - (5 * params.age) + (params.sex === Sex.MALE ? 5 : -161);
     return bmr * getActivityFactor(params.activityLevel);
}

export const calculateAllMetrics = (inputs: CalculationInputs): BodyCompositionEntry => {
    const { age, gender, height, weight, waist, neck, hip } = inputs;
    
    // 1. BMI
    const bmi = calculateBmi(weight, height);

    // 2. Body Fat %
    let bodyFatPercentage: number;
    const useNavyFormula = waist > 0 && neck > 0 && (gender === 1 || (gender === 0 && hip > 0));

    if (useNavyFormula) {
        if (gender === 1) { // Male
            bodyFatPercentage = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
        } else { // Female
            bodyFatPercentage = 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) - 78.387;
        }
    } else { // Fallback to Deurenberg formula
        bodyFatPercentage = (1.20 * bmi) + (0.23 * age) - (10.8 * gender) - 5.4;
    }
    bodyFatPercentage = Math.max(0, bodyFatPercentage);

    // 3. Lean Body Mass (LBM)
    const leanBodyMass = weight * (1 - bodyFatPercentage / 100);

    // 4. Muscle Mass Estimate
    const muscleMass = gender === 1 ? leanBodyMass * 0.57 : leanBodyMass * 0.48;

    // 5. Visceral Fat Index (VFI)
    const whtr = waist / height;
    let visceralFatIndex: number;
    if (whtr < 0.45) visceralFatIndex = 3;
    else if (whtr < 0.50) visceralFatIndex = 6;
    else if (whtr < 0.55) visceralFatIndex = 9;
    else if (whtr < 0.60) visceralFatIndex = 13;
    else visceralFatIndex = 18;

    // 6. Protein Mass and %
    const proteinMass = leanBodyMass * 0.17;
    const proteinPercentage = (proteinMass / weight) * 100;

    return {
        date: new Date().toISOString().split('T')[0],
        bmi: parseFloat(bmi.toFixed(1)),
        bodyFatPercentage: parseFloat(bodyFatPercentage.toFixed(1)),
        leanBodyMass: parseFloat(leanBodyMass.toFixed(1)),
        muscleMass: parseFloat(muscleMass.toFixed(1)),
        visceralFatIndex: visceralFatIndex,
        proteinMass: parseFloat(proteinMass.toFixed(1)),
        proteinPercentage: parseFloat(proteinPercentage.toFixed(1)),
    };
};
