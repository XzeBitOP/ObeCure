import { ActivityLevel, BodyCompositionEntry, Sex, MetabolicAgeAnalysis } from '../types';

interface CalculationInputs {
    age: number;
    gender: number; // 0 for female, 1 for male
    height: number; // cm
    weight: number; // kg
    waist: number; // cm
    neck: number; // cm
    hip: number; // cm
    activityLevel: ActivityLevel;
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
}

const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

export const calculateMetabolicAge = (inputs: MetabolicAgeInputs): MetabolicAgeAnalysis => {
  const { weight_kg, height_cm, age_years, sex, waist_cm, bodyFatPercent, muscleMass_kg, triglycerides_mgdl, hdl_mgdl } = inputs;
  
  const height_m = height_cm / 100;
  const BMI = weight_kg / (height_m ** 2);
  const WHtR = waist_cm / height_cm;
  const MuscleIndex = (muscleMass_kg / weight_kg) * 100;
  const BMR = sex === "male"
    ? 10 * weight_kg + 6.25 * height_cm - 5 * age_years + 5
    : 10 * weight_kg + 6.25 * height_cm - 5 * age_years - 161;

  const norm = (x: number, min: number, max: number) => clamp(((x - min) / (max - min)) * 100, 0, 100);
  const norm_inv = (x: number, min: number, max: number) => 100 - norm(x, min, max);

  const BMR_range = sex === "male" ? { min: 1200, max: 2200 } : { min: 1100, max: 2000 };

  const comp_bmr = norm(BMR, BMR_range.min, BMR_range.max);
  const comp_muscle = norm(MuscleIndex, 10, 50);
  const comp_fat = norm_inv(bodyFatPercent, 5, 50);
  const comp_whtr = norm_inv(WHtR, 0.35, 0.75);

  const w_bmr = 0.40, w_muscle = 0.25, w_fat = 0.20, w_whtr = 0.15;
  const metabolicScore = clamp(
    w_bmr * comp_bmr + w_muscle * comp_muscle + w_fat * comp_fat + w_whtr * comp_whtr,
    0, 100
  );

  const metabolicAge_clinical = Math.round(clamp(18 + (100 - metabolicScore) * 0.6, 18, 90));

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

export const calculateAllMetrics = (inputs: CalculationInputs): BodyCompositionEntry => {
    const { age, gender, height, weight, waist, neck, hip, tg, hdl, activityLevel } = inputs;
    
    const bmi = calculateBmi(weight, height);

    // Deurenberg BMI-based body fat formula
    let bodyFatPercentage = (1.20 * bmi) + (0.23 * age) - (10.8 * gender) - 5.4;
    bodyFatPercentage = Math.max(0, Math.min(100, bodyFatPercentage));

    const fatMass = weight * (bodyFatPercentage / 100);
    const leanBodyMass = weight - fatMass;

    // Katch-McArdle BMR formula
    const bmr = 370 + (21.6 * leanBodyMass);

    const whtr = height > 0 ? waist / height : 0;
    const whr = hip > 0 ? waist / hip : 0;

    const muscleMass = gender === 1 ? leanBodyMass * 0.57 : leanBodyMass * 0.48;
    const proteinMass = leanBodyMass * 0.17;
    const proteinPercentage = (proteinMass / weight) * 100;

    // Watson formula for Total Body Water
    const tbw = gender === 1 
        ? 2.447 - (0.09516 * age) + (0.1074 * height) + (0.3362 * weight)
        : -2.097 + (0.1069 * height) + (0.2466 * weight);
    
    // Estimated Visceral Fat Index based on WHtR
    const visceralFatIndex = Math.round(clamp((whtr - 0.4) * 50 + 5, 1, 30));

    let activity_level_str: "sedentary" | "light" | "moderate" | "heavy" = "light";
    if (activityLevel === ActivityLevel.SEDENTARY) activity_level_str = "sedentary";
    if (activityLevel === ActivityLevel.LIGHTLY_ACTIVE) activity_level_str = "light";
    if (activityLevel === ActivityLevel.MODERATELY_ACTIVE) activity_level_str = "moderate";
    if (activityLevel === ActivityLevel.VERY_ACTIVE) activity_level_str = "heavy";

    const metabolicAgeAnalysis = calculateMetabolicAge({
        age_years: age,
        sex: gender === 1 ? "male" : "female",
        height_cm: height,
        weight_kg: weight,
        waist_cm: waist,
        neck_cm: neck,
        hip_cm: hip,
        activity_level: activity_level_str,
        bodyFatPercent: bodyFatPercentage,
        muscleMass_kg: muscleMass,
        triglycerides_mgdl: tg,
        hdl_mgdl: hdl,
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
    };
};