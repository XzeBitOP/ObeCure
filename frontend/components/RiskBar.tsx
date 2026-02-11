import React from 'react';

interface RiskBarProps {
  value: number;
  maxValue: number;
}

const RiskBar: React.FC<RiskBarProps> = ({ value, maxValue }) => {
  const percentage = (value / maxValue) * 100;

  let levelText: string;
  if (value >= 13) {
    levelText = 'Very High';
  } else if (value >= 9) {
    levelText = 'High';
  } else {
    levelText = 'Healthy';
  }
  
  let colorClass = 'bg-green-500';
  if (value >= 13) colorClass = 'bg-red-500';
  else if (value >= 9) colorClass = 'bg-yellow-500';

  return (
    <div className="w-full">
      <div className="relative h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="absolute top-0 left-0 h-full w-1/3 bg-green-400 dark:bg-green-700"></div>
        <div className="absolute top-0 left-1/3 h-full w-1/3 bg-yellow-400 dark:bg-yellow-700"></div>
        <div className="absolute top-0 left-2/3 h-full w-1/3 bg-red-400 dark:bg-red-700"></div>
        
        <div className="absolute top-0 h-full transition-all duration-500" style={{ left: `calc(${percentage}% - 8px)` }}>
           <div className={`relative w-4 h-4 rounded-full ${colorClass} border-2 border-white dark:border-gray-800 shadow-lg`}></div>
        </div>
      </div>
       <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 px-1">
        <span>Low</span>
        <span>Moderate</span>
        <span>High</span>
      </div>
      <div className="text-center mt-2">
        <span className="font-bold text-lg text-gray-800 dark:text-gray-200">{value}</span>
        <span className={`ml-2 font-semibold ${colorClass.replace('bg','text')}`}>{levelText}</span>
      </div>
    </div>
  );
};

export default RiskBar;