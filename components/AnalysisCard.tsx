import React from 'react';
import type { AnalysisResult } from '../types';
import { CheckCircleIcon, LightBulbIcon, ExclamationIcon, XCircleIcon, CloseIcon } from './Icons';

interface AnalysisCardProps {
  analysis: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

const LoadingSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-6 bg-gray-700 rounded w-1/3"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-700 rounded w-5/6"></div>
    </div>
    <div className="h-4 bg-gray-700 rounded w-full"></div>
  </div>
);

const AnalysisCard: React.FC<AnalysisCardProps> = ({ analysis, isLoading, error, onClose }) => {
  return (
    <div className="relative mb-6 bg-white/5 backdrop-blur-lg rounded-lg shadow-lg py-6 pr-6 pl-8 border border-white/10 overflow-hidden group transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 hover:border-white/20">
      <div className="absolute top-0 left-0 h-full w-1.5 bg-gradient-to-b from-brand-accent to-brand-primary transition-all duration-500 group-hover:w-2.5"></div>
      <button 
        onClick={onClose} 
        className="absolute top-3 right-3 p-1 text-brand-text-secondary hover:text-white hover:bg-white/10 rounded-full transition-colors"
        aria-label="Close analysis"
      >
        <CloseIcon />
      </button>
      <h2 className="text-xl font-bold text-white mb-4">AI Habit Analysis</h2>
      {isLoading && <LoadingSkeleton />}
      {error && (
        <div className="flex items-center gap-3 text-brand-loss">
          <XCircleIcon />
          <p>{error}</p>
        </div>
      )}
      {analysis && !isLoading && (
        <div className="space-y-6">
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-brand-profit mb-2">
              <CheckCircleIcon />
              Positive Habits
            </h3>
            <ul className="list-disc list-inside space-y-1 text-brand-text">
              {analysis.positiveHabits.map((habit, index) => <li key={index}>{habit}</li>)}
            </ul>
          </div>
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-yellow-400 mb-2">
              <ExclamationIcon />
              Areas for Improvement
            </h3>
            <ul className="list-disc list-inside space-y-1 text-brand-text">
              {analysis.areasForImprovement.map((area, index) => <li key={index}>{area}</li>)}
            </ul>
          </div>
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-brand-accent mb-2">
              <LightBulbIcon />
              Actionable Feedback
            </h3>
            <p className="text-brand-text-secondary">{analysis.actionableFeedback}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisCard;