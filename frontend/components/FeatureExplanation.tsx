import React, { useState } from 'react';
import { ForkAndSpoonIcon } from './icons/ForkAndSpoonIcon';
import { LeafIcon } from './icons/LeafIcon';
import { DumbbellIcon } from './icons/DumbbellIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { BrainIcon } from './icons/BrainIcon';

type View = 'everyone' | 'doctors';

const FeatureExplanation: React.FC = () => {
    const [view, setView] = useState<View>('everyone');

    const tabButtonClass = (isActive: boolean) => 
        `px-4 py-2 font-semibold rounded-md transition-colors text-sm sm:text-base ${
            isActive 
            ? 'bg-orange-500 text-white shadow' 
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`;

    return (
        <div>
            <div className="flex justify-center p-1 bg-gray-100 dark:bg-gray-700 rounded-lg mb-6">
                <button onClick={() => setView('everyone')} className={tabButtonClass(view === 'everyone')}>For Everyone</button>
                <button onClick={() => setView('doctors')} className={tabButtonClass(view === 'doctors')}>For Doctors</button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-2 text-left space-y-6 text-gray-700 dark:text-gray-300">
                {view === 'everyone' ? <EveryoneView /> : <DoctorsView />}
            </div>
        </div>
    );
};

const FeatureItem: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="flex items-start gap-4">
        <div className="mt-1 shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-500">{icon}</div>
        <div>
            <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200">{title}</h4>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{children}</p>
        </div>
    </div>
);

const EveryoneView: React.FC = () => (
    <div className="space-y-6 animate-fade-in">
        <FeatureItem icon={<ForkAndSpoonIcon className="w-5 h-5"/>} title="Personalized Diet Planner">
            Think of it as a smart chef who creates a tasty, healthy Indian meal plan just for you. It knows your goals, your body's needs, and what you like to eat to make losing weight easy and delicious.
        </FeatureItem>
        <FeatureItem icon={<LeafIcon className="w-5 h-5"/>} title="BioAdaptive Ayurveda™ Planner">
            This is like a daily check-up with an Ayurvedic expert. You tell us how you're feeling (sleep, stress, energy), and we suggest natural supplements to help your body find its balance and feel its best.
        </FeatureItem>
         <FeatureItem icon={<DumbbellIcon className="w-5 h-5"/>} title="Workout Planner">
            Your personal trainer in your pocket! It picks safe and effective exercises that are right for your body, even if you have conditions like knee pain or high blood pressure.
        </FeatureItem>
        <FeatureItem icon={<ChartBarIcon className="w-5 h-5"/>} title="Body Composition Metrics">
            A magic mirror that shows you what you're really made of (fat, muscle, etc.) and even calculates your 'body age'. It helps you see the real progress, not just the number on the scale.
        </FeatureItem>
        <FeatureItem icon={<ClipboardListIcon className="w-5 h-5"/>} title="Blood Report Evaluator">
            A simple guide to understand your lab report. Just enter your numbers, and we'll explain what they mean in plain English, helping you see how your health is improving.
        </FeatureItem>
        <FeatureItem icon={<BrainIcon className="w-5 h-5"/>} title="MindFit & Gamification">
            Your personal motivation coach! The FAQs help you understand the 'why' behind your cravings and feelings, while challenges and achievements make staying on track fun and rewarding.
        </FeatureItem>
    </div>
);

const DoctorsView: React.FC = () => (
    <div className="space-y-4 text-sm animate-fade-in">
        <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200">Personalized Diet Planner</h4>
        <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Calculates BMR using the <strong>Mifflin-St Jeor equation</strong> and TDEE based on user-reported activity levels.</li>
            <li>Applies a <strong>20-25% caloric deficit</strong> for weight loss goals or a <strong>300-500 kcal surplus</strong> for weight gain, ensuring a scientific approach.</li>
            <li>Distributes macronutrients based on the selected diet goal (e.g., higher protein ratio for 'High Protein' plans).</li>
            <li>Utilizes an offline database of Indian meals, filtering options based on user's pre-existing conditions (e.g., prioritizing <strong>low-GI foods</strong> for diabetes, <strong>low-sodium</strong> for hypertension).</li>
            <li>Includes "ObeCure Special Meals" to improve adherence by incorporating healthier versions of popular 'cheat' meals.</li>
        </ul>

        <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200">BioAdaptive Ayurveda™ Planner</h4>
        <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Employs a proprietary scoring engine to quantify metabolic state across five domains: <strong>Gut Load (GLS), Appetite (ACS), Stress (SCS), Energy (EDS), and Metabolism (MSS)</strong>.</li>
            <li>Scores are calculated based on daily subjective inputs (sleep, stress, bloating, etc.) and objective data (weight, sleep hours).</li>
            <li>Identifies a dominant <strong>Metabolic Phenotype</strong> (e.g., Gut-dominant, Stress-dominant) based on the highest scores.</li>
            <li>A rule-based engine recommends a personalized dosing schedule for five proprietary Ayurvedic/nutraceutical products based on score thresholds and phenotypes.</li>
            <li>Includes built-in <strong>guardrails</strong> to automatically adjust recommendations based on contraindications (e.g., pregnancy), side effects (e.g., palpitations), and potential medication interactions (e.g., thyroid).</li>
        </ul>
        
        <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200">Workout Planner</h4>
        <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Recommends a suitable workout program from a predefined library based on the user's health conditions.</li>
            <li>Prioritizes safety by selecting <strong>low-impact, joint-friendly routines</strong> for conditions like arthritis or low-cardio-stress routines for stable heart disease/hypertension.</li>
            <li>Includes structured timers with warmup, work/rest intervals, rounds, and cooldown phases to guide the user effectively.</li>
        </ul>

        <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200">Body Composition & Metrics</h4>
        <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Calculates Body Fat Percentage using a modified <strong>US Navy formula</strong> (based on height, weight, neck, waist, hip measurements).</li>
            <li>Estimates key metrics like Lean Body Mass, Fat Mass, Muscle Mass, Visceral Fat Index, and BMR.</li>
            <li>Provides an estimated <strong>Metabolic Age</strong> based on a proprietary algorithm that weighs BMR, muscle index, body fat, and WHtR.</li>
            <li>Calculates health risk indicators like WHR, WHtR, and a composite <strong>Metabolic Risk Score</strong> to quantify cardiometabolic risk.</li>
        </ul>

         <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200">Blood Report Evaluator</h4>
        <ul className="list-disc list-inside space-y-1 pl-2">
            <li>An educational tool that maps user-inputted lab values to standard reference ranges for over 30 common biomarkers.</li>
            <li>Provides general interpretations for high or low values (e.g., high TG linked to insulin resistance), contextualizing the numbers.</li>
            <li>Acts as a patient-facing tool to facilitate more informed discussions during clinical consultations. It does not provide a diagnosis.</li>
        </ul>

        <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200">MindFit & Gamification</h4>
        <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Utilizes principles of <strong>Cognitive Behavioral Therapy (CBT)</strong> in the FAQ section to address common psychological barriers to weight loss (e.g., guilt, motivation cycles).</li>
            <li>Improves user adherence and long-term engagement through gamification elements like daily streaks, weekly challenges, and unlockable achievements.</li>
        </ul>
    </div>
);

export default FeatureExplanation;