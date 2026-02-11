import { UserProfile, DailyCheckin, DailyPlan } from '../types';

const USER_PROFILE_KEY = 'bioadaptive_userProfile_v1';
const CHECKIN_HISTORY_KEY = 'bioadaptive_checkinHistory_v1';
const PLAN_HISTORY_KEY = 'bioadaptive_planHistory_v1';
const PLAN_SHARED_KEY = 'bioadaptive_planShared_v1';
const PLAN_ACKNOWLEDGED_KEY = 'bioadaptive_planAcknowledged_v1';

// --- User Profile ---
export const saveUserProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error("Error saving user profile to localStorage:", error);
  }
};

export const getUserProfile = (): UserProfile | null => {
  try {
    const data = localStorage.getItem(USER_PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error reading user profile from localStorage:", error);
    return null;
  }
};

// --- Daily Check-in ---
export const saveDailyCheckin = (checkin: DailyCheckin): void => {
  try {
    const history = getCheckinHistory(30); // Get recent history
    const today = new Date().toISOString().split('T')[0];
    const filteredHistory = history.filter(c => c.date !== today);
    const newHistory = [checkin, ...filteredHistory];
    localStorage.setItem(CHECKIN_HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error("Error saving check-in to localStorage:", error);
  }
};

export const getCheckinHistory = (days: number): DailyCheckin[] => {
  try {
    const data = localStorage.getItem(CHECKIN_HISTORY_KEY);
    const history: DailyCheckin[] = data ? JSON.parse(data) : [];
    return history
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, days);
  } catch (error) {
    console.error("Error reading check-in history from localStorage:", error);
    return [];
  }
};

export const getDailyCheckin = (date: string): DailyCheckin | null => {
  try {
    const history = getCheckinHistory(30); // Reuse existing function to get data
    return history.find(c => c.date === date) || null;
  } catch (error) {
    console.error("Error getting daily check-in from localStorage:", error);
    return null;
  }
};

// --- Daily Plan ---
export const saveDailyPlan = (plan: DailyPlan): void => {
  try {
    const history = getPlanHistory(30);
    const today = new Date().toISOString().split('T')[0];
    const filteredHistory = history.filter(p => p.date !== today);
    const newHistory = [plan, ...filteredHistory];
    localStorage.setItem(PLAN_HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error("Error saving daily plan to localStorage:", error);
  }
};

export const getDailyPlan = (date: string): DailyPlan | null => {
  try {
    const history = getPlanHistory(30);
    return history.find(p => p.date === date) || null;
  } catch (error) {
    console.error("Error getting daily plan from localStorage:", error);
    return null;
  }
};

export const getPlanHistory = (days: number): DailyPlan[] => {
    try {
        const data = localStorage.getItem(PLAN_HISTORY_KEY);
        const history: DailyPlan[] = data ? JSON.parse(data) : [];
        return history
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, days);
    } catch (error) {
        console.error("Error reading plan history from localStorage:", error);
        return [];
    }
};

// --- Plan Sharing ---
export const logPlanShare = (date: string): void => {
    try {
        const data = localStorage.getItem(PLAN_SHARED_KEY);
        const sharedData: Record<string, string> = data ? JSON.parse(data) : {};
        sharedData[date] = new Date().toISOString();
        localStorage.setItem(PLAN_SHARED_KEY, JSON.stringify(sharedData));
    } catch (error) {
        console.error("Error logging plan share:", error);
    }
};

// --- Plan Acknowledgement ---
export const logPlanAcknowledgement = (date: string): void => {
    try {
        const data = localStorage.getItem(PLAN_ACKNOWLEDGED_KEY);
        const acknowledgedData: Record<string, boolean> = data ? JSON.parse(data) : {};
        acknowledgedData[date] = true;
        localStorage.setItem(PLAN_ACKNOWLEDGED_KEY, JSON.stringify(acknowledgedData));
    } catch (error) {
        console.error("Error logging plan acknowledgement:", error);
    }
};

export const isPlanAcknowledged = (date: string): boolean => {
    try {
        const data = localStorage.getItem(PLAN_ACKNOWLEDGED_KEY);
        const acknowledgedData: Record<string, boolean> = data ? JSON.parse(data) : {};
        return acknowledgedData[date] === true;
    } catch (error) {
        console.error("Error checking plan acknowledgement:", error);
        return false;
    }
};