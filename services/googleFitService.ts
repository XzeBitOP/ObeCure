
// Production Google Cloud Credentials
// These keys are restricted by HTTP Referrer in Google Cloud Console
// We use process.env to allow hiding keys in production builds, falling back to provided keys for immediate functionality.
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '936247255031-2efv5se59p6dn8mqu72pnl0b7amboqto.apps.googleusercontent.com'; 
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY || 'AIzaSyAAKoSFqg09J7heGLPPmVJcUoJh2vOb2nw';

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
        console.warn("Google API script not loaded in index.html");
        return;
    }
    gapi.load('client:auth2', callback);
};

export const initClient = async (): Promise<boolean> => {
    const gapi = (window as any).gapi;
    if (!gapi) return false;

    // 1. Ensure the necessary libraries are loaded
    await new Promise<void>((resolve) => gapi.load('client:auth2', resolve));

    try {
        // 2. Initialize the client if not already initialized
        // We check getAuthInstance to see if init has successfully run before
        if (!gapi.auth2 || !gapi.auth2.getAuthInstance()) {
             await gapi.client.init({
                apiKey: API_KEY,
                clientId: CLIENT_ID,
                discoveryDocs: DISCOVERY_DOCS,
                scope: SCOPES,
            });
        }

        // 3. Verify that the auth instance was actually created
        const authInstance = gapi.auth2 && gapi.auth2.getAuthInstance();
        
        if (!authInstance) {
            console.warn("Google Auth2 initialized but instance is null. This usually means the Client ID is incorrect or the Origin is not allowed in Google Cloud Console.");
            return false;
        }

        return authInstance.isSignedIn.get();
    } catch (error) {
        console.warn("Google Fit Init Error:", error);
        return false;
    }
};

export const signIn = async (): Promise<boolean> => {
    const gapi = (window as any).gapi;
    if (!gapi) throw new Error("Google API script not loaded");

    // 1. Check if we have an instance
    let authInstance = gapi.auth2 && gapi.auth2.getAuthInstance();

    // 2. If not, try to initialize manually
    if (!authInstance) {
        console.log("Auth Instance missing, attempting lazy initialization...");
        const initialized = await initClient();
        if (!initialized) {
             throw new Error("Google Fit API could not initialize. Check your network connection or API keys.");
        }
        // Refresh instance after init
        authInstance = gapi.auth2.getAuthInstance();
    }
    
    // 3. Final check
    if (!authInstance) {
        throw new Error("Google Auth Instance not available even after initialization.");
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
        // Attempt lazy load if missing (edge case)
        await initClient();
        if (!gapi.client || !gapi.client.fitness) {
             throw new Error("Google Fit API not loaded or initialized");
        }
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
