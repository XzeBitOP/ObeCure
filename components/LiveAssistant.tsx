import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HealthCondition } from '../types';
import { getWorkoutPlanForConditions, WorkoutPlan } from '../data/workouts';

const USER_PREFERENCES_KEY = 'obeCureUserPreferences';

const workerScript = `
  let timerId = null;
  self.onmessage = function(e) {
    if (e.data.command === 'start') {
      if (timerId) clearInterval(timerId);
      timerId = setInterval(() => {
        self.postMessage('tick');
      }, 1000);
    } else if (e.data.command === 'stop') {
      if(timerId) clearInterval(timerId);
      timerId = null;
    }
  };
`;

const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M8 5v14l11-7z" /></svg>;
const PauseIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>;
const ResetIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" /></svg>;
const WhatsAppIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.79.52 3.48 1.45 4.93L2 22l5.3-1.52c1.38.84 2.96 1.33 4.61 1.33h.11c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zM12.04 20.35h-.09c-1.49 0-2.93-.42-4.17-1.2l-.3-.18-3.11.9.92-3.03-.2-.32c-.86-1.35-1.32-2.94-1.32-4.61 0-4.6 3.73-8.33 8.33-8.33s8.33 3.73 8.33 8.33-3.73 8.35-8.33 8.35zm4.4-5.37c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.64-1.19-1.43-1.33-1.67-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42s-.54-1.29-.74-1.77c-.2-.48-.4-.41-.54-.42-.14 0-.3 0-.46 0s-.42.06-.64.3c-.22.24-.86.84-1.06 2.04-.2 1.2.22 2.37.5 3.19.28.82 1.39 2.66 3.36 3.74 1.97 1.08 2.63 1.2 3.53 1.04.9-.16 1.52-.76 1.73-1.44.22-.68.22-1.25.16-1.44-.06-.19-.22-.3-.46-.42z"></path>
    </svg>
);


const ConditionSelector: React.FC<{ onConfirm: (conditions: HealthCondition[]) => void }> = ({ onConfirm }) => {
    const [selection, setSelection] = useState<HealthCondition[]>([]);
    const [isNone, setIsNone] = useState(false);

    const handleConditionChange = (condition: HealthCondition) => {
        setIsNone(false);
        setSelection(prev =>
            prev.includes(condition)
                ? prev.filter(c => c !== condition)
                : [...prev, condition]
        );
    };

    const handleNoneChange = () => {
        setSelection([]);
        setIsNone(true);
    };

    const handleSubmit = () => {
        onConfirm(selection);
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Personalize Your Workout</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Select any existing health conditions to get a tailored workout plan. This helps us recommend safe and effective exercises.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                {Object.values(HealthCondition).map((condition) => (
                    <label key={condition} className="flex items-center space-x-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                        <input type="checkbox" checked={selection.includes(condition)} onChange={() => handleConditionChange(condition)} className="h-5 w-5 rounded border-gray-300 text-orange-500 focus:ring-orange-400"/>
                        <span>{condition}</span>
                    </label>
                ))}
            </div>
             <label className="flex items-center space-x-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mt-4">
                <input type="checkbox" checked={isNone} onChange={handleNoneChange} className="h-5 w-5 rounded border-gray-300 text-orange-500 focus:ring-orange-400"/>
                <span className="font-semibold">None of the above (General Plan)</span>
            </label>
            <button onClick={handleSubmit} disabled={selection.length === 0 && !isNone} className="mt-6 w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors duration-300 disabled:bg-orange-300 disabled:cursor-not-allowed shadow-md">
                Confirm & Start Workout
            </button>
        </div>
    );
};

const UniversalTips: React.FC = () => (
    <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">Universal Tips for Fat Loss</h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <li className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"><strong>Be consistent:</strong> 30–40 min/day, 5 days/week</li>
            <li className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"><strong>Walk 15–20 min</strong> after meals</li>
            <li className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"><strong>Drink 2.5–3 L</strong> water daily</li>
            <li className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"><strong>Eat high protein</strong> (1.2–1.5 g/kg/day)</li>
            <li className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"><strong>Sleep 7–8 hours</strong> every night</li>
            <li className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"><strong>Stay patient</strong> and trust the process</li>
        </ul>
    </div>
);


