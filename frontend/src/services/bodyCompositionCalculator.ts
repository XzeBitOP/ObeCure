import { ActivityLevel, BodyCompositionEntry, Sex, MetabolicAgeAnalysis, DietType } from '../types';

interface CalculationInputs {
    age: number;
    gender: number; // 0 for female, 1 for male
    height: number; // cm
    weight: number; // kg
    waist: number; // cm
    neck: number; // cm
    hip: number; // cm
    activityLevel: ActivityLevel;
    dietType: DietType;
    ethnicity: string;
    tg?: number; // Triglycerides mg/dL
    hdl?: number; // HDL-C mg/dL
}

interface MetabolicAgeInputs {
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
  triglycerides_mgdl?: number;
  hdl_mgdl?: number;
  ethnicity: string;
}

const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

export const calculateMetabolicAge = (inputs: MetabolicAgeInputs): MetabolicAgeAnalysis => {
  const { weight_kg, height_cm, age_years, sex, waist_cm, bodyFatPercent, muscleMass_kg, activity_level, ethnicity, triglycerides_mgdl, hdl_mgdl, hip_cm, neck_cm } = inputs;
  
  const height_m = height_cm / 100;
  const BMI = weight_kg / (height_m ** 2);
  const WHtR = waist_cm / height_cm;
  const MuscleIndex = (muscleMass_kg / weight_kg) * 100;
  
  // Use Mifflin-St Jeor for BMR
  let BMR = sex === "male"
    ? 10 * weight_kg + 6.25 * height_cm - 5 * age_years + 5
    : 10 * weight_kg + 6.25 * height_cm - 5 * age_years - 161;
  
  // Apply ethnicity correction
  if (ethnicity === 'South Asian') {
      BMR *= 0.94;
  }

  const norm = (x: number, min: number, max: number) => clamp(((x - min) / (max - min)) * 100, 0, 100);
  const norm_inv = (x: number, min: number, max: number) => 100 - norm(x, min, max);

  const BMR_range = sex === "male" ? { min: 1200, max: 2200 } : { min: 1100, max: 2000 };

  const comp_bmr = norm(BMR, BMR_range.min, BMR_range.max);
  const comp_muscle = norm(MuscleIndex, 10, 50);
  const comp_fat = norm_inv(bodyFatPercent, 5, 50);
  const comp_whtr = norm_inv(WHtR, 0.35, 0.75);
  
  // New activity component
  const activityMap = { "sedentary": 10, "light": 40, "moderate": 70, "heavy": 90 };
  const comp_activity = activityMap[activity_level] || 40;

  // New weights including activity
  const w_bmr = 0.35, w_muscle = 0.25, w_fat = 0.15, w_whtr = 0.10, w_activity = 0.15;
  const metabolicScore = clamp(
    w_bmr * comp_bmr + w_muscle * comp_muscle + w_fat * comp_fat + w_whtr * comp_whtr + w_activity * comp_activity,
    0, 100
  );

  // New metabolic age multiplier
  const metabolicAge_clinical = Math.round(clamp(18 + (100 - metabolicScore) * 0.4, 18, 90));

  let confidence = 0.5;
  if (muscleMass_kg > 0) confidence += 0.15;
  if (bodyFatPercent > 0) confidence += 0.15;
  if (waist_cm > 0) confidence += 0.10;
  if (triglycerides_mgdl && hdl_mgdl) confidence += 0.10;
  if (!muscleMass_kg && !bodyFatPercent) confidence -= 0.20;
  confidence = clamp(confidence, 0.05, 0.98);

  const contributors = [
    { feature: "BMR", impact: parseFloat((w_bmr * comp_bmr).toFixed(2)) },
    { feature: "MuscleIndex", impact: parseFloat((w_muscle * comp_muscle).toFixed(2)) },
    { feature: "bodyFatPercent", impact: parseFloat((w_fat * comp_fat).toFixed(2)) },
    { feature: "WHtR", impact: parseFloat((w_whtr * comp_whtr).toFixed(2)) },
    { feature: "Activity", impact: parseFloat((w_activity * comp_activity).toFixed(2)) },
  ];
  
  let explanation = `Your metabolic age is estimated based on your BMR, body composition, and key health ratios. A metabolic age lower than your actual age is a good indicator of health.`;
  if (metabolicAge_clinical <= age_years) {
      explanation += ` Yours is currently at or below your chronological age, which is excellent.`;
  } else {
      explanation += ` Yours is currently higher than your chronological age, suggesting areas for improvement.`;
  }

  const recommendations: string[] = [];
  if (comp_fat < 60) recommendations.push('Focus on reducing body fat through consistent caloric deficit and exercise.');
  if (comp_muscle < 60) recommendations.push('Incorporate strength training to build and maintain muscle mass.');
  if (comp_whtr < 60) recommendations.push('Prioritize reducing waist circumference, a key indicator of visceral fat.');
  if (recommendations.length === 0) recommendations.push('Continue maintaining your healthy habits to support your metabolism.');

  return {
    inputs: {
      weight_kg: inputs.weight_kg,
      height_cm: inputs.height_cm,
      age_years: inputs.age_years,
      sex: inputs.sex,
      waist_cm: inputs.waist_cm,
      hip_cm: inputs.hip_cm,
      neck_cm: inputs.neck_cm,
      activity_level: inputs.activity_level,
      bodyFatPercent: inputs.bodyFatPercent,
      muscleMass_kg: inputs.muscleMass_kg,
    },
    derived: {
      BMI: parseFloat(BMI.toFixed(2)),
      WHtR: parseFloat(WHtR.toFixed(2)),
      BMR: parseFloat(BMR.toFixed(2)),
      MuscleIndex: parseFloat(MuscleIndex.toFixed(2)),
    },
    metabolicScore: parseFloat(metabolicScore.toFixed(2)),
    metabolicAge_clinical,
    method: "clinical",
    confidence: parseFloat(confidence.toFixed(2)),
    contributors,
    explanation,
    recommendation: recommendations.join('$$'),
  };
};

