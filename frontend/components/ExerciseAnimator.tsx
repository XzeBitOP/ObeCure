
import React, { useMemo } from 'react';

interface ExerciseAnimatorProps {
    exerciseName: string;
    isResting?: boolean;
}

type AnimationType = 'squat' | 'jack' | 'pushup' | 'leg-raise' | 'stretch' | 'run' | 'breathing';

const getAnimationType = (name: string): AnimationType => {
    const lower = name.toLowerCase();
    if (lower.includes('squat') || lower.includes('sit-to-stand') || lower.includes('chair')) return 'squat';
    if (lower.includes('jack') || lower.includes('step-up') || lower.includes('march')) return 'jack';
    if (lower.includes('push') || lower.includes('plank') || lower.includes('burpee')) return 'pushup';
    if (lower.includes('leg') || lower.includes('knee') || lower.includes('kick')) return 'leg-raise';
    if (lower.includes('stretch') || lower.includes('twist') || lower.includes('slide') || lower.includes('yoga') || lower.includes('salutation')) return 'stretch';
    if (lower.includes('jog') || lower.includes('run')) return 'run';
    return 'breathing';
};

const ExerciseAnimator: React.FC<ExerciseAnimatorProps> = ({ exerciseName, isResting = false }) => {
    const type = useMemo(() => isResting ? 'breathing' : getAnimationType(exerciseName), [exerciseName, isResting]);

    const color = isResting ? '#60a5fa' : '#f97316'; // Blue for rest, Orange for work

    const renderStickFigure = () => {
        switch (type) {
            case 'squat':
                return (
                    <g className="animate-[ex-squat-body_2s_ease-in-out_infinite]">
                        {/* Head */}
                        <circle cx="70" cy="70" r="20" stroke={color} strokeWidth="8" fill="none" />
                        {/* Body */}
                        <line x1="70" y1="90" x2="70" y2="150" stroke={color} strokeWidth="8" strokeLinecap="round" />
                        {/* Arms (Fixed Out) */}
                        <path d="M 70 100 L 110 130" stroke={color} strokeWidth="8" strokeLinecap="round" />
                        <path d="M 70 100 L 30 130" stroke={color} strokeWidth="8" strokeLinecap="round" />
                        {/* Legs (Animating) */}
                        <path className="animate-[ex-squat-legs_2s_ease-in-out_infinite]" d="M 70 150 L 70 200 L 70 250" stroke={color} strokeWidth="8" strokeLinecap="round" fill="none" />
                        <path className="animate-[ex-squat-legs_2s_ease-in-out_infinite]" style={{transformOrigin: '70px 150px', transform: 'scaleX(-1)'}} d="M 70 150 L 70 200 L 70 250" stroke={color} strokeWidth="8" strokeLinecap="round" fill="none" />
                    </g>
                );
            case 'jack':
            case 'run':
                return (
                    <g>
                        {/* Head */}
                        <circle cx="100" cy="50" r="20" stroke={color} strokeWidth="8" fill="none" className="animate-[ex-breathe_0.5s_ease-in-out_infinite]" />
                        {/* Body */}
                        <line x1="100" y1="70" x2="100" y2="150" stroke={color} strokeWidth="8" strokeLinecap="round" />
                        {/* Arms */}
                        <path className="animate-[ex-jack-arms_1s_ease-in-out_infinite]" d="M 100 80 L 100 130" stroke={color} strokeWidth="8" strokeLinecap="round" />
                        <path className="animate-[ex-jack-arms_1s_ease-in-out_infinite]" style={{transformOrigin: '100px 80px', transform: 'scaleX(-1)'}} d="M 100 80 L 100 130" stroke={color} strokeWidth="8" strokeLinecap="round" />
                        {/* Legs */}
                        <path className="animate-[ex-jack-legs_1s_ease-in-out_infinite]" d="M 100 150 L 100 250" stroke={color} strokeWidth="8" strokeLinecap="round" />
                        <path className="animate-[ex-jack-legs_1s_ease-in-out_infinite]" style={{transformOrigin: '100px 150px', transform: 'scaleX(-1)'}} d="M 100 150 L 100 250" stroke={color} strokeWidth="8" strokeLinecap="round" />
                    </g>
                );
            case 'pushup':
                return (
                    <g className="animate-[ex-pushup-body_2s_ease-in-out_infinite]" style={{transformOrigin: '150px 250px'}}>
                         {/* Floor */}
                         <line x1="0" y1="260" x2="200" y2="260" stroke="#e5e7eb" strokeWidth="4" />
                        {/* Whole body as one unit mostly */}
                        {/* Head */}
                        <circle cx="50" cy="180" r="20" stroke={color} strokeWidth="8" fill="none" />
                        {/* Body */}
                        <line x1="50" y1="180" x2="150" y2="250" stroke={color} strokeWidth="8" strokeLinecap="round" />
                        {/* Arms */}
                        <path d="M 70 200 L 70 260" stroke={color} strokeWidth="8" strokeLinecap="round" />
                        {/* Legs */}
                        <line x1="150" y1="250" x2="180" y2="260" stroke={color} strokeWidth="8" strokeLinecap="round" />
                    </g>
                );
            case 'leg-raise':
                return (
                    <g>
                        {/* Head */}
                        <circle cx="100" cy="60" r="20" stroke={color} strokeWidth="8" fill="none" />
                        {/* Body */}
                        <line x1="100" y1="80" x2="100" y2="150" stroke={color} strokeWidth="8" strokeLinecap="round" />
                        {/* Arms */}
                        <path d="M 100 90 L 130 130" stroke={color} strokeWidth="8" strokeLinecap="round" />
                        <path d="M 100 90 L 70 130" stroke={color} strokeWidth="8" strokeLinecap="round" />
                        {/* Stationary Leg */}
                        <line x1="100" y1="150" x2="100" y2="250" stroke={color} strokeWidth="8" strokeLinecap="round" />
                        {/* Moving Leg */}
                        <path className="animate-[ex-leg-raise_2s_ease-in-out_infinite]" d="M 100 150 L 100 250" stroke={color} strokeWidth="8" strokeLinecap="round" />
                    </g>
                );
            case 'stretch':
                return (
                    <g className="animate-[ex-stretch-body_4s_ease-in-out_infinite]">
                        {/* Head */}
                        <circle cx="100" cy="60" r="20" stroke={color} strokeWidth="8" fill="none" />
                        {/* Body */}
                        <line x1="100" y1="80" x2="100" y2="150" stroke={color} strokeWidth="8" strokeLinecap="round" />
                        {/* Arms Up */}
                        <path d="M 100 90 L 130 30" stroke={color} strokeWidth="8" strokeLinecap="round" />
                        <path d="M 100 90 L 70 30" stroke={color} strokeWidth="8" strokeLinecap="round" />
                        {/* Legs */}
                        <line x1="100" y1="150" x2="80" y2="250" stroke={color} strokeWidth="8" strokeLinecap="round" />
                        <line x1="100" y1="150" x2="120" y2="250" stroke={color} strokeWidth="8" strokeLinecap="round" />
                    </g>
                );
            case 'breathing':
            default:
                return (
                    <g className="animate-[ex-breathe_3s_ease-in-out_infinite]" style={{transformOrigin: '100px 150px'}}>
                        {/* Head */}
                        <circle cx="100" cy="80" r="20" stroke={color} strokeWidth="8" fill="none" />
                        {/* Body */}
                        <line x1="100" y1="100" x2="100" y2="180" stroke={color} strokeWidth="8" strokeLinecap="round" />
                        {/* Arms (Resting) */}
                        <path d="M 100 110 L 130 160" stroke={color} strokeWidth="8" strokeLinecap="round" />
                        <path d="M 100 110 L 70 160" stroke={color} strokeWidth="8" strokeLinecap="round" />
                        {/* Legs (Lotus ish) */}
                        <path d="M 100 180 L 140 220" stroke={color} strokeWidth="8" strokeLinecap="round" />
                        <path d="M 100 180 L 60 220" stroke={color} strokeWidth="8" strokeLinecap="round" />
                    </g>
                );
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 200 300" className="h-48 w-auto">
                {renderStickFigure()}
            </svg>
        </div>
    );
};

export default ExerciseAnimator;
