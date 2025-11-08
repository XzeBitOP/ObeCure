
import React, { useState, useEffect } from 'react';
import { DailyCheckin, UserProfile, SleepEntry } from '../../types';

interface DailyCheckinFormProps {
    user: UserProfile;
    onSubmit: (checkin: DailyCheckin) => void;
    existingCheckin: DailyCheckin | null;
}

const SLEEP_DATA_KEY = 'obeCureSleepData';
const formLabelClass = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2";

const SliderInput: React.FC<{label: string, name: keyof DailyCheckin, value: number, onChange: (name: keyof DailyCheckin, value: number) => void, minLabel: string, maxLabel: string}> = 
({label, name, value, onChange, minLabel, maxLabel}) => (
    <div>
        <label className={formLabelClass}>{label} <span className="font-bold text-orange-500">{value}</span>/10</label>
        <input type="range" min="0" max="10" value={value} onChange={(e) => onChange(name, parseInt(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-orange-500"/>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1"><span>{minLabel}</span><span>{maxLabel}</span></div>
    </div>
);

const DailyCheckinForm: React.FC<DailyCheckinFormProps> = ({ user, onSubmit, existingCheckin }) => {
    const [checkin, setCheckin] = useState<Partial<DailyCheckin>>({
        sleep_hours: 7, sleep_quality: 5, stress: 5, hunger: 5, cravings: 'none',
        bloating: 5, bowel: 'regular', energy: 5, focus: 5, activity: '30_60',
        hydration_glasses: 8, caffeine_today: 0, compliance: 'yes',
        side_effects: { palpitations: false, nausea: false, insomnia: false, loose_stools: false },
    });
    
    useEffect(() => {
        // First, try to populate from an existing checkin for today
        if (existingCheckin) {
            setCheckin(existingCheckin);
            return; // Don't overwrite with sleep log if we have a full checkin object
        }

        // If no existing checkin, check for a logged sleep entry from the other modal
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


    const handleSliderChange = (name: keyof DailyCheckin, value: number) => {
        setCheckin(prev => ({...prev, [name]: value}));
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setCheckin(prev => ({...prev, side_effects: { ...prev.side_effects, [name]: checked }}));
        } else {
             const numValue = (name === 'sleep_hours' || name === 'weight_kg') ? parseFloat(value) : value;
             setCheckin(prev => ({...prev, [name]: numValue }));
        }
    };

    const handleSubmit = () => {
        const fullCheckin: DailyCheckin = {
            id: existingCheckin?.id || crypto.randomUUID(),
            user_id: user.id,
            date: new Date().toISOString().split('T')[0],
            created_at: existingCheckin?.created_at || new Date().toISOString(),
            ...checkin
        } as DailyCheckin; // Casting because we know all fields will be present
        onSubmit(fullCheckin);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Daily Check-in</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Just a few quick questions to personalize your plan for today. Be honest!</p>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="weight_kg" className={formLabelClass}>Today's Weight (kg)</label>
                        <input id="weight_kg" name="weight_kg" type="number" value={checkin.weight_kg || ''} onChange={handleChange} placeholder="Optional" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" />
                    </div>
                    <div>
                        <label htmlFor="sleep_hours" className={formLabelClass}>Sleep Hours</label>
                        <input id="sleep_hours" name="sleep_hours" type="number" value={checkin.sleep_hours} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" />
                    </div>
                </div>

                <SliderInput label="Sleep Quality" name="sleep_quality" value={checkin.sleep_quality!} onChange={handleSliderChange} minLabel="Restless" maxLabel="Deep" />
                <SliderInput label="Stress Level" name="stress" value={checkin.stress!} onChange={handleSliderChange} minLabel="Calm" maxLabel="High" />
                <SliderInput label="Hunger Level" name="hunger" value={checkin.hunger!} onChange={handleSliderChange} minLabel="Not Hungry" maxLabel="Very Hungry" />
                <SliderInput label="Bloating" name="bloating" value={checkin.bloating!} onChange={handleSliderChange} minLabel="None" maxLabel="Severe" />
                <SliderInput label="Energy Level" name="energy" value={checkin.energy!} onChange={handleSliderChange} minLabel="Low" maxLabel="High" />
                <SliderInput label="Focus / Concentration" name="focus" value={checkin.focus!} onChange={handleSliderChange} minLabel="Distracted" maxLabel="Sharp" />

                <div>
                    <label className={formLabelClass}>Bowel Movement</label>
                    <select name="bowel" value={checkin.bowel} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition">
                        <option value="regular">Regular</option>
                        <option value="constipated">Constipated</option>
                        <option value="loose">Loose</option>
                        <option value="irregular">Irregular</option>
                    </select>
                </div>
                 <div>
                    <label className={formLabelClass}>Food Cravings</label>
                    <select name="cravings" value={checkin.cravings} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition">
                        <option value="none">None</option>
                        <option value="sweet">Sweet</option>
                        <option value="salty">Salty</option>
                        <option value="fried">Fried</option>
                    </select>
                </div>
                 <div>
                    <label className={formLabelClass}>Today's Activity</label>
                    <select name="activity" value={checkin.activity} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition">
                        <option value="none">None</option>
                        <option value="<30">Less than 30 mins</option>
                        <option value="30_60">30-60 mins</option>
                        <option value=">60">More than 60 mins</option>
                    </select>
                </div>
                
                <div>
                    <label className={formLabelClass}>Any side effects today?</label>
                    <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <label className="flex items-center space-x-2 text-sm"><input type="checkbox" name="palpitations" checked={checkin.side_effects?.palpitations} onChange={handleChange} className="h-4 w-4 rounded text-orange-500 focus:ring-orange-400"/><span>Palpitations</span></label>
                        <label className="flex items-center space-x-2 text-sm"><input type="checkbox" name="nausea" checked={checkin.side_effects?.nausea} onChange={handleChange} className="h-4 w-4 rounded text-orange-500 focus:ring-orange-400"/><span>Nausea</span></label>
                        <label className="flex items-center space-x-2 text-sm"><input type="checkbox" name="insomnia" checked={checkin.side_effects?.insomnia} onChange={handleChange} className="h-4 w-4 rounded text-orange-500 focus:ring-orange-400"/><span>Insomnia</span></label>
                        <label className="flex items-center space-x-2 text-sm"><input type="checkbox" name="loose_stools" checked={checkin.side_effects?.loose_stools} onChange={handleChange} className="h-4 w-4 rounded text-orange-500 focus:ring-orange-400"/><span>Loose Stools</span></label>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={handleSubmit} className="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-all active:scale-95 shadow-md">
                        {existingCheckin ? "Update Today's Plan" : "Generate Today's Plan"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DailyCheckinForm;
