


import React, { useMemo } from 'react';
import { ShieldIcon, DollarIcon } from './Icons';

interface EquityRiskCardProps {
  equity: string;
  onEquityChange: (value: string) => void;
  riskPercent: string;
  onRiskPercentChange: (value: string) => void;
  useDynamicEquity: boolean;
  onUseDynamicEquityChange: (value: boolean) => void;
  currentEquity: number;
}

const EquityRiskCard: React.FC<EquityRiskCardProps> = ({
  equity,
  onEquityChange,
  riskPercent,
  onRiskPercentChange,
  useDynamicEquity,
  onUseDynamicEquityChange,
  currentEquity,
}) => {
  const calculatedRisk = useMemo(() => {
    const equityForCalc = useDynamicEquity ? currentEquity : parseFloat(equity);
    const riskPercentNum = parseFloat(riskPercent);

    if (!isNaN(equityForCalc) && equityForCalc > 0 && !isNaN(riskPercentNum) && riskPercentNum >= 0) {
      return equityForCalc * (riskPercentNum / 100);
    }
    return 0;
  }, [equity, riskPercent, useDynamicEquity, currentEquity]);

  const inputClasses = "block w-full bg-stone-800/60 border-2 border-stone-700 rounded-md shadow-sm text-white focus:ring-0 focus:border-brand-primary transition-all p-2 text-lg";

  return (
    <div className="bg-stone-900/70 backdrop-blur-lg border border-stone-400/20 rounded-lg shadow-lg py-6 pr-6 pl-8 h-full flex flex-col relative overflow-hidden group transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 hover:border-brand-accent/50">
      <div className="absolute top-0 left-0 h-full w-1.5 bg-gradient-to-b from-brand-accent to-brand-primary transition-all duration-500 group-hover:w-2.5"></div>
      <div className="flex items-center gap-3 mb-4">
        <ShieldIcon className="text-brand-accent h-7 w-7" />
        <h2 className="text-xl font-bold text-white">Equity & Risk Management</h2>
      </div>

      <div className="absolute top-6 right-6 flex items-center gap-2">
        <span className={`text-xs font-semibold transition-colors ${!useDynamicEquity ? 'text-white' : 'text-brand-text-secondary'}`}>
          Fixed
        </span>
        <button
          onClick={() => onUseDynamicEquityChange(!useDynamicEquity)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-brand-primary ${useDynamicEquity ? 'bg-brand-primary' : 'bg-slate-600'}`}
          role="switch"
          aria-checked={useDynamicEquity}
          aria-label="Toggle dynamic equity for risk calculation"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useDynamicEquity ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
        <span className={`text-xs font-semibold transition-colors ${useDynamicEquity ? 'text-white' : 'text-brand-text-secondary'}`}>
          Dynamic
        </span>
      </div>

      <div className="flex-grow flex flex-col justify-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label htmlFor="currentEquity" className="block text-sm font-medium text-brand-text-secondary mb-1">
              {useDynamicEquity ? 'Initial Equity (RM)' : 'Equity (RM)'}
            </label>
            <div className="relative">
               <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <DollarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="currentEquity"
                value={equity}
                onChange={(e) => onEquityChange(e.target.value)}
                className={`${inputClasses} pl-10`}
                placeholder="10000"
              />
            </div>
          </div>
          <div>
            <label htmlFor="riskPerTrade" className="block text-sm font-medium text-brand-text-secondary mb-1">
              Risk per Trade (%)
            </label>
             <div className="relative">
              <input
                type="number"
                id="riskPerTrade"
                value={riskPercent}
                onChange={(e) => onRiskPercentChange(e.target.value)}
                className={`${inputClasses} pr-10`}
                placeholder="2"
              />
               <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-400 text-lg">%</span>
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="calculatedRisk" className="block text-sm font-medium text-brand-text-secondary mb-1">
              Calculated Risk (R)
            </label>
            <div
              id="calculatedRisk"
              className={`${inputClasses} flex items-center bg-black/40`}
              aria-live="polite"
            >
              <span className="font-semibold text-brand-accent">
                RM {calculatedRisk.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
         {useDynamicEquity && (
          <div className="mt-4 pt-4 border-t border-white/10 animate-fade-in">
            <p className="text-sm text-brand-text-secondary text-center">
              Using dynamic equity for risk calculation:
              <strong className="text-white ml-2">RM {currentEquity.toFixed(2)}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(EquityRiskCard);