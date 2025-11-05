import React from 'react';

export const SnackIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M12 21.5c-4.34 0 -8.5 -3.42 -8.5 -8.24c0 -4.43 3.12 -8.05 7 -8.25c.16 -.01 .32 -.01 .48 0c4.13 .21 7.52 3.82 7.52 8.25c0 4.82 -4.16 8.24 -8.5 8.24z" />
    <path d="M14 14.5c-1.333 -1.333 -2.667 -1.333 -4 0" />
    <path d="M10 11a2 2 0 0 1 4 0" />
  </svg>
);