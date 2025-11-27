
import React, { useState, useEffect } from 'react';
import * as fitService from '../services/googleFitService';
import SuccessToast from './SuccessToast';

interface StepCounterProps {}

// Fallback Icon if you don't want to create a new file right now, defined inline
const ShoeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M18.32,3.06C16.65,2.29 14.91,2 13.5,2C10.09,2 7.97,3.8 6.39,6.74L3.66,11.81C2.59,13.81 2,15.61 2,17C2,19.76 4.24,22 7,22C8.57,22 9.95,21.27 10.86,20.12C11.62,21.25 12.94,22 14.5,22C17.54,22 20,19.54 20,16.5C20,15.64 19.78,14.83 19.4,14.12L21.34,10.5C21.76,9.71 21.46,8.73 20.68,8.31L18.32,3.06M17.6,13.16C17.32,13.03 16.98,13.15 16.85,13.43L16.13,15.03C15.9,15.54 15.3,15.76 14.79,15.53C14.28,15.3 14.06,14.7 14.29,14.19L15.72,11.03C15.77,10.91 15.78,10.79 15.74,10.67L14.5,7.91L13.26,10.67C13.22,10.79 13.23,10.91 13.28,11.03L14.71,14.19C14.94,14.7 14.72,15.3 14.21,15.53C13.7,15.76 13.1,15.54 12.87,15.03L12.15,13.43C12.02,13.15 11.68,13.03 11.4,13.16C11.12,13.29 11,13.63 11.13,13.91L12.5,16.95C12.85,17.72 13.61,18.22 14.46,18.22C15.31,18.22 16.07,17.72 16.42,16.95L17.87,13.91C18,13.63 17.88,13.29 17.6,13.16Z" />
    </svg>
);

const StepCounter: React.FC<StepCounterProps> = () => {
    const [steps, setSteps] = useState(0);
    const [calories, setCalories] = useState(0);
    const [distance, setDistance] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [toast, setToast] = useState<{ title: string, message: string, quote: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [initFailed, setInitFailed] = useState(false);

    const GOAL = 10000;

    useEffect(() => {
        fitService.loadGoogleApi(async () => {
            const signedIn = await fitService.initClient();
            setIsConnected(signedIn);
            
            if (signedIn) {
                refreshData();
            } else {
                // If init returns false, it might mean keys are invalid or just not signed in.
                // We'll assume not signed in for now, but if keys are invalid, handleConnect will catch it.
            }
        });
    }, []);

    const refreshData = async () => {
        setIsLoading(true);
        try {
            const data = await fitService.fetchTodaySteps();
            setSteps(data.steps);
            setCalories(data.calories);
            setDistance(data.distance);
            setIsDemoMode(false);
        } catch (error) {
            console.warn("Fetch error, switching to demo mode:", error);
            if (!isDemoMode) {
                setToast({
                    title: "Connection Issue",
                    message: "Could not fetch live data (Check API Keys). Switched to Demo Mode.",
                    quote: "Visualizing success is the first step."
                });
                enableDemoMode();
            }
        } finally {
            setIsLoading(false);
        }
    };

    const enableDemoMode = () => {
        setIsDemoMode(true);
        // Don't set isConnected true here visually, or distinguish it
        setSteps(5420);
        setCalories(280);
        setDistance(3.8);
    };

    const handleConnect = async () => {
        if (isDemoMode) {
            // If in demo mode, clicking connect tries to reconnect real API
            setIsLoading(true);
        }
        
        try {
            await fitService.signIn();
            setIsConnected(true);
            setIsDemoMode(false); // successfully connected
            setInitFailed(false);
            refreshData();
        } catch (error: any) {
            console.error("Sign in failed:", error);
            // Use a flag to prevent infinite retry loops if user keeps clicking
            setInitFailed(true); 
            enableDemoMode();
            
            const isConfigError = error.message === "API Keys not configured" || error.message === "Google Auth Instance not available";

            setToast({
                title: isConfigError ? "Demo Mode Active" : "Google Fit Unavailable",
                message: isConfigError 
                    ? "Google Fit setup required. Showing demo data." 
                    : "Unable to sign in. Showing demo data instead.",
                quote: "Keep moving forward."
            });
        } finally {
            setIsLoading(false);
        }
    };

    const progress = Math.min(100, (steps / GOAL) * 100);
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 animate-fade-in relative overflow-hidden">
            {toast && <SuccessToast {...toast} onClose={() => setToast(null)} />}
            
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full">
                        <ShoeIcon className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-200">Daily Steps</h3>
                        {isDemoMode && <span className="text-[10px] bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300">Demo Mode</span>}
                    </div>
                </div>
                {(!isConnected || isDemoMode) && (
                    <button 
                        onClick={handleConnect}
                        className="text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-full transition-colors shadow-sm"
                    >
                        {isDemoMode ? "Retry Connect" : "Connect Google Fit"}
                    </button>
                )}
                {isConnected && !isDemoMode && (
                    <button onClick={refreshData} className={`text-gray-400 hover:text-orange-500 transition ${isLoading ? 'animate-spin' : ''}`}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                )}
            </div>

            {/* Main Content */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-4xl font-bold text-gray-800 dark:text-gray-100">
                        {steps.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        / {GOAL.toLocaleString()} goal
                    </p>
                    
                    <div className="flex gap-4 mt-4">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 uppercase font-semibold">Calories</span>
                            <span className="font-bold text-orange-500">{calories} <span className="text-xs text-gray-500">kcal</span></span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 uppercase font-semibold">Distance</span>
                            <span className="font-bold text-blue-500">{distance} <span className="text-xs text-gray-500">km</span></span>
                        </div>
                    </div>
                </div>

                {/* Progress Ring */}
                <div className="relative w-24 h-24 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90 drop-shadow-lg">
                        {/* Track Circle */}
                        <circle
                            cx="48" cy="48" r="40"
                            className="stroke-gray-100 dark:stroke-gray-700"
                            strokeWidth="8" fill="none"
                            strokeLinecap="round"
                        />
                        {/* Progress Circle */}
                        <circle
                            cx="48" cy="48" r="40"
                            className="stroke-cyan-400 transition-all duration-1000 ease-out"
                            strokeWidth="8" fill="none"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            style={{ filter: 'drop-shadow(0px 0px 3px rgba(34, 211, 238, 0.6))' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{Math.round(progress)}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StepCounter;
