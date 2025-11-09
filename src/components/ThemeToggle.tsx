import React from 'react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 dark:focus:ring-offset-gray-800 ${
        theme === 'light' ? 'bg-orange-400' : 'bg-gray-700'
      }`}
      aria-label="Toggle theme"
    >
      <span className="sr-only">Toggle theme</span>
      <span
        className={`inline-block h-6 w-6 rounded-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          theme === 'light' ? 'translate-x-1' : 'translate-x-7'
        }`}
      />
      <div className="absolute inset-0 flex items-center justify-between px-2">
        <svg className={`w-4 h-4 text-yellow-300 transition-opacity duration-300 ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <svg className={`w-4 h-4 text-gray-400 transition-opacity duration-300 ${theme === 'light' ? 'opacity-0' : 'opacity-100'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </div>
    </button>
  );
};
