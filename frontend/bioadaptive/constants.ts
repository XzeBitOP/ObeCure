
import { Sku } from '../types';

export const SKUS: Sku[] = ["Gutrify", "FiberFuel", "ObeCalm", "LeanPulse", "MetaboFix"];

// Score Calculation Constants (from spec)
export const SCORING_WEIGHTS = {
  GLS: {
    bloating: 0.45,
    bowel: 0.25,
    hydration: 0.15,
    fiber: 0.15,
  },
  ACS: {
    hunger: 0.5,
    cravings: 0.2,
    sleep: 0.15,
    stress: 0.15,
  },
  SCS: {
    stress: 0.6,
    sleep: 0.25,
    insomnia: 0.15,
  },
  EDS: {
    sleep: 0.45,
    energy: 0.25,
    focus: 0.15,
    activity: 0.15,
  },
  MSS: {
    bmi: 0.35,
    steps: 0.25,
    weight_trend: 0.2,
    morning_energy: 0.2,
  },
};

// Rule Thresholds (from spec)
export const RULE_THRESHOLDS = {
  // Main thresholds
  GUTRIFY_HIGH_GLS: 70,
  GUTRIFY_VERY_HIGH_GLS: 80,
  GUTRIFY_BLOATING: 6,
  FIBERFUEL_HIGH_ACS: 70,
  OBECALM_HIGH_SCS: 70,
  OBECALM_VERY_HIGH_SCS: 80,
  OBECALM_LOW_SLEEP: 6,
  LEANPULSE_HIGH_EDS: 65,
  LEANPULSE_MIN_SLEEP: 6.5,
  METABOFIX_HIGH_MSS: 65,
  METABOFIX_PERSISTENT_MSS: 70,
  
  // Phenotype secondary threshold
  PHENOTYPE_SECONDARY_MIN_SCORE: 50,

  // MSS calculation thresholds
  MSS_BMI_THRESHOLD: 27,
  MSS_STEPS_THRESHOLD: 6000,
  MSS_WEIGHT_TREND_THRESHOLD: 0,
  MSS_MORNING_ENERGY_THRESHOLD: 6,
};
