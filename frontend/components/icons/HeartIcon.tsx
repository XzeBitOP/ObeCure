import React from 'react';

interface HeartIconProps extends React.SVGProps<SVGSVGElement> {
  isFavorite: boolean;
}

export const HeartIcon: React.FC<HeartIconProps> = ({ isFavorite, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6"
    viewBox="0 0 24 24"
    strokeWidth="2"
    stroke={isFavorite ? '#f97316' : 'currentColor'}
    fill={isFavorite ? '#f97316' : 'none'}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
  </svg>
);
