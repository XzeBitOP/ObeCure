import { DailyCheckin, DailyPlan, PlanItem, UserProfile } from "../types";

export const isFiberLow = (user: UserProfile, planDates: string[], checkinDate: string): boolean => {
    const isMixedDiet = user.baseline.diet_pattern === "mixed";
    
    // This is a proxy. A more robust solution would check if FiberFuel was in the plan and if compliance was no/partial.
    // For now, any non-perfect compliance is a flag.
    const missedFiberFuel = false; // Placeholder for more complex history check if needed

    return isMixedDiet || missedFiberFuel;
};

export const applyGuardrails = (
    plan: PlanItem[],
    user: UserProfile,
    checkin: DailyCheckin,
    planHistory: DailyPlan[]
): { guardedPlan: PlanItem[], guardrailNotes: string[] } => {
    let guardedPlan = [...plan];
    const guardrailNotes: string[] = [];
    const { contra } = user.baseline;
    const { side_effects } = checkin;

    // Hard stops for contraindications
    if (contra.pregnant || contra.breastfeeding || contra.under18) {
        guardedPlan = guardedPlan.filter(item => item.sku !== 'MetaboFix' && item.sku !== 'LeanPulse');
        guardrailNotes.push("MetaboFix & LeanPulse are not recommended during pregnancy, breastfeeding, or for users under 18.");
    }
    
    // Palpitations after LeanPulse
    if (side_effects.palpitations) {
        const leanPulseInRecentPlans = planHistory.slice(0,3).some(p => p.plan.some(item => item.sku === 'LeanPulse'));
        if (leanPulseInRecentPlans) {
             guardedPlan = guardedPlan.filter(item => item.sku !== 'LeanPulse');
             guardrailNotes.push("LeanPulse is on hold for 3 days due to reported palpitations. Consult a doctor if they persist.");
        }
    }
    
    // Loose stools
    if (side_effects.loose_stools) {
        guardedPlan = guardedPlan.filter(item => item.sku !== 'FiberFuel');
        guardrailNotes.push("FiberFuel is on hold today due to loose stools. Reintroduce slowly once symptoms resolve.");
    }

    // Medication spacing
    if (user.baseline.conditions.thyroid === 'hypo') {
        guardrailNotes.push("Thyroid Medication: Take MetaboFix and FiberFuel at least 4 hours apart from your thyroid medication (e.g., levothyroxine).");
    }

    if (user.baseline.conditions.diabetes) {
        guardrailNotes.push("Diabetes Medication: Monitor your blood sugar levels, as improved metabolic health may require adjusting medication doses with your doctor.");
    }

    // GERD condition
    if (user.baseline.conditions.gerd) {
        const leanPulseItem = guardedPlan.find(item => item.sku === 'LeanPulse');
        if (leanPulseItem && leanPulseItem.dose !== 'SKIP today') {
            leanPulseItem.caution = "Take after a meal, not on an empty stomach, due to GERD.";
        }
        guardrailNotes.push("GERD/Acidity: Avoid LeanPulse on an empty stomach. Take Gutrify only after a meal.");
    }

    return { guardedPlan, guardrailNotes };
};