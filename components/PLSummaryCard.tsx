


import React from 'react';
import { SummaryIcon } from './Icons';
import type { PLSummary } from '../types';

interface PLSummaryCardProps {
  summary: PLSummary;
}

const PLSummaryCard: React.FC<PLSummaryCardProps> = ({ summary }) => {
  return (
    <div className="bg-brand-surface backdrop-blur-md rounded-lg shadow-lg border border-white/10 h-full flex flex-col relative overflow-hidden group transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 hover:border-brand-accent/50">
      <div className="absolute top-0 left-0 h-full w-1.5 bg-gradient-to-b from-brand-accent to-brand-primary transition-all duration-500 group-hover:w-2.5"></div>
      <div className="p-6 pl-8 flex-grow flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <SummaryIcon className="text-brand-accent h-7 w-7" />
          <h2 className="text-xl font-bold text-white">P/L Summary</h2>
        </div>
        <div className="flex-grow flex flex-col justify-center">
          {summary.hasData ? (
            <ul className="grid grid-cols-2 gap-y-5 gap-x-6">
              <li>
                <p className="text-sm text-brand-text-secondary truncate">Total Realized P/L</p>
                <p className={`text-xl font-bold ${summary.totalPL >= 0 ? 'text-brand-profit' : 'text-brand-loss'}`}>
                  RM{summary.totalPL.toFixed(2)}
                </p>
              </li>
              <li className="text-right">
                <p className="text-sm text-brand-text-secondary">Win Rate</p>
                <p className="text-xl font-bold text-white">{summary.winRate.toFixed(1)}%</p>
              </li>
              <li>
                <p className="text-sm text-brand-text-secondary truncate">Avg. P/L / Trade</p>
                <p className={`text-xl font-bold ${summary.avgPL >= 0 ? 'text-brand-profit' : 'text-brand-loss'}`}>
                  RM{summary.avgPL.toFixed(2)}
                </p>
              </li>
              <li className="text-right">
                <p className="text-sm text-brand-text-secondary">Winners / Losers</p>
                <p className="text-xl font-bold">
                  <span className="text-brand-profit">{summary.winners}</span>
                  <span className="text-brand-text-secondary"> / </span>
                  <span className="text-brand-loss">{summary.losers}</span>
                </p>
              </li>
            </ul>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-brand-text-secondary text-center">No fully closed trades to summarize.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(PLSummaryCard);