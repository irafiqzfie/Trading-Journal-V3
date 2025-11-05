


import React, { useState, useMemo } from 'react';
import type { Position } from '../types';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChartIcon } from './Icons';

const MonthlyPLChartCard: React.FC<{ positions: Position[] }> = ({ positions }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const { months, totalYearlyPL, yAxisMax, hasData } = useMemo(() => {
        const plByMonth: { [month: number]: number } = {}; // 0-11 index

        positions.forEach(position => {
            if (position.sells.length === 0 || position.buys.length === 0) return;

            const totalLotsBought = position.buys.reduce((sum, buy) => sum + buy.lotSize, 0);
            const totalBuyValue = position.buys.reduce((sum, buy) => sum + buy.totalBuyPrice, 0);
            const avgBuyPrice = totalLotsBought > 0 ? totalBuyValue / (totalLotsBought * 100) : 0;

            position.sells.forEach(sell => {
                const parts = sell.sellDate.split('-');
                if (parts.length < 3) return;

                const transactionYear = parseInt(parts[0], 10);
                const transactionMonth = parseInt(parts[1], 10) - 1; // 0-indexed

                if (transactionYear === currentYear) {
                    const costOfLotsSold = avgBuyPrice * sell.lotSize * 100;
                    const realizedPL = sell.totalSellPrice - costOfLotsSold;
                    
                    if (plByMonth[transactionMonth]) {
                        plByMonth[transactionMonth] += realizedPL;
                    } else {
                        plByMonth[transactionMonth] = realizedPL;
                    }
                }
            });
        });

        const months = Array.from({ length: 12 }, (_, i) => {
            return {
                name: new Date(currentYear, i, 1).toLocaleString('default', { month: 'short' }),
                pl: plByMonth[i] ?? 0
            };
        });

        const totalYearlyPL = months.reduce((acc, curr) => acc + curr.pl, 0);
        const hasData = Object.keys(plByMonth).length > 0;
        const maxAbsPL = Math.max(0, ...months.map(d => Math.abs(d.pl)));
        // Make the Y axis scale in nice round numbers
        const yAxisMax = maxAbsPL > 0 ? Math.ceil(maxAbsPL / 100) * 100 : 100;

        return { months, totalYearlyPL, yAxisMax, hasData };
    }, [positions, currentYear]);

    const handlePrevYear = () => setCurrentYear(prev => prev - 1);
    const handleNextYear = () => setCurrentYear(prev => prev + 1);

    const plColor = totalYearlyPL >= 0 ? 'text-brand-profit' : 'text-brand-loss';

    return (
        <div
          className="bg-brand-surface backdrop-blur-md rounded-lg shadow-lg border border-white/10 h-full relative overflow-hidden group transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 hover:border-brand-accent/50 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
          role="button"
          aria-expanded={isExpanded}
        >
            <div className="absolute top-0 left-0 h-full w-1.5 bg-gradient-to-b from-brand-accent to-brand-primary transition-all duration-500 group-hover:w-2.5"></div>
            <div className="p-4 pl-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <ChartIcon className="w-7 h-7 text-brand-accent" />
                        <h2 className="text-xl font-bold text-white">Monthly P/L</h2>
                    </div>
                     <div className="flex items-center gap-4">
                         {!isExpanded && (
                            <p className="font-semibold text-lg">
                                {currentYear}: <span className={plColor}>RM{totalYearlyPL.toFixed(2)}</span>
                            </p>
                         )}
                         <ChevronDownIcon className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                     </div>
                </div>

                {isExpanded && (
                    <div className="mt-4 animate-fade-in">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                            <div className="flex items-center gap-2">
                                <button onClick={(e) => { e.stopPropagation(); handlePrevYear(); }} className="p-1 hover:bg-white/10 rounded-full"><ChevronLeftIcon /></button>
                                <h3 className="font-semibold text-lg text-white w-24 text-center">{currentYear}</h3>
                                <button onClick={(e) => { e.stopPropagation(); handleNextYear(); }} className="p-1 hover:bg-white/10 rounded-full"><ChevronRightIcon /></button>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-brand-text-secondary">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-brand-profit rounded-sm" />Profit</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-brand-loss rounded-sm" />Loss</div>
                                <span className="hidden md:inline">|</span>
                                <p>Year Total: <span className={`font-bold text-base ${plColor}`}>RM{totalYearlyPL.toFixed(2)}</span></p>
                            </div>
                        </div>
                        
                        <div className="h-64 flex w-full">
                            <div className="flex flex-col justify-between h-full text-xs text-brand-text-secondary py-1 pr-2 text-right">
                                <span>{yAxisMax.toFixed(0)}</span>
                                <span className="font-semibold">0</span>
                                <span>{-yAxisMax.toFixed(0)}</span>
                            </div>
                            <div className="flex-1 relative">
                                <div className="h-full w-full flex flex-col">
                                    {/* Profit Area */}
                                    <div className="flex-1 border-b border-dashed border-white/20 flex justify-around items-end gap-1">
                                        {months.map(({ name, pl }) => {
                                            const height = pl > 0 ? (pl / yAxisMax) * 100 : 0;
                                            return (
                                                <div key={`${name}-p`} className="w-full h-full flex justify-center items-end group relative">
                                                    <div className="w-3/4 bg-brand-profit rounded-t-sm transition-opacity hover:opacity-75" style={{height: `${height}%`}} />
                                                    {pl !== 0 && 
                                                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 pointer-events-none shadow-lg z-10 whitespace-nowrap">
                                                            {name}: RM{pl.toFixed(2)}
                                                        </div>
                                                    }
                                                </div>
                                            )
                                        })}
                                    </div>
                                    {/* Loss Area */}
                                    <div className="flex-1 flex justify-around items-start gap-1">
                                        {months.map(({ name, pl }) => {
                                            const height = pl < 0 ? (Math.abs(pl) / yAxisMax) * 100 : 0;
                                            return (
                                                <div key={`${name}-l`} className="w-full h-full flex justify-center items-start group relative">
                                                    <div className="w-3/4 bg-brand-loss rounded-b-sm transition-opacity hover:opacity-75" style={{height: `${height}%`}} />
                                                    {pl !== 0 && 
                                                        <div className="absolute top-full mt-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 pointer-events-none shadow-lg z-10 whitespace-nowrap">
                                                            {name}: RM{pl.toFixed(2)}
                                                        </div>
                                                    }
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                                {!hasData && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-brand-surface/80 rounded-md">
                                        <p className="text-brand-text-secondary">No realized P/L for this year.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* X Axis */}
                        <div className="flex w-full pl-10 pr-2 mt-1">
                            <div className="flex-1 flex justify-between text-xs text-brand-text-secondary">
                               {months.map(({ name }) => <span key={name} className="w-8 text-center">{name}</span>)}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(MonthlyPLChartCard);