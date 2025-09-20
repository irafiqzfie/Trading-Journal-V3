import React, { useRef } from 'react';
import { buySetups } from './TradeFormModal';
import { CloseIcon, ImageIcon, TrashIcon } from './Icons';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    customImages: Record<string, string>;
    onCustomImagesChange: (images: Record<string, string>) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, customImages, onCustomImagesChange }) => {
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setupName: string) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onCustomImagesChange({
                    ...customImages,
                    [setupName]: reader.result as string,
                });
            };
            reader.readAsDataURL(file);
        }
        if (e.target) e.target.value = ''; // Reset input
    };
    
    const handleRemoveImage = (setupName: string) => {
        const newImages = { ...customImages };
        delete newImages[setupName];
        onCustomImagesChange(newImages);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="modal-title-settings" onClick={onClose}>
            <div className="bg-brand-surface rounded-lg shadow-2xl p-6 w-full max-w-2xl m-4 animate-slide-up-fade border border-white/10 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <h2 id="modal-title-settings" className="text-2xl font-bold text-white">Setup Image Settings</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-brand-text-secondary hover:bg-white/10" aria-label="Close settings">
                        <CloseIcon />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-4">
                    {buySetups.map(setup => {
                        const customImage = customImages[setup.name];
                        return (
                            <div key={setup.name} className="flex flex-col md:flex-row items-center gap-4 p-3 bg-black/30 rounded-lg">
                                <div className="flex-grow w-full">
                                    <p className="font-semibold text-white">{setup.name.split(':')[0]}</p>
                                    <p className="text-xs text-brand-text-secondary">{setup.name.split(':').slice(1).join(':').trim() || 'Custom Setup'}</p>
                                </div>
                                <div className="w-full md:w-40 h-24 bg-black/40 rounded-md flex justify-center items-center flex-shrink-0 border border-white/10">
                                    {customImage ? (
                                        <img src={customImage} alt={setup.name} className="max-w-full max-h-full object-contain rounded-sm" />
                                    ) : (
                                        <div className="text-center text-brand-text-secondary text-xs p-2">
                                            <ImageIcon className="h-6 w-6 mx-auto mb-1" />
                                            No image uploaded
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
// FIX: The ref callback function was implicitly returning the assigned element, causing a type error. Changed to a block body to ensure a void return.
                                        ref={el => { fileInputRefs.current[setup.name] = el; }}
                                        onChange={(e) => handleImageUpload(e, setup.name)}
                                    />
                                    <button
                                        onClick={() => fileInputRefs.current[setup.name]?.click()}
                                        className="px-3 py-1.5 text-xs font-semibold bg-slate-600 text-white rounded-md hover:bg-slate-500 transition-colors"
                                    >
                                        {customImage ? 'Change' : 'Upload'}
                                    </button>
                                    {customImage && (
                                        <button onClick={() => handleRemoveImage(setup.name)} className="p-1.5 text-brand-text-secondary hover:text-brand-loss bg-slate-600/50 hover:bg-slate-500/50 rounded-full transition-colors" aria-label={`Remove custom image for ${setup.name}`}>
                                            <TrashIcon />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-end pt-6 space-x-3 border-t border-white/10 mt-6 flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-5 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors">Done</button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
