import React from 'react';
import { Challenge, Achievement } from '../types';
import { achievementsList } from '../data/achievements';
import { TrophyIcon } from './icons/TrophyIcon';

interface GamificationViewProps {
    challenges: Challenge[];
    unlockedAchievementIds: string[];
}

const GamificationView: React.FC<GamificationViewProps> = ({ challenges, unlockedAchievementIds }) => {

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">This Week's Challenges</h2>
                {challenges.length > 0 ? (
                    <div className="space-y-4">
                        {challenges.map(challenge => (
                            <div key={challenge.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-semibold text-gray-700 dark:text-gray-300">{challenge.title}</p>
                                    <p className={`font-bold text-sm ${challenge.completed ? 'text-green-500' : 'text-orange-500'}`}>
                                        {challenge.completed ? 'Completed!' : `${challenge.current} / ${challenge.goal}`}
                                    </p>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                                    <div 
                                        className={`h-2.5 rounded-full transition-all duration-500 ${challenge.completed ? 'bg-green-500' : 'bg-orange-500'}`} 
                                        style={{ width: `${Math.min(100, (challenge.current / challenge.goal) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400">Your new weekly challenges are loading...</p>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">My Achievements</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {achievementsList.map(ach => {
                        const isUnlocked = unlockedAchievementIds.includes(ach.id);
                        return (
                            <div key={ach.id} className={`p-3 rounded-lg text-center transition-opacity ${isUnlocked ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-gray-100 dark:bg-gray-700/50 opacity-60'}`}>
                                <div className={`text-4xl mx-auto ${isUnlocked ? 'text-amber-500' : 'text-gray-400'}`}>
                                    <TrophyIcon className="w-12 h-12 mx-auto" strokeWidth={isUnlocked ? 2.5 : 1.5} />
                                </div>
                                <p className={`text-xs font-bold mt-2 ${isUnlocked ? 'text-amber-800 dark:text-amber-200' : 'text-gray-500'}`}>{ach.title}</p>
                                {isUnlocked && <p className="text-xs text-amber-600 dark:text-amber-400 hidden sm:block">{ach.description}</p>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default GamificationView;