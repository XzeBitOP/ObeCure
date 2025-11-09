import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ProgressEntry, DailyIntake, SleepEntry, FastingEntry, WorkoutLogEntry, WaterEntry } from '../types';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import WeeklyReportView from './WeeklyReportView';

const PROGRESS_DATA_KEY = 'obeCureProgressData';
const DAILY_INTAKE_KEY = 'obeCureDailyIntake';
const SLEEP_DATA_KEY = 'obeCureSleepData';
const FASTING_DATA_KEY = 'obeCureFastingData';
const WORKOUT_LOG_KEY = 'obeCureWorkoutLog';
const WATER_INTAKE_KEY = 'obeCureWaterIntake';


interface ChartDataPoint {
  date: string;
  weight?: number;
  bmi?: number;
  intake?: number;
  target?: number;
  sleep?: number;
  fastingDuration?: number;
  water?: number;
}

type NumericChartDataPointKeys = 'weight' | 'bmi' | 'intake' | 'target' | 'sleep' | 'fastingDuration' | 'water';

interface TooltipData {
  x: number;
  y: number;
  data: ChartDataPoint;
}

const ProgressChart: React.FC<{ data: ChartDataPoint[] }> = ({ data }) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const padding = { top: 20, right: 50, bottom: 40, left: 50 };
  const width = 500;
  const height = 300;

  const { weightDomain, calorieDomain, sharedDomain, xDomain } = useMemo(() => {
    const weights = data.map(d => d.weight).filter(v => v !== undefined) as number[];
    const bmis = data.map(d => d.bmi).filter(v => v !== undefined) as number[];
    const sleeps = data.map(d => d.sleep).filter(v => v !== undefined) as number[];
    const fasts = data.map(d => d.fastingDuration).filter(v => v !== undefined) as number[];
    const waters = data.map(d => d.water).filter(v => v !== undefined) as number[];
    const intakes = data.map(d => d.intake).filter(v => v !== undefined) as number[];
    const targets = data.map(d => d.target).filter(v => v !== undefined) as number[];
    const allCalories = [...intakes, ...targets];
    
    const getDomain = (values: number[], pad: number, minSpread: number): [number, number] => {
        if (values.length === 0) return [0, minSpread];
        let min = Math.min(...values);
        let max = Math.max(...values);
        if (max - min < minSpread) {
            const mid = (min + max) / 2;
            min = mid - minSpread / 2;
            max = mid + minSpread / 2;
        }
        return [min - pad, max + pad];
    };

    return {
        weightDomain: getDomain(weights, 2, 10),
        calorieDomain: getDomain(allCalories, 200, 1000),
        sharedDomain: getDomain([...bmis, ...sleeps, ...fasts, ...waters], 2, 10),
        xDomain: [0, data.length - 1],
    };
  }, [data]);

  const xScale = (index: number) => padding.left + (index / (data.length > 1 ? data.length - 1 : 1)) * (width - padding.left - padding.right);
  const yScale = (val: number, domain: [number, number]) => height - padding.bottom - ((val - domain[0]) / (domain[1] - domain[0])) * (height - padding.top - padding.bottom);

  const createPath = (key: NumericChartDataPointKeys, scale: (val: number) => number) =>
    data.map((d, i) => d[key] !== undefined ? { x: xScale(i), y: scale(d[key]!) } : null)
        .reduce((acc, point, i, arr) => {
            if (point) {
                const isFirstInSegment = i === 0 || arr[i - 1] === null;
                const command = isFirstInSegment ? 'M' : 'L';
                acc += ` ${command} ${point.x} ${point.y}`;
            }
            return acc;
        }, '').trim();
        
  const weightPath = createPath('weight', (v) => yScale(v, weightDomain));
  const intakePath = createPath('intake', (v) => yScale(v, calorieDomain));
  const targetPath = createPath('target', (v) => yScale(v, calorieDomain));
  const bmiPath = createPath('bmi', (v) => yScale(v, sharedDomain));
  const sleepPath = createPath('sleep', (v) => yScale(v, sharedDomain));
  const fastingPath = createPath('fastingDuration', (v) => yScale(v, sharedDomain));
  const waterPath = createPath('water', (v) => yScale(v, sharedDomain));

  const yAxisWeightTicks = Array.from({ length: 5 }, (_, i) => weightDomain[0] + i * (weightDomain[1] - weightDomain[0]) / 4);
  const yAxisCalorieTicks = Array.from({ length: 5 }, (_, i) => calorieDomain[0] + i * (calorieDomain[1] - calorieDomain[0]) / 4);
  const yAxisSharedTicks = Array.from({ length: 5 }, (_, i) => sharedDomain[0] + i * (sharedDomain[1] - sharedDomain[0]) / 4);

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const svgPoint = svgRef.current.createSVGPoint();
    svgPoint.x = event.clientX;
    svgPoint.y = event.clientY;
    const point = svgPoint.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    
    const index = Math.round(((point.x - padding.left) / (width - padding.left - padding.right)) * (data.length - 1));
    
    if(index >= 0 && index < data.length) {
        const d = data[index];
        const xPos = xScale(index);
        const yPos = d.weight ? yScale(d.weight, weightDomain) : height / 2;
        setTooltip({ x: xPos, y: yPos, data: d });
    }
  };

  return (
    <div className="relative w-full h-full">
        <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="w-full h-full text-xs text-gray-500 dark:text-gray-400" onMouseMove={handleMouseMove} onMouseLeave={() => setTooltip(null)}>
        <rect x="0" y="0" width={width} height={height} fill="transparent" />
        {yAxisWeightTicks.map(tick => (<line key={`grid-${tick}`} x1={padding.left} y1={yScale(tick, weightDomain)} x2={width - padding.right} y2={yScale(tick, weightDomain)} className="stroke-gray-200 dark:stroke-gray-700" strokeDasharray="2,2"/>))}
        {yAxisWeightTicks.map(tick => (<g key={`y-weight-${tick}`}><text x={padding.left - 5} y={yScale(tick, weightDomain)} textAnchor="end" alignmentBaseline="middle" className="fill-current text-orange-500 font-semibold">{tick.toFixed(1)}</text></g>))}
        {yAxisCalorieTicks.map(tick => (<g key={`y-cal-${tick}`}><text x={padding.left - 25} y={yScale(tick, calorieDomain)} textAnchor="end" alignmentBaseline="middle" className="fill-current text-indigo-500 font-semibold">{Math.round(tick)}</text></g>))}
        {yAxisSharedTicks.map(tick => (<g key={`y-shared-${tick}`}><text x={width - padding.right + 5} y={yScale(tick, sharedDomain)} textAnchor="start" alignmentBaseline="middle" className="fill-current text-teal-500 font-semibold">{tick.toFixed(1)}</text></g>))}
        
        {data.map((d, i) => {
            if (data.length <= 1 || i % Math.max(1, Math.floor((data.length-1)/5)) === 0 || i === data.length - 1) {
                return (<g key={`x-${i}`}><text x={xScale(i)} y={height - padding.bottom + 15} textAnchor="middle" className="fill-current">{new Date(d.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</text></g>)
            } return null;
        })}
        
        <path d={targetPath} strokeWidth="2" fill="none" className="stroke-indigo-300 dark:stroke-indigo-700" strokeDasharray="3,3"/>
        <path d={intakePath} strokeWidth="2" fill="none" className="stroke-indigo-500"/>
        <path d={weightPath} strokeWidth="2" fill="none" className="stroke-orange-500"/>
        <path d={bmiPath} strokeWidth="2" fill="none" className="stroke-teal-500"/>
        <path d={sleepPath} strokeWidth="2" fill="none" className="stroke-cyan-500"/>
        <path d={fastingPath} strokeWidth="2" fill="none" className="stroke-purple-500"/>
        <path d={waterPath} strokeWidth="2" fill="none" className="stroke-blue-500"/>

        {data.map((d, i) => (<g key={`point-${i}`}>
            {d.intake && <circle cx={xScale(i)} cy={yScale(d.intake, calorieDomain)} r="3" className="fill-indigo-500"/>}
            {d.weight && <circle cx={xScale(i)} cy={yScale(d.weight, weightDomain)} r="3" className="fill-orange-500"/>}
            {d.bmi && <circle cx={xScale(i)} cy={yScale(d.bmi, sharedDomain)} r="3" className="fill-teal-500"/>}
            {d.sleep && <circle cx={xScale(i)} cy={yScale(d.sleep, sharedDomain)} r="3" className="fill-cyan-500"/>}
            {d.fastingDuration && <circle cx={xScale(i)} cy={yScale(d.fastingDuration, sharedDomain)} r="3" className="fill-purple-500"/>}
            {d.water && <circle cx={xScale(i)} cy={yScale(d.water, sharedDomain)} r="3" className="fill-blue-500"/>}
        </g>))}
        {tooltip && <line x1={tooltip.x} y1={padding.top} x2={tooltip.x} y2={height - padding.bottom} className="stroke-gray-400 dark:stroke-gray-500" strokeDasharray="3,3"/>}
        </svg>
        {tooltip && (
            <div 
                className="absolute p-3 text-xs bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg shadow-xl pointer-events-none transition-transform duration-100"
                style={{
                    left: `${tooltip.x + 10}px`,
                    top: `${padding.top}px`,
                    transform: tooltip.x > width / 2 ? 'translateX(-110%)' : 'translateX(0)',
                }}
            >
                <div className="font-bold mb-2 border-b border-gray-300 dark:border-gray-600 pb-1">{new Date(tooltip.data.date).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                <div className="space-y-1">
                    {tooltip.data.weight && <div className="flex justify-between items-center gap-2"><span className="font-semibold text-orange-500">Weight:</span> <span>{tooltip.data.weight} kg</span></div>}
                    {tooltip.data.bmi && <div className="flex justify-between items-center gap-2"><span className="font-semibold text-teal-500">BMI:</span> <span>{tooltip.data.bmi}</span></div>}
                    {tooltip.data.sleep && <div className="flex justify-between items-center gap-2"><span className="font-semibold text-cyan-500">Sleep:</span> <span>{tooltip.data.sleep} hrs</span></div>}
                    {tooltip.data.fastingDuration && <div className="flex justify-between items-center gap-2"><span className="font-semibold text-purple-500">Fasting:</span> <span>{tooltip.data.fastingDuration} hrs</span></div>}
                    {tooltip.data.water && <div className="flex justify-between items-center gap-2"><span className="font-semibold text-blue-500">Water:</span> <span>{tooltip.data.water} glasses</span></div>}
                    {tooltip.data.intake && <div className="flex justify-between items-center gap-2"><span className="font-semibold text-indigo-500">Intake:</span> <span>{tooltip.data.intake} kcal</span></div>}
                    {tooltip.data.target && <div className="flex justify-between items-center gap-2"><span className="font-semibold text-indigo-400">Target:</span> <span>{tooltip.data.target} kcal</span></div>}
                </div>
            </div>
        )}
    </div>
  );
};


const ProgressModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
  const [progressData, setProgressData] = useState<ProgressEntry[]>([]);
  const [intakeData, setIntakeData] = useState<DailyIntake[]>([]);
  const [sleepData, setSleepData] = useState<SleepEntry[]>([]);
  const [fastingData, setFastingData] = useState<FastingEntry[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLogEntry[]>([]);
  const [waterData, setWaterData] = useState<WaterEntry[]>([]);
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowWeeklyReport(false); // Reset to chart view on open
      try {
        const progressRaw = localStorage.getItem(PROGRESS_DATA_KEY);
        setProgressData(progressRaw ? JSON.parse(progressRaw) : []);
        const intakeRaw = localStorage.getItem(DAILY_INTAKE_KEY);
        setIntakeData(intakeRaw ? JSON.parse(intakeRaw) : []);
        const sleepRaw = localStorage.getItem(SLEEP_DATA_KEY);
        setSleepData(sleepRaw ? JSON.parse(sleepRaw) : []);
        const fastingRaw = localStorage.getItem(FASTING_DATA_KEY);
        setFastingData(fastingRaw ? JSON.parse(fastingRaw) : []);
        const workoutLogsRaw = localStorage.getItem(WORKOUT_LOG_KEY);
        setWorkoutLogs(workoutLogsRaw ? JSON.parse(workoutLogsRaw) : []);
        const waterRaw = localStorage.getItem(WATER_INTAKE_KEY);
        setWaterData(waterRaw ? JSON.parse(waterRaw) : []);
      } catch (e) {
        console.error("Failed to parse progress data", e);
      }
    }
  }, [isOpen]);

  const chartData = useMemo(() => {
    const combined: Record<string, ChartDataPoint> = {};
    progressData.forEach(d => {
        combined[d.date] = { ...combined[d.date], date: d.date, weight: d.weight, bmi: d.bmi };
    });
    intakeData.forEach(d => {
        combined[d.date] = { ...combined[d.date], date: d.date, intake: d.totalIntake, target: d.targetCalories };
    });
    sleepData.forEach(d => {
        combined[d.date] = { ...combined[d.date], date: d.date, sleep: d.hours };
    });
    fastingData.forEach(d => {
        combined[d.date] = { ...combined[d.date], date: d.date, fastingDuration: d.duration };
    });
    waterData.forEach(d => {
        combined[d.date] = { ...combined[d.date], date: d.date, water: d.glasses };
    });
    return Object.values(combined).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [progressData, intakeData, sleepData, fastingData, waterData]);

  const getShareText = () => {
    if (progressData.length < 1) return encodeURIComponent("I'm starting my health journey with ObeCure!");
    const start = progressData[0];
    const latest = progressData[progressData.length - 1];
    let text = `My #ObeCureProgress Update!\n\n`;
    if (progressData.length > 1) {
        text += `*Start:* ${start.weight}kg (BMI: ${start.bmi})\n`;
        text += `*Latest:* ${latest.weight}kg (BMI: ${latest.bmi})\n\n`;
        const weightChange = (latest.weight - start.weight).toFixed(1);
        text += `I've ${parseFloat(weightChange) <= 0 ? 'lost' : 'gained'} ${Math.abs(parseFloat(weightChange))} kg so far! `;
    } else {
        text += `*Current:* ${start.weight}kg (BMI: ${start.bmi})\n\nJust getting started! `;
    }
     if(sleepData.length > 0) {
        const avgSleep = sleepData.reduce((sum, d) => sum + d.hours, 0) / sleepData.length;
        text += `My average sleep is ${avgSleep.toFixed(1)} hrs/night. `;
    }
    if(fastingData.length > 0) {
        const avgFasting = fastingData.reduce((sum, d) => sum + d.duration, 0) / fastingData.length;
        text += `I'm also doing intermittent fasting for an average of ${avgFasting.toFixed(1)} hours! `;
    }
    text += `Tracking my progress with the ObeCure Diet Assistant.`
    return encodeURIComponent(text);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4 animate-fade-in" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-3xl border border-gray-200 dark:border-gray-700 transform animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {showWeeklyReport ? 'Your Weekly Report' : 'Your Progress History'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition text-2xl">&times;</button>
        </div>
        
        {chartData.length > 0 || workoutLogs.length > 0 ? (
          <>
            {showWeeklyReport ? (
                <WeeklyReportView
                    onBack={() => setShowWeeklyReport(false)}
                    progressData={progressData}
                    intakeData={intakeData}
                    sleepData={sleepData}
                    workoutLogs={workoutLogs}
                />
            ) : (
                <>
                    <div className="w-full h-64 md:h-80 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2 relative">
                        <ProgressChart data={chartData}/>
                        <div className="absolute top-2 left-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold">
                            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500"></span><span className="text-gray-700 dark:text-gray-300">Weight</span></div>
                            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-teal-500"></span><span className="text-gray-700 dark:text-gray-300">BMI</span></div>
                            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-cyan-500"></span><span className="text-gray-700 dark:text-gray-300">Sleep</span></div>
                            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-purple-500"></span><span className="text-gray-700 dark:text-gray-300">Fasting</span></div>
                            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span><span className="text-gray-700 dark:text-gray-300">Water</span></div>
                            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-indigo-500"></span><span className="text-gray-700 dark:text-gray-300">Intake</span></div>
                            <div className="flex items-center gap-1"><span className="w-3 h-1 border-b-2 border-dashed border-indigo-400 dark:border-indigo-600"></span><span className="text-gray-700 dark:text-gray-300">Target</span></div>
                        </div>
                    </div>
                    
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button onClick={() => setShowWeeklyReport(true)} className="w-full flex items-center justify-center space-x-2 bg-orange-500 text-white text-base font-semibold px-4 py-3 rounded-lg hover:bg-orange-600 transition-colors shadow-sm active:scale-95">
                            <span>📅</span>
                            <span>View Weekly Report</span>
                        </button>
                        <a href={`https://wa.me/?text=${getShareText()}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center space-x-2 bg-green-500 text-white text-base font-semibold px-4 py-3 rounded-lg hover:bg-green-600 transition-colors shadow-sm active:scale-95">
                            <WhatsAppIcon className="w-6 h-6" />
                            <span>Share My Progress</span>
                        </a>
                    </div>
                </>
            )}

            {workoutLogs.length > 0 && !showWeeklyReport && (
                <div className="mt-6">
                    <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-3 text-center sm:text-left">Recent Workouts</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {workoutLogs.slice(-5).reverse().map((log, index) => (
                            <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{log.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(log.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                <p className="font-bold text-orange-500 dark:text-orange-400">{log.duration} min</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No progress data yet.</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Generate a diet plan, log sleep, or complete a workout to start tracking!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressModal;
