


import React, { useState, useMemo } from 'react';
import type { Position } from '../types';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, LineChartIcon } from './Icons';

interface EquityChartCardProps {
  positions: Position[];
  initialEquity: number;
}

const EquityChartCard: React.FC<EquityChartCardProps> = ({ positions, initialEquity }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const { dataPoints, finalEquity, totalPL, hasData } = useMemo(() => {
        const allSellsWithPL = positions.flatMap(position => {
            if (position.sells.length === 0 || position.buys.length === 0) return [];
            
            const totalLotsBought = position.buys.reduce((sum, buy) => sum + buy.lotSize, 0);
            const totalBuyValue = position.buys.reduce((sum, buy) => sum + buy.totalBuyPrice, 0);
            const avgBuyPrice = totalLotsBought > 0 ? totalBuyValue / (totalLotsBought * 100) : 0;

            return position.sells.map(sell => {
                const costOfLotsSold = avgBuyPrice * sell.lotSize * 100;
                const realizedPL = sell.totalSellPrice - costOfLotsSold;
                return { date: sell.sellDate, pl: realizedPL };
            });
        });

        const sellsForYear = allSellsWithPL
            .filter(sell => new Date(sell.date).getFullYear() === currentYear)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        let runningEquity = initialEquity;
        const points = [{ date: new Date(currentYear, 0, 1), equity: runningEquity }];

        sellsForYear.forEach(sell => {
            runningEquity += sell.pl;
            points.push({ date: new Date(sell.date), equity: runningEquity });
        });

        const hasData = points.length > 1;
        const finalEquity = hasData ? points[points.length - 1].equity : initialEquity;
        const totalPL = finalEquity - initialEquity;

        return { dataPoints: points, finalEquity, totalPL, hasData };
    }, [positions, initialEquity, currentYear]);

    const handlePrevYear = () => setCurrentYear(prev => prev - 1);
    const handleNextYear = () => setCurrentYear(prev => prev + 1);

    const plColor = totalPL >= 0 ? 'text-brand-profit' : 'text-brand-loss';
    const plSign = totalPL >= 0 ? '+' : '';

    const Chart = () => {
        const width = 500;
        const height = 200;
        const padding = 20;

        const equityValues = dataPoints.map(p => p.equity);
        let yMin = Math.min(...equityValues);
        let yMax = Math.max(...equityValues);

        if (yMin === yMax) {
           yMin -= 50;
           yMax += 50;
        }

        const yRange = yMax - yMin;
        const yMinPadded = yMin - yRange * 0.1;
        const yMaxPadded = yMax + yRange * 0.1;
        
        const xMin = new Date(currentYear, 0, 1).getTime();
        const xMax = new Date(currentYear, 11, 31).getTime();

        const getX = (date: Date) => ((date.getTime() - xMin) / (xMax - xMin)) * (width - padding * 2) + padding;
        const getY = (equity: number) => height - (((equity - yMinPadded) / (yMaxPadded - yMinPadded)) * (height - padding * 2) + padding);

        const linePath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.date)} ${getY(p.equity)}`).join(' ');

        const yAxisLabels = [yMax, yMax - yRange/2, yMin].map(val => ({
            value: val.toFixed(0),
            y: getY(val)
        }));

        const xAxisLabels = Array.from({length: 12}, (_, i) => new Date(currentYear, i, 15)).map(date => ({
             name: date.toLocaleString('default', { month: 'short' }),
             x: getX(date),
        }));


        return (
            <div className="w-full flex h-full">
                <div className="flex flex-col justify-between text-xs text-brand-text-secondary py-1 pr-2 text-right">
                    {yAxisLabels.map(label => <span key={label.value}>{label.value}</span>)}
                </div>
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 min-h-0">
                        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
                            {/* Grid Lines */}
                            {yAxisLabels.map(label => (
                                 <line key={`grid-${label.value}`} x1={padding} y1={label.y} x2={width - padding} y2={label.y} stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="2,2" />
                            ))}
                            
                            <path d={linePath} fill="none" stroke="var(--brand-accent)" strokeWidth="2" />
                            {dataPoints.map((p, i) => (
                              <circle key={i} cx={getX(p.date)} cy={getY(p.equity)} r="3" fill="var(--brand-accent)" className="transition-all hover:r-5">
                                <title>{p.date.toLocaleDateString()}: RM{p.equity.toFixed(2)}</title>
                              </circle>
                            ))}
                        </svg>
                    </div>
                     <div className="flex w-full mt-1">
                        <div className="flex-1 flex justify-between text-xs text-brand-text-secondary">
                           {xAxisLabels.map(({ name }) => <span key={name} className="w-8 text-center">{name}</span>)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
          className="bg-brand-surface backdrop-blur-md rounded-lg shadow-lg border border-white/10 relative overflow-hidden group transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 hover:border-brand-accent/50 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
          role="button"
          aria-expanded={isExpanded}
        >
            <div className="absolute top-0 left-0 h-full w-1.5 bg-gradient-to-b from-brand-accent to-brand-primary transition-all duration-500 group-hover:w-2.5"></div>
            <div className="p-4 pl-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <LineChartIcon />
                        <h2 className="text-xl font-bold text-white">Equity Curve</h2>
                    </div>
                     <div className="flex items-center gap-4">
                         {!isExpanded && (
                            <p className="font-semibold text-lg">
                                {currentYear}: <span className={plColor}>{plSign}RM{totalPL.toFixed(2)}</span>
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
                                 <p>Start: <span className="font-bold text-base text-white">RM{initialEquity.toFixed(2)}</span></p>
                                 <p>End: <span className="font-bold text-base text-white">RM{finalEquity.toFixed(2)}</span></p>
                                <span className="hidden md:inline">|</span>
                                <p>Year P/L: <span className={`font-bold text-base ${plColor}`}>{plSign}RM{totalPL.toFixed(2)}</span></p>
                            </div>
                        </div>
                        
                        <div className="h-64 w-full">
                            {hasData ? <Chart /> : (
                                 <div className="h-full flex items-center justify-center bg-brand-surface/80 rounded-md">
                                    <p className="text-brand-text-secondary">No closed trades for this year.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(EquityChartCard);