const Workouts: React.FC = () => {
    const [selectedConditions, setSelectedConditions] = useState<HealthCondition[] | undefined>(undefined);
    const [showSelector, setShowSelector] = useState(false);
    const [isWorkoutFinished, setIsWorkoutFinished] = useState(false);

    const listRef = useRef<HTMLDivElement>(null);
    const timerWorkerRef = useRef<Worker | null>(null);
    const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        const savedPrefsRaw = localStorage.getItem(USER_PREFERENCES_KEY);
        if (savedPrefsRaw) {
            const savedPrefs = JSON.parse(savedPrefsRaw);
            if (Array.isArray(savedPrefs.healthConditions)) {
                setSelectedConditions(savedPrefs.healthConditions);
            } else {
                setShowSelector(true);
            }
        } else {
            setShowSelector(true);
        }
    }, []);

    const activeWorkoutPlan = useMemo(() => {
        if (selectedConditions === undefined) return null;
        return getWorkoutPlanForConditions(selectedConditions);
    }, [selectedConditions]);

    const combinedWorkout = useMemo(() => {
        if (!activeWorkoutPlan) return [];
        const { exercises, structure } = activeWorkoutPlan;
        const fullWorkout: any[] = [{ name: 'Dynamic Warm-up', type: 'Preparation', duration: 180, description: 'Start with light cardio like marching in place, arm circles, and leg swings to prepare your body for exercise.' }];

        for (let i = 1; i <= structure.rounds; i++) {
            exercises.forEach((ex, index) => {
                fullWorkout.push({ name: ex.name, description: ex.description, type: `Round ${i}`, duration: structure.work });
                if (index < exercises.length - 1) {
                    fullWorkout.push({ name: 'Rest', type: 'Rest', duration: structure.rest, description: 'Take a short break. Breathe deeply and drink some water if needed.' });
                }
            });
            if (structure.roundRest && i < structure.rounds) {
                fullWorkout.push({ name: 'Round Rest', type: 'Rest', duration: structure.roundRest, description: `End of Round ${i}. Take a longer break before the next round.` });
            }
        }
        fullWorkout.push({ name: 'Cool-down Stretch', type: 'Recovery', duration: 180, description: 'Finish with gentle stretches for major muscle groups. Hold each stretch for 20-30 seconds.' });
        return fullWorkout;
    }, [activeWorkoutPlan]);

    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [secondsRemaining, setSecondsRemaining] = useState(combinedWorkout[0]?.duration || 0);
    const [isTimerActive, setIsTimerActive] = useState(false);

    useEffect(() => {
        if(combinedWorkout.length > 0) {
            handleReset();
        }
    }, [combinedWorkout]);
    
    useEffect(() => {
        const blob = new Blob([workerScript], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));
        timerWorkerRef.current = worker;

        worker.onmessage = () => {
        setSecondsRemaining(prev => {
            if (prev <= 1) {
            setCurrentExerciseIndex(currentIndex => {
                const nextIndex = currentIndex + 1;
                if (nextIndex < combinedWorkout.length) {
                setSecondsRemaining(combinedWorkout[nextIndex].duration);
                return nextIndex;
                } else {
                setIsTimerActive(false);
                setIsWorkoutFinished(true);
                worker.postMessage({ command: 'stop' });
                return currentIndex;
                }
            });
            return 0;
            }
            return prev - 1;
        });
        };
        return () => worker.terminate();
    }, [combinedWorkout]);
    
    useEffect(() => {
        const currentItem = listRef.current?.children[currentExerciseIndex] as HTMLElement;
        if(currentItem) currentItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [currentExerciseIndex]);

    useEffect(() => {
        if (isTimerActive && secondsRemaining > 0 && secondsRemaining % 5 === 0) {
            const minutes = Math.floor(secondsRemaining / 60);
            const seconds = secondsRemaining % 60;
            let message = `${minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''} ` : ''}${seconds > 0 || minutes === 0 ? `${seconds} seconds ` : ''}remaining`;
            if ('speechSynthesis' in window) {
                if (speechSynthesis.speaking) speechSynthesis.cancel();
                speechUtteranceRef.current = new SpeechSynthesisUtterance(message);
                speechUtteranceRef.current.rate = 1.1;
                speechSynthesis.speak(speechUtteranceRef.current);
            }
        }
    }, [secondsRemaining, isTimerActive]);

    const handleStartPause = () => {
        if (isWorkoutFinished) return;
        if (isTimerActive) {
            timerWorkerRef.current?.postMessage({ command: 'stop' });
            if ('speechSynthesis' in window) speechSynthesis.cancel();
        } else {
            timerWorkerRef.current?.postMessage({ command: 'start' });
        }
        setIsTimerActive(!isTimerActive);
    };

    const handleReset = () => {
        timerWorkerRef.current?.postMessage({ command: 'stop' });
        if ('speechSynthesis' in window) speechSynthesis.cancel();
        setIsTimerActive(false);
        setIsWorkoutFinished(false);
        setCurrentExerciseIndex(0);
        setSecondsRemaining(combinedWorkout[0]?.duration || 0);
    };

    const handleShare = () => {
        const message = `I just completed the ObeCure ${activeWorkoutPlan?.name}! Feeling great! 💪`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };
    
    const handleConfirmConditions = (conditions: HealthCondition[]) => {
        setSelectedConditions(conditions);
        setShowSelector(false);
        // Also save to localStorage for next time
        const savedPrefsRaw = localStorage.getItem(USER_PREFERENCES_KEY);
        const savedPrefs = savedPrefsRaw ? JSON.parse(savedPrefsRaw) : {};
        savedPrefs.healthConditions = conditions;
        localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(savedPrefs));
    };

    const currentExercise = combinedWorkout[currentExerciseIndex];
    const totalDuration = useMemo(() => combinedWorkout.reduce((sum, ex) => sum + ex.duration, 0), [combinedWorkout]);
    const elapsedDuration = useMemo(() => {
        return combinedWorkout.slice(0, currentExerciseIndex).reduce((sum, ex) => sum + ex.duration, 0) + (currentExercise?.duration - secondsRemaining);
    }, [currentExerciseIndex, secondsRemaining, combinedWorkout, currentExercise]);
    const progressPercentage = (elapsedDuration / totalDuration) * 100;
    
    if (showSelector) {
        return <ConditionSelector onConfirm={handleConfirmConditions} />;
    }

    if (!activeWorkoutPlan || !currentExercise) {
        return (
            <div className="flex justify-center items-center p-8">
                <svg className="animate-spin h-8 w-8 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 sm:text-4xl text-center">{activeWorkoutPlan.name}</h1>
                <div className="mt-2 text-gray-600 dark:text-gray-400 mb-6 text-center max-w-prose mx-auto flex justify-center flex-wrap gap-x-4">
                    {activeWorkoutPlan.details.map(detail => <span key={detail}>{detail}</span>)}
                </div>

                <div className="sticky top-16 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg shadow-inner mb-6 border dark:border-gray-700">
                    <div className="text-center">
                        <p className="text-sm font-semibold text-orange-500 uppercase tracking-wider">{isWorkoutFinished ? 'Workout Complete!' : currentExercise.type}</p>
                        <p className="text-2xl md:text-3xl font-bold my-1 text-gray-800 dark:text-gray-200">{currentExercise.name}</p>
                        <p className="text-7xl md:text-8xl font-mono font-extrabold text-gray-900 dark:text-gray-100 tabular-nums">
                            {Math.floor(secondsRemaining / 60).toString().padStart(2, '0')}:{(secondsRemaining % 60).toString().padStart(2, '0')}
                        </p>
                        {currentExercise.description && (
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto animate-fade-in">
                                {currentExercise.description}
                            </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">(voice announcement is made every 5sec)</p>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-4">
                        <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                    <div className="flex justify-center items-center gap-6 mt-4">
                        <button onClick={handleReset} aria-label="Reset Timer" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
                            <ResetIcon className="w-8 h-8"/>
                        </button>
                        <button onClick={handleStartPause} aria-label={isTimerActive ? "Pause Timer" : "Start Timer"} className="bg-orange-500 text-white rounded-full p-4 shadow-lg hover:bg-orange-600 transition-transform transform hover:scale-105 active:scale-95">
                        {isTimerActive ? <PauseIcon className="w-10 h-10"/> : <PlayIcon className="w-10 h-10"/>}
                        </button>
                        <div className="w-8 h-8">
                          {isWorkoutFinished && (
                              <button onClick={handleShare} aria-label="Share Workout" className="text-green-500 hover:text-green-600 transition-colors animate-fade-in">
                                  <WhatsAppIcon className="w-8 h-8" />
                              </button>
                          )}
                        </div>
                    </div>
                </div>
                
                <div ref={listRef} className="max-h-[600px] overflow-y-auto space-y-2 pr-2">
                {combinedWorkout.map((ex, index) => (
                    <div key={`${ex.name}-${index}`} className={`p-3 rounded-lg transition-all duration-300 transform ${
                        index === currentExerciseIndex 
                        ? 'bg-orange-100 dark:bg-orange-900/40 ring-2 ring-orange-500 scale-[1.02] shadow-md' 
                        : 'bg-gray-50 dark:bg-gray-700/50 scale-100'
                    }`}>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className={`font-semibold ${index === currentExerciseIndex ? 'text-orange-800 dark:text-orange-300' : 'text-gray-800 dark:text-gray-200'}`}>{ex.name}</p>
                                <p className={`text-xs ${index === currentExerciseIndex ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'}`}>{ex.type}</p>
                            </div>
                            <p className={`font-mono font-semibold ${index === currentExerciseIndex ? 'text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-gray-300'}`}>
                            {Math.floor(ex.duration / 60)}:{(ex.duration % 60).toString().padStart(2, '0')}
                            </p>
                        </div>
                        {ex.description && (
                            <p className={`text-sm mt-2 pt-2 border-t transition-all duration-300 ${
                                index === currentExerciseIndex 
                                ? 'text-gray-700 dark:text-gray-300 border-orange-200 dark:border-orange-800' 
                                : 'text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600'
                            }`}>
                                {ex.description}
                            </p>
                        )}
                    </div>
                ))}
                </div>
            </div>
            <UniversalTips />
        </div>
    );
};

export default Workouts;