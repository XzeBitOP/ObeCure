import React from 'react';
import { ProgressEntry, DailyIntake, SleepEntry, WorkoutLogEntry } from '../types';

interface WeeklyReportViewProps {
  onBack: () => void;
  progressData: ProgressEntry[];
  intakeData: DailyIntake[];
  sleepData: SleepEntry[];
  workoutLogs: WorkoutLogEntry[];
}

const RadialProgress: React.FC<{ percentage: number; label: string }> = ({ percentage, label }) => {
  const radius = 50;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg height={radius * 2} width={radius * 2}>
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="#f97316"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          transform={`rotate(-90 ${radius} ${radius})`}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy=".3em"
          className="text-2xl font-bold fill-gray-800 dark:fill-gray-200"
        >
          {`${Math.round(percentage)}%`}
        </text>
      </svg>
      <p className="mt-2 font-semibold text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; unit: string; change?: string; changeColor?: string }> = ({ title, value, unit, change, changeColor }) => (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200 my-1">
            {value} <span className="text-lg font-medium text-gray-600 dark:text-gray-300">{unit}</span>
        </p>
        {change && <p className={`text-sm font-semibold ${changeColor}`}>{change}</p>}
    </div>
);

const WeeklyReportView: React.FC<WeeklyReportViewProps> = ({ onBack, progressData, intakeData, sleepData, workoutLogs }) => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    const todayStr = today.toISOString().split('T')[0];
    const lastWeekStr = lastWeek.toISOString().split('T')[0];

    const weeklyProgress = progressData.filter(d => d.date >= lastWeekStr && d.date <= todayStr);
    const weeklyIntake = intakeData.filter(d => d.date >= lastWeekStr && d.date <= todayStr);
    const weeklySleep = sleepData.filter(d => d.date >= lastWeekStr && d.date <= todayStr);
    const weeklyWorkouts = workoutLogs.filter(d => d.date >= lastWeekStr && d.date <= todayStr);

    const weightChange = weeklyProgress.length >= 2 
        ? (weeklyProgress[weeklyProgress.length - 1].weight - weeklyProgress[0].weight).toFixed(1) 
        : "0.0";
    const weightChangeNum = parseFloat(weightChange);

    const avgCalories = weeklyIntake.length > 0
        ? Math.round(weeklyIntake.reduce((sum, d) => sum + d.totalIntake, 0) / weeklyIntake.length)
        : 0;

    const avgSleep = weeklySleep.length > 0
        ? (weeklySleep.reduce((sum, d) => sum + d.hours, 0) / weeklySleep.length).toFixed(1)
        : "0.0";
        
    const totalWorkoutMinutes = weeklyWorkouts.reduce((sum, d) => sum + d.duration, 0);

    const loggedDays = new Set([...weeklyIntake.map(d => d.date), ...weeklySleep.map(d => d.date), ...weeklyWorkouts.map(d => d.date)]).size;
    const consistency = (loggedDays / 7) * 100;

  return (
    <div className="animate-fade-in-up space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1 flex items-center justify-center">
                <RadialProgress percentage={consistency} label="Weekly Consistency" />
            </div>
            <div className="sm:col-span-2 grid grid-cols-2 gap-4">
                <StatCard 
                    title="Weight Change" 
                    value={Math.abs(weightChangeNum).toFixed(1)} 
                    unit="kg"
                    change={weightChangeNum < 0 ? 'Lost' : weightChangeNum > 0 ? 'Gained' : 'Maintained'}
                    changeColor={weightChangeNum < 0 ? 'text-green-500' : weightChangeNum > 0 ? 'text-red-500' : 'text-gray-500'}
                />
                <StatCard title="Avg. Calories" value={String(avgCalories)} unit="kcal" />
                <StatCard title="Avg. Sleep" value={avgSleep} unit="hrs" />
                <StatCard title="Total Workout" value={String(totalWorkoutMinutes)} unit="min" />
            </div>
        </div>
        
        <div>
            <h3 className="font-bold text-lg text-gray-700 dark:text-gray-300 mb-2 text-center">Summary</h3>
            <p className="text-center text-gray-600 dark:text-gray-400 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                {consistency > 80 ? "Fantastic week! Your consistency is paying off. " : "Good start to the week. Let's aim to log every day for even better results. "}
                {weightChangeNum < 0 && "You've successfully lost weight this week, great job! "}
                Keep up the great work!
            </p>
        </div>

        <div className="mt-6 flex justify-center">
             <button
                onClick={onBack}
                className="w-full sm:w-auto bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-all active:scale-95"
              >
                &larr; Back to Progress Chart
            </button>
        </div>
    </div>
  );
};

export default WeeklyReportView;