
import { DailyPlan, PhenotypeName, Scores } from '../types';
import { RULE_THRESHOLDS } from './constants';

export const computePhenotype = (
  planHistory: DailyPlan[]
): { primary: PhenotypeName; secondary?: PhenotypeName } => {
  
  if (planHistory.length === 0) {
      return { primary: 'Balanced' };
  }
  
  const recentScores = planHistory.slice(0, 7).map(p => p.scores);
  
  const avgScores: Record<keyof Omit<Scores, 'id' | 'user_id' | 'date'>, number> = {
      GLS: 0, ACS: 0, SCS: 0, EDS: 0, MSS: 0
  };
  
  const scoreKeys = Object.keys(avgScores) as (keyof typeof avgScores)[];

  for(const key of scoreKeys) {
      const sum = recentScores.reduce((acc, s) => acc + s[key], 0);
      avgScores[key] = sum / recentScores.length;
  }
  
  const scoreEntries = Object.entries(avgScores) as [keyof typeof avgScores, number][];
  
  // Sort by score descending
  scoreEntries.sort(([, scoreA], [, scoreB]) => scoreB - scoreA);

  const getPhenotypeFromScore = (scoreKey: keyof typeof avgScores): PhenotypeName => {
    switch (scoreKey) {
      case 'GLS': return 'Gut-dominant';
      case 'ACS': return 'Appetite-dominant';
      case 'SCS': return 'Stress-dominant';
      case 'EDS': return 'Energy-deficit';
      case 'MSS': return 'Metabolic-sluggish';
      default: return 'Balanced';
    }
  };
  
  if(scoreEntries[0][1] < RULE_THRESHOLDS.PHENOTYPE_SECONDARY_MIN_SCORE) {
      return { primary: 'Balanced' };
  }
  
  const primary = getPhenotypeFromScore(scoreEntries[0][0]);
  let secondary: PhenotypeName | undefined = undefined;

  if (scoreEntries.length > 1 && scoreEntries[1][1] > RULE_THRESHOLDS.PHENOTYPE_SECONDARY_MIN_SCORE) {
      const secondaryPhenotype = getPhenotypeFromScore(scoreEntries[1][0]);
      if (secondaryPhenotype !== primary) {
          secondary = secondaryPhenotype;
      }
  }

  return { primary, secondary };
};
