import React from 'react';

export const BreakfastIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
    <path d="M12 2l0 2" />
    <path d="M12 20l0 2" />
    <path d="M20 12l2 0" />
    <path d="M2 12l2 0" />
    <path d="M18.364 18.364l1.414 1.414" />
    <path d="M4.222 4.222l1.414 1.414" />
    <path d="M18.364 5.636l1.414 -1.414" />
    <path d="M4.222 19.778l1.414 -1.414" />
  </svg>
);