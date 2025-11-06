import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Filters } from '../types';
import { buySetups as allSetups } from './TradeFormModal';
import { CloseIcon } from './Icons';

interface FilterBarProps {
    onApplyFilters: (filters: Filters) => void;
    onClearFilters: () => void;
    initialFilters: Filters;
}

const FilterBar: React.FC<FilterBarProps> = ({ onApplyFilters, onClearFilters, initialFilters }) => {
    const [filters, setFilters] = useState<Filters>(initialFilters);
    const [isSetupDropdownOpen, setIsSetupDropdownOpen] = useState(false);
    const [setupSearchTerm, setSetupSearchTerm] = useState('');
    const setupRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        setFilters(initialFilters);
    }, [initialFilters]);

    const handleApply = () => {
        onApplyFilters(filters);
    };

    const handleClear = () => {
        setFilters({ ticker: '', status: 'all', plStatus: 'all', dateFrom: '', dateTo: '', setups: [] });
        onClearFilters();
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (setupRef.current && !setupRef.current.contains(event.target as Node)) {
                setIsSetupDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredSetups = useMemo(() => 
        allSetups.filter(s => 
            !filters.setups.includes(s.name) && 
            s.name.toLowerCase().includes(setupSearchTerm.toLowerCase())
        ), 
        [filters.setups, setupSearchTerm]
    );
    
    const handleAddSetup = (setupName: string) => { 
        setFilters(prev => ({...prev, setups: [...prev.setups, setupName]})); 
        setSetupSearchTerm(''); 
    };
    
    const handleRemoveSetup = (setupToRemove: string) => {
        setFilters(prev => ({...prev, setups: prev.setups.filter(s => s !== setupToRemove)}));
    };
    
    const inputClasses = "block w-full bg-black/20 border-2 border-stone-700 rounded-md shadow-sm text-white focus:ring-0 focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(249,115,22,0.3)] transition-all duration-200 py-2 px-3 text-sm";
    const labelClasses = "block text-xs font-medium text-brand-text-secondary mb-1";
    
    return (
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {/* Ticker */}
                <div>
                    <label htmlFor="ticker-filter" className={labelClasses}>Ticker</label>
                    <input
                        id="ticker-filter"
                        type="text"
                        placeholder="e.g. MSFT"
                        className={inputClasses}
                        value={filters.ticker}
                        onChange={e => setFilters({ ...filters, ticker: e.target.value })}
                    />
                </div>

                {/* Status */}
                <div>
                    <label htmlFor="status-filter" className={labelClasses}>Position Status</label>
                    <select
                        id="status-filter"
                        className={inputClasses}
                        value={filters.status}
                        onChange={e => setFilters({ ...filters, status: e.target.value as Filters['status'] })}
                    >
                        <option value="all">All</option>
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

                {/* P/L Status */}
                <div>
                    <label htmlFor="pl-filter" className={labelClasses}>P/L Status</label>
                    <select
                        id="pl-filter"
                        className={inputClasses}
                        value={filters.plStatus}
                        onChange={e => setFilters({ ...filters, plStatus: e.target.value as Filters['plStatus'] })}
                    >
                        <option value="all">All</option>
                        <option value="profit">Profit</option>
                        <option value="loss">Loss</option>
                    </select>
                </div>

                {/* Date From */}
                <div>
                    <label htmlFor="date-from-filter" className={labelClasses}>Date From</label>
                    <input
                        id="date-from-filter"
                        type="date"
                        className={inputClasses}
                        value={filters.dateFrom}
                        onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
                    />
                </div>

                {/* Date To */}
                <div>
                    <label htmlFor="date-to-filter" className={labelClasses}>Date To</label>
                    <input
                        id="date-to-filter"
                        type="date"
                        className={inputClasses}
                        value={filters.dateTo}
                        onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
                    />
                </div>

                {/* Setup */}
                 <div className="xl:col-span-1">
                    <label className={labelClasses}>Setups</label>
                     <div className="relative" ref={setupRef}>
                        <div className={`${inputClasses} flex flex-wrap items-center gap-1 min-h-[42px] cursor-text pr-8`} onClick={() => setupRef.current?.querySelector('input')?.focus()}>
                            {filters.setups.length === 0 && !setupSearchTerm && <span className="text-brand-text-secondary">Any setup</span>}
                            {filters.setups.map(setupName => (
                                <span key={setupName} className="flex items-center gap-1 bg-brand-primary/80 text-white text-xs font-semibold pl-2 pr-1 py-0.5 rounded-full animate-fade-in">
                                    {setupName.split(':')[0]}
                                    <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveSetup(setupName); }} className="text-white/70 hover:text-white bg-white/10 rounded-full" aria-label={`Remove ${setupName}`}><CloseIcon className="h-3 w-3" /></button>
                                </span>
                            ))}
                            <input type="text" value={setupSearchTerm} onChange={e => setSetupSearchTerm(e.target.value)} onFocus={() => setIsSetupDropdownOpen(true)} className="bg-transparent outline-none flex-grow text-white p-0 text-sm" />
                        </div>
                        {isSetupDropdownOpen && filteredSetups.length > 0 && (
                            <div className="absolute z-20 mt-1 w-full bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-48 overflow-y-auto animate-fade-in">
                                <ul>{filteredSetups.map(setup => (<li key={setup.name} onClick={() => { handleAddSetup(setup.name); setIsSetupDropdownOpen(false); }} className="px-3 py-1.5 text-xs text-brand-text hover:bg-brand-primary/20 cursor-pointer">{setup.name}</li>))}</ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/10">
                <button onClick={handleClear} className="px-4 py-2 text-sm font-semibold text-brand-text-secondary rounded-md hover:bg-stone-700 transition-colors">Clear</button>
                <button onClick={handleApply} className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-md hover:bg-orange-600 transition-colors">Apply Filters</button>
            </div>
        </div>
    );
};

export default FilterBar;