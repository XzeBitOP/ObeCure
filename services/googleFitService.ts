
// Production Google Cloud Credentials
// These keys are restricted by HTTP Referrer in Google Cloud Console
// We use process.env to allow hiding keys in production builds, falling back to provided keys for immediate functionality.
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '936247255031-hd606mc0qbdge7ej72k6dudsosjt88hr.apps.googleusercontent.com'; 
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

    // PREVENT 401/400 ERRORS: Check if using placeholder keys before trying to init
    if (CLIENT_ID.includes('YOUR_NEW_CLIENT_ID')) {
        console.warn("Google Fit: Using placeholder Client ID. Skipping initialization.");
        return false;
    }

    // 1. Ensure the necessary libraries are loaded
    await new Promise<void>((resolve) => gapi.load('client:auth2', resolve));

    try {
        // 2. Initialize the client if not already initialized
        if (!gapi.auth2 || !gapi.auth2.getAuthInstance()) {
             await gapi.client.init({
                apiKey: API_KEY,
                clientId: CLIENT_ID,
                discoveryDocs: DISCOVERY_DOCS,
                scope: SCOPES,
                plugin_name: "ObeCure" 
            });
        }

        // 3. Verify that the auth instance was actually created
        const authInstance = gapi.auth2 && gapi.auth2.getAuthInstance();
        
        if (!authInstance) {
            console.error("CRITICAL: Google Auth2 initialized but instance is null.");
            console.error("CHECK THIS: Go to Google Cloud Console > Credentials > OAuth Client ID.");
            console.error(`Ensure 'Authorized JavaScript origins' includes EXACLTY: ${window.location.origin}`);
            return false;
        }

        return authInstance.isSignedIn.get();
    } catch (error: any) {
        console.error("GAPI Init Failed. Error:", error);
        
        if (error.details) {
            console.error("Error Details:", error.details);
            if (error.details === 'deleted_client') {
                console.error("CRITICAL: The Client ID has been DELETED in Google Cloud Console. Please generate a new one.");
            }
        }
        
        if (error.error === 'idpiframe_initialization_failed') {
            console.error("This specific error usually means 'Authorized JavaScript origins' is missing or incorrect in Google Cloud Console.");
            console.error(`Please add '${window.location.origin}' to your Authorized Origins for Client ID: ${CLIENT_ID}`);
        }

        return false;
    }
};

export const signIn = async (): Promise<boolean> => {
    const gapi = (window as any).gapi;
    if (!gapi) throw new Error("Google API script not loaded");

    // Prevent signing in with invalid configuration
    if (CLIENT_ID.includes('YOUR_NEW_CLIENT_ID')) {
        throw new Error("Client ID not configured. Please check source code.");
    }

    // 1. Check if we have an instance
    let authInstance = gapi.auth2 && gapi.auth2.getAuthInstance();

    // 2. If not, try to initialize manually
    if (!authInstance) {
        console.log("Auth Instance missing, attempting lazy initialization...");
        const initialized = await initClient();
        if (!initialized) {
             throw new Error("Google Fit API could not initialize. Check console for details.");
        }
        // Refresh instance after init
        authInstance = gapi.auth2.getAuthInstance();
    }
    
    // 3. Final check
    if (!authInstance) {
        throw new Error("Google Auth Instance not available. This is likely a configuration issue (e.g. deleted client or bad origin).");
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
