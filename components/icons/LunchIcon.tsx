import React from 'react';

export const LunchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M4 11h16a1 1 0 0 1 1 1v.5c0 1.5 -2.517 5.573 -4 6.5v1a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1v-1c-1.687 -1.054 -4 -5 -4 -6.5v-.5a1 1 0 0 1 1 -1z" />
    <path d="M6 8h12a1 1 0 0 1 1 1v1h-14v-1a1 1 0 0 1 1 -1z" />
    <path d="M7.5 4c1.667 0 1.667 2.5 0 2.5" />
    <path d="M12 4c1.667 0 1.667 2.5 0 2.5" />
    <path d="M16.5 4c1.667 0 1.667 2.5 0 2.5" />
  </svg>
);