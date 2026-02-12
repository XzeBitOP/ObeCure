import React, { useState } from 'react';
import { logsAPI } from '../services/api';

interface DailyLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

type LogType = 'calories' | 'workout' | 'weight';

const DailyLogModal: React.FC<DailyLogModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [activeTab, setActiveTab] = useState<LogType>('calories');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Calorie log state
    const [mealName, setMealName] = useState('');
    const [calories, setCalories] = useState('');
    const [mealType, setMealType] = useState('breakfast');

    // Workout log state
    const [workoutName, setWorkoutName] = useState('');
    const [duration, setDuration] = useState('');
    const [caloriesBurned, setCaloriesBurned] = useState('');

    // Weight log state
    const [weight, setWeight] = useState('');
    const [waist, setWaist] = useState('');
    const [chest, setChest] = useState('');
    const [hips, setHips] = useState('');
    const [bodyFat, setBodyFat] = useState('');
    const [notes, setNotes] = useState('');

    if (!isOpen) return null;

    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    const resetForm = () => {
        setMealName('');
        setCalories('');
        setMealType('breakfast');
        setWorkoutName('');
        setDuration('');
        setCaloriesBurned('');
        setWeight('');
        setWaist('');
        setChest('');
        setHips('');
        setBodyFat('');
        setNotes('');
        setError(null);
        setSuccess(null);
    };

    const handleLogCalories = async () => {
        if (!mealName || !calories) {
            setError('Please fill in meal name and calories');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await logsAPI.logCalories(getTodayDate(), mealName, parseInt(calories), mealType);
            setSuccess('✅ Meal logged successfully!');
            setTimeout(() => {
                resetForm();
                onSuccess?.();
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to log meal');
        } finally {
            setLoading(false);
        }
    };

    const handleLogWorkout = async () => {
        if (!workoutName || !duration) {
            setError('Please fill in workout name and duration');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await logsAPI.logWorkout(
                getTodayDate(), 
                workoutName, 
                parseInt(duration),
                caloriesBurned ? parseInt(caloriesBurned) : undefined
            );
            setSuccess('✅ Workout logged successfully!');
            setTimeout(() => {
                resetForm();
                onSuccess?.();
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to log workout');
        } finally {
            setLoading(false);
        }
    };

    const handleLogWeight = async () => {
        if (!weight) {
            setError('Please enter your weight');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await logsAPI.logBodyMetrics(
                getTodayDate(),
                parseFloat(weight),
                waist ? parseFloat(waist) : undefined,
                chest ? parseFloat(chest) : undefined,
                hips ? parseFloat(hips) : undefined,
                bodyFat ? parseFloat(bodyFat) : undefined,
                notes || undefined
            );
            setSuccess('✅ Body metrics logged successfully!');
            setTimeout(() => {
                resetForm();
                onSuccess?.();
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to log body metrics');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        if (activeTab === 'calories') handleLogCalories();
        else if (activeTab === 'workout') handleLogWorkout();
        else if (activeTab === 'weight') handleLogWeight();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
                <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-pink-500 p-6 text-white rounded-t-2xl z-10">
                    <button
                        onClick={() => { resetForm(); onClose(); }}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <h2 className="text-2xl font-bold">Daily Log</h2>
                    <p className="text-white/90 text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <button
                        onClick={() => { setActiveTab('calories'); resetForm(); }}
                        className={`flex-1 py-3 text-sm font-semibold transition-all ${
                            activeTab === 'calories'
                                ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-50/50 dark:bg-orange-900/20'
                                : 'text-gray-500 dark:text-gray-400'
                        }`}
                    >
                        🍽️ Meals
                    </button>
                    <button
                        onClick={() => { setActiveTab('workout'); resetForm(); }}
                        className={`flex-1 py-3 text-sm font-semibold transition-all ${
                            activeTab === 'workout'
                                ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-50/50 dark:bg-orange-900/20'
                                : 'text-gray-500 dark:text-gray-400'
                        }`}
                    >
                        💪 Workout
                    </button>
                    <button
                        onClick={() => { setActiveTab('weight'); resetForm(); }}
                        className={`flex-1 py-3 text-sm font-semibold transition-all ${
                            activeTab === 'weight'
                                ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-50/50 dark:bg-orange-900/20'
                                : 'text-gray-500 dark:text-gray-400'
                        }`}
                    >
                        ⚖️ Weight
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Calorie Log Form */}
                    {activeTab === 'calories' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meal Type</label>
                                <select
                                    value={mealType}
                                    onChange={(e) => setMealType(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="breakfast">Breakfast</option>
                                    <option value="lunch">Lunch</option>
                                    <option value="dinner">Dinner</option>
                                    <option value="snack">Snack</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meal Name</label>
                                <input
                                    type="text"
                                    value={mealName}
                                    onChange={(e) => setMealName(e.target.value)}
                                    placeholder="e.g., Chicken Salad"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Calories</label>
                                <input
                                    type="number"
                                    value={calories}
                                    onChange={(e) => setCalories(e.target.value)}
                                    placeholder="500"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </>
                    )}

                    {/* Workout Log Form */}
                    {activeTab === 'workout' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Workout Name</label>
                                <input
                                    type="text"
                                    value={workoutName}
                                    onChange={(e) => setWorkoutName(e.target.value)}
                                    placeholder="e.g., Morning Run"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration (minutes)</label>
                                <input
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    placeholder="30"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Calories Burned (optional)</label>
                                <input
                                    type="number"
                                    value={caloriesBurned}
                                    onChange={(e) => setCaloriesBurned(e.target.value)}
                                    placeholder="250"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </>
                    )}

                    {/* Weight Log Form */}
                    {activeTab === 'weight' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Weight (kg) *</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    placeholder="70.5"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Waist (cm)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={waist}
                                        onChange={(e) => setWaist(e.target.value)}
                                        placeholder="80"
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chest (cm)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={chest}
                                        onChange={(e) => setChest(e.target.value)}
                                        placeholder="95"
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hips (cm)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={hips}
                                        onChange={(e) => setHips(e.target.value)}
                                        placeholder="100"
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Body Fat %</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={bodyFat}
                                    onChange={(e) => setBodyFat(e.target.value)}
                                    placeholder="20.5"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Feeling energetic today..."
                                    rows={2}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </>
                    )}

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
                            {success}
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-4 px-6 rounded-xl hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Logging...' : 'Save Log'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DailyLogModal;
