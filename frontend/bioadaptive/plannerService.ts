
import { UserProfile, DailyCheckin, DailyPlan } from '../types';
import * as repository from './repository';
import { computeScores } from './scoring';
import { computePhenotype } from './phenotypes';
import { applyDosingRules } from './rules';

class OfflinePlannerService {
    public async buildDailyPlan(user: UserProfile, checkin: DailyCheckin): Promise<DailyPlan> {
        return new Promise((resolve) => {
            const checkinHistory = repository.getCheckinHistory(7);
            const planHistory = repository.getPlanHistory(7);
            
            // 1. Compute Scores
            const scores = computeScores(user, checkin, checkinHistory);
            
            // 2. Determine Phenotype
            const phenotype = computePhenotype(planHistory);
            
            // 3. Apply Rules
            const { plan, notes } = applyDosingRules(scores, user, checkin, planHistory);

            // 4. Assemble the final plan object
            const dailyPlan: DailyPlan = {
                id: crypto.randomUUID(),
                user_id: user.id,
                date: checkin.date,
                phenotype,
                scores,
                plan,
                notes,
                created_at: new Date().toISOString(),
            };

            // 5. Persist everything for future reference
            repository.saveDailyCheckin(checkin);
            repository.saveDailyPlan(dailyPlan);
            
            resolve(dailyPlan);
        });
    }
}

// Export a singleton instance of the service
export const plannerService = new OfflinePlannerService();
