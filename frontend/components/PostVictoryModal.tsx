import React from 'react';

interface PostVictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: (text: string) => void;
}

const nonScaleVictories = [
    // Mindful Eating
    "Chose water over soda",
    "Ate a planned, healthy meal",
    "Successfully resisted a craving",
    "Ate slowly without distractions",
    "Stopped eating when I felt full",
    // Movement
    "Finished my workout for the day",
    "Went for a walk",
    "Took the stairs instead of the elevator",
    "Stretched my body today",
    "Hit my step goal",
    // Mindset & Self-Care
    "Slept for 7+ hours",
    "Was patient with my progress",
    "Felt more energetic today",
    "My clothes feel a little looser",
    "Drank all my water for the day",
];

const PostVictoryModal: React.FC<PostVictoryModalProps> = ({ isOpen, onClose, onPost }) => {

    const handlePost = (victoryText: string) => {
        onPost(victoryText);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700 transform animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        Share a Victory
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition text-2xl">&times;</button>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6">What small win are you celebrating today? Choose one to share anonymously.</p>
                
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {nonScaleVictories.map((victory, index) => (
                        <button
                            key={index}
                            onClick={() => handlePost(victory)}
                            className="w-full text-left p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-700 dark:hover:text-orange-300 transition-all font-semibold"
                        >
                           {victory}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PostVictoryModal;
