
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { saveUserProfile } from '../../bioadaptive/repository';

interface BaselineFormProps {
    onSave: (profile: UserProfile) => void;
    existingProfile: UserProfile | null;
}

const USER_PREFERENCES_KEY = 'obeCureUserPreferences';

const formInputClass = "w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition";
const formLabelClass = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2";

const BaselineForm: React.FC<BaselineFormProps> = ({ onSave, existingProfile }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '', age: '', sex: 'Female', height_cm: '', weight_kg: '', waist_cm: '',
        diet_pattern: 'vegetarian', caffeine_sensitivity: 'medium',
        conditions: { gerd: false, ibs: false, thyroid: 'none', diabetes: false },
        contra: { pregnant: false, breastfeeding: false, under18: false },
        goals: [] as string[],
    });

    useEffect(() => {
        if (existingProfile) {
            setFormData({
                name: existingProfile.name || '',
                age: String(existingProfile.age),
                sex: existingProfile.sex,
                height_cm: String(existingProfile.height_cm),
                weight_kg: String(existingProfile.baseline.weight_kg),
                waist_cm: String(existingProfile.baseline.waist_cm || ''),
                diet_pattern: existingProfile.baseline.diet_pattern,
                caffeine_sensitivity: existingProfile.baseline.caffeine_sensitivity,
                conditions: { ...existingProfile.baseline.conditions },
                contra: { ...existingProfile.baseline.contra },
                goals: [...existingProfile.goals],
            });
        } else {
             // If no bio-adaptive profile, try to import from diet planner
            try {
                const dietPrefsRaw = localStorage.getItem(USER_PREFERENCES_KEY);
                if (dietPrefsRaw) {
                    const dietPrefs = JSON.parse(dietPrefsRaw);
                    setFormData(prev => ({
                        ...prev,
                        name: dietPrefs.patientName || '',
                        age: dietPrefs.age || '',
                        sex: dietPrefs.sex || 'Female',
                        height_cm: dietPrefs.height || '',
                        weight_kg: dietPrefs.patientWeight || '',
                    }));
                }
            } catch (e) {
                console.error("Failed to import from diet planner preferences", e);
            }
        }
    }, [existingProfile]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, category: 'conditions' | 'contra' | 'goals') => {
        const { name, checked } = e.target;
        if(category === 'goals') {
             setFormData(prev => ({
                ...prev,
                goals: checked ? [...prev.goals, name] : prev.goals.filter(g => g !== name),
            }));
        } else {
             setFormData(prev => ({
                ...prev,
                [category]: { ...prev[category], [name]: checked }
            }));
        }
    };
    
    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>, category: 'conditions' | 'contra') => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [category]: { ...prev[category], [name]: value } }));
    }

    const handleSubmit = () => {
        const now = new Date().toISOString();
        const profile: UserProfile = {
            id: existingProfile?.id || crypto.randomUUID(),
            name: formData.name,
            age: parseInt(formData.age),
            sex: formData.sex as "Male" | "Female" | "Other",
            height_cm: parseInt(formData.height_cm),
            baseline: {
                weight_kg: parseFloat(formData.weight_kg),
                waist_cm: formData.waist_cm ? parseFloat(formData.waist_cm) : undefined,
                diet_pattern: formData.diet_pattern as "vegetarian" | "mixed",
                caffeine_sensitivity: formData.caffeine_sensitivity as "low" | "medium" | "high",
                conditions: {
                    ...formData.conditions,
                    thyroid: formData.conditions.thyroid as "hypo" | "hyper" | "none",
                },
                contra: formData.contra,
            },
            goals: formData.goals,
            created_at: existingProfile?.created_at || now,
            updated_at: now,
        };
        saveUserProfile(profile);
        onSave(profile);
    };
    
    const goalsOptions = ["fat_loss", "gut_reset", "energy", "stress_sleep"];

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Create Your Bio-Profile</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">This one-time setup helps us create a personalized baseline for your plan.</p>
            
            {/* Stepper */}
            <div className="mb-8">
                <div className="flex justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Step {step} of 3</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
                </div>
            </div>

            {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                    <h3 className="font-semibold text-lg">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label htmlFor="name" className={formLabelClass}>Name</label><input id="name" name="name" type="text" value={formData.name} onChange={handleChange} placeholder="Optional" className={formInputClass}/></div>
                        <div><label htmlFor="age" className={formLabelClass}>Age*</label><input id="age" name="age" type="number" value={formData.age} onChange={handleChange} required className={formInputClass}/></div>
                        <div><label htmlFor="sex" className={formLabelClass}>Sex*</label><select id="sex" name="sex" value={formData.sex} onChange={handleChange} className={formInputClass}><option>Female</option><option>Male</option><option>Other</option></select></div>
                        <div><label htmlFor="height_cm" className={formLabelClass}>Height (cm)*</label><input id="height_cm" name="height_cm" type="number" value={formData.height_cm} onChange={handleChange} required className={formInputClass}/></div>
                        <div><label htmlFor="weight_kg" className={formLabelClass}>Current Weight (kg)*</label><input id="weight_kg" name="weight_kg" type="number" value={formData.weight_kg} onChange={handleChange} required className={formInputClass}/></div>
                        <div><label htmlFor="waist_cm" className={formLabelClass}>Waist (cm)</label><input id="waist_cm" name="waist_cm" type="number" value={formData.waist_cm} onChange={handleChange} placeholder="Optional" className={formInputClass}/></div>
                    </div>
                </div>
            )}
            
            {step === 2 && (
                 <div className="space-y-6 animate-fade-in">
                     <h3 className="font-semibold text-lg">Lifestyle & Goals</h3>
                     <div>
                        <label className={formLabelClass}>Primary Diet Pattern*</label>
                        <select name="diet_pattern" value={formData.diet_pattern} onChange={handleChange} className={formInputClass}><option value="vegetarian">Vegetarian</option><option value="mixed">Mixed (Non-Vegetarian)</option></select>
                     </div>
                      <div>
                        <label className={formLabelClass}>Caffeine Sensitivity*</label>
                        <select name="caffeine_sensitivity" value={formData.caffeine_sensitivity} onChange={handleChange} className={formInputClass}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>
                     </div>
                     <div>
                        <label className={formLabelClass}>What are your main goals?</label>
                        <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                           {goalsOptions.map(goal => (
                                <label key={goal} className="flex items-center space-x-2 text-sm"><input type="checkbox" name={goal} checked={formData.goals.includes(goal)} onChange={e => handleCheckboxChange(e, 'goals')} className="h-4 w-4 rounded text-orange-500 focus:ring-orange-400"/><span>{goal.replace('_',' ')}</span></label>
                           ))}
                        </div>
                     </div>
                 </div>
            )}

            {step === 3 && (
                <div className="space-y-6 animate-fade-in">
                    <h3 className="font-semibold text-lg">Health Background</h3>
                     <div>
                        <label className={formLabelClass}>Any of the following conditions?</label>
                        <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <label className="flex items-center space-x-2 text-sm"><input type="checkbox" name="gerd" checked={formData.conditions.gerd} onChange={e => handleCheckboxChange(e, 'conditions')} className="h-4 w-4 rounded text-orange-500 focus:ring-orange-400"/><span>GERD / Acidity</span></label>
                            <label className="flex items-center space-x-2 text-sm"><input type="checkbox" name="ibs" checked={formData.conditions.ibs} onChange={e => handleCheckboxChange(e, 'conditions')} className="h-4 w-4 rounded text-orange-500 focus:ring-orange-400"/><span>IBS (Irritable Bowel)</span></label>
                             <label className="flex items-center space-x-2 text-sm"><input type="checkbox" name="diabetes" checked={formData.conditions.diabetes} onChange={e => handleCheckboxChange(e, 'conditions')} className="h-4 w-4 rounded text-orange-500 focus:ring-orange-400"/><span>Diabetes</span></label>
                            <div>
                                <span className="text-sm font-medium">Thyroid:</span>
                                <div className="flex gap-4 mt-1"><label className="flex items-center gap-1 text-sm"><input type="radio" name="thyroid" value="none" checked={formData.conditions.thyroid === 'none'} onChange={e => handleRadioChange(e, 'conditions')} />None</label><label className="flex items-center gap-1 text-sm"><input type="radio" name="thyroid" value="hypo" checked={formData.conditions.thyroid === 'hypo'} onChange={e => handleRadioChange(e, 'conditions')} />Hypo</label><label className="flex items-center gap-1 text-sm"><input type="radio" name="thyroid" value="hyper" checked={formData.conditions.thyroid === 'hyper'} onChange={e => handleRadioChange(e, 'conditions')} />Hyper</label></div>
                            </div>
                        </div>
                     </div>
                      <div>
                        <label className={`${formLabelClass} text-red-600 dark:text-red-400`}>Important: Contraindications</label>
                        <div className="space-y-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                             <label className="flex items-center space-x-2 text-sm"><input type="checkbox" name="pregnant" checked={formData.contra.pregnant} onChange={e => handleCheckboxChange(e, 'contra')} className="h-4 w-4 rounded text-orange-500 focus:ring-orange-400"/><span>Pregnant</span></label>
                             <label className="flex items-center space-x-2 text-sm"><input type="checkbox" name="breastfeeding" checked={formData.contra.breastfeeding} onChange={e => handleCheckboxChange(e, 'contra')} className="h-4 w-4 rounded text-orange-500 focus:ring-orange-400"/><span>Breastfeeding</span></label>
                             <label className="flex items-center space-x-2 text-sm"><input type="checkbox" name="under18" checked={formData.contra.under18} onChange={e => handleCheckboxChange(e, 'contra')} className="h-4 w-4 rounded text-orange-500 focus:ring-orange-400"/><span>Under 18 years old</span></label>
                        </div>
                     </div>
                </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex gap-4">
                {step > 1 && <button onClick={() => setStep(s => s - 1)} className="w-full bg-gray-200 dark:bg-gray-600 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-all active:scale-95">Back</button>}
                {step < 3 ? (
                     <button onClick={() => setStep(s => s + 1)} className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-all active:scale-95 shadow-md">Next</button>
                ) : (
                     <button onClick={handleSubmit} className="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-all active:scale-95 shadow-md">Save Profile</button>
                )}
            </div>
        </div>
    );
};

export default BaselineForm;
