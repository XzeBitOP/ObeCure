import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Validate API URL is configured
if (!import.meta.env.VITE_BACKEND_URL && !import.meta.env.REACT_APP_BACKEND_URL && typeof window !== 'undefined') {
    console.warn('Backend URL not configured. Using localhost fallback.');
}

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    signup: async (name: string, email: string, password: string) => {
        const response = await api.post('/api/auth/signup', { name, email, password });
        return response.data;
    },
    login: async (email: string, password: string) => {
        const response = await api.post('/api/auth/login', { email, password });
        return response.data;
    },
    getMe: async () => {
        const response = await api.get('/api/auth/me');
        return response.data;
    },
};

// Subscription API
export const subscriptionAPI = {
    redeemCode: async (code: string) => {
        const response = await api.post('/api/subscription/redeem', { code });
        return response.data;
    },
    getStatus: async () => {
        const response = await api.get('/api/subscription/status');
        return response.data;
    },
};

// User API
export const userAPI = {
    updatePreferences: async (preferences: any) => {
        const response = await api.put('/api/user/preferences', preferences);
        return response.data;
    },
};

// Logging API
export const logsAPI = {
    logCalories: async (date: string, mealName: string, calories: number, mealType?: string) => {
        const response = await api.post('/api/logs/calories', { date, meal_name: mealName, calories, meal_type: mealType });
        return response.data;
    },
    getCalorieLogs: async (date?: string) => {
        const response = await api.get('/api/logs/calories', { params: { date } });
        return response.data;
    },
    logWorkout: async (date: string, workoutName: string, durationMinutes: number, caloriesBurned?: number) => {
        const response = await api.post('/api/logs/workouts', { 
            date, 
            workout_name: workoutName, 
            duration_minutes: durationMinutes,
            calories_burned: caloriesBurned 
        });
        return response.data;
    },
    getWorkoutLogs: async (date?: string) => {
        const response = await api.get('/api/logs/workouts', { params: { date } });
        return response.data;
    },
    logBodyMetrics: async (date: string, weight: number, waist?: number, chest?: number, hips?: number, bodyFat?: number, notes?: string) => {
        const response = await api.post('/api/logs/body-metrics', { 
            date, 
            weight, 
            waist, 
            chest, 
            hips, 
            body_fat_percentage: bodyFat,
            notes 
        });
        return response.data;
    },
    getBodyMetricsLogs: async (date?: string) => {
        const response = await api.get('/api/logs/body-metrics', { params: { date } });
        return response.data;
    },
};

// Reports API
export const reportsAPI = {
    generateReport: async (startDate: string, endDate: string, reportType: string = 'all') => {
        const response = await api.post('/api/reports/generate', { 
            start_date: startDate, 
            end_date: endDate, 
            report_type: reportType 
        });
        return response.data;
    },
};

// Notifications API
export const notificationsAPI = {
    subscribe: async (subscription: PushSubscription) => {
        const response = await api.post('/api/notifications/subscribe', {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: subscription.toJSON().keys?.p256dh,
                auth: subscription.toJSON().keys?.auth,
            },
        });
        return response.data;
    },
    unsubscribe: async () => {
        const response = await api.delete('/api/notifications/unsubscribe');
        return response.data;
    },
};

export default api;
