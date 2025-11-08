import React from 'react';

interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return null;

  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const slices = data.map(item => {
    const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
    cumulativePercent += item.value / total;
    const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
    const largeArcFlag = item.value / total > 0.5 ? 1 : 0;

    const pathData = [
      `M ${startX} ${startY}`, // Move
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc
      `L 0 0`, // Line to center
    ].join(' ');

    return { pathData, color: item.color, label: item.label, value: item.value };
  });

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-48 h-48 transform -rotate-90">
        {slices.map((slice, i) => (
          <path key={i} d={slice.pathData} fill={slice.color} />
        ))}
         <circle cx="0" cy="0" r="0.5" fill="white" className="dark:fill-gray-800"/>
        <text
            x="0"
            y="0.05"
            textAnchor="middle"
            alignmentBaseline="middle"
            className="fill-gray-800 dark:fill-gray-200 font-bold text-[0.2px] transform rotate-90"
        >
            Body Comp
        </text>
      </svg>
      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
        {data.map((item) => (
          <div key={item.label} className="flex items-center text-xs">
            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">{item.label}:</span>
            <span className="ml-1 text-gray-600 dark:text-gray-400">{item.value.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChart;
