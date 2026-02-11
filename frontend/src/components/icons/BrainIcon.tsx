import React from 'react';

export const BrainIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M15.5 13a3.5 3.5 0 0 0 -3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8" />
        <path d="M8.5 13a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 -7 0v-1.8" />
        <path d="M12 17.5v-1.5" />
        <path d="M15.5 13a3.5 3.5 0 0 1 -3.5 -3.5v-2a3.5 3.5 0 0 1 7 0v2" />
        <path d="M8.5 13a3.5 3.5 0 0 0 3.5 -3.5v-2a3.5 3.5 0 0 0 -7 0v2" />
        <path d="M12 9.5v-1.5" />
        <path d="M3 13a3.5 3.5 0 0 1 3.5 -3.5h1" />
        <path d="M17.5 9.5h1a3.5 3.5 0 0 1 3.5 3.5" />
    </svg>
);
