import React from 'react';

export const DumbbellIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    strokeWidth="2"
    stroke="currentColor"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4.5 12h15" />
    <path d="M6 9v6" />
    <path d="M18 9v6" />
    <path d="M3 10.5h1" />
    <path d="M20 10.5h1" />
    <path d="M4 13.5h1" />
    <path d="M20 13.5h1" />
  </svg>
);
