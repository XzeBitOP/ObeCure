import React, { useState, useEffect, useRef } from 'react';
import { DailyCheckin, UserProfile, SleepEntry } from '../../types';

interface DailyCheckinFormProps {
    user: UserProfile;
    onSubmit: (checkin: DailyCheckin) => void;
    existingCheckin: DailyCheckin | null;
}

const SLEEP_DATA_KEY = 'obeCureSleepData';
const formLabelClass = "block text-base font-semibold text-gray-700 dark:text-gray-300 text-center";

// --- Custom Thematic Inputs ---

const SleepQualityInput: React.FC<{ value: number; onChange: (value: number) => void }> = ({ value, onChange }) => {
    const moonRef = useRef<HTMLDivElement>(null);
    const labels = ["Restless", "Poor", "Fair", "Okay", "Decent", "Good", "Very Good", "Great", "Excellent", "Deep", "Perfect"];
    const moonPhases = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 100]; // % of moon visible

    const handleInteraction = (clientX: number) => {
        if (!moonRef.current) return;
        const rect = moonRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const newValue = Math.round(percent * 10);
        onChange(newValue);
    };
    
    const handleMouseMove = (e: React.MouseEvent) => { if(e.buttons === 1) handleInteraction(e.clientX); };
    const handleTouchMove = (e: React.TouchEvent) => { if(e.touches[0]) handleInteraction(e.touches[0].clientX); };

    return (
        <div className="flex flex-col items-center">
            <div 
                ref={moonRef}
                className="w-48 h-48 rounded-full cursor-pointer relative bg-yellow-400/20 dark:bg-blue-300/10 overflow-hidden select-none"
                onMouseDown={(e) => handleInteraction(e.clientX)}
                onMouseMove={handleMouseMove}
                onTouchStart={(e) => handleInteraction(e.touches[0].clientX)}
                onTouchMove={handleTouchMove}
            >
                <div 
                    className="absolute top-0 left-0 w-full h-full rounded-full bg-yellow-400 dark:bg-blue-200 transition-all duration-200"
                    style={{ clipPath: `inset(0 ${100 - moonPhases[value]}% 0 0)`}}
                />
                <div className="absolute top-0 left-0 w-full h-full rounded-full shadow-[inset_10px_-10px_30px_rgba(0,0,0,0.2)] dark:shadow-[inset_10px_-10px_30px_rgba(255,255,255,0.1)]"/>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">(slide to increase or decrease)</p>
            <p className="mt-2 font-bold text-lg text-orange-500 dark:text-orange-400">{labels[value]}</p>
        </div>
    );
};

const StressLevelInput: React.FC<{ value: number; onChange: (value: number) => void }> = ({ value, onChange }) => {
    const labels = ["Serene", "Calm", "Relaxed", "Okay", "Slightly Tense", "Tense", "Stressed", "Very Stressed", "Anxious", "Overwhelmed", "Extreme"];
    
    const handleIncrease = () => onChange(Math.min(10, value + 1));
    const handleDecrease = () => onChange(Math.max(0, value - 1));

    return (
        <div className="flex flex-col items-center">
             <div className="flex items-center justify-center gap-4">
                 <button 
                    onClick={handleDecrease} 
                    disabled={value === 0}
                    className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 text-3xl font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition disabled:opacity-50 active:scale-95"
                    aria-label="Decrease stress level"
                 >
                    -
                 </button>

                <div className="relative w-48 h-48 flex items-center justify-center">
                    {[...Array(5)].map((_, i) => (
                        <div 
                            key={i}
                            className="absolute rounded-full border border-blue-300 dark:border-blue-600"
                            style={{
                                width: `${(i + 1) * 20}%`,
                                height: `${(i + 1) * 20}%`,
                                animation: value > 2 ? `pulse ${2 - (value/10)}s cubic-bezier(0, 0, 0.2, 1) infinite` : 'none',
                                animationDelay: `${i * 0.2}s`,
                                opacity: value > 1 ? (value/10) * 0.5 : 0.1
                            }}
                        />
                    ))}
                    <style>{`
                        @keyframes pulse {
                          0% { transform: scale(0.95); opacity: 0; }
                          50% { opacity: 0.7; }
                          100% { transform: scale(1.2); opacity: 0; }
                        }
                    `}</style>
                    <p className="absolute text-5xl font-bold text-gray-700 dark:text-gray-300">{value}</p>
                </div>

                <button 
                    onClick={handleIncrease} 
                    disabled={value === 10}
                    className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 text-3xl font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition disabled:opacity-50 active:scale-95"
                    aria-label="Increase stress level"
                 >
                    +
                 </button>
            </div>
            <p className="mt-4 font-bold text-lg text-orange-500 dark:text-orange-400">{labels[value]}</p>
        </div>
    );
};


