
import { DailyCheckin, Scores, UserProfile } from '../types';
import { SCORING_WEIGHTS, RULE_THRESHOLDS } from './constants';

function calculateBMI(weight_kg: number, height_cm: number): number {
    if (height_cm <= 0) return 0;
    const height_m = height_cm / 100;
    return weight_kg / (height_m * height_m);
}

export const computeScores = (
  user: UserProfile,
  checkin: DailyCheckin,
  history: DailyCheckin[]
): Scores => {
  const W = SCORING_WEIGHTS;

  // Helpers
  const bmi = checkin.weight_kg ? calculateBMI(checkin.weight_kg, user.height_cm) : calculateBMI(user.baseline.weight_kg, user.height_cm);
  
  const fiber_low = (() => {
      const isMixedDiet = user.baseline.diet_pattern === "mixed";
      const missedFiberFuel = history.slice(0, 2).filter(h => h.compliance === 'no' || h.compliance === 'partial').length >= 2;
      return isMixedDiet || missedFiberFuel;
  })();

  const weight_trend_7d = (() => {
      const relevantHistory = [checkin, ...history].filter(h => h.weight_kg).slice(0, 7);
      if (relevantHistory.length < 2) return 0;
      const latestWeight = relevantHistory[0].weight_kg!;
      const oldestWeight = relevantHistory[relevantHistory.length - 1].weight_kg!;
      return latestWeight - oldestWeight;
  })();

  const morning_energy = checkin.energy; // Use today's energy as a proxy per new logic
  const sleep_deficit_multiplier = Math.max(0, 7 - checkin.sleep_hours);

  // Score Calculations
  const GLS =
    W.GLS.bloating * (checkin.bloating * 10) +
    W.GLS.bowel * (checkin.bowel === "constipated" ? 80 : (checkin.bowel === "loose" ? 40 : (checkin.bowel === "irregular" ? 60 : 0))) +
    W.GLS.hydration * (sleep_deficit_multiplier * 8) + // UPDATED: Now based on sleep, not hydration
    W.GLS.fiber * (fiber_low ? 60 : 0);

  const ACS =
    W.ACS.hunger * (checkin.hunger * 10) +
    W.ACS.cravings * (checkin.cravings === "sweet" ? 80 : (checkin.cravings === "salty" || checkin.cravings === "fried" ? 60 : 0)) +
    W.ACS.sleep * (sleep_deficit_multiplier * 10) +
    W.ACS.stress * (checkin.stress * 4);

  const SCS =
    W.SCS.stress * (checkin.stress * 10) +
    W.SCS.sleep * (sleep_deficit_multiplier * 10) +
    W.SCS.insomnia * (checkin.side_effects.insomnia ? 100 : 0);

  const EDS =
    W.EDS.sleep * (sleep_deficit_multiplier * 10) +
    W.EDS.energy * ((10 - checkin.energy) * 10) +
    W.EDS.focus * ((10 - checkin.focus) * 10) +
    W.EDS.activity * (checkin.activity === "none" ? 80 : (checkin.activity === "<30" ? 40 : 0));

  const MSS =
    W.MSS.bmi * (bmi > RULE_THRESHOLDS.MSS_BMI_THRESHOLD ? 80 : 20) +
    W.MSS.steps * ((checkin.steps || 0) < RULE_THRESHOLDS.MSS_STEPS_THRESHOLD ? 70 : 10) +
    W.MSS.weight_trend * (weight_trend_7d > RULE_THRESHOLDS.MSS_WEIGHT_TREND_THRESHOLD ? 80 : 10) +
    W.MSS.morning_energy * (morning_energy < RULE_THRESHOLDS.MSS_MORNING_ENERGY_THRESHOLD ? 70 : 10);

  // FIX: Added return statement to satisfy the function's declared return type 'Scores'.
  return {
    id: checkin.id,
    user_id: user.id,
    date: checkin.date,
    GLS: Math.min(100, Math.round(GLS)),
    ACS: Math.min(100, Math.round(ACS)),
    SCS: Math.min(100, Math.round(SCS)),
    EDS: Math.min(100, Math.round(EDS)),
    MSS: Math.min(100, Math.round(MSS)),
  };
};