import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HealthCondition, WorkoutLogEntry } from '../types';
import { getWorkoutPlanForConditions, WorkoutPlan } from '../data/workouts';
import { StopIcon } from './icons/StopIcon';
import SuccessToast from './SuccessToast';
import { motivationalQuotes } from '../data/quotes';
import { YouTubeIcon } from './icons/YouTubeIcon';
import InfoModal from './InfoModal';
import { WhatsAppIcon } from './icons/WhatsAppIcon';

const USER_PREFERENCES_KEY = 'obeCureUserPreferences';
const WORKOUT_LOG_KEY = 'obeCureWorkoutLog';

// --- ICONS ---
const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M8 5v14l11-7z" /></svg>;
const PauseIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>;
const ResetIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" /></svg>;
const Sparkle: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
    <svg width="20" height="20" viewBox="0 0 100 100" className="absolute sparkle text-yellow-400" style={style} fill="currentColor">
        <path d="M50 0 L61.2 38.8 L100 50 L61.2 61.2 L50 100 L38.8 61.2 L0 50 L38.8 38.8 Z" />
    </svg>
);

// --- WEB WORKER FOR TIMER ---
const workerScript = `
  let timerId = null;
  self.onmessage = function(e) {
    if (e.data.command === 'start') {
      if (timerId) clearInterval(timerId);
      timerId = setInterval(() => { self.postMessage('tick'); }, 1000);
    } else if (e.data.command === 'stop') {
      if(timerId) clearInterval(timerId);
      timerId = null;
    }
  };
`;

// --- MODAL COMPONENTS ---
const StopWorkoutModal: React.FC<{ isOpen: boolean; onContinue: () => void; onEnd: () => void; }> = ({ isOpen, onContinue, onEnd }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-gray-200 dark:border-gray-700 transform animate-fade-in-up">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Stop Workout?</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Do you want to end your workout? Your progress so far will be logged.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={onContinue} className="w-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-all active:scale-95">Continue Workout</button>
          <button onClick={onEnd} className="w-full bg-red-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-600 transition-all active:scale-95">End & Log Workout</button>
        </div>
      </div>
    </div>
  );
};

// --- VIEW COMPONENTS ---

const ConditionSelector: React.FC<{ onPlanSelected: (plan: WorkoutPlan) => void }> = ({ onPlanSelected }) => {
    const [selection, setSelection] = useState<HealthCondition[]>([]);
    const [isNone, setIsNone] = useState(false);

    const handleConditionChange = (condition: HealthCondition) => {
        setIsNone(false);
        setSelection(prev => prev.includes(condition) ? prev.filter(c => c !== condition) : [...prev, condition]);
    };
    const handleNoneChange = () => { setSelection([]); setIsNone(true); };
    const handleSubmit = () => { onPlanSelected(getWorkoutPlanForConditions(selection)); };

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
            <button onClick={handleSubmit} disabled={selection.length === 0 && !isNone} className="mt-6 w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-all duration-300 disabled:bg-orange-300 disabled:cursor-not-allowed shadow-md active:scale-95">
                Confirm & See Workout
            </button>
        </div>
    );
};

const WorkoutBriefing: React.FC<{ plan: WorkoutPlan; onStart: () => void; onChangePlan: () => void; }> = ({ plan, onStart, onChangePlan }) => {
    const totalDuration = useMemo(() => {
        const { exercises, structure, warmupDuration, cooldownDuration } = plan;
        const workTime = exercises.length * structure.work * structure.rounds;
        const restTime = (exercises.length - 1) * structure.rest * structure.rounds;
        const roundRestTime = (structure.roundRest || 0) * (structure.rounds - 1);
        return Math.round((workTime + restTime + roundRestTime + (warmupDuration || 0) + (cooldownDuration || 0)) / 60);
    }, [plan]);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 animate-fade-in text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200">{plan.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 mb-6">Here's your plan. Get ready to start!</p>
            <div className="grid grid-cols-3 gap-4 my-8">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"><p className="text-3xl font-bold text-orange-500">{totalDuration}</p><p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Mins</p></div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"><p className="text-3xl font-bold text-orange-500">{plan.exercises.length}</p><p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Exercises</p></div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"><p className="text-3xl font-bold text-orange-500">{plan.structure.rounds}</p><p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Rounds</p></div>
            </div>
            <div className="space-y-3">
                <button onClick={onStart} className="w-full bg-green-500 text-white font-bold py-4 px-6 rounded-lg hover:bg-green-600 transition-all shadow-md active:scale-95">Get Ready & Start</button>
                <button onClick={onChangePlan} className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-3 px-6 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95">Change Workout</button>
            </div>
        </div>
    );
};

