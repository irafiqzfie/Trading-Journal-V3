import React, { useMemo } from 'react';
import type { Position } from '../types';
import { ClipboardListIcon } from './Icons';

interface TransactionHistoryCardProps {
  positions: Position[];
}

const TransactionHistoryCard: React.FC<TransactionHistoryCardProps> = ({ positions }) => {
    const transactions = useMemo(() => {
        const allTransactions = positions.flatMap(p => {
            const buyTransactions = p.buys.map(b => ({
                id: b.id,
                ticker: p.ticker,
                type: 'buy' as const,
                date: b.buyDate,
                lotSize: b.lotSize,
                price: b.buyPrice,
                totalValue: b.totalBuyPrice,
                reason: Array.isArray(b.buyReason) ? b.buyReason.join(', ') : '',
            }));

            const sellTransactions = p.sells.map(s => ({
                id: s.id,
                ticker: p.ticker,
                type: 'sell' as const,
                date: s.sellDate,
                lotSize: s.lotSize,
                price: s.sellPrice,
                totalValue: s.totalSellPrice,
                reason: s.sellReason || '',
            }));
            return [...buyTransactions, ...sellTransactions];
        });

        return allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [positions]);

    return (
        <div
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg shadow-lg relative overflow-hidden group transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 hover:border-white/20"
        >
            <div className="absolute top-0 left-0 h-full w-1.5 bg-gradient-to-b from-brand-accent to-brand-primary transition-all duration-500 group-hover:w-2.5"></div>
            <div className="p-4 pl-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <ClipboardListIcon className="w-7 h-7 text-brand-accent" />
                        <h2 className="text-xl font-bold text-white">Transaction History</h2>
                    </div>
                </div>

                <div className="mt-4">
                    {transactions.length > 0 ? (
                        <div className="max-h-96 overflow-y-auto pr-2">
                            <table className="w-full text-sm text-left text-brand-text-secondary">
                                <thead className="text-xs text-brand-text-secondary uppercase bg-black/20 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-4 py-3">Date</th>
                                        <th scope="col" className="px-4 py-3">Ticker</th>
                                        <th scope="col" className="px-4 py-3">Type</th>
                                        <th scope="col" className="px-4 py-3 text-right">Lots</th>
                                        <th scope="col" className="px-4 py-3 text-right">Price</th>
                                        <th scope="col" className="px-4 py-3 text-right">Total Value</th>
                                        <th scope="col" className="px-4 py-3">Reason</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map(tx => (
                                        <tr key={tx.id} className="border-b border-white/10 hover:bg-white/5">
                                            <td className="px-4 py-3 font-mono">{new Date(tx.date).toLocaleDateString('en-GB')}</td>
                                            <td className="px-4 py-3 font-semibold text-white">{tx.ticker}</td>
                                            <td className={`px-4 py-3 font-bold ${tx.type === 'buy' ? 'text-brand-profit' : 'text-brand-loss'}`}>
                                                {tx.type.toUpperCase()}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono text-white">{tx.lotSize}</td>
                                            <td className="px-4 py-3 text-right font-mono text-white">RM{tx.price.toFixed(3)}</td>
                                            <td className="px-4 py-3 text-right font-mono text-white">RM{tx.totalValue.toFixed(2)}</td>
                                            <td className="px-4 py-3 truncate max-w-xs">{tx.reason}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                         <div className="flex items-center justify-center h-48 bg-black/20 rounded-md">
                            <p className="text-brand-text-secondary">No transactions recorded yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(TransactionHistoryCard);