import React, { useState, useEffect } from 'react';
import { bloodTestData, BloodTest } from '../data/bloodTests';
import { Sex } from '../types';
import { ClipboardListIcon } from './icons/ClipboardListIcon';

const USER_PREFERENCES_KEY = 'obeCureUserPreferences';

const TestItem: React.FC<{ test: BloodTest; userSex: Sex | undefined }> = ({ test, userSex }) => {
    const [value, setValue] = useState('');
    const [interpretation, setInterpretation] = useState<{ text: string; color: string } | null>(null);

    useEffect(() => {
        if (value === '') {
            setInterpretation(null);
            return;
        }

        const numericValue = parseFloat(value);
        if (isNaN(numericValue)) {
            setInterpretation({ text: 'Please enter a valid number.', color: 'text-gray-500' });
            return;
        }

        const { low, high, note } = test.parseRange(userSex);
        
        let interpText = 'Normal';
        let interpColor = 'text-green-500';

        if (note) { // For age-specific or complex ranges
            interpText = note;
            interpColor = 'text-blue-500';
        } else if (high !== undefined && numericValue > high) {
            interpText = test.highMeaning;
            interpColor = 'text-red-500 animate-glowing-red';
        } else if (low !== undefined && numericValue < low) {
            interpText = test.lowMeaning;
            interpColor = 'text-yellow-500 animate-glowing-yellow';
        }
        
        setInterpretation({ text: interpText, color: interpColor });

    }, [value, test, userSex]);

    return (
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{test.name}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 items-center">
                <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Your Value</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder="Enter value"
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                         <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">{test.unit}</span>
                    </div>
                </div>
                 <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Normal Range</label>
                    <p className="font-mono text-sm h-10 flex items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-md">{test.normalRangeText}</p>
                </div>
            </div>
            {interpretation && (
                <div className={`mt-3 p-3 rounded-md bg-white dark:bg-gray-900/50 text-sm ${interpretation.color} border border-gray-200 dark:border-gray-700`}>
                    <span className="font-bold">Interpretation: </span>{interpretation.text}
                </div>
            )}
        </div>
    );
};

const BloodReportEvaluator: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [userSex, setUserSex] = useState<Sex>();

    useEffect(() => {
        try {
            const savedPrefsRaw = localStorage.getItem(USER_PREFERENCES_KEY);
            if (savedPrefsRaw) {
                const savedPrefs = JSON.parse(savedPrefsRaw);
                setUserSex(savedPrefs.sex || Sex.FEMALE);
            }
        } catch (e) {
            console.error("Failed to load user sex for blood reports", e);
        }
    }, [isOpen]); // Re-check when opening, in case profile was updated

    if (!isOpen) {
        return (
            <div className="animate-fade-in text-center">
                <button
                    onClick={() => setIsOpen(true)}
                    aria-expanded="false"
                    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 w-full hover:bg-orange-50/50 dark:hover:bg-gray-700/50 transition-colors duration-300 transform hover:-translate-y-1"
                >
                    <ClipboardListIcon className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 sm:text-4xl">
                        My Blood Report Evaluation
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Click to interpret your lab results</p>
                </button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <button onClick={() => setIsOpen(false)} className="w-full text-center mb-6" aria-expanded="true">
                    <ClipboardListIcon className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 sm:text-4xl">
                        My Blood Report Evaluation
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Click to collapse</p>
                </button>
                
                <div className="p-4 mb-6 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 text-yellow-800 dark:text-yellow-200">
                    <p className="font-bold">Important:</p>
                    <p className="text-sm">This tool provides general interpretations. Always crosscheck the unit values and normal ranges with those provided by your specific lab report, as they may differ.</p>
                </div>

                <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                    {bloodTestData.map(test => (
                        <TestItem key={test.id} test={test} userSex={userSex} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BloodReportEvaluator;