const WorkoutTimer: React.FC<{ plan: WorkoutPlan; onFinish: (durationInSeconds: number) => void; }> = ({ plan, onFinish }) => {
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [secondsRemaining, setSecondsRemaining] = useState(0);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [isStopModalOpen, setIsStopModalOpen] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);
    const timerWorkerRef = useRef<Worker | null>(null);

    const exerciseIndexRef = useRef(currentExerciseIndex);
    useEffect(() => { exerciseIndexRef.current = currentExerciseIndex; }, [currentExerciseIndex]);
    const isTimerActiveRef = useRef(isTimerActive);
    useEffect(() => { isTimerActiveRef.current = isTimerActive; }, [isTimerActive]);

    const combinedWorkout = useMemo(() => {
        const { exercises, structure, warmupDuration, cooldownDuration } = plan;
        const fullWorkout: any[] = [{ name: 'Warm-up', type: 'Preparation', duration: warmupDuration || 180, description: 'Light cardio like marching in place, arm circles, and leg swings.' }];
        for (let i = 1; i <= structure.rounds; i++) {
            exercises.forEach((ex, index) => {
                fullWorkout.push({ ...ex, type: `Round ${i}`.toUpperCase(), duration: structure.work });
                if (index < exercises.length - 1) fullWorkout.push({ name: 'Rest', type: 'Rest', duration: structure.rest, description: 'Breathe. Get ready for the next exercise.' });
            });
            if (structure.roundRest && i < structure.rounds) fullWorkout.push({ name: 'Round Rest', type: 'Rest', duration: structure.roundRest, description: `Longer break before Round ${i+1}.` });
        }
        fullWorkout.push({ name: 'Cool-down', type: 'Recovery', duration: cooldownDuration || 180, description: 'Gentle stretches for major muscle groups. Hold each stretch.' });
        return fullWorkout;
    }, [plan]);
    
    const totalDuration = useMemo(() => combinedWorkout.reduce((sum, ex) => sum + ex.duration, 0), [combinedWorkout]);

    useEffect(() => { setSecondsRemaining(combinedWorkout[0]?.duration || 0); }, [combinedWorkout]);
    
    const speak = (text: string) => {
        if ('speechSynthesis' in window && text) {
            if (speechSynthesis.speaking) speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.1;
            speechSynthesis.speak(utterance);
        }
    };
    
    useEffect(() => {
        const blob = new Blob([workerScript], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));
        timerWorkerRef.current = worker;
        worker.onmessage = () => {
            setSecondsRemaining(prev => {
                if (prev <= 1) {
                    worker.postMessage({ command: 'stop' });
                    const nextIndex = exerciseIndexRef.current + 1;
                    if (nextIndex < combinedWorkout.length) {
                        const nextEx = combinedWorkout[nextIndex];
                        speak(nextEx.name);
                        setCurrentExerciseIndex(nextIndex);
                        setSecondsRemaining(nextEx.duration);
                        if (isTimerActiveRef.current) worker.postMessage({ command: 'start' });
                    } else {
                        speak("Workout complete! Well done!");
                        setIsTimerActive(false);
                        onFinish(totalDuration);
                    }
                    return 0;
                }
                if (prev === 4) speak("3. 2. 1.");
                return prev - 1;
            });
        };
        return () => worker.terminate();
    }, [combinedWorkout, onFinish, totalDuration]);
    
    useEffect(() => {
        const currentItem = listRef.current?.children[currentExerciseIndex] as HTMLElement;
        if(currentItem) currentItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [currentExerciseIndex]);

    const handleStartPause = () => {
        const nextIsActive = !isTimerActive;
        setIsTimerActive(nextIsActive);
        if (nextIsActive) {
            timerWorkerRef.current?.postMessage({ command: 'start' });
            speak(combinedWorkout[currentExerciseIndex].name);
        } else {
            timerWorkerRef.current?.postMessage({ command: 'stop' });
            if ('speechSynthesis' in window) speechSynthesis.cancel();
        }
    };
    
    const handleReset = () => {
        timerWorkerRef.current?.postMessage({ command: 'stop' });
        if ('speechSynthesis' in window) speechSynthesis.cancel();
        setIsTimerActive(false);
        setCurrentExerciseIndex(0);
        setSecondsRemaining(combinedWorkout[0]?.duration || 0);
    };

    const handleStop = () => {
        setIsTimerActive(false);
        timerWorkerRef.current?.postMessage({ command: 'stop' });
        if ('speechSynthesis' in window) speechSynthesis.cancel();
        setIsStopModalOpen(true);
    };

    const handleEndWorkout = () => {
        setIsStopModalOpen(false);
        onFinish(elapsedDuration);
    };

    const handleWatchTutorial = (e: React.MouseEvent, exerciseName: string) => {
        e.stopPropagation();
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName + ' tutorial')}`, '_blank', 'noopener,noreferrer');
    };

    const currentExercise = combinedWorkout[currentExerciseIndex];
    const elapsedDuration = combinedWorkout.slice(0, currentExerciseIndex).reduce((sum, ex) => sum + ex.duration, 0) + (currentExercise.duration - secondsRemaining);
    const progressPercentage = (elapsedDuration / totalDuration) * 100;
    
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (secondsRemaining / currentExercise.duration) * circumference;

    const phaseColor = useMemo(() => {
      const type = currentExercise.type;
      if (type === 'Rest') return 'stroke-blue-500';
      if (type === 'Preparation' || type === 'Recovery') return 'stroke-green-500';
      return 'stroke-orange-500';
    }, [currentExercise.type]);

    return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <StopWorkoutModal isOpen={isStopModalOpen} onContinue={() => { setIsStopModalOpen(false); handleStartPause(); }} onEnd={handleEndWorkout} />
            <div className="text-center mb-4">
                <p className="text-sm font-semibold text-orange-500 uppercase tracking-wider">{currentExercise.type}</p>
                <p className="text-2xl font-bold my-1 text-gray-800 dark:text-gray-200">{currentExercise.name}</p>
            </div>
            <div className="relative w-56 h-56 mx-auto">
                <svg className="w-full h-full" viewBox="0 0 200 200">
                    <circle className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="12" fill="transparent" r={radius} cx="100" cy="100"/>
                    <circle className={`transition-all duration-1000 ease-linear ${phaseColor}`} strokeWidth="12" fill="transparent" r={radius} cx="100" cy="100" strokeDasharray={circumference} strokeDashoffset={offset} transform="rotate(-90 100 100)" strokeLinecap="round"/>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <p className="text-6xl font-mono font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                        {Math.floor(secondsRemaining / 60).toString().padStart(2, '0')}:{(secondsRemaining % 60).toString().padStart(2, '0')}
                    </p>
                </div>
            </div>
             <div className="text-center my-4 h-16 flex flex-col justify-center">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Up Next:</p>
                <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
                    {currentExerciseIndex + 1 < combinedWorkout.length ? combinedWorkout[currentExerciseIndex + 1].name : "Workout Finish!"}
                </p>
            </div>
             <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 my-4"><div className="bg-orange-500 h-2 rounded-full" style={{ width: `${progressPercentage}%` }}></div></div>
            <div className="flex justify-center items-center gap-4 sm:gap-6">
                <button onClick={handleReset} aria-label="Reset Timer" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all active:scale-95"><ResetIcon className="w-8 h-8"/></button>
                <button onClick={handleStartPause} aria-label={isTimerActive ? "Pause" : "Start"} className="bg-orange-500 text-white rounded-full p-4 shadow-lg hover:bg-orange-600 transition-transform transform hover:scale-105 active:scale-95">{isTimerActive ? <PauseIcon className="w-10 h-10"/> : <PlayIcon className="w-10 h-10"/>}</button>
                <button onClick={handleStop} disabled={elapsedDuration === 0 && !isTimerActive} aria-label="Stop Workout" className="text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all active:scale-95 disabled:opacity-50"><StopIcon className="w-8 h-8"/></button>
            </div>
            
             <div ref={listRef} className="mt-6 max-h-[240px] overflow-y-auto space-y-2 pr-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                {combinedWorkout.map((ex, index) => (
                    <div key={`${ex.name}-${index}`} className={`p-2 rounded-lg transition-all ${index === currentExerciseIndex ? 'bg-orange-100 dark:bg-orange-900/40' : 'bg-gray-50 dark:bg-gray-700/50 opacity-60'}`}>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <p className={`font-semibold text-sm ${index === currentExerciseIndex ? 'text-orange-800 dark:text-orange-300' : 'text-gray-800 dark:text-gray-200'}`}>{ex.name}</p>
                                {ex.type.startsWith('ROUND') && <button onClick={(e) => handleWatchTutorial(e, ex.name)} className="text-gray-400 dark:text-gray-500 hover:text-red-600" title="Watch tutorial"><YouTubeIcon className="w-5 h-5" /></button>}
                            </div>
                            <p className="font-mono text-sm font-semibold text-gray-600 dark:text-gray-300">{Math.floor(ex.duration / 60)}:{(ex.duration % 60).toString().padStart(2, '0')}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const WorkoutSummary: React.FC<{ plan: WorkoutPlan; durationInSeconds: number; onRestart: () => void; }> = ({ plan, durationInSeconds, onRestart }) => {
    const durationInMinutes = Math.round(durationInSeconds / 60);

    const handleShare = () => {
        const message = `I just completed the ${plan.name} for ${durationInMinutes} minutes with ObeCure! Feeling great! 💪`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 animate-fade-in-up text-center overflow-hidden">
            {[...Array(6)].map((_, i) => <Sparkle key={i} style={{ top: `${Math.random()*80+10}%`, left: `${Math.random()*80+10}%`, animationDelay: `${Math.random()}s` }} />)}
            <h2 className="text-3xl font-bold text-green-500">Workout Complete!</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Awesome work on finishing the</p>
            <p className="text-xl font-semibold text-orange-500 my-2">{plan.name}</p>
            <p className="text-5xl font-bold text-gray-800 dark:text-gray-200 my-4">{durationInMinutes}<span className="text-xl">min</span></p>
            
            <div className="my-6">
                <p className="font-semibold text-gray-700 dark:text-gray-300 mb-3">How did that feel?</p>
                <div className="flex justify-center gap-4">
                    <button className="text-4xl p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition transform hover:scale-125 active:scale-110">😊</button>
                    <button className="text-4xl p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition transform hover:scale-125 active:scale-110">😐</button>
                    <button className="text-4xl p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition transform hover:scale-125 active:scale-110">🥵</button>
                </div>
            </div>

            <div className="space-y-3">
                 <button onClick={handleShare} className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-all shadow-md active:scale-95"><WhatsAppIcon className="w-6 h-6"/><span>Share Achievement</span></button>
                 <button onClick={onRestart} className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-3 px-6 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95">Do Another Workout</button>
            </div>
        </div>
    );
};


const Workouts: React.FC = () => {
    type WorkoutView = 'selector' | 'briefing' | 'timer' | 'summary';
    const [view, setView] = useState<WorkoutView>('selector');
    const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
    const [completedDuration, setCompletedDuration] = useState(0);
    const [toastInfo, setToastInfo] = useState<{ title: string; message: string; quote: string; } | null>(null);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    useEffect(() => {
        const savedPrefsRaw = localStorage.getItem(USER_PREFERENCES_KEY);
        if (savedPrefsRaw) {
            const savedPrefs = JSON.parse(savedPrefsRaw);
            if (Array.isArray(savedPrefs.healthConditions)) {
                setWorkoutPlan(getWorkoutPlanForConditions(savedPrefs.healthConditions));
                setView('briefing');
            }
        }
    }, []);

    const handlePlanSelected = (plan: WorkoutPlan) => {
        setWorkoutPlan(plan);
        setView('briefing');
        // Save selection for next time
        const savedPrefsRaw = localStorage.getItem(USER_PREFERENCES_KEY);
        const savedPrefs = savedPrefsRaw ? JSON.parse(savedPrefsRaw) : {};
        savedPrefs.healthConditions = plan.id === 'GENERAL' ? [] : [plan.id]; // Simplified mapping
        localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(savedPrefs));
    };

    const handleWorkoutComplete = (durationInSeconds: number) => {
        if (!workoutPlan) return;
        const durationInMinutes = Math.round(durationInSeconds / 60);

        if (durationInMinutes > 0) {
            const newLog: WorkoutLogEntry = { date: new Date().toISOString().split('T')[0], name: workoutPlan.name, duration: durationInMinutes };
            try {
                const logsRaw = localStorage.getItem(WORKOUT_LOG_KEY);
                let logs: WorkoutLogEntry[] = logsRaw ? JSON.parse(logsRaw) : [];
                if (!logs.find(l => l.date === newLog.date && l.name === newLog.name)) {
                    logs.push(newLog);
                    localStorage.setItem(WORKOUT_LOG_KEY, JSON.stringify(logs));
                }
            } catch (e) { console.error("Failed to log workout", e); }
            
            setToastInfo({ title: "Workout Logged!", message: `Great job! ${durationInMinutes} mins of ${workoutPlan.name} added to your progress.`, quote: motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)] });
        }
        
        setCompletedDuration(durationInSeconds);
        setView('summary');
    };

    const handleRestart = () => {
        setView('selector');
        setWorkoutPlan(null);
        setCompletedDuration(0);
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
    
    let content;
    switch(view) {
        case 'selector':
            content = <ConditionSelector onPlanSelected={handlePlanSelected} />;
            break;
        case 'briefing':
            content = workoutPlan && <WorkoutBriefing plan={workoutPlan} onStart={() => setView('timer')} onChangePlan={handleRestart} />;
            break;
        case 'timer':
            content = workoutPlan && <WorkoutTimer plan={workoutPlan} onFinish={handleWorkoutComplete} />;
            break;
        case 'summary':
            content = workoutPlan && <WorkoutSummary plan={workoutPlan} durationInSeconds={completedDuration} onRestart={handleRestart} />;
            break;
        default:
            content = <div>Loading...</div>;
    }

    return (
        <div className="space-y-8">
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Partner Gyms" message="No partnership near your location." />
            {toastInfo && <SuccessToast title={toastInfo.title} message={toastInfo.message} quote={toastInfo.quote} onClose={() => setToastInfo(null)} />}
            
            {content}
            
            <UniversalTips />

            <div className="mt-8 text-center">
                <button onClick={() => setIsInfoModalOpen(true)} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-3 px-8 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95">
                    Workout at your partner gym
                </button>
            </div>
        </div>
    );
};

export default Workouts;
