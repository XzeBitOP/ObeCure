import React from 'react';

export const HistoryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className="w-6 h-6" 
    viewBox="0 0 24 24" 
    strokeWidth="2" 
    stroke="currentColor" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M12 8v4l2 2" />
    <path d="M3.05 11a9 9 0 1 1 .5 4m-3.55 -4a9 9 0 0 1 12.036 -8.99" />
    <path d="M3 4.001v5h5" />
  </svg>
);