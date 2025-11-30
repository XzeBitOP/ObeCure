
import React, { useState, useEffect } from 'react';
import * as googleFitService from '../services/googleFitService';
import SuccessToast from './SuccessToast';
import { ShoeIcon } from './icons/ShoeIcon';
import InfoModal from './InfoModal';

interface StepCounterProps {}

const StepCounter: React.FC<StepCounterProps> = () => {
    const [steps, setSteps] = useState(0);
    const [calories, setCalories] = useState(0);
    const [distance, setDistance] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isDemoMode, setIsDemoMode] = useState(false);

    const GOAL = 10000;

    useEffect(() => {
        // Initial check if user is already signed in
        googleFitService.loadGoogleApi(async () => {
            const signedIn = await googleFitService.initClient();
            if (signedIn) {
                setIsConnected(true);
                fetchData();
            } else if (!process.env.REACT_APP_GOOGLE_CLIENT_ID && !process.env.REACT_APP_GOOGLE_API_KEY) {
                // If no keys configured, degrade to demo mode to prevent crashes
            }
        });
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const data = await googleFitService.fetchTodaySteps();
            setSteps(data.steps);
            setCalories(data.calories);
            setDistance(data.distance);
            setError(null);
        } catch (err: any) {
            console.error("Failed to fetch steps", err);
            // If fetch fails, it might be auth issue or API issue
            if (err.message && err.message.includes('not loaded')) {
                 setIsConnected(false); // Force re-login
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleConnect = async () => {
        try {
            setError(null);
            setIsLoading(true);
            const success = await googleFitService.signIn();
            if (success) {
                setIsConnected(true);
                await fetchData();
            } else {
                // If sign in returns false (e.g. popup closed), just stop loading
                setIsLoading(false);
            }
        } catch (err: any) {
            console.error("Connection failed", err);
            setIsLoading(false);
            
            // Check for specific error types to give better feedback
            if (err.message === "API Keys not configured" || err.message.includes("Client ID not configured")) {
                setIsDemoMode(true);
                setError("Demo Mode: Google Fit API keys are missing.");
                // Set fake data for demo
                setSteps(5420);
                setCalories(280);
                setDistance(3.8);
            } else if (err.error === 'popup_closed_by_user') {
                setError(null); // User cancelled, no error
            } else if (err.message.includes("Origin Mismatch") || err.message.includes("Authorized JavaScript origins") || err.message.includes("Auth Instance not available")) {
                 setError(`Setup Error: Tap to see the fix.`);
            } else {
                setError("Could not connect. Tap for help.");
            }
        }
    };

    const progress = Math.min(100, (steps / GOAL) * 100);
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 animate-fade-in relative overflow-hidden">
            <InfoModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} title="Connection Help" buttonText="Got it">
                <div className="text-sm space-y-4">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="font-bold text-red-700 dark:text-red-300 mb-1">Step 1: Copy this URL</p>
                        <code className="block bg-white dark:bg-gray-900 p-2 rounded border border-gray-300 dark:border-gray-600 font-mono text-xs break-all select-all">
                            {window.location.origin}
                        </code>
                    </div>

                    <div>
                        <p className="font-bold text-gray-800 dark:text-gray-200 mb-1">Step 2: Add it to Google Console</p>
                        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
                            <li>Go to <b>Credentials &gt; OAuth Client ID</b>.</li>
                            <li>Paste the URL into <b>Authorized JavaScript origins</b>.</li>
                            <li>Click Save and wait 5 minutes.</li>
                        </ol>
                    </div>

                    <hr className="border-gray-200 dark:border-gray-600"/>
                    
                    <div>
                        <p className="font-bold text-gray-800 dark:text-gray-200 mb-1">Step 3: "App not verified"?</p>
                        <p className="text-gray-600 dark:text-gray-400">
                            If you see a warning screen, click <b>Advanced</b> (bottom left) &rarr; <b>Go to ObeCure (unsafe)</b>.
                        </p>
                    </div>
                </div>
            </InfoModal>

            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full">
                        <ShoeIcon className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            Daily Steps
                            {isDemoMode && <span className="text-[10px] bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300">Demo Mode</span>}
                        </h3>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            {isConnected ? 'Synced with Google Fit' : 'Connect to track'}
                        </p>
                    </div>
                </div>
                {!isConnected && !isDemoMode && (
                    <button 
                        onClick={handleConnect}
                        disabled={isLoading}
                        className="text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-full transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1"
                    >
                        {isLoading ? 'Connecting...' : 'Connect'}
                    </button>
                )}
                {isDemoMode && (
                     <button onClick={() => {setIsDemoMode(false); handleConnect();}} className="text-xs text-blue-500 hover:underline">Retry Connect</button>
                )}
            </div>

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
            
            {error && (
                <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg" onClick={() => setIsHelpOpen(true)}>
                    <p className="text-xs text-red-600 dark:text-red-300 text-center cursor-pointer hover:underline font-semibold">
                        {error}
                    </p>
                </div>
            )}
        </div>
    );
};

export default StepCounter;
