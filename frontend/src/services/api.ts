import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';

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

export default api;
