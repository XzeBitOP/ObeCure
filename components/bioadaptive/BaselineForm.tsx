import React, { useState, useEffect } from 'react';
import { UserProfile, ProgressEntry } from '../../types';
import { saveUserProfile } from '../../bioadaptive/repository';

interface BaselineFormProps {
    onSave: (profile: UserProfile) => void;
    existingProfile: UserProfile | null;
}

const USER_PREFERENCES_KEY = 'obeCureUserPreferences';
const PROGRESS_DATA_KEY = 'obeCureProgressData';

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
                // FIX: Correctly merge optional properties from existingProfile with default values to satisfy the state's inferred type which expects all properties to be required.
                conditions: {
                    gerd: false, ibs: false, thyroid: 'none', diabetes: false,
                    ...existingProfile.baseline.conditions
                },
                contra: {
                    pregnant: false, breastfeeding: false, under18: false,
                    ...existingProfile.baseline.contra
                },
                goals: [...existingProfile.goals],
            });
        } else {
             // If no bio-adaptive profile, try to import from diet planner
            try {
                const dietPrefsRaw = localStorage.getItem(USER_PREFERENCES_KEY);
                const dietPrefs = dietPrefsRaw ? JSON.parse(dietPrefsRaw) : {};

                // Calculate average weight from progress data
                const progressDataRaw = localStorage.getItem(PROGRESS_DATA_KEY);
                let currentWeight = dietPrefs.patientWeight || '';
                if (progressDataRaw) {
                    const progressData: ProgressEntry[] = JSON.parse(progressDataRaw);
                    if (progressData.length > 0) {
                        const sortedProgress = [...progressData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                        const recentEntries = sortedProgress.slice(0, 7);
                        if (recentEntries.length > 0) {
                            const totalWeight = recentEntries.reduce((sum, entry) => sum + entry.weight, 0);
                            const avgWeight = totalWeight / recentEntries.length;
                            currentWeight = avgWeight.toFixed(1);
                        }
                    }
                }
                
                setFormData(prev => ({
                    ...prev,
                    name: dietPrefs.patientName || '',
                    age: dietPrefs.age || '',
                    sex: dietPrefs.sex || 'Female',
                    height_cm: dietPrefs.height || '',
                    weight_kg: currentWeight,
                }));
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
            // FIX: Added missing properties to conform to UserProfile type
            baseline: {
                weight_kg: parseFloat(formData.weight_kg),
                waist_cm: formData.waist_cm ? parseFloat(formData.waist_cm) : undefined,
                diet_pattern: formData.diet_pattern as "vegetarian" | "mixed",
                caffeine_sensitivity: formData.caffeine_sensitivity as "low" | "medium" | "high",
                // FIX: Explicitly cast the 'thyroid' property to its specific union type to resolve the 'string' vs. union type mismatch on assignment.
                conditions: {
                    ...formData.conditions,
                    thyroid: formData.conditions.thyroid as "none" | "hypo" | "hyper",
                },
                contra: formData.contra
            },
            goals: formData.goals,
            created_at: existingProfile?.created_at || now,
            updated_at: now,
        };
        saveUserProfile(profile);
        onSave(profile);
    };

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                {existingProfile ? 'Update Your Bio-Profile' : 'Create Your Bio-Profile'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">This helps us create a deeply personalized Ayurvedic plan for you.</p>
            
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
                    {/* Basic Info Inputs */}
                    <div><label htmlFor="name" className={formLabelClass}>Name</label><input id="name" name="name" type="text" value={formData.name} onChange={handleChange} placeholder="e.g., Anjali Sharma" className={formInputClass} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label htmlFor="age" className={formLabelClass}>Age*</label><input id="age" name="age" type="number" value={formData.age} onChange={handleChange} placeholder="e.g., 30" required className={formInputClass} /></div>
                        <div><label htmlFor="sex" className={formLabelClass}>Sex*</label><select id="sex" name="sex" value={formData.sex} onChange={handleChange} className={formInputClass}><option value="Female">Female</option><option value="Male">Male</option><option value="Other">Other</option></select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label htmlFor="height_cm" className={formLabelClass}>Height (cm)*</label><input id="height_cm" name="height_cm" type="number" value={formData.height_cm} onChange={handleChange} placeholder="e.g., 165" required className={formInputClass} /></div>
                        <div><label htmlFor="weight_kg" className={formLabelClass}>Weight (kg)*</label><input id="weight_kg" name="weight_kg" type="number" value={formData.weight_kg} onChange={handleChange} placeholder="e.g., 75" required className={formInputClass} /></div>
                    </div>
                    <div><label htmlFor="waist_cm" className={formLabelClass}>Waist (cm)</label><input id="waist_cm" name="waist_cm" type="number" value={formData.waist_cm} onChange={handleChange} placeholder="Optional, at navel level" className={formInputClass} /></div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                    {/* Lifestyle & Goals */}
                    <div>
                        <label className={formLabelClass}>Primary Goals</label>
                        <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <label className="flex items-center space-x-2 text-sm"><input type="checkbox" name="fat_loss" checked={formData.goals.includes('fat_loss')} onChange={e => handleCheckboxChange(e, 'goals')} className="h-4 w-4 rounded text-orange-500"/><span>Fat Loss</span></label>
                            <label className="flex items-center space-x-2 text-sm"><input type="checkbox" name="gut_reset" checked={formData.goals.includes('gut_reset')} onChange={e => handleCheckboxChange(e, 'goals')} className="h-4 w-4 rounded text-orange-500"/><span>Gut Reset</span></label>
                            <label className="flex items-center space-x-2 text-sm"><input type="checkbox" name="energy" checked={formData.goals.includes('energy')} onChange={e => handleCheckboxChange(e, 'goals')} className="h-4 w-4 rounded text-orange-500"/><span>Energy Boost</span></label>
                            <label className="flex items-center space-x-2 text-sm"><input type="checkbox" name="stress_sleep" checked={formData.goals.includes('stress_sleep')} onChange={e => handleCheckboxChange(e, 'goals')} className="h-4 w-4 rounded text-orange-500"/><span>Stress & Sleep</span></label>
                        </div>
                    </div>
                     <div><label className={formLabelClass}>Diet Pattern</label><select name="diet_pattern" value={formData.diet_pattern} onChange={handleChange} className={formInputClass}><option value="vegetarian">Vegetarian</option><option value="mixed">Mixed (Non-Veg)</option></select></div>
                     <div><label className={formLabelClass}>Caffeine Sensitivity</label><select name="caffeine_sensitivity" value={formData.caffeine_sensitivity} onChange={handleChange} className={formInputClass}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
                </div>
            )}

            {step === 3 && (
                 <div className="space-y-6 animate-fade-in">
                    {/* Health Conditions */}
                    <div>
                        <label className={formLabelClass}>Existing Conditions</label>
                        <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <label className="flex items-center space-x-2 text-sm"><input type="checkbox" name="gerd" checked={formData.conditions.gerd} onChange={e => handleCheckboxChange(e, 'conditions')} className="h-4 w-4 rounded text-orange-500"/><span>GERD / Acidity</span></label>
                            <label className="flex items-center space-x-2 text-sm"><input type="checkbox" name="ibs" checked={formData.conditions.ibs} onChange={e => handleCheckboxChange(e, 'conditions')} className="h-4 w-4 rounded text-orange-500"/><span>IBS</span></label>
                            <label className="flex items-center space-x-2 text-sm"><input type="checkbox" name="diabetes" checked={formData.conditions.diabetes} onChange={e => handleCheckboxChange(e, 'conditions')} className="h-4 w-4 rounded text-orange-500"/><span>Diabetes</span></label>
                            <div>
                                <label className="text-sm">Thyroid:</label>
                                <div className="flex gap-4 mt-1">
                                    <label className="flex items-center gap-1 text-sm"><input type="radio" name="thyroid" value="none" checked={formData.conditions.thyroid === 'none'} onChange={e => handleRadioChange(e, 'conditions')} className="text-orange-500"/>None</label>
                                    <label className="flex items-center gap-1 text-sm"><input type="radio" name="thyroid" value="hypo" checked={formData.conditions.thyroid === 'hypo'} onChange={e => handleRadioChange(e, 'conditions')} className="text-orange-500"/>Hypo</label>
                                    <label className="flex items-center gap-1 text-sm"><input type="radio" name="thyroid" value="hyper" checked={formData.conditions.thyroid === 'hyper'} onChange={e => handleRadioChange(e, 'conditions')} className="text-orange-500"/>Hyper</label>
                                </div>
                            </div>
                        </div>
                    </div>
                     <div>
                        <label className={formLabelClass}>Contraindications</label>
                         <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <label className="flex items-center space-x-2 text-sm"><input type="checkbox" name="pregnant" checked={formData.contra.pregnant} onChange={e => handleCheckboxChange(e, 'contra')} className="h-4 w-4 rounded text-orange-500"/><span>Pregnant</span></label>
                            <label className="flex items-center space-x-2 text-sm"><input type="checkbox" name="breastfeeding" checked={formData.contra.breastfeeding} onChange={e => handleCheckboxChange(e, 'contra')} className="h-4 w-4 rounded text-orange-500"/><span>Breastfeeding</span></label>
                            <label className="flex items-center space-x-2 text-sm"><input type="checkbox" name="under18" checked={formData.contra.under18} onChange={e => handleCheckboxChange(e, 'contra')} className="h-4 w-4 rounded text-orange-500"/><span>Under 18</span></label>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row-reverse gap-4">
                {step < 3 && (
                    <button onClick={handleNext} className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-all duration-300 active:scale-95 shadow-md">Next Step &rarr;</button>
                )}
                {step === 3 && (
                    <button onClick={handleSubmit} className="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-all duration-300 active:scale-95 shadow-md">Save Profile</button>
                )}
                {step > 1 && (
                    <button onClick={handleBack} className="w-full sm:w-auto bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-3 px-6 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 active:scale-95 shadow-md">&larr; Back</button>
                )}
            </div>
        </div>
    );
};

export default BaselineForm;