import React, { useState } from 'react';
import { Position } from '../../types';
import TradeItem from './TradeItem';

interface TradeListProps {
  positions: Position[];
  originalPositionsCount: number;
  onDelete: (id: string) => void;
  onSell: (position: Position) => void;
  onEdit: (positionId: string, transactionId: string, type: 'buy' | 'sell') => void;
}

const TradeList: React.FC<TradeListProps> = ({ positions, originalPositionsCount, onDelete, onSell, onEdit }) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  if (positions.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-brand-surface rounded-lg border border-white/10 shadow-lg">
        <h2 className="text-xl font-semibold text-white">
          {originalPositionsCount > 0 ? 'No Matching Positions' : 'No Positions Yet'}
        </h2>
        <p className="text-brand-text-secondary mt-2">
           {originalPositionsCount > 0 
            ? 'Try adjusting your filters to see more results.' 
            : 'Click "Add Trade" to log your first transaction.'}
        </p>
      </div>
    );
  }

  const handleToggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const allIds = positions.map(p => p.id);
  const areAllExpanded = allIds.length > 0 && allIds.every(id => expandedIds.has(id));

  const handleToggleAll = () => {
    if (areAllExpanded) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(allIds));
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        {positions.length > 1 && (
          <button
            onClick={handleToggleAll}
            className="text-sm text-brand-accent hover:text-sky-400 font-semibold transition-colors"
            aria-label={areAllExpanded ? 'Collapse all items' : 'Expand all items'}
          >
            {areAllExpanded ? 'Collapse All' : 'Expand All'}
          </button>
        )}
      </div>
      <div className="space-y-4">
        {positions.map(position => (
          <TradeItem
            key={position.id}
            position={position}
            onDelete={onDelete}
            onSell={onSell}
            onEdit={onEdit}
            isExpanded={expandedIds.has(position.id)}
            onToggleExpand={() => handleToggleExpand(position.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default TradeList;
