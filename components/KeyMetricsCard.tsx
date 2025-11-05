



import React from 'react';
import type { KeyMetrics } from '../types';
import { CalculatorIcon } from './Icons';

interface KeyMetricsCardProps {
  metrics: KeyMetrics;
}

const KeyMetricsCard: React.FC<KeyMetricsCardProps> = ({ metrics }) => {
  return (
    <div className="bg-stone-900/70 backdrop-blur-lg border border-stone-400/20 rounded-lg shadow-lg h-full flex flex-col relative overflow-hidden group transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 hover:border-brand-accent/50">
       <div className="absolute top-0 left-0 h-full w-1.5 bg-gradient-to-b from-brand-accent to-brand-primary transition-all duration-500 group-hover:w-2.5"></div>
      <div className="p-6 pl-8 flex-grow flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <CalculatorIcon className="text-brand-accent h-7 w-7" />
          <h2 className="text-xl font-bold text-white">Key Metrics</h2>
        </div>
        <div className="flex-grow flex flex-col justify-center">
          {metrics.hasData ? (
            <ul className="grid grid-cols-2 gap-y-5 gap-x-6">
              <li>
                <p className="text-sm text-brand-text-secondary truncate">Total Trades</p>
                <p className="text-xl font-bold text-white">{metrics.totalTrades}</p>
              </li>
              <li className="text-right">
                <p className="text-sm text-brand-text-secondary">Profit Factor</p>
                <p className={`text-xl font-bold ${metrics.profitFactor >= 1 ? 'text-brand-profit' : 'text-brand-loss'}`}>
                  {isFinite(metrics.profitFactor) ? metrics.profitFactor.toFixed(2) : '∞'}
                </p>
              </li>
              <li>
                <p className="text-sm text-brand-text-secondary truncate">Avg. P/L</p>
                <p className={`text-xl font-bold ${metrics.avgPL >= 0 ? 'text-brand-profit' : 'text-brand-loss'}`}>
                  RM{metrics.avgPL.toFixed(2)}
                </p>
              </li>
              <li className="text-right">
                <p className="text-sm text-brand-text-secondary">Max Drawdown</p>
                <p className="text-xl font-bold text-brand-loss">{metrics.maxDrawdown.toFixed(2)}%</p>
              </li>
            </ul>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-brand-text-secondary text-center">No closed trades for metrics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(KeyMetricsCard);