import React, { useState } from 'react';
import { CloseIcon, LineChartIcon } from './Icons';

interface LoginModalProps {
  onLogin: (id: string, pass: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLogin }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ id?: string; password?: string, form?: string }>({});

  const validate = () => {
    const newErrors: { id?: string; password?: string } = {};
    if (!id.trim()) {
      newErrors.id = 'ID cannot be empty.';
    }
    if (!password.trim()) {
      newErrors.password = 'Password cannot be empty.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      if (id === 'inafiq' && password === '2024') {
        onLogin(id, password);
      } else {
        setErrors({ form: 'Invalid ID or password. Please try again.' });
      }
    }
  };
  
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    if (errors.form) {
        setErrors(prev => ({...prev, form: undefined}));
    }
  }

  const inputClasses = "mt-1 block w-full bg-black/20 border-2 border-stone-700 rounded-md shadow-sm text-white focus:ring-0 focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(249,115,22,0.4)] transition-all duration-200 py-2.5 px-4";
  const errorInputClasses = "border-brand-loss focus:border-brand-loss focus:shadow-[0_0_0_3px_rgba(239,68,68,0.4)]";

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div 
        className="bg-stone-900/60 backdrop-blur-lg border border-white/10 rounded-lg shadow-2xl p-6 w-full max-w-sm m-4 animate-slide-up-fade relative"
      >
        <div className="text-center mb-6">
            <LineChartIcon />
            <h2 id="modal-title" className="text-2xl font-bold text-white mt-2">Trading Journal Login</h2>
        </div>
        <form onSubmit={handleSubmit} noValidate>
            {errors.form && (
              <div className="mb-4 p-3 bg-red-900/50 border border-brand-loss text-red-300 text-sm rounded-md animate-fade-in text-center">
                {errors.form}
              </div>
            )}
            <div className="space-y-4">
                <div>
                    <label htmlFor="id" className="block text-sm font-medium text-brand-text-secondary">ID</label>
                    <input 
                        type="text" 
                        id="id" 
                        value={id}
                        onChange={handleInputChange(setId)}
                        className={`${inputClasses} ${errors.id ? errorInputClasses : ''}`}
                        placeholder="Enter your ID"
                        aria-required="true"
                        aria-invalid={!!errors.id}
                    />
                    {errors.id && <p className="text-red-400 text-xs mt-1 animate-fade-in">{errors.id}</p>}
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-brand-text-secondary">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        value={password}
                        onChange={handleInputChange(setPassword)}
                        className={`${inputClasses} ${errors.password ? errorInputClasses : ''}`}
                        placeholder="••••••••"
                        aria-required="true"
                        aria-invalid={!!errors.password}
                    />
                    {errors.password && <p className="text-red-400 text-xs mt-1 animate-fade-in">{errors.password}</p>}
                </div>
            </div>

          <div className="mt-8">
            <button 
                type="submit" 
                className="w-full px-5 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold rounded-lg shadow-lg transition-all duration-300 hover:shadow-brand-primary/50 transform hover:scale-105"
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