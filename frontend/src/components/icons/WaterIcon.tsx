import React from 'react';

export const WaterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M14.5 21a8.96 8.96 0 0 0 -10.5 -12.5a9 9 0 0 0 1.954 12.016a2 2 0 0 0 3.3 0l.246 -.464" />
    <path d="M13 13.5a1.5 1.5 0 0 0 2.5 1.5l1 -1.5" />
    <path d="M9 15.5l-2 -2" />
    <path d="M17.5 11a1.5 1.5 0 0 0 -2 -2" />
  </svg>
);
