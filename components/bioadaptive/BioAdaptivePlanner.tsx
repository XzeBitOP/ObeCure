
import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, DailyCheckin, DailyPlan } from '../../types';
import * as repository from '../../bioadaptive/repository';
import { plannerService } from '../../bioadaptive/plannerService';

import BaselineForm from './BaselineForm';
import DailyCheckinForm from './DailyCheckinForm';
import DailyPlanView from './DailyPlanView';
import { LeafIcon } from '../icons/LeafIcon';

interface BioAdaptivePlannerProps {
    isSubscribed: boolean;
    onOpenSubscriptionModal: () => void;
}

type ViewState = 'loading' | 'needs_baseline' | 'needs_checkin' | 'show_plan';

const BioAdaptivePlanner: React.FC<BioAdaptivePlannerProps> = ({ isSubscribed, onOpenSubscriptionModal }) => {
    const [viewState, setViewState] = useState<ViewState>('loading');
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [todaysPlan, setTodaysPlan] = useState<DailyPlan | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [todaysCheckin, setTodaysCheckin] = useState<DailyCheckin | null>(null);

    const loadData = useCallback(() => {
        const profile = repository.getUserProfile();
        setUserProfile(profile);

        if (!profile) {
            setViewState('needs_baseline');
            return;
        }
        
        const today = new Date().toISOString().split('T')[0];
        const plan = repository.getDailyPlan(today);
        setTodaysPlan(plan);

        // Also load today's checkin data if it exists
        const checkin = repository.getDailyCheckin(today);
        setTodaysCheckin(checkin);

        if (plan) {
            setViewState('show_plan');
        } else {
            setViewState('needs_checkin');
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleBaselineSaved = (profile: UserProfile) => {
        setUserProfile(profile);
        setViewState('needs_checkin');
    };

    const handleCheckinComplete = async (checkin: DailyCheckin) => {
        if (!userProfile) return;
        setIsProcessing(true);
        setTodaysCheckin(checkin);
        
        // Simulate processing time for better UX
        setTimeout(async () => {
            try {
                const plan = await plannerService.buildDailyPlan(userProfile, checkin);
                setTodaysPlan(plan);
                setViewState('show_plan');
            } catch (error) {
                console.error("Failed to build daily plan:", error);
                // Optionally show an error message to the user
                setViewState('needs_checkin');
            } finally {
                setIsProcessing(false);
            }
        }, 2500);
    };
    
    const handleEditBaseline = () => {
        setViewState('needs_baseline');
    };
    
    const handleNewCheckin = () => {
        setTodaysPlan(null);
        // We already have today's checkin in state, so the form will be pre-filled
        setViewState('needs_checkin');
    }

    if (!isSubscribed) {
        return (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center animate-fade-in-up">
                 <LeafIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Unlock BioAdaptive Ayurveda™</h2>
                <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    This premium feature provides personalized Ayurvedic supplement recommendations based on your daily inputs. Subscribe to access your daily plan.
                </p>
                <button
                    onClick={onOpenSubscriptionModal}
                    className="mt-6 bg-orange-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-orange-600 transition-all duration-300 shadow-md active:scale-95"
                >
                    Subscribe Now
                </button>
            </div>
        );
    }
    
    if (isProcessing) {
        return (
             <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center animate-fade-in-up min-h-[400px] flex flex-col justify-center items-center">
                <svg className="animate-spin h-12 w-12 text-orange-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Analyzing your check-in...</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Generating your personalized BioAdaptive plan.</p>
            </div>
        )
    }

    switch (viewState) {
        case 'loading':
            return <div className="text-center p-10 text-gray-500 dark:text-gray-400">Loading Your Plan...</div>;
        case 'needs_baseline':
            return <BaselineForm onSave={handleBaselineSaved} existingProfile={userProfile} />;
        case 'needs_checkin':
            return userProfile ? <DailyCheckinForm user={userProfile} onSubmit={handleCheckinComplete} existingCheckin={todaysCheckin} /> : null;
        case 'show_plan':
            return todaysPlan && userProfile ? <DailyPlanView plan={todaysPlan} user={userProfile} onEditBaseline={handleEditBaseline} onNewCheckin={handleNewCheckin} /> : <div className="text-center p-10 text-gray-500 dark:text-gray-400">Could not load today's plan. Please try again.</div>;
        default:
            return <div className="text-center p-10 text-red-500">An unexpected error occurred.</div>;
    }
};

export default BioAdaptivePlanner;
