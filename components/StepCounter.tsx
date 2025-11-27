
import React, { useState, useEffect } from 'react';
import * as fitService from '../services/googleFitService';
import SuccessToast from './SuccessToast';
import { ShoeIcon } from './icons/ShoeIcon';

interface StepCounterProps {}

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
                    message: "Could not fetch live data. Switched to Demo Mode.",
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
        setSteps(5420);
        setCalories(280);
        setDistance(3.8);
    };

    const handleConnect = async () => {
        if (isDemoMode) {
            setIsLoading(true);
        }
        
        try {
            await fitService.signIn();
            setIsConnected(true);
            setIsDemoMode(false);
            setInitFailed(false);
            refreshData();
        } catch (error: any) {
            console.error("Sign in failed:", error);
            setInitFailed(true); 
            enableDemoMode();
            
            // Generic fallback message if specific error detection fails
            let title = "Google Fit Unavailable";
            let message = "Unable to sign in. Showing demo data instead.";

            if (error.message === "API Keys not configured" || error.message === "Google Auth Instance not available") {
                 title = "Demo Mode Active";
                 message = "Google Fit setup required. Showing demo data.";
            } else if (error.message.includes("Google Fit API could not initialize")) {
                 title = "Initialization Failed";
                 message = "Could not load Google Fit. Switching to Demo.";
            }

            setToast({
                title: title,
                message: message,
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
                    <div className="flex flex-col items-end">
                        <button 
                            onClick={handleConnect}
                            className="text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-full transition-colors shadow-sm"
                        >
                            {isDemoMode ? "Retry Connect" : "Connect Google Fit"}
                        </button>
                        {initFailed && !isDemoMode && (
                             <button onClick={() => { alert("If you see a warning screen from Google, click 'Advanced' -> 'Go to ObeCure (unsafe)' to proceed. This is normal for new apps."); }} className="text-[10px] text-gray-400 mt-1 underline">Trouble connecting?</button>
                        )}
                    </div>
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
