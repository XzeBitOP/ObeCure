
import React from 'react';

const products = [
    { 
        name: 'Gutrify®', 
        description: 'For gut load, bloating, constipation', 
        bgClass: 'bg-green-900/80 hover:bg-green-800', 
        textClass: 'text-green-400', 
        borderClass: 'border-green-500' 
    },
    { 
        name: 'FiberFuel®', 
        description: 'For satiety, bowel rhythm', 
        bgClass: 'bg-yellow-900/80 hover:bg-yellow-800', 
        textClass: 'text-yellow-400', 
        borderClass: 'border-yellow-500' 
    },
    { 
        name: 'ObeCalm®', 
        description: 'For stress & sleep balance', 
        bgClass: 'bg-blue-900/80 hover:bg-blue-800', 
        textClass: 'text-blue-400', 
        borderClass: 'border-blue-500' 
    },
    { 
        name: 'LeanPulse®', 
        description: 'For energy & focus', 
        bgClass: 'bg-red-900/80 hover:bg-red-800', 
        textClass: 'text-red-400', 
        borderClass: 'border-red-500' 
    },
    { 
        name: 'MetaboFix®', 
        description: 'For metabolic sluggishness', 
        bgClass: 'bg-purple-900/80 hover:bg-purple-800', 
        textClass: 'text-purple-400', 
        borderClass: 'border-purple-500' 
    },
];

const ProductShowcase: React.FC = () => {
    const handleBuy = () => {
        window.open('https://www.xzecure.co.in/buy', '_blank');
    };

    return (
        <div className="py-6 animate-fade-in">
            <h2 className="text-2xl font-handwriting text-gray-700 dark:text-gray-200 text-center mb-6 italic">
                Our Upcoming BioAdaptive Products
            </h2>
            <div className="space-y-4">
                {products.map((product) => (
                    <button
                        key={product.name}
                        onClick={handleBuy}
                        className={`w-full p-5 rounded-lg shadow-md border-l-4 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex flex-col items-center justify-center ${product.bgClass} ${product.borderClass}`}
                    >
                        <h3 className={`text-xl font-bold tracking-wide ${product.textClass}`}>{product.name}</h3>
                        <p className="text-gray-200 text-sm mt-1 font-medium">{product.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ProductShowcase;
