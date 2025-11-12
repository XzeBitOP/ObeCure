import React from 'react';

export const ForkAndSpoonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M4 3h8l-1 9h-6z" />
    <path d="M7 12v9" />
    <path d="M20 3v12h-5c-.023 -3.681 .184 -7.406 5 -12z" />
  </svg>
);
