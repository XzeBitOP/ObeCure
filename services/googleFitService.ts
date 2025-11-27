
// Placeholder keys - REPLACE THESE with your actual Google Cloud Credentials
const CLIENT_ID = '936247255031-lpf6r402dp3i84qv5slog48q0cphl4bt.apps.googleusercontent.com'; 
const API_KEY = 'AIzaSyAAKoSFqg09J7heGLPPmVJcUoJh2vOb2nw'; 

const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/fitness/v1/rest"];
const SCOPES = "https://www.googleapis.com/auth/fitness.activity.read";

export interface FitData {
    steps: number;
    calories: number;
    distance: number; // in km
}

export const loadGoogleApi = (callback: () => void) => {
    if (typeof window === 'undefined') return;
    const gapi = (window as any).gapi;
    if (!gapi) {
        console.warn("Google API script not loaded");
        return;
    }
    gapi.load('client:auth2', callback);
};

export const initClient = async (): Promise<boolean> => {
    const gapi = (window as any).gapi;
    if (!gapi || !gapi.client) return false;

    // PREVENT 401 ERROR: Check if using placeholder keys
    if (CLIENT_ID.includes('YOUR_CLIENT_ID') || API_KEY.includes('YOUR_API_KEY')) {
        console.warn("Google Fit API keys are placeholders. Skipping initialization to prevent 401 error.");
        return false;
    }

    try {
        await gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES,
        });
        
        // Check if auth2 is actually initialized
        if (!gapi.auth2) {
            console.warn("Google Auth2 not initialized (likely due to invalid keys)");
            return false;
        }

        const authInstance = gapi.auth2.getAuthInstance();
        if (!authInstance) return false;

        return authInstance.isSignedIn.get();
    } catch (error) {
        console.warn("Google Fit Init Error (Likely missing/invalid keys). Switching to Demo Mode internally.", error);
        return false;
    }
};

export const signIn = async (): Promise<boolean> => {
    if (CLIENT_ID.includes('YOUR_CLIENT_ID')) {
         throw new Error("API Keys not configured");
    }

    const gapi = (window as any).gapi;
    if (!gapi || !gapi.auth2) {
        throw new Error("Google Auth API not initialized");
    }
    
    const authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance) {
        throw new Error("Google Auth Instance not available");
    }

    try {
        await authInstance.signIn();
        return true;
    } catch (error) {
        console.error("Google Sign-In Error:", error);
        throw error;
    }
};

export const signOut = async (): Promise<void> => {
    const gapi = (window as any).gapi;
    if(gapi && gapi.auth2) {
        const authInstance = gapi.auth2.getAuthInstance();
        if (authInstance) {
            await authInstance.signOut();
        }
    }
};

export const fetchTodaySteps = async (): Promise<FitData> => {
    const gapi = (window as any).gapi;
    // Double check if client and fitness API are loaded
    if (!gapi || !gapi.client || !gapi.client.fitness) {
        // This mimics the error user saw, but now we catch it upstream usually.
        // Throwing here allows the UI to catch it and switch to demo mode.
        throw new Error("Google Fit API not loaded or initialized");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startTimeMillis = today.getTime();
    const endTimeMillis = Date.now();

    try {
        const response = await gapi.client.fitness.users.dataset.aggregate({
            userId: 'me',
            resource: {
                aggregateBy: [
                    { dataTypeName: "com.google.step_count.delta", dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps" },
                    { dataTypeName: "com.google.calories.expended", dataSourceId: "derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended" },
                    { dataTypeName: "com.google.distance.delta", dataSourceId: "derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta" }
                ],
                bucketByTime: { durationMillis: 86400000 }, // 24 hours
                startTimeMillis: startTimeMillis,
                endTimeMillis: endTimeMillis
            }
        });

        const bucket = response.result.bucket[0];
        let steps = 0;
        let calories = 0;
        let distance = 0;

        if (bucket && bucket.dataset) {
            // Steps
            if (bucket.dataset[0].point[0]) {
                steps = bucket.dataset[0].point[0].value[0].intVal || 0;
            }
            // Calories
            if (bucket.dataset[1].point[0]) {
                calories = bucket.dataset[1].point[0].value[0].fpVal || 0;
            }
            // Distance
            if (bucket.dataset[2].point[0]) {
                distance = (bucket.dataset[2].point[0].value[0].fpVal || 0) / 1000; // Convert m to km
            }
        }

        return { steps, calories: Math.round(calories), distance: parseFloat(distance.toFixed(2)) };

    } catch (error) {
        console.error("Error fetching fitness data:", error);
        throw error;
    }
};
