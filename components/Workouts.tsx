import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { WorkoutLogEntry, WorkoutProgram, HealthCondition } from '../types';
import { WORKOUT_PLANS_DATA, WorkoutPlan } from '../data/workouts';
import { WORKOUT_PROGRAMS_DATA } from '../data/workoutPrograms';
import { StopIcon } from './icons/StopIcon';
import SuccessToast from './SuccessToast';
import { motivationalQuotes } from '../data/quotes';
import { YouTubeIcon } from './icons/YouTubeIcon';
import { WhatsAppIcon } from './icons/WhatsAppIcon';

const USER_PREFERENCES_KEY = 'obeCureUserPreferences';
const WORKOUT_LOG_KEY = 'obeCureWorkoutLog';
const CURRENT_PROGRAM_KEY = 'obeCureCurrentProgram';

const celebratoryQuotes = ["You're on fire! 🔥", "Amazing effort! ✨", "Keep pushing! 💪", "Great work! 🥳", "You got this! 🚀", "Feeling stronger! 💯"];

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

// --- MODAL & VIEW COMPONENTS ---

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

const CalorieBurnAnimation: React.FC<{ amount: number, quote: string }> = ({ amount, quote }) => {
    return (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in z-20 text-center p-4">
            <div className="text-6xl animate-flame" style={{ textShadow: '0 0 10px #f97316' }}>🔥</div>
            <p className="text-2xl font-bold text-orange-500 mt-2 animate-bounce-in">~{Math.round(amount)} kcal burned!</p>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 mt-2 animate-burn-in" style={{animationDelay: '0.3s'}}>{quote}</p>
        </div>
    );
};

