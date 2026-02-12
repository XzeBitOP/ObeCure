import React, { useState } from 'react';
import { reportsAPI } from '../services/api';

interface ReportsViewProps {
    isOpen: boolean;
    onClose: () => void;
}

const ReportsView: React.FC<ReportsViewProps> = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<any>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportType, setReportType] = useState('all');
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleGenerateReport = async () => {
        if (!startDate || !endDate) {
            setError('Please select both start and end dates');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await reportsAPI.generateReport(startDate, endDate, reportType);
            setReportData(data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickSelect = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        
        setEndDate(end.toISOString().split('T')[0]);
        setStartDate(start.toISOString().split('T')[0]);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full my-8 animate-fade-in-up">
                <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white rounded-t-2xl z-10">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <h2 className="text-3xl font-bold">📊 Progress Report</h2>
                    <p className="text-white/90 text-sm mt-1">View your fitness journey data</p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Date Selection */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 space-y-4">
                        <div className="flex gap-2 flex-wrap">
                            <button onClick={() => handleQuickSelect(7)} className="px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800">Last 7 Days</button>
                            <button onClick={() => handleQuickSelect(30)} className="px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800">Last 30 Days</button>
                            <button onClick={() => handleQuickSelect(90)} className="px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800">Last 3 Months</button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Report Type</label>
                            <select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                                <option value="all">Complete Report</option>
                                <option value="calories">Calories Only</option>
                                <option value="workouts">Workouts Only</option>
                                <option value="body_metrics">Body Metrics Only</option>
                            </select>
                        </div>

                        <button
                            onClick={handleGenerateReport}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            {loading ? 'Generating Report...' : 'Generate Report'}
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Report Results */}
                    {reportData && (
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                            {/* Calories Summary */}
                            {reportData.calories && (
                                <div className="bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                                        <span>🍽️</span> Calorie Intake
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{reportData.calories.total}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Total Calories</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{reportData.calories.average_per_day}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Avg per Day</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{reportData.calories.days_logged}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Days Logged</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Workouts Summary */}
                            {reportData.workouts && (
                                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                                        <span>💪</span> Workouts
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{reportData.workouts.total_sessions}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{reportData.workouts.total_duration_minutes}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Total Minutes</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{reportData.workouts.total_calories_burned}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Calories Burned</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Body Metrics Summary */}
                            {reportData.body_metrics && (
                                <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                                        <span>⚖️</span> Body Metrics
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="text-center">
                                            <div className={`text-3xl font-bold ${reportData.body_metrics.weight_change && reportData.body_metrics.weight_change < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {reportData.body_metrics.weight_change ? (reportData.body_metrics.weight_change > 0 ? '+' : '') + reportData.body_metrics.weight_change : 'N/A'} kg
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Weight Change</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{reportData.body_metrics.measurements_taken}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Measurements</div>
                                        </div>
                                    </div>
                                    {reportData.body_metrics.logs.length > 0 && (
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            <div>First: {reportData.body_metrics.logs[0].weight} kg on {reportData.body_metrics.logs[0].date}</div>
                                            <div>Latest: {reportData.body_metrics.logs[reportData.body_metrics.logs.length - 1].weight} kg on {reportData.body_metrics.logs[reportData.body_metrics.logs.length - 1].date}</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportsView;
