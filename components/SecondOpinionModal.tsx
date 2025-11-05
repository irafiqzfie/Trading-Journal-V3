

import React, { useEffect, useRef } from 'react';
import { CloseIcon, SparklesIcon, XCircleIcon } from './Icons';

interface SecondOpinionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticker: string;
  buyReasons: string[];
  chartImage: string;
  analysis: string;
  isLoading: boolean;
  error: string | null;
}

const SecondOpinionModal: React.FC<SecondOpinionModalProps> = ({
  isOpen,
  onClose,
  ticker,
  buyReasons,
  chartImage,
  analysis,
  isLoading,
  error,
}) => {
    
  const contentRef = useRef<HTMLDivElement>(null);
    
  useEffect(() => {
    if (contentRef.current) {
        contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [analysis]);
  
  if (!isOpen) return null;

  const parseMarkdown = (text: string) => {
    const html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>') // List items
      .replace(/<\/li>\n<li/g, '</li><li'); // Fix list spacing
    
    // Wrap list items in a <ul>, handling multiple lists
    return html.replace(/(<li.*<\/li>)/gs, '<ul>$1</ul>');
  };

  const AnalysisContent = () => {
    if (isLoading && !analysis) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                <div className="space-y-2">
                    <div className="h-3 bg-gray-700 rounded w-full"></div>
                    <div className="h-3 bg-gray-700 rounded w-5/6"></div>
                </div>
                 <div className="h-4 bg-gray-700 rounded w-1/4 mt-4"></div>
                <div className="space-y-2">
                    <div className="h-3 bg-gray-700 rounded w-full"></div>
                </div>
            </div>
        )
    }
    if (error) {
        return (
            <div className="flex items-center gap-3 text-brand-loss p-4 bg-red-900/30 rounded-md">
                <XCircleIcon />
                <div>
                    <p className="font-semibold">Analysis Failed</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        )
    }
    return <div className="prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(analysis) }} />;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="modal-title-opinion" onClick={onClose}>
      <div 
        className="bg-stone-900/70 backdrop-blur-lg border border-stone-400/20 rounded-lg shadow-2xl p-6 w-full max-w-4xl m-4 animate-slide-up-fade max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 id="modal-title-opinion" className="text-2xl font-bold text-white flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-brand-accent"/>
            AI Second Opinion
          </h2>
          <button onClick={onClose} className="p-1 rounded-full text-brand-text-secondary hover:bg-white/10" aria-label="Close modal">
            <CloseIcon />
          </button>
        </div>

        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
            {/* Left Column: Setup Info */}
            <div className="flex flex-col gap-4">
                <div className="bg-black/30 p-3 rounded-lg">
                    <h3 className="font-bold text-xl text-white">{ticker.toUpperCase()}</h3>
                    <p className="text-sm text-brand-text-secondary">Entry Reasons:</p>
                    <ul className="text-sm list-disc list-inside mt-1">
                        {buyReasons.map(r => <li key={r}>{r}</li>)}
                    </ul>
                </div>
                <div className="flex-grow bg-black/30 rounded-lg p-2 flex items-center justify-center">
                    <img src={chartImage} alt={`Chart for ${ticker}`} className="max-w-full max-h-full object-contain rounded-md" />
                </div>
            </div>

            {/* Right Column: AI Analysis */}
            <div ref={contentRef} className="bg-black/30 p-4 rounded-lg overflow-y-auto">
                <AnalysisContent />
            </div>
        </div>

        <div className="flex justify-end pt-4 space-x-3 border-t border-white/10 mt-6 flex-shrink-0">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
};

export default SecondOpinionModal;