const WorkoutSummary: React.FC<{ plan: WorkoutPlan; duration: number; onRestart: () => void; onChangeProgram: () => void; }> = ({ plan, duration, onRestart, onChangeProgram }) => {
     const durationMinutes = Math.floor(duration / 60);
     const durationSeconds = duration % 60;
     const quote = useMemo(() => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)], []);

     const getShareText = () => {
        let text = `I just completed the "${plan.name}" on the ObeCure app! 🔥\n\n`;
        text += `Duration: ${durationMinutes}m ${durationSeconds}s\n`;
        text += `Feeling stronger already! #ObeCure #FitnessJourney`;
        return encodeURIComponent(text);
    };

    return (
        <div className="relative text-center animate-fade-in-up">
            {Array.from({ length: 15 }).map((_, i) => (
                <Sparkle key={i} style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 1.5}s` }} />
            ))}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h2 className="text-3xl font-bold text-green-500">Workout Complete!</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Awesome job! You've taken another step towards your goal.</p>
                <div className="my-8 bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{plan.name}</p>
                    <p className="text-5xl font-bold text-orange-500 my-2">{durationMinutes}<span className="text-2xl">m</span> {durationSeconds}<span className="text-2xl">s</span></p>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Time</p>
                </div>
                <p className="font-handwriting text-xl text-orange-600 dark:text-orange-400 mb-8">"{quote}"</p>
                <div className="space-y-3">
                    <a href={`https://wa.me/?text=${getShareText()}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-bold py-3 px-4 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all">
                        <WhatsAppIcon className="w-5 h-5"/> Share Your Win
                    </a>
                    <button onClick={onRestart} className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-all active:scale-95">Do It Again!</button>
                    <button onClick={onChangeProgram} className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-3 px-6 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">Choose Another Program</button>
                </div>
            </div>
        </div>
    );
};

const WorkoutTimer: React.FC<{ plan: WorkoutPlan; onFinish: (durationInSeconds: number) => void; userWeight: number; }> = ({ plan, onFinish, userWeight }) => {
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [secondsRemaining, setSecondsRemaining] = useState(0);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [isStopModalOpen, setIsStopModalOpen] = useState(false);
    const [caloriesBurned, setCaloriesBurned] = useState<{ key: number, amount: number, quote: string } | null>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const timerWorkerRef = useRef<Worker | null>(null);

    const exerciseIndexRef = useRef(currentExerciseIndex);
    useEffect(() => { exerciseIndexRef.current = currentExerciseIndex; }, [currentExerciseIndex]);
    const isTimerActiveRef = useRef(isTimerActive);
    useEffect(() => { isTimerActiveRef.current = isTimerActive; }, [isTimerActive]);

    const combinedWorkout = useMemo(() => {
        const { exercises, structure, warmupDuration, cooldownDuration } = plan;
        const fullWorkout: any[] = [];
        if (warmupDuration) {
            fullWorkout.push({ name: 'Warm-up', type: 'Preparation', duration: warmupDuration, description: 'Light cardio like marching in place, arm circles, and leg swings.' });
            fullWorkout.push({ name: 'Get Ready', type: 'Preparation', duration: 5, description: 'Prepare for the first exercise.', position: exercises[0].position });
        }
        for (let i = 1; i <= structure.rounds; i++) {
            exercises.forEach((ex, index) => {
                fullWorkout.push({ ...ex, type: `Round ${i}`.toUpperCase(), duration: structure.work });
                if (index < exercises.length - 1) {
                    const nextExPosition = exercises[index + 1].position;
                    fullWorkout.push({ name: 'Rest', type: 'Rest', duration: structure.rest, description: 'Breathe. Get ready for the next exercise.', position: nextExPosition });
                }
            });
            if (structure.roundRest && i < structure.rounds) {
                 const nextExPosition = exercises[0].position;
                fullWorkout.push({ name: 'Round Rest', type: 'Rest', duration: structure.roundRest, description: `Longer break before Round ${i+1}.`, position: nextExPosition });
            }
        }
        if (cooldownDuration) {
            fullWorkout.push({ name: 'Cool-down', type: 'Recovery', duration: cooldownDuration, description: 'Gentle stretches for major muscle groups. Hold each stretch.' });
        }
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
                    const currentEx = combinedWorkout[exerciseIndexRef.current];
                    const nextIndex = exerciseIndexRef.current + 1;

                    if (currentEx.type.startsWith('ROUND')) {
                        const calories = (7 * userWeight * 3.5 / 200) * (currentEx.duration / 60);
                        const quote = celebratoryQuotes[Math.floor(Math.random() * celebratoryQuotes.length)];
                        setCaloriesBurned({ key: Date.now(), amount: calories, quote });
                        setTimeout(() => setCaloriesBurned(null), 4000);
                    }
                    
                    if (nextIndex < combinedWorkout.length) {
                        const nextEx = combinedWorkout[nextIndex];
                        let speech = `Next up: ${nextEx.name}.`;
                        if (nextEx.position) {
                            speech = `${nextEx.position}. ${speech}`;
                        }
                        speak(speech);
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
    }, [combinedWorkout, onFinish, totalDuration, userWeight]);
    
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
    
    const currentExercise = combinedWorkout[currentExerciseIndex];
    const elapsedDuration = combinedWorkout.slice(0, currentExerciseIndex).reduce((sum, ex) => sum + ex.duration, 0) + (currentExercise.duration - secondsRemaining);

    const handleEndWorkout = () => {
        setIsStopModalOpen(false);
        onFinish(elapsedDuration);
    };

    const handleWatchTutorial = (e: React.MouseEvent, exerciseName: string) => {
        e.stopPropagation();
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName + ' tutorial')}`, '_blank', 'noopener,noreferrer');
    };

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
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 animate-fade-in-up relative">
            <StopWorkoutModal isOpen={isStopModalOpen} onContinue={() => { setIsStopModalOpen(false); handleStartPause(); }} onEnd={handleEndWorkout} />
            {caloriesBurned && <CalorieBurnAnimation key={caloriesBurned.key} amount={caloriesBurned.amount} quote={caloriesBurned.quote} />}
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4"><div className="bg-orange-500 h-2 rounded-full transition-all duration-1000 ease-linear" style={{ width: `${progressPercentage}%` }}></div></div>

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

const Workouts: React.FC = () => {
    const [view, setView] = useState<'program-selection' | 'active-program' | 'timer' | 'summary'>('program-selection');
    const [activeProgram, setActiveProgram] = useState<{ programId: string, startDate: string } | null>(null);
    const [todaysWorkoutPlan, setTodaysWorkoutPlan] = useState<WorkoutPlan | null>(null);
    const [workoutDuration, setWorkoutDuration] = useState(0);
    const [userWeight, setUserWeight] = useState<number>(70);
    const [toastInfo, setToastInfo] = useState<{ title: string; message: string; quote: string; } | null>(null);
    const [workoutDays, setWorkoutDays] = useState(3);
    const [recommendedDays, setRecommendedDays] = useState(3);
    const [recommendedProgramId, setRecommendedProgramId] = useState<string>('');

    const calculateProgramState = useCallback(() => {
        const programDataRaw = localStorage.getItem(CURRENT_PROGRAM_KEY);
        if (programDataRaw) {
            const savedProgram = JSON.parse(programDataRaw);
            setActiveProgram(savedProgram);
            
            const program = WORKOUT_PROGRAMS_DATA.find(p => p.id === savedProgram.programId);
            if (program) {
                const startDate = new Date(savedProgram.startDate);
                const today = new Date();
                const diffTime = Math.abs(today.getTime() - startDate.getTime());
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                
                const dayInSchedule = diffDays % program.schedule.length;
                
                const workoutId = program.schedule[dayInSchedule];
                if (workoutId) {
                    setTodaysWorkoutPlan(WORKOUT_PLANS_DATA[workoutId]);
                } else {
                    setTodaysWorkoutPlan(null); // Rest day
                }
                setView('active-program');
            }
        } else {
            setView('program-selection');
        }
    }, []);

    useEffect(() => {
        let userConditions: HealthCondition[] = [];
        try {
            const savedPrefsRaw = localStorage.getItem(USER_PREFERENCES_KEY);
            if (savedPrefsRaw) {
                const savedPrefs = JSON.parse(savedPrefsRaw);
                if (savedPrefs.patientWeight) setUserWeight(parseFloat(savedPrefs.patientWeight));
                if (savedPrefs.healthConditions) userConditions = savedPrefs.healthConditions;
            }
        } catch (e) { console.error("Failed to load user preferences", e); }
        
        // --- Medical Condition Logic ---
        const highPriorityConditions: HealthCondition[] = [HealthCondition.HEART_DISEASE, HealthCondition.KNEE_PAIN, HealthCondition.HYPERTENSION];
        const hasHighPriority = userConditions.some(c => highPriorityConditions.includes(c));

        let recDays = 4;
        let recIntensity: 'Low' | 'Moderate' | 'High' = 'Moderate';
        
        if (hasHighPriority) {
            recDays = 3;
            recIntensity = 'Low';
        }

        const recommendedProg = WORKOUT_PROGRAMS_DATA.find(p => p.daysPerWeek === recDays && p.intensity === recIntensity);
        
        setRecommendedDays(recDays);
        setWorkoutDays(recDays);
        setRecommendedProgramId(recommendedProg?.id || '');

        calculateProgramState();
    }, [calculateProgramState]);

    const handleStartProgram = (program: WorkoutProgram) => {
        const newProgramState = { programId: program.id, startDate: new Date().toISOString().split('T')[0] };
        localStorage.setItem(CURRENT_PROGRAM_KEY, JSON.stringify(newProgramState));
        calculateProgramState(); // Recalculate and switch view
    };

    const handleChangeProgram = () => {
        localStorage.removeItem(CURRENT_PROGRAM_KEY);
        setActiveProgram(null);
        setTodaysWorkoutPlan(null);
        setView('program-selection');
    };

    const handleFinish = (durationInSeconds: number) => {
        if (!todaysWorkoutPlan) return;
        setWorkoutDuration(durationInSeconds);
        const durationInMinutes = Math.round(durationInSeconds / 60);

        if (durationInMinutes > 0) {
            const newLog: WorkoutLogEntry = { date: new Date().toISOString().split('T')[0], name: todaysWorkoutPlan.name, duration: durationInMinutes };
            try {
                const logsRaw = localStorage.getItem(WORKOUT_LOG_KEY);
                let logs: WorkoutLogEntry[] = logsRaw ? JSON.parse(logsRaw) : [];
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                const updatedLogs = [newLog, ...logs.filter(log => log.date >= sevenDaysAgo.toISOString().split('T')[0])];
                localStorage.setItem(WORKOUT_LOG_KEY, JSON.stringify(updatedLogs));
                setToastInfo({ title: "Workout Logged!", message: `Great job completing ${durationInMinutes} minutes!`, quote: "Consistency is your superpower." });
            } catch (e) { console.error("Could not save workout log.", e); }
        }
        setView('summary');
    };
    
    const renderContent = () => {
        const currentProgram = activeProgram ? WORKOUT_PROGRAMS_DATA.find(p => p.id === activeProgram.programId) : null;

        switch (view) {
            case 'program-selection':
                const filteredPrograms = WORKOUT_PROGRAMS_DATA.filter(p => p.daysPerWeek === workoutDays);
                return (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 animate-fade-in">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Choose Your Workout Program</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Based on your profile, we recommend a <span className="font-bold text-orange-500">{recommendedDays}-day per week</span> program. You can adjust this as you like.</p>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-center text-gray-700 dark:text-gray-300 mb-2">Workout Days per Week: <span className="text-orange-500 font-bold text-lg">{workoutDays}</span></label>
                            <input type="range" min="3" max="5" value={workoutDays} onChange={(e) => setWorkoutDays(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"/>
                        </div>
                        <div className="space-y-4">
                            {filteredPrograms.length > 0 ? filteredPrograms.map(prog => (
                                <div key={prog.id} className={`p-4 rounded-lg border-2 transition-all ${prog.id === recommendedProgramId ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700'}`}>
                                    {prog.id === recommendedProgramId && <p className="text-xs font-bold text-orange-500 mb-1">RECOMMENDED FOR YOU</p>}
                                    <h3 className={`font-bold text-lg ${prog.id === recommendedProgramId ? 'text-orange-600 dark:text-orange-400' : 'text-gray-800 dark:text-gray-200'}`}>{prog.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{prog.description}</p>
                                    <div className="flex justify-between items-center mt-3">
                                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                            <span>{prog.durationWeeks} Weeks</span> &bull; <span>{prog.daysPerWeek} Days/Week</span> &bull; <span className="font-bold">{prog.intensity}</span>
                                        </div>
                                        <button onClick={() => handleStartProgram(prog)} className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-green-600 transition active:scale-95">Start Program</button>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-4">No {workoutDays}-day programs available. Please select another frequency.</p>
                            )}
                        </div>
                    </div>
                );
            case 'active-program':
                if (!currentProgram) return null;
                const dayNumber = Math.floor((new Date().getTime() - new Date(activeProgram!.startDate).getTime()) / (1000 * 60 * 60 * 24));
                const weekNumber = Math.floor(dayNumber / 7) + 1;
                return (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center animate-fade-in">
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{currentProgram.name}</h1>
                        <p className="font-semibold text-gray-500 dark:text-gray-400">Week {weekNumber > currentProgram.durationWeeks ? currentProgram.durationWeeks : weekNumber} / {currentProgram.durationWeeks}</p>
                        
                        {todaysWorkoutPlan ? (
                            <div className="my-6 p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                                <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">Today's Workout</p>
                                <h2 className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">{todaysWorkoutPlan.name}</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{todaysWorkoutPlan.details.join(' • ')}</p>
                            </div>
                        ) : (
                             <div className="my-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">🌿 Rest Day</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Focus on recovery, hydration, and nutrition. Your body is rebuilding stronger!</p>
                            </div>
                        )}

                        <div className="space-y-3">
                            {todaysWorkoutPlan && <button onClick={() => setView('timer')} className="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition shadow-md active:scale-95">Start Today's Workout</button>}
                            <button onClick={handleChangeProgram} className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-2 px-4 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition">Change Program</button>
                        </div>
                    </div>
                );
            case 'timer':
                return todaysWorkoutPlan && <WorkoutTimer plan={todaysWorkoutPlan} onFinish={handleFinish} userWeight={userWeight} />;
            case 'summary':
                return todaysWorkoutPlan && <WorkoutSummary plan={todaysWorkoutPlan} duration={workoutDuration} onRestart={() => setView('timer')} onChangeProgram={handleChangeProgram} />;
            default:
                return null;
        }
    };

    return (
        <div>
            {toastInfo && <SuccessToast {...toastInfo} onClose={() => setToastInfo(null)} />}
            {renderContent()}
        </div>
    );
};

export default Workouts;