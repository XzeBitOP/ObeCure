import React, { useMemo, useState, useRef } from 'react';
import { BodyCompositionEntry } from '../types';

interface TooltipData {
  x: number;
  y: number;
  date: string;
  fatMass: number;
  muscleMass: number;
}

const TrendGraph: React.FC<{ history: BodyCompositionEntry[] }> = ({ history }) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const width = 500;
  const height = 300;

  const data = useMemo(() => history.filter(d => d.fatMass > 0 && d.muscleMass > 0), [history]);

  const yDomain = useMemo(() => {
    if (data.length === 0) return [0, 100];
    const allValues = data.flatMap(d => [d.fatMass, d.muscleMass]);
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const spread = max - min;
    return [Math.max(0, min - spread * 0.1), max + spread * 0.1];
  }, [data]);

  const xScale = (index: number) => padding.left + (index / (data.length > 1 ? data.length - 1 : 1)) * (width - padding.left - padding.right);
  const yScale = (val: number) => height - padding.bottom - ((val - yDomain[0]) / (yDomain[1] - yDomain[0])) * (height - padding.top - padding.bottom);

  const createPath = (key: 'fatMass' | 'muscleMass') =>
    data.map((d, i) => ({ x: xScale(i), y: yScale(d[key]) }))
        .map((p, i) => i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)
        .join(' ');

  const fatPath = createPath('fatMass');
  const musclePath = createPath('muscleMass');
  
  const yAxisTicks = Array.from({ length: 6 }, (_, i) => yDomain[0] + i * (yDomain[1] - yDomain[0]) / 5);

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || data.length === 0) return;
    const svgPoint = svgRef.current.createSVGPoint();
    svgPoint.x = event.clientX;
    svgPoint.y = event.clientY;
    const point = svgPoint.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    
    const index = Math.round(((point.x - padding.left) / (width - padding.left - padding.right)) * (data.length - 1));
    
    if(index >= 0 && index < data.length) {
        const d = data[index];
        const xPos = xScale(index);
        const yPos = (yScale(d.fatMass) + yScale(d.muscleMass)) / 2;
        setTooltip({ x: xPos, y: yPos, date: d.date, fatMass: d.fatMass, muscleMass: d.muscleMass });
    }
  };

  if (data.length < 2) {
    return <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">Not enough data for a trend graph. Keep logging your measurements!</p>;
  }

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="w-full h-full text-xs text-gray-500 dark:text-gray-400" onMouseMove={handleMouseMove} onMouseLeave={() => setTooltip(null)}>
        <rect x="0" y="0" width={width} height={height} fill="transparent" />
        {yAxisTicks.map(tick => (<g key={`y-${tick}`}><line x1={padding.left} y1={yScale(tick)} x2={width - padding.right} y2={yScale(tick)} className="stroke-gray-200 dark:stroke-gray-700" strokeDasharray="2,2"/><text x={padding.left - 5} y={yScale(tick)} textAnchor="end" alignmentBaseline="middle" className="fill-current">{tick.toFixed(1)}</text></g>))}
        
        {data.map((d, i) => {
            if (data.length <= 1 || i % Math.max(1, Math.floor((data.length-1)/5)) === 0 || i === data.length - 1) {
                return (<g key={`x-${i}`}><text x={xScale(i)} y={height - padding.bottom + 15} textAnchor="middle" className="fill-current">{new Date(d.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</text></g>)
            } return null;
        })}
        
        <path d={fatPath} strokeWidth="2.5" fill="none" className="stroke-red-500"/>
        <path d={musclePath} strokeWidth="2.5" fill="none" className="stroke-orange-500"/>
        
        {data.map((d, i) => (<g key={`point-${i}`}>
            <circle cx={xScale(i)} cy={yScale(d.fatMass)} r="3" className="fill-red-500"/>
            <circle cx={xScale(i)} cy={yScale(d.muscleMass)} r="3" className="fill-orange-500"/>
        </g>))}
        {tooltip && <line x1={tooltip.x} y1={padding.top} x2={tooltip.x} y2={height - padding.bottom} className="stroke-gray-400 dark:stroke-gray-500" strokeDasharray="3,3"/>}
      </svg>
        <div className="flex justify-center gap-4 text-xs font-semibold mt-2">
            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span><span className="text-gray-700 dark:text-gray-300">Fat Mass (kg)</span></div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500"></span><span className="text-gray-700 dark:text-gray-300">Muscle Mass (kg)</span></div>
        </div>
      {tooltip && (
          <div 
              className="absolute p-2 text-xs bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg shadow-xl pointer-events-none transition-transform duration-100"
              style={{
                  left: `${tooltip.x + 10}px`,
                  top: `${tooltip.y - 30}px`,
                  transform: tooltip.x > width / 2 ? 'translateX(-110%)' : 'translateX(0)',
              }}
          >
              <div className="font-bold mb-1 border-b border-gray-300 dark:border-gray-600 pb-1">{new Date(tooltip.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</div>
              <div className="space-y-1">
                  <div className="flex justify-between items-center gap-2"><span className="font-semibold text-red-500">Fat:</span> <span>{tooltip.fatMass.toFixed(1)} kg</span></div>
                  <div className="flex justify-between items-center gap-2"><span className="font-semibold text-orange-500">Muscle:</span> <span>{tooltip.muscleMass.toFixed(1)} kg</span></div>
              </div>
          </div>
      )}
    </div>
  );
};

export default TrendGraph;
