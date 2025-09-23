import React from 'react';
import { LineChartIcon, ExportIcon, ImportIcon, SettingsIcon, LoginIcon, LogoutIcon } from './Icons';

interface HeaderProps {
    onExport: () => void;
    onImport: () => void;
    onSettings: () => void;
    isAuthenticated: boolean;
    onLoginClick: () => void;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onExport, onImport, onSettings, isAuthenticated, onLoginClick, onLogout }) => {
  return (
    <header className="bg-brand-surface/80 backdrop-blur-sm border-b border-white/10 sticky top-0 z-40">
      <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <LineChartIcon />
          <h1 className="text-xl font-bold text-white tracking-wider">
            AS Trading Journal V1
          </h1>
        </div>
        <div className="flex items-center gap-3">
            <button
              onClick={onSettings}
              className="p-2 text-brand-text-secondary rounded-full transition-colors hover:bg-slate-700 hover:text-white"
              title="Open settings"
            >
              <SettingsIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onImport}
              className="p-2 text-brand-text-secondary rounded-full transition-colors hover:bg-slate-700 hover:text-white"
              title="Import data from JSON file"
            >
              <ImportIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onExport}
              className="p-2 text-brand-text-secondary rounded-full transition-colors hover:bg-slate-700 hover:text-white"
              title="Export data to JSON file"
            >
              <ExportIcon className="h-5 w-5" />
            </button>
            
            {/* Login / Logout Button */}
            {isAuthenticated ? (
               <button
                  onClick={onLogout}
                  className="p-2 text-brand-text-secondary rounded-full transition-colors hover:bg-slate-700 hover:text-white"
                  title="Logout"
                >
                  <LogoutIcon className="h-5 w-5" />
                </button>
            ) : (
                <button
                  onClick={onLoginClick}
                  className="p-2 text-brand-text-secondary rounded-full transition-colors hover:bg-slate-700 hover:text-white"
                  title="Login"
                >
                  <LoginIcon className="h-5 w-5" />
                </button>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;