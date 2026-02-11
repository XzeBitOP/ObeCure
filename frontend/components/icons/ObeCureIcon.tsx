
import React from 'react';

export const ObeCureIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    {...props}
  >
    <circle cx="50" cy="26" r="12" fill="#f97316" />
    <path d="M 30,42 C 18,50 18,78 34,86 L 66,86 C 82,78 82,50 70,42 C 66,54 58,62 50,62 C 42,62 34,54 30,42 Z" fill="#f97316" />
  </svg>
);
