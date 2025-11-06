import React from 'react';
import { LineChartIcon, ExportIcon, ImportIcon, SettingsIcon } from './Icons';

interface HeaderProps {
    onExport: () => void;
    onImport: () => void;
    onSettings: () => void;
    onLogout: () => void;
    isAuthenticated: boolean;
}

const Header: React.FC<HeaderProps> = ({ onExport, onImport, onSettings, onLogout, isAuthenticated }) => {
  return (
    <header className="bg-black/50 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
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
              className="p-2 text-brand-text-secondary rounded-full transition-colors hover:bg-white/10 hover:text-white"
              title="Open settings"
            >
              <SettingsIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onImport}
              className="p-2 text-brand-text-secondary rounded-full transition-colors hover:bg-white/10 hover:text-white"
              title="Import data from JSON file"
            >
              <ImportIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onExport}
              className="p-2 text-brand-text-secondary rounded-full transition-colors hover:bg-white/10 hover:text-white"
              title="Export data to JSON file"
            >
              <ExportIcon className="h-5 w-5" />
            </button>
            {isAuthenticated && (
              <>
                <div className="border-l border-white/20 h-6"></div>
                <button
                  onClick={onLogout}
                  className="px-3 py-1.5 text-sm bg-brand-secondary text-white font-semibold rounded-md transition-colors hover:bg-orange-600"
                  title="Logout"
                >
                  Logout
                </button>
              </>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;