export const calculateBmi = (weightKg: number, heightCm: number): number => {
    if (!weightKg || !heightCm || heightCm === 0) return 0;
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    return bmi;
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

const getObesityGrade = (bmi: number): string => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 23) return 'Normal';
    if (bmi < 25) return 'Overweight';
    if (bmi < 30) return 'Obesity Grade I';
    return 'Obesity Grade II';
};

const getBodyType = (bodyFat: number, muscleRate: number, gender: number): string => {
    const isMale = gender === 1;
    const fatNormal = isMale ? [18, 24] : [25, 31];
    const fatHigh = isMale ? 25 : 32;
    
    const muscleNormal = isMale ? [33, 39] : [24, 30];

    if (bodyFat >= fatHigh && muscleRate < muscleNormal[0]) return 'Obese';
    if (bodyFat >= fatHigh && muscleRate >= muscleNormal[0]) return 'Strong Obese';
    if (bodyFat < fatNormal[0] && muscleRate < muscleNormal[0]) return 'Underweight';
    if (bodyFat >= fatNormal[0] && bodyFat < fatHigh && muscleRate < muscleNormal[0]) return 'Skinny Fat';
    if (bodyFat < fatNormal[0] && muscleRate >= muscleNormal[0]) return 'Athletic';
    return 'Healthy';
}

const getIdealBodyFatRange = (age: number, gender: number): [number, number] => {
    const isMale = gender === 1;
    if (isMale) {
        if (age <= 29) return [11, 21];
        if (age <= 39) return [12, 22];
        if (age <= 49) return [14, 24];
        if (age <= 59) return [15, 25];
        return [16, 26];
    } else { // Female
        if (age <= 29) return [16, 28];
        if (age <= 39) return [17, 29];
        if (age <= 49) return [18, 30];
        if (age <= 59) return [19, 31];
        return [20, 32];
    }
};

