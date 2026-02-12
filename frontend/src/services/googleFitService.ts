
// Helper to safely access process.env
const getEnv = (key: string) => {
    try {
        return typeof process !== 'undefined' && process.env ? process.env[key] : undefined;
    } catch (e) {
        return undefined;
    }
};

// Production Credentials - Must be set in environment variables
const CLIENT_ID = getEnv('REACT_APP_GOOGLE_CLIENT_ID');
const API_KEY = getEnv('REACT_APP_GOOGLE_API_KEY');

// Validate credentials are set
if (!CLIENT_ID || !API_KEY) {
    console.warn('Google Fit integration disabled: Missing REACT_APP_GOOGLE_CLIENT_ID or REACT_APP_GOOGLE_API_KEY');
}

const FITNESS_DISCOVERY_URL = "https://www.googleapis.com/discovery/v1/apis/fitness/v1/rest";

// Scopes
const BASIC_SCOPES = "profile email"; 
const FITNESS_SCOPES = "https://www.googleapis.com/auth/fitness.activity.read";

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

// Track initialization state
let isFitnessApiLoaded = false;

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
    if (!gapi) return false;

    await new Promise<void>((resolve) => gapi.load('client:auth2', resolve));

    try {
        // STEP 1: Basic Init (No API Key, No Discovery Docs)
        // This ensures Sign In works even if API Key is restricted to Fitness only.
        if (!gapi.auth2 || !gapi.auth2.getAuthInstance()) {
             await gapi.client.init({
                clientId: CLIENT_ID,
                scope: BASIC_SCOPES, 
                plugin_name: "ObeCure",
                // Fix for "Invalid cookiePolicy" and localhost/Vercel issues
                // @ts-ignore
                cookie_policy: 'single_host_origin'
            });
        }

        const authInstance = gapi.auth2 && gapi.auth2.getAuthInstance();
        
        if (!authInstance) {
            console.error("CRITICAL: Google Auth2 initialized but instance is null.");
            if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
                 alert(`Google Auth requires HTTPS. Current: ${window.location.protocol}`);
            }
            return false;
        }

        return authInstance.isSignedIn.get();
    } catch (error: any) {
        console.error("GAPI Basic Init Failed:", error);
        
        // Improve error message visibility
        const errorMsg = error?.details || error?.error || JSON.stringify(error);
        
        if (error.error === 'idpiframe_initialization_failed' || errorMsg.includes('cookie')) {
             alert(`GAPI Error: ${errorMsg}\n\nHint: Add "${window.location.origin}" to Authorized Origins in Google Cloud Console.`);
        }
        return false;
    }
};

// STEP 2: Lazy Load Fitness API (Called only when connecting to Fitness)
export const ensureFitnessInitialized = async (): Promise<boolean> => {
    if (isFitnessApiLoaded) return true;
    
    const gapi = (window as any).gapi;
    if (!gapi || !gapi.client) return false;

    try {
        // Set API Key now
        gapi.client.setApiKey(API_KEY);
        
        // Load Fitness Docs
        await gapi.client.load(FITNESS_DISCOVERY_URL);
        
        isFitnessApiLoaded = true;
        return true;
    } catch (error) {
        console.error("Failed to load Fitness API:", error);
        alert("Failed to load Fitness API. Please check if 'Fitness API' is enabled in Google Console.");
        return false;
    }
};

export const signIn = async (): Promise<boolean> => {
    const gapi = (window as any).gapi;
    if (!gapi) throw new Error("Google API script not loaded");

    let authInstance = gapi.auth2 && gapi.auth2.getAuthInstance();

    if (!authInstance) {
        await initClient();
        authInstance = gapi.auth2 && gapi.auth2.getAuthInstance();
    }
    
    if (!authInstance) {
        alert("Google Auth failed to initialize. Check console for details.");
        return false;
    }

    try {
        await authInstance.signIn();
        return true;
    } catch (error: any) {
        console.error("Sign In Error:", error);
        if (error.error !== 'popup_closed_by_user') {
            alert(`Sign In Failed: ${error.error || JSON.stringify(error)}`);
        }
        return false;
    }
};

export const requestFitnessPermissions = async (): Promise<boolean> => {
    const gapi = (window as any).gapi;
    if (!gapi) return false;

    // Ensure API bits are loaded first (API Key injection)
    const apiLoaded = await ensureFitnessInitialized();
    if (!apiLoaded) return false;

    const authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance) return false;

    const user = authInstance.currentUser.get();
    
    // Check if we already have fitness scope
    if (user.hasGrantedScopes(FITNESS_SCOPES)) {
        return true;
    }

    try {
        const options = new gapi.auth2.SigninOptionsBuilder();
        options.setScope(FITNESS_SCOPES);
        await user.grant(options);
        return true;
    } catch (error: any) {
        console.error("Fitness Permission Error:", error);
        return false;
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
        await gapi.auth2.getAuthInstance().signOut();
    }
};

export const fetchTodaySteps = async (): Promise<FitData> => {
    const gapi = (window as any).gapi;
    let googleFitData = { steps: 0, calories: 0, distance: 0 };
    let fitApiAvailable = false;

    // Check permissions and load API
    const authInstance = gapi?.auth2?.getAuthInstance();
    if (authInstance) {
        const user = authInstance.currentUser.get();
        if (user.hasGrantedScopes(FITNESS_SCOPES)) {
             await ensureFitnessInitialized(); // Ensure API key is set and docs loaded
             
             if (gapi.client && gapi.client.fitness) {
                try {
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
                            bucketByTime: { durationMillis: 86400000 }, 
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
                } catch (e) {
                    console.warn("API Fetch failed", e);
                }
             }
        }
    }

    if (fitApiAvailable && googleFitData.steps > 0) {
        return googleFitData;
    }

    return fetchLocalSteps(googleFitData);
};

const fetchLocalSteps = (defaultData: FitData): Promise<FitData> => {
    return new Promise((resolve) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const raw = localStorage.getItem('obeCureLocalSteps');
            if (raw) {
                const data = JSON.parse(raw);
                if (data.date === today) {
                    resolve(data.stats);
                    return;
                }
            }
            resolve(defaultData);
        } catch (e) {
            resolve(defaultData);
        }
    });
}

export const saveManualSteps = (steps: number): FitData => {
    const calories = Math.round(steps * 0.045); 
    const distance = parseFloat((steps * 0.000762).toFixed(2));
    const stats = { steps, calories, distance };
    const data = { date: new Date().toISOString().split('T')[0], stats };
    localStorage.setItem('obeCureLocalSteps', JSON.stringify(data));
    return stats;
};