const EnergyLevelInput: React.FC<{ value: number; onChange: (value: number) => void }> = ({ value, onChange }) => {
    const labels = ["Drained", "Exhausted", "Very Low", "Low", "Moderate", "Okay", "Energized", "High", "Very High", "Dynamic", "Vibrant"];
    return (
        <div className="flex flex-col items-center">
            <svg width="120" height="120" viewBox="0 0 100 100" className="transform -rotate-90">
                <path d="M 50,90 A 40,40 0 1,1 50,10" stroke="#e5e7eb" strokeWidth="10" fill="none" className="dark:stroke-gray-700" />
                <path d="M 50,90 A 40,40 0 1,1 50,10" stroke="#22c55e" strokeWidth="10" fill="none" strokeLinecap="round"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (value / 10) * 251.2 * 0.75}
                    className="transition-all duration-300"
                />
            </svg>
            <input type="range" min="0" max="10" value={value} onChange={(e) => onChange(parseInt(e.target.value))} className="w-48 mt-4 accent-green-500 cursor-pointer"/>
            <p className="mt-4 font-bold text-lg text-orange-500 dark:text-orange-400">{labels[value]}</p>
        </div>
    )
}


const SliderInput: React.FC<{label: string, name: keyof DailyCheckin, value: number, onChange: (value: number) => void, minLabel: string, maxLabel: string}> = 
({label, value, onChange, minLabel, maxLabel}) => (
    <div>
        <label className={formLabelClass}>{label} <span className="font-bold text-orange-500">{value}</span>/10</label>
        <input type="range" min="0" max="10" value={value} onChange={(e) => onChange(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-orange-500"/>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1"><span>{minLabel}</span><span>{maxLabel}</span></div>
    </div>
);


const questions = [
    { id: 'sleep_quality', label: 'How was your sleep quality?', Component: SleepQualityInput },
    { id: 'stress', label: 'How is your stress level today?', Component: StressLevelInput },
    { id: 'energy', label: 'How would you rate your energy level?', Component: EnergyLevelInput },
    { id: 'hunger', label: 'How hungry do you feel?', minLabel: 'Not Hungry', maxLabel: 'Very Hungry' },
    { id: 'bloating', label: 'How is your bloating?', minLabel: 'None', maxLabel: 'Severe' },
    { id: 'focus', label: 'How is your focus and concentration?', minLabel: 'Distracted', maxLabel: 'Sharp' },
    { id: 'bowel', label: 'Bowel Movement' },
    { id: 'cravings', label: 'Food Cravings' },
    { id: 'activity', label: 'Today\'s Activity' },
    { id: 'side_effects', label: 'Any side effects today?' },
    { id: 'weight_and_sleep', label: 'Finally, your stats for today' },
];

const DailyCheckinForm: React.FC<DailyCheckinFormProps> = ({ user, onSubmit, existingCheckin }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [animationClass, setAnimationClass] = useState('animate-fade-in-up');
    const questionContainerRef = useRef<HTMLDivElement>(null);

    const [checkin, setCheckin] = useState<Partial<DailyCheckin>>({
        sleep_hours: 7, sleep_quality: 5, stress: 5, hunger: 5, cravings: 'none',
        bloating: 5, bowel: 'regular', energy: 5, focus: 5, activity: '30_60',
        hydration_glasses: 8, caffeine_today: 0, compliance: 'yes',
        side_effects: { palpitations: false, nausea: false, insomnia: false, loose_stools: false },
    });
    
    useEffect(() => {
        if (existingCheckin) {
            setCheckin(existingCheckin);
            return;
        }
        try {
            const sleepDataRaw = localStorage.getItem(SLEEP_DATA_KEY);
            if (sleepDataRaw) {
                const sleepHistory: SleepEntry[] = JSON.parse(sleepDataRaw);
                const today = new Date().toISOString().split('T')[0];
                const todaysSleep = sleepHistory.find(entry => entry.date === today);
                if (todaysSleep) {
                    setCheckin(prev => ({...prev, sleep_hours: todaysSleep.hours}));
                }
            }
        } catch (e) {
            console.error("Failed to parse sleep data for check-in form", e);
        }
    }, [existingCheckin]);

    const handleValueChange = (name: keyof DailyCheckin, value: any) => {
        setCheckin(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = () => {
        if (currentStep < questions.length - 1) {
            setAnimationClass('animate-slide-out-left');
        } else {
            handleSubmit();
        }
    };
    
     const handleAnimationEnd = () => {
        if (animationClass === 'animate-slide-out-left') {
            setCurrentStep(s => s + 1);
            setAnimationClass('animate-slide-in-right');
        }
    };

    const handleSubmit = () => {
        const fullCheckin: DailyCheckin = {
            id: existingCheckin?.id || crypto.randomUUID(),
            user_id: user.id,
            date: new Date().toISOString().split('T')[0],
            created_at: existingCheckin?.created_at || new Date().toISOString(),
            ...checkin
        } as DailyCheckin;
        onSubmit(fullCheckin);
    };

    const currentQuestion = questions[currentStep];

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="mb-6">
                <div className="flex justify-between mb-1 items-center">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Step {currentStep + 1} of {questions.length}</span>
                    {currentStep > 0 && <button onClick={() => setCurrentStep(s => s - 1)} className="text-sm font-semibold text-gray-500 hover:text-orange-500">&larr; Back</button>}
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div className="bg-orange-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}></div>
                </div>
            </div>

            <div 
                ref={questionContainerRef}
                onAnimationEnd={handleAnimationEnd}
                className={`min-h-[350px] flex flex-col justify-between ${animationClass}`}
            >
                <div className="flex-grow flex flex-col justify-center">
                    <h3 className={formLabelClass}>{currentQuestion.label}</h3>
                    <div className="mt-6">
                        {currentQuestion.Component ? (
                            <currentQuestion.Component value={checkin[currentQuestion.id as keyof DailyCheckin] as number} onChange={(val) => handleValueChange(currentQuestion.id as keyof DailyCheckin, val)} />
                        ) : currentQuestion.minLabel ? (
                            <SliderInput 
                                label=""
                                name={currentQuestion.id as keyof DailyCheckin}
                                value={checkin[currentQuestion.id as keyof DailyCheckin] as number} 
                                onChange={(val) => handleValueChange(currentQuestion.id as keyof DailyCheckin, val)}
                                minLabel={currentQuestion.minLabel}
                                maxLabel={currentQuestion.maxLabel}
                            />
                        ) : (
                            <div className="space-y-4 max-w-sm mx-auto">
                            {currentQuestion.id === 'bowel' && (
                                 <select name="bowel" value={checkin.bowel} onChange={(e) => handleValueChange('bowel', e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400">
                                    <option value="regular">Regular</option><option value="constipated">Constipated</option><option value="loose">Loose</option><option value="irregular">Irregular</option>
                                </select>
                            )}
                            {currentQuestion.id === 'cravings' && (
                                <select name="cravings" value={checkin.cravings} onChange={(e) => handleValueChange('cravings', e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400">
                                    <option value="none">None</option><option value="sweet">Sweet</option><option value="salty">Salty</option><option value="fried">Fried</option>
                                </select>
                            )}
                            {currentQuestion.id === 'activity' && (
                                <select name="activity" value={checkin.activity} onChange={(e) => handleValueChange('activity', e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400">
                                    <option value="none">None</option><option value="<30">Less than 30 mins</option><option value="30_60">30-60 mins</option><option value=">60">More than 60 mins</option>
                                </select>
                            )}
                             {currentQuestion.id === 'side_effects' && (
                                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <label className="flex items-center space-x-2 text-sm"><input type="checkbox" name="palpitations" checked={checkin.side_effects?.palpitations} onChange={(e) => handleValueChange('side_effects', {...checkin.side_effects, palpitations: e.target.checked})} className="h-4 w-4 rounded text-orange-500"/><span>Palpitations</span></label>
                                    <label className="flex items-center space-x-2 text-sm"><input type="checkbox" name="nausea" checked={checkin.side_effects?.nausea} onChange={(e) => handleValueChange('side_effects', {...checkin.side_effects, nausea: e.target.checked})} className="h-4 w-4 rounded text-orange-500"/><span>Nausea</span></label>
                                    <label className="flex items-center space-x-2 text-sm"><input type="checkbox" name="insomnia" checked={checkin.side_effects?.insomnia} onChange={(e) => handleValueChange('side_effects', {...checkin.side_effects, insomnia: e.target.checked})} className="h-4 w-4 rounded text-orange-500"/><span>Insomnia</span></label>
                                    <label className="flex items-center space-x-2 text-sm"><input type="checkbox" name="loose_stools" checked={checkin.side_effects?.loose_stools} onChange={(e) => handleValueChange('side_effects', {...checkin.side_effects, loose_stools: e.target.checked})} className="h-4 w-4 rounded text-orange-500"/><span>Loose Stools</span></label>
                                </div>
                            )}
                            {currentQuestion.id === 'weight_and_sleep' && (
                                <div className="space-y-4">
                                     <div>
                                        <label htmlFor="weight_kg" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Today's Weight (kg)</label>
                                        <input id="weight_kg" name="weight_kg" type="number" value={checkin.weight_kg || ''} onChange={(e) => handleValueChange('weight_kg', e.target.value)} placeholder="Optional" className="w-full text-center px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400" />
                                    </div>
                                    <div>
                                        <label htmlFor="sleep_hours" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Sleep Hours</label>
                                        <input id="sleep_hours" name="sleep_hours" type="number" value={checkin.sleep_hours} onChange={(e) => handleValueChange('sleep_hours', e.target.value)} className="w-full text-center px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400" />
                                    </div>
                                </div>
                            )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-8">
                     <button onClick={handleNext} className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-all active:scale-95 shadow-md">
                        {currentStep < questions.length - 1 ? 'Next' : (existingCheckin ? "Update Plan" : "Generate Plan")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DailyCheckinForm;