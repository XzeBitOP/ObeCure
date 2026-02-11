import React from 'react';
import { DrKenilsNote } from '../types';

interface DrKenilsNoteProps {
  note: DrKenilsNote;
}

const DrKenilsNoteComponent: React.FC<DrKenilsNoteProps> = ({ note }) => {
  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-3">Dr. Kenil's Note</h3>
      <div className="relative p-6 bg-white dark:bg-gray-800 border-l-4 border-orange-500 rounded-lg shadow-md">
        {/* Notebook lines effect */}
        <div 
          className="absolute inset-0 top-6 bottom-4 left-4 right-4" 
          style={{
            backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 27px, #E0E0E030 28px, #E0E0E030 28px)',
            backgroundSize: '100% 28px',
            pointerEvents: 'none'
          }}
        ></div>
        
        <div className="relative z-10">
          <h4 className="font-bold text-orange-600 dark:text-orange-400 mb-2">{note.title}</h4>
          <p className="font-handwriting text-lg leading-relaxed text-gray-800 dark:text-gray-200">{note.text}</p>
        </div>
      </div>
    </div>
  );
};

export default DrKenilsNoteComponent;
