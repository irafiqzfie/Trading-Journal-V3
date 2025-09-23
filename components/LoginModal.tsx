import React, { useState } from 'react';
import { CloseIcon } from './Icons';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (id: string, pass: string) => boolean;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!id.trim() || !password.trim()) {
            setError('ID and password cannot be empty.');
            return;
        }
        
        console.log('Logging in with:', { id, password });

        const loginSuccess = onLogin(id, password);

        if (loginSuccess) {
            onClose();
            // Reset fields for next time
            setId('');
            setPassword('');
        } else {
            setError('Invalid ID or password.');
        }
    };
    
    if (!isOpen) return null;

    const inputClasses = "mt-1 block w-full bg-black/30 border-2 border-white/20 rounded-md shadow-sm text-white focus:ring-0 focus:border-brand-accent focus:shadow-[0_0_0_3px_rgba(59,130,246,0.4)] transition-all duration-200 py-2.5 px-4";

    return (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300 animate-fade-in" 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="modal-title-login"
        >
            <div 
              className="bg-brand-surface rounded-lg shadow-2xl p-6 sm:p-8 w-full max-w-md m-4 animate-slide-up-fade border border-white/10 relative"
            >
                <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full text-brand-text-secondary hover:bg-white/10" aria-label="Close modal">
                    <CloseIcon />
                </button>
                
                <div className="text-center mb-6">
                    <h2 id="modal-title-login" className="text-2xl font-bold text-white">Trading Journal Login</h2>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="login-id" className="block text-sm font-medium text-brand-text-secondary">ID</label>
                            <input 
                                type="text" 
                                id="login-id" 
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                className={inputClasses} 
                                placeholder="Enter your ID"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="login-password" className="block text-sm font-medium text-brand-text-secondary">Password</label>
                            <input 
                                type="password" 
                                id="login-password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={inputClasses} 
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-brand-loss text-sm text-center mt-4 animate-fade-in">{error}</p>
                    )}

                    <div className="mt-6">
                        <button 
                            type="submit" 
                            className="w-full px-5 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold rounded-lg shadow-lg transition-all duration-300 hover:shadow-brand-primary/50 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-brand-accent"
                        >
                            Log In
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;