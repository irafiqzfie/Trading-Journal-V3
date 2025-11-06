import React, { useRef, useState } from 'react';
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
    const [uploadingSetup, setUploadingSetup] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleImageUpload = async (file: File | null, setupName: string) => {
        if (!file || !file.type.startsWith('image/')) return;

        setUploadingSetup(setupName);
        setUploadError(null);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'x-vercel-filename': file.name,
                    'Content-Type': file.type,
                },
                body: file,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const newBlob = await response.json();
            onCustomImagesChange({
                ...customImages,
                [setupName]: newBlob.url,
            });

        } catch (error: any) {
            console.error(error);
            setUploadError(`Failed to upload for ${setupName}: ${error.message}`);
        } finally {
            setUploadingSetup(null);
        }
    };
    
    const handleRemoveImage = (setupName: string) => {
        const newImages = { ...customImages };
        delete newImages[setupName];
        onCustomImagesChange(newImages);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="modal-title-settings" onClick={onClose}>
            <div className="bg-stone-900/60 backdrop-blur-lg border border-white/10 rounded-lg shadow-2xl p-6 w-full max-w-2xl m-4 animate-slide-up-fade max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <h2 id="modal-title-settings" className="text-2xl font-bold text-white">Setup Image Settings</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-brand-text-secondary hover:bg-white/10" aria-label="Close settings">
                        <CloseIcon />
                    </button>
                </div>
                
                {uploadError && (
                    <div className="bg-red-900/50 border border-brand-loss text-red-300 text-sm p-3 rounded-md mb-4 animate-fade-in">
                        <p className="font-semibold">Upload Error</p>
                        <p>{uploadError}</p>
                    </div>
                )}

                <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-4">
                    {buySetups.map(setup => {
                        const customImage = customImages[setup.name];
                        const isUploadingThis = uploadingSetup === setup.name;
                        return (
                            <div key={setup.name} className="flex flex-col md:flex-row items-center gap-4 p-3 bg-black/20 rounded-lg">
                                <div className="flex-grow w-full">
                                    <p className="font-semibold text-white">{setup.name.split(':')[0]}</p>
                                    <p className="text-xs text-brand-text-secondary">{setup.name.split(':').slice(1).join(':').trim() || 'Custom Setup'}</p>
                                </div>
                                <div className="w-full md:w-40 h-24 bg-black/25 rounded-md flex justify-center items-center flex-shrink-0 border border-white/10 relative">
                                    {customImage && !isUploadingThis && (
                                        <img src={customImage} alt={setup.name} className="max-w-full max-h-full object-contain rounded-sm" />
                                    )}
                                    {!customImage && !isUploadingThis && (
                                        <div className="text-center text-brand-text-secondary text-xs p-2">
                                            <ImageIcon className="h-6 w-6 mx-auto mb-1" />
                                            No image uploaded
                                        </div>
                                    )}
                                    {isUploadingThis && (
                                        <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/50">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-accent"></div>
                                            <span className="mt-2 text-xs text-brand-accent">Uploading...</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        disabled={!!uploadingSetup}
                                        ref={el => { fileInputRefs.current[setup.name] = el; }}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            handleImageUpload(file || null, setup.name);
                                            if (e.target) e.target.value = ''; // Reset input
                                        }}
                                    />
                                    <button
                                        onClick={() => fileInputRefs.current[setup.name]?.click()}
                                        disabled={!!uploadingSetup}
                                        className="px-3 py-1.5 text-xs font-semibold bg-slate-600 text-white rounded-md hover:bg-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {customImage ? 'Change' : 'Upload'}
                                    </button>
                                    {customImage && (
                                        <button 
                                            onClick={() => handleRemoveImage(setup.name)} 
                                            disabled={!!uploadingSetup}
                                            className="p-1.5 text-brand-text-secondary hover:text-brand-loss bg-slate-600/50 hover:bg-slate-500/50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                                            aria-label={`Remove custom image for ${setup.name}`}
                                        >
                                            <TrashIcon />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-end pt-6 space-x-3 border-t border-white/10 mt-6 flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-5 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors">Done</button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;