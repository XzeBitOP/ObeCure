

import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, DailyCheckin, DailyPlan } from '../../types';
import * as repository from '../../bioadaptive/repository';
import { plannerService } from '../../bioadaptive/plannerService';

import BaselineForm from './BaselineForm';
import DailyCheckinForm from './DailyCheckinForm';
import DailyPlanView from './DailyPlanView';
import { LeafIcon } from '../icons/LeafIcon';
import GeneratingBioPlan from './GeneratingBioPlan';

interface BioAdaptivePlannerProps {
    // No subscription props needed anymore
}

type ViewState = 'loading' | 'needs_baseline' | 'needs_checkin' | 'show_plan';

const BioAdaptivePlanner: React.FC<BioAdaptivePlannerProps> = () => {
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
        }, 3500); // Increased duration for the new animation
    };
    
    const handleEditBaseline = () => {
        setViewState('needs_baseline');
    };
    
    const handleNewCheckin = () => {
        setTodaysPlan(null);
        // We already have today's checkin in state, so the form will be pre-filled
        setViewState('needs_checkin');
    }
    
    if (isProcessing) {
        return <GeneratingBioPlan />;
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
