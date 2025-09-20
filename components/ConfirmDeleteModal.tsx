
import React from 'react';
import { TrashIcon, CloseIcon } from './Icons';

interface ConfirmDeleteModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  positionTicker: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ onConfirm, onCancel, positionTicker }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="modal-title-delete" onClick={onCancel}>
      <div className="bg-brand-surface rounded-lg shadow-2xl p-6 w-full max-w-md m-4 animate-slide-up-fade border border-white/10" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 id="modal-title-delete" className="text-2xl font-bold text-brand-loss flex items-center gap-3">
            <TrashIcon />
            Confirm Deletion
          </h2>
          <button onClick={onCancel} className="p-1 rounded-full text-brand-text-secondary hover:bg-white/10" aria-label="Close modal">
            <CloseIcon />
          </button>
        </div>
        <div className="my-4">
            <p className="text-brand-text">
                Are you sure you want to permanently delete the position for <strong className="font-bold text-white">{positionTicker}</strong>?
            </p>
            <p className="text-sm text-brand-text-secondary mt-2">This action cannot be undone.</p>
        </div>
        <div className="flex justify-end pt-4 space-x-3 border-t border-white/10">
            <button type="button" onClick={onCancel} className="px-5 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500 transition-colors">Cancel</button>
            <button type="button" onClick={onConfirm} className="px-5 py-2 bg-brand-loss text-white font-semibold rounded-lg shadow-lg shadow-red-500/30 transition-all duration-300 hover:bg-red-500 transform hover:scale-105">Delete</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
