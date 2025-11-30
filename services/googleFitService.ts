
// Helper to safely access process.env without crashing in browser-only environments
const getEnv = (key: string) => {
    try {
        return typeof process !== 'undefined' && process.env ? process.env[key] : undefined;
    } catch (e) {
        return undefined;
    }
};

// Production Google Cloud Credentials
// We use getEnv to safely check for environment variables, falling back to provided keys.
const CLIENT_ID = getEnv('REACT_APP_GOOGLE_CLIENT_ID') || '936247255031-hd606mc0qbdge7ej72k6dudsosjt88hr.apps.googleusercontent.com'; 
const API_KEY = getEnv('REACT_APP_GOOGLE_API_KEY') || 'AIzaSyAAKoSFqg09J7heGLPPmVJcUoJh2vOb2nw';

const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/fitness/v1/rest"];
// Using profile and email scopes for login, activity read for fitness if available
const SCOPES = "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/fitness.activity.read";

export interface FitData {
    steps: number;
    calories: number;
    distance: number; // in km
}

export interface GoogleProfile {
    name: string;
    email: string;
    imageUrl: string;
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

export const getUserProfile = (): GoogleProfile | null => {
    const gapi = (window as any).gapi;
    if (!gapi || !gapi.auth2) return null;
    
    const authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance || !authInstance.isSignedIn.get()) return null;

    const profile = authInstance.currentUser.get().getBasicProfile();
    return {
        name: profile.getName(),
        email: profile.getEmail(),
        imageUrl: profile.getImageUrl(),
    };
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

// Hybrid Strategy: Try Google Fit, Fallback to Local Storage
export const fetchTodaySteps = async (): Promise<FitData> => {
    const gapi = (window as any).gapi;
    let googleFitData = { steps: 0, calories: 0, distance: 0 };
    let fitApiAvailable = false;

    // 1. Attempt to fetch from Google Fit API
    try {
        if (gapi && gapi.client && gapi.client.fitness) {
             const today = new Date();
            today.setHours(0, 0, 0, 0);
            const startTimeMillis = today.getTime();
            const endTimeMillis = Date.now();

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
            if (bucket && bucket.dataset) {
                if (bucket.dataset[0].point[0]) googleFitData.steps = bucket.dataset[0].point[0].value[0].intVal || 0;
                if (bucket.dataset[1].point[0]) googleFitData.calories = Math.round(bucket.dataset[1].point[0].value[0].fpVal || 0);
                if (bucket.dataset[2].point[0]) googleFitData.distance = parseFloat(((bucket.dataset[2].point[0].value[0].fpVal || 0) / 1000).toFixed(2));
                fitApiAvailable = true;
            }
        }
    } catch (e) {
        console.warn("Google Fit API fetch failed, checking local storage.", e);
    }

    // 2. If API worked and has data, return it
    if (fitApiAvailable && googleFitData.steps > 0) {
        return googleFitData;
    }

    // 3. Fallback: Fetch from Local Storage (Manual Mode)
    return new Promise((resolve) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const raw = localStorage.getItem('obeCureLocalSteps');
            if (raw) {
                const data = JSON.parse(raw);
                if (data.date === today) {
                    // Merge logic: If API returned 0 but manual has data, use manual. 
                    // Ideally we'd sync them, but for now we prioritize manual if API fails/is empty.
                    resolve(data.stats);
                    return;
                }
            }
            // If no manual data either, return zero or whatever API found (likely 0)
            resolve(googleFitData);
        } catch (e) {
            resolve(googleFitData);
        }
    });
};

export const saveManualSteps = (steps: number): FitData => {
    const calories = Math.round(steps * 0.045); 
    const distance = parseFloat((steps * 0.000762).toFixed(2));
    
    const stats = { steps, calories, distance };
    const data = {
        date: new Date().toISOString().split('T')[0],
        stats
    };
    
    localStorage.setItem('obeCureLocalSteps', JSON.stringify(data));
    return stats;
};
