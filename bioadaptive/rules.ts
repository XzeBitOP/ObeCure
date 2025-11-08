import { DailyCheckin, PlanItem, Scores, UserProfile, Sku, DailyPlan } from '../types';
import { RULE_THRESHOLDS } from './constants';
import { applyGuardrails, isFiberLow } from './guardrails';

export const applyDosingRules = (
  scores: Scores,
  user: UserProfile,
  checkin: DailyCheckin,
  planHistory: DailyPlan[]
): { plan: PlanItem[]; notes: string[] } => {
    const planItems: PlanItem[] = [];
    const notes: string[] = [];
    const fiber_low = isFiberLow(user, planHistory.map(p => p.date), checkin.date);

    // --- Decision Table (apply in order) ---

    // 1. Gutrify Rules
    if (scores.GLS >= RULE_THRESHOLDS.GUTRIFY_HIGH_GLS || checkin.bloating >= RULE_THRESHOLDS.GUTRIFY_BLOATING || checkin.bowel === "constipated") {
        planItems.push({ sku: 'Gutrify', dose: '1 Sachet', time: 'Post-lunch', reason: 'To manage gut load, bloating, or constipation.' });
        if (scores.GLS >= RULE_THRESHOLDS.GUTRIFY_VERY_HIGH_GLS) {
            planItems.push({ sku: 'Gutrify', dose: '1 Sachet', time: 'Post-dinner', reason: 'Added dose for acute digestive stress.' });
        }
    } else {
        planItems.push({ sku: 'Gutrify', dose: 'Optional', time: 'Post-largest meal', reason: 'For general digestive support if needed.' });
    }

    // 2. FiberFuel Rules
    if (fiber_low || checkin.bowel === "constipated" || checkin.bowel === "irregular") {
        planItems.push({ sku: 'FiberFuel', dose: '1 serving', time: '30 min before dinner', reason: 'To improve fiber intake and bowel regularity.' });
    }
    if (scores.ACS >= RULE_THRESHOLDS.FIBERFUEL_HIGH_ACS) {
        if (!planItems.some(p => p.sku === 'FiberFuel')) {
            planItems.push({ sku: 'FiberFuel', dose: '1 serving', time: '30 min before dinner', reason: 'To manage high appetite score.' });
        }
        planItems.push({ sku: 'FiberFuel', dose: '1 serving', time: '30 min before lunch', reason: 'Additional dose for high appetite & cravings.' });
    }

    // 3. ObeCalm Rules
    if (scores.SCS >= RULE_THRESHOLDS.OBECALM_HIGH_SCS || checkin.sleep_hours < RULE_THRESHOLDS.OBECALM_LOW_SLEEP) {
        planItems.push({ sku: 'ObeCalm', dose: '1 capsule', time: 'After dinner', reason: 'To manage stress and support better sleep.' });
        if (scores.SCS >= RULE_THRESHOLDS.OBECALM_VERY_HIGH_SCS || checkin.side_effects.insomnia) {
            planItems.push({ sku: 'ObeCalm', dose: '1 capsule', time: 'At bedtime', reason: 'Additional dose for acute stress or insomnia.' });
        }
    }

    // NEW CROSS-RULE: Cravings + Poor Sleep
    if (checkin.cravings === 'sweet' && checkin.sleep_hours < RULE_THRESHOLDS.OBECALM_LOW_SLEEP) {
        if (!planItems.some(p => p.sku === 'ObeCalm')) {
            planItems.push({ sku: 'ObeCalm', dose: '1 capsule', time: 'After dinner', reason: 'For sweet cravings linked to poor sleep.' });
        }
        if (!planItems.some(p => p.sku === 'FiberFuel')) {
            planItems.push({ sku: 'FiberFuel', dose: '1 serving', time: '30 min before dinner', reason: 'To help manage cravings from poor sleep.' });
        }
    }

    // 4. LeanPulse Rules
    const allow_stimulant = (checkin.sleep_hours >= RULE_THRESHOLDS.LEANPULSE_MIN_SLEEP) && (user.baseline.caffeine_sensitivity !== 'high') && (!checkin.side_effects.insomnia);
    if (scores.EDS >= RULE_THRESHOLDS.LEANPULSE_HIGH_EDS && allow_stimulant) {
        planItems.push({ sku: 'LeanPulse', dose: '1 tablet', time: 'AM or Pre-workout', reason: 'To boost energy and focus on high energy deficit days.' });
    } else {
        let reason = 'Energy levels are adequate today.';
        if (!allow_stimulant) {
            if (checkin.sleep_hours < RULE_THRESHOLDS.LEANPULSE_MIN_SLEEP) reason = 'Due to insufficient sleep.';
            else if (user.baseline.caffeine_sensitivity === 'high') reason = 'Due to high caffeine sensitivity.';
            else if (checkin.side_effects.insomnia) reason = 'Due to reported insomnia.';
        }
        planItems.push({ sku: 'LeanPulse', dose: 'SKIP today', time: 'N/A', reason });
    }

    // 5. MetaboFix Rules
    const persistentHighMss = planHistory.length >= 7 && planHistory.slice(0, 7).every(p => p.scores.MSS >= RULE_THRESHOLDS.METABOFIX_PERSISTENT_MSS);
    if (scores.MSS >= RULE_THRESHOLDS.METABOFIX_HIGH_MSS) {
        planItems.push({ sku: 'MetaboFix', dose: '1 tablet', time: 'With breakfast', reason: 'To support basal metabolism due to high score.' });
        if (persistentHighMss) {
             if (!planItems.some(p => p.sku === 'MetaboFix' && p.time === 'With lunch')) {
                planItems.push({ sku: 'MetaboFix', dose: '1 tablet', time: 'With lunch', reason: 'Additional dose for persistent metabolic sluggishness.' });
             }
        }
    } else {
        planItems.push({ sku: 'MetaboFix', dose: '1 tablet', time: 'With breakfast', reason: 'Maintenance dose for metabolic support.' });
    }

    // --- Final Guardrails & Notes ---
    const { guardedPlan, guardrailNotes } = applyGuardrails(planItems, user, checkin, planHistory);
    
    // Sort plan for consistent display order
    const skuOrder: Sku[] = ["Gutrify", "FiberFuel", "ObeCalm", "LeanPulse", "MetaboFix"];
    guardedPlan.sort((a, b) => skuOrder.indexOf(a.sku) - skuOrder.indexOf(b.sku));

    return {
        plan: guardedPlan,
        notes: [...notes, ...guardrailNotes],
    };
};