const calculateProteinRequirement = (weight: number, activityLevel: ActivityLevel, dietType: DietType): { low: number, high: number } => {
    if (dietType !== DietType.WEIGHT_GAIN) { // Fat loss goal
        return { low: parseFloat((weight * 1.8).toFixed(1)), high: parseFloat((weight * 2.2).toFixed(1)) };
    }
    switch (activityLevel) {
        case ActivityLevel.SEDENTARY:
            return { low: parseFloat((weight * 1.0).toFixed(1)), high: parseFloat((weight * 1.0).toFixed(1)) };
        case ActivityLevel.LIGHTLY_ACTIVE:
            return { low: parseFloat((weight * 1.2).toFixed(1)), high: parseFloat((weight * 1.4).toFixed(1)) };
        case ActivityLevel.MODERATELY_ACTIVE:
            return { low: parseFloat((weight * 1.4).toFixed(1)), high: parseFloat((weight * 1.6).toFixed(1)) };
        case ActivityLevel.VERY_ACTIVE:
            return { low: parseFloat((weight * 1.6).toFixed(1)), high: parseFloat((weight * 1.8).toFixed(1)) };
        default:
            return { low: parseFloat((weight * 1.2).toFixed(1)), high: parseFloat((weight * 1.4).toFixed(1)) };
    }
};

const calculateFFMI = (lbm: number, height: number): { ffmi: number, classification: string } => {
    if (height <= 0) return { ffmi: 0, classification: 'N/A' };
    const heightM = height / 100;
    const ffmi = lbm / (heightM * heightM);
    let classification = 'Average';
    if (ffmi > 25) classification = 'Suspiciously High';
    else if (ffmi > 20) classification = 'Muscular';
    else if (ffmi < 18) classification = 'Below Average';
    return { ffmi, classification };
};

const getBodyShape = (whr: number, gender: number): 'Android (Apple)' | 'Gynoid (Pear)' => {
    const isMale = gender === 1;
    if (isMale) {
        return whr > 0.90 ? 'Android (Apple)' : 'Gynoid (Pear)';
    } else {
        return whr > 0.85 ? 'Android (Apple)' : 'Gynoid (Pear)';
    }
};

const calculateMetabolicRiskScore = (bmi: number, whtr: number, bodyFatPercentage: number, visceralFatIndex: number, age: number, gender: number): number => {
    const norm = (val: number, good: number, bad: number) => clamp(((val - good) / (bad - good)) * 100, 0, 100);
    const bmiScore = norm(bmi, 23, 35);
    const whtrScore = norm(whtr, 0.5, 0.7);
    const isMale = gender === 1;
    const fatGood = isMale ? (age < 40 ? 11 : 14) : (age < 40 ? 16 : 18);
    const fatBad = isMale ? (age < 40 ? 25 : 28) : (age < 40 ? 32 : 35);
    const bfScore = norm(bodyFatPercentage, fatGood, fatBad);
    const viScore = norm(visceralFatIndex, 8, 15);
    const ageScore = norm(age, 20, 70);
    const riskScore = bmiScore * 0.10 + whtrScore * 0.30 + bfScore * 0.20 + viScore * 0.30 + ageScore * 0.10;
    return Math.round(clamp(riskScore, 0, 100));
};

export const calculateAllMetrics = (inputs: CalculationInputs): BodyCompositionEntry => {
    const { age, gender, height, weight, waist, neck, hip, tg, hdl, activityLevel, dietType, ethnicity } = inputs;
    
    const bmi = calculateBmi(weight, height);
    let bodyFatPercentage = (1.20 * bmi) + (0.23 * age) - (10.8 * gender) - 5.4;
    bodyFatPercentage = Math.max(0, Math.min(100, bodyFatPercentage));
    const fatMass = weight * (bodyFatPercentage / 100);
    const leanBodyMass = weight - fatMass;

    let bmr = gender === 1 
        ? (10 * weight) + (6.25 * height) - (5 * age) + 5
        : (10 * weight) + (6.25 * height) - (5 * age) - 161;

    if (ethnicity === 'South Asian') { bmr *= 0.94; }

    const whtr = height > 0 ? waist / height : 0;
    const whr = hip > 0 ? waist / hip : 0;
    const muscleMass = gender === 1 ? leanBodyMass * 0.57 : leanBodyMass * 0.48;
    const muscleRate = (muscleMass / weight) * 100;
    const proteinMass = leanBodyMass * 0.17;
    const proteinPercentage = (proteinMass / weight) * 100;
    const tbw = gender === 1 
        ? 2.447 - (0.09516 * age) + (0.1074 * height) + (0.3362 * weight)
        : -2.097 + (0.1069 * height) + (0.2466 * weight);
    const bodyWaterPercentage = (tbw / weight) * 100;
    const visceralFatIndex = Math.round(clamp((whtr - 0.4) * 40 + 5, 1, 30));
    const boneMass = leanBodyMass * 0.15;
    const subcutaneousFatMass = fatMass * 0.85;
    const subcutaneousFatPercentage = (subcutaneousFatMass / weight) * 100;
    const heightInches = height / 2.54;
    const idealWeight = gender === 1 ? 50 + 2.3 * (heightInches - 60) : 45.5 + 2.3 * (heightInches - 60);
    const obesityGrade = getObesityGrade(bmi);
    const bodyType = getBodyType(bodyFatPercentage, muscleRate, gender);
    const { ffmi, classification: ffmiClassification } = calculateFFMI(leanBodyMass, height);
    const idealBodyFatPercentageRange = getIdealBodyFatRange(age, gender);
    const dailyProteinRequirement = calculateProteinRequirement(weight, activityLevel, dietType);
    const dailyWaterRequirement = parseFloat(((weight * 35) / 1000).toFixed(1));
    const bodyShape = getBodyShape(whr, gender);
    const metabolicRiskScore = calculateMetabolicRiskScore(bmi, whtr, bodyFatPercentage, visceralFatIndex, age, gender);

    let activity_level_str: "sedentary" | "light" | "moderate" | "heavy" = "light";
    if (activityLevel === ActivityLevel.SEDENTARY) activity_level_str = "sedentary";
    if (activityLevel === ActivityLevel.LIGHTLY_ACTIVE) activity_level_str = "light";
    if (activityLevel === ActivityLevel.MODERATELY_ACTIVE) activity_level_str = "moderate";
    if (activityLevel === ActivityLevel.VERY_ACTIVE) activity_level_str = "heavy";

    const metabolicAgeAnalysis = calculateMetabolicAge({
        age_years: age, sex: gender === 1 ? "male" : "female", height_cm: height, weight_kg: weight,
        waist_cm: waist, neck_cm: neck, hip_cm: hip, activity_level: activity_level_str,
        bodyFatPercent: bodyFatPercentage, muscleMass_kg: muscleMass, triglycerides_mgdl: tg, hdl_mgdl: hdl, ethnicity: ethnicity,
    });

    return {
        date: new Date().toISOString().split('T')[0],
        bmi: parseFloat(bmi.toFixed(1)),
        bodyFatPercentage: parseFloat(bodyFatPercentage.toFixed(1)),
        leanBodyMass: parseFloat(leanBodyMass.toFixed(1)),
        muscleMass: parseFloat(muscleMass.toFixed(1)),
        proteinMass: parseFloat(proteinMass.toFixed(1)),
        proteinPercentage: parseFloat(proteinPercentage.toFixed(1)),
        bmr: Math.round(bmr),
        whtr: parseFloat(whtr.toFixed(2)),
        whr: parseFloat(whr.toFixed(2)),
        tbw: parseFloat(tbw.toFixed(1)),
        fatMass: parseFloat(fatMass.toFixed(1)),
        visceralFatIndex: visceralFatIndex,
        metabolicAgeAnalysis,
        muscleRate: parseFloat(muscleRate.toFixed(1)),
        bodyWaterPercentage: parseFloat(bodyWaterPercentage.toFixed(1)),
        boneMass: parseFloat(boneMass.toFixed(1)),
        subcutaneousFatPercentage: parseFloat(subcutaneousFatPercentage.toFixed(1)),
        idealWeight: parseFloat(idealWeight.toFixed(1)),
        obesityGrade,
        bodyType,
        // New fields
        ffmi: parseFloat(ffmi.toFixed(1)),
        ffmiClassification,
        idealBodyFatPercentageRange,
        dailyProteinRequirement,
        dailyWaterRequirement,
        bodyShape,
        metabolicRiskScore,
    };
};
