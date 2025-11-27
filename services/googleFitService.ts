/**
 * LOCAL STEP TRACKING SERVICE
 * 
 * Replaces the deprecated Google Fit API integration.
 * Handles reading and writing daily step counts to localStorage.
 */

export interface FitData {
    steps: number;
    calories: number;
    distance: number; // in km
}

const STORAGE_KEY = 'obeCureLocalSteps';

// Get today's date string in YYYY-MM-DD format
const getTodayStr = () => new Date().toISOString().split('T')[0];

export const fetchTodaySteps = async (): Promise<FitData> => {
    // Simulate an async call to keep potential future API structure compatibility
    return new Promise((resolve) => {
        try {
            const today = getTodayStr();
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const data = JSON.parse(raw);
                // Check if the stored data is for today
                if (data.date === today) {
                    resolve(data.stats);
                    return;
                }
            }
            // Default zero if no data for today or parsing failed
            resolve({ steps: 0, calories: 0, distance: 0 });
        } catch (e) {
            console.error("Error reading steps from local storage", e);
            resolve({ steps: 0, calories: 0, distance: 0 });
        }
    });
};

export const saveSteps = async (steps: number): Promise<FitData> => {
    return new Promise((resolve) => {
        try {
            // Simple estimation formulas
            const calories = Math.round(steps * 0.045); // Approx 0.045 kcal per step
            const distance = parseFloat((steps * 0.000762).toFixed(2)); // Approx 0.762 meters per step, converted to km
            
            const stats = { steps, calories, distance };
            const data = {
                date: getTodayStr(),
                stats
            };
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            resolve(stats);
        } catch (e) {
            console.error("Error saving steps to local storage", e);
            resolve({ steps: 0, calories: 0, distance: 0 });
        }
    });
};

// Deprecated functions kept as no-ops to prevent build crashes if referenced elsewhere
// In a full refactor, these would be removed from consumer components.
export const loadGoogleApi = (cb: () => void) => cb(); 
export const initClient = async () => false;
export const signIn = async () => false;
export const signOut = async () => {};
