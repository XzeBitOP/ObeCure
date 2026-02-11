import React from 'react';

export const SwapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M16 3l4 4l-4 4" />
    <path d="M20 7h-14a4 4 0 0 0 -4 4v2" />
    <path d="M8 21l-4 -4l4 -4" />
    <path d="M4 17h14a4 4 0 0 0 4 -4v-2" />
  </svg>
);