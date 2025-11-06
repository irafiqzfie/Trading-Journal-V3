import React from 'react';
import { CloseIcon, ExclamationIcon } from './Icons';

interface ConfirmImportModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmImportModal: React.FC<ConfirmImportModalProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="modal-title-import" onClick={onCancel}>
      <div className="bg-stone-900/60 backdrop-blur-lg border border-white/10 rounded-lg shadow-2xl p-6 w-full max-w-md m-4 animate-slide-up-fade" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 id="modal-title-import" className="text-2xl font-bold text-yellow-400 flex items-center gap-3">
            <ExclamationIcon />
            Confirm Import
          </h2>
          <button onClick={onCancel} className="p-1 rounded-full text-brand-text-secondary hover:bg-white/10" aria-label="Close modal">
            <CloseIcon />
          </button>
        </div>
        <div className="my-4">
            <p className="text-brand-text">
                Are you sure you want to import data from the selected file?
            </p>
            <p className="text-sm text-yellow-400 mt-2 font-semibold">This will overwrite all current positions in your journal. This action cannot be undone.</p>
        </div>
        <div className="flex justify-end pt-4 space-x-3 border-t border-white/10">
            <button type="button" onClick={onCancel} className="px-5 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500 transition-colors">Cancel</button>
            <button type="button" onClick={onConfirm} className="px-5 py-2 bg-yellow-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:bg-yellow-500">Overwrite and Import</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmImportModal;