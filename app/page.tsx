'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Position, SellTransaction, BuyTransaction, AnalysisResult, PLSummary, KeyMetrics, Filters } from '../types';
import Header from '../components/Header';
import TradeList from '../components/TradeList';
import TradeFormModal from '../components/TradeFormModal';
import AnalysisCard from '../components/AnalysisCard';
import { PlusIcon, FilterIcon } from '../components/Icons';
import EquityRiskCard from '../components/EquityRiskCard';
import DailyPLChartCard from '../components/DailyPLChartCard';
import MonthlyPLChartCard from '../components/MonthlyPLChartCard';
import EquityChartCard from '../components/EquityChartCard';
import ConfirmImportModal from '../components/ConfirmImportModal';
import SettingsModal from '../components/SettingsModal';
import KeyMetricsCard from '../components/KeyMetricsCard';
import TransactionHistoryCard from '../components/TransactionHistoryCard';
import PLSummaryCard from '../components/PLSummaryCard';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import FilterBar from '../components/FilterBar';
import { getPositionStats } from '../utils/tradeCalculations';

const initialFilters: Filters = {
  ticker: '',
  status: 'all',
  plStatus: 'all',
  dateFrom: '',
  dateTo: '',
  setups: [],
};

const HomePage: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [positionToSell, setPositionToSell] = useState<Position | null>(null);
  const [transactionToEdit, setTransactionToEdit] = useState<{
    positionId: string;
    transaction: BuyTransaction | SellTransaction;
    type: 'buy' | 'sell';
    ticker: string;
  } | null>(null);
  const [positionToDeleteId, setPositionToDeleteId] = useState<string | null>(null);

  // Note: Settings for Equity/Risk and Custom Images are kept in localStorage
  // as they are more like user preferences and less critical than trade data.
  const [equity, setEquity] = useLocalStorage<string>('equity', '10000');
  const [riskPercent, setRiskPercent] = useLocalStorage<string>('riskPercent', '2');
  const [useDynamicEquity, setUseDynamicEquity] = useLocalStorage<boolean>('useDynamicEquity', true);
  const [customSetupImages, setCustomSetupImages] = useLocalStorage<Record<string, string>>('customSetupImages', {});
  
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isAnalysisVisible, setIsAnalysisVisible] = useState<boolean>(false);

  const [isImportConfirmOpen, setIsImportConfirmOpen] = useState<boolean>(false);
  const [dataToImport, setDataToImport] = useState<Position[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);

  // Fetch initial data from the server
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);
        const response = await fetch('/api/positions');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to fetch positions from server.' }));
          throw new Error(errorData.error || 'An unknown server error occurred.');
        }
        const data = await response.json();
        setPositions(data);
      } catch (error: any) {
        setFetchError(error.message || 'An unknown error occurred while fetching data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPositions();
  }, []);

  // Function to save data to the server and update local state
  const syncPositions = async (updatedPositions: Position[]) => {
      setPositions(updatedPositions); // Optimistic UI update
      try {
          const response = await fetch('/api/positions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedPositions),
          });
          if (!response.ok) {
              console.error('Failed to sync positions with server.');
              // Simple alert for now, could be replaced with a toast notification
              alert('Error: Could not save changes to the server. Your data may be out of sync.');
          }
      } catch (error) {
          console.error('Failed to sync positions:', error);
          alert('Error: Could not save changes to the server. Your data may be out of sync.');
      }
  };


  const initialEquity = useMemo(() => {
    const equityNum = parseFloat(equity);
    return isNaN(equityNum) ? 0 : equityNum;
  }, [equity]);

  const filteredPositions = useMemo(() => {
    return positions.filter(position => {
      const stats = getPositionStats(position);

      // Ticker filter
      if (filters.ticker && !position.ticker.toLowerCase().includes(filters.ticker.toLowerCase().trim())) {
        return false;
      }

      // Status filter
      if (filters.status === 'open' && stats.isClosed) return false;
      if (filters.status === 'closed' && !stats.isClosed) return false;
      
      // P/L Status Filter (only applies to closed positions)
      if (stats.isClosed && filters.plStatus !== 'all') {
        if (filters.plStatus === 'profit' && stats.realizedPL <= 0) return false;
        if (filters.plStatus === 'loss' && stats.realizedPL > 0) return false;
      } else if (!stats.isClosed && filters.plStatus !== 'all') {
        return false;
      }

      // Date Range filter (checks if ANY transaction is within the range)
       if (filters.dateFrom || filters.dateTo) {
            const allDates = [...position.buys.map(b => new Date(b.buyDate).getTime()), ...position.sells.map(s => new Date(s.sellDate).getTime())];
            const fromTime = filters.dateFrom ? new Date(filters.dateFrom).getTime() : 0;
            const toTime = filters.dateTo ? new Date(filters.dateTo).setHours(23, 59, 59, 999) : Infinity;

            if (!allDates.some(date => date >= fromTime && date <= toTime)) {
                return false;
            }
        }

      // Setup filter
      if (filters.setups.length > 0) {
        const positionSetups = new Set(position.buys.flatMap(b => b.buyReason));
        if (!filters.setups.every(s => positionSetups.has(s))) return false;
      }

      return true;
    });
  }, [positions, filters]);

  const tradeStats = useMemo(() => {
    const closedPositionsWithPL = filteredPositions
      .map(p => {
        const stats = getPositionStats(p);
        if (!stats.isClosed) return null;

        const latestSellDate = new Date(
            Math.max(...p.sells.map(s => new Date(s.sellDate).getTime()))
        );
        
        return { pl: stats.realizedPL, date: latestSellDate };
      })
      .filter((trade): trade is { pl: number; date: Date } => trade !== null)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const totalTrades = closedPositionsWithPL.length;

    if (totalTrades === 0) {
      const initialStats = {
        totalPL: 0,
        winRate: 0,
        avgPL: 0,
        winners: 0,
        losers: 0,
        totalTrades: 0,
        hasData: false,
        profitFactor: 0,
        maxDrawdown: 0,
      };
      return { summary: initialStats, metrics: initialStats };
    }

    const totalPL = closedPositionsWithPL.reduce((sum, trade) => sum + trade.pl, 0);
    const winners = closedPositionsWithPL.filter(t => t.pl > 0).length;
    const losers = totalTrades - winners;
    const winRate = (winners / totalTrades) * 100;
    const avgPL = totalPL / totalTrades;

    const grossProfit = closedPositionsWithPL
      .filter(t => t.pl > 0)
      .reduce((sum, t) => sum + t.pl, 0);
      
    const grossLoss = Math.abs(
      closedPositionsWithPL
        .filter(t => t.pl <= 0)
        .reduce((sum, t) => sum + t.pl, 0)
    );

    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : Infinity;

    // Max Drawdown Calculation
    const equityCurve = [initialEquity];
    closedPositionsWithPL.forEach(trade => {
      equityCurve.push(equityCurve[equityCurve.length - 1] + trade.pl);
    });

    let peak = -Infinity;
    let maxDrawdown = 0;
    for (const equityPoint of equityCurve) {
      if (equityPoint > peak) {
        peak = equityPoint;
      }
      const drawdown = peak > 0 ? (peak - equityPoint) / peak : 0;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    const summary: PLSummary = {
        totalPL,
        winRate,
        avgPL,
        winners,
        losers,
        totalTrades,
        hasData: true,
    };
    
    const metrics: KeyMetrics = {
        totalTrades,
        avgPL,
        profitFactor,
        maxDrawdown: maxDrawdown * 100,
        hasData: true,
    };

    return { summary, metrics };
  }, [filteredPositions, initialEquity]);

  const totalPL = tradeStats.summary.totalPL;
  const currentEquity = useMemo(() => initialEquity + totalPL, [initialEquity, totalPL]);

  const baseRiskAmount = useMemo(() => {
    const equityForCalc = useDynamicEquity ? currentEquity : initialEquity;
    const riskPercentNum = parseFloat(riskPercent);

    if (!isNaN(equityForCalc) && equityForCalc > 0 && !isNaN(riskPercentNum) && riskPercentNum >= 0) {
      return equityForCalc * (riskPercentNum / 100);
    }
    return 0;
  }, [initialEquity, currentEquity, riskPercent, useDynamicEquity]);

  const handleSaveTransaction = (
    transactionData: any,
    positionId?: string,
    transactionId?: string,
  ) => {
    let updatedPositions: Position[];

    // EDIT Transaction
    if (positionId && transactionId) {
      updatedPositions = positions.map(p => {
        if (p.id === positionId) {
          const isBuy = 'buyPrice' in transactionData;
          if (isBuy) {
            const { chartImage, ...buyTxData } = transactionData;
            return {
              ...p,
              buys: p.buys.map(b =>
                b.id === transactionId
                  ? { ...b, ...buyTxData, buyChartImage: chartImage } as BuyTransaction
                  : b
              )
            };
          } else {
            const { ...sellTxData } = transactionData;
            return {
              ...p,
              sells: p.sells.map(s => s.id === transactionId ? { ...s, ...sellTxData } as SellTransaction : s)
            };
          }
        }
        return p;
      });
    }
    // ADD Sell Transaction
    else if (positionId) {
        const { ...sellSpecificData } = transactionData;
        updatedPositions = positions.map(p => {
                if (p.id === positionId) {
                    const newSell: SellTransaction = {
                        id: Date.now().toString(),
                        ...(sellSpecificData as Omit<SellTransaction, 'id'>)
                    };
                    return {
                        ...p,
                        sells: [...p.sells, newSell]
                    };
                }
                return p;
            });
    }
    // ADD New Buy Transaction / Position
    else {
      const { ticker, chartImage, ...buySpecificData } = transactionData;
      
      const newBuy: BuyTransaction = {
        id: Date.now().toString(),
        ...buySpecificData,
        buyChartImage: chartImage || null,
      };

      const existingPositionIndex = positions.findIndex(p => p.ticker === ticker.toUpperCase());
      
      if (existingPositionIndex > -1) {
        const { isClosed } = getPositionStats(positions[existingPositionIndex]);
        if (!isClosed) {
          updatedPositions = positions.map((p, index) => {
            if (index === existingPositionIndex) {
              return { ...p, buys: [...p.buys, newBuy] };
            }
            return p;
          });
        } else {
           const newPosition: Position = {
              id: Date.now().toString(),
              ticker: ticker.toUpperCase(),
              buys: [newBuy],
              sells: [],
            };
            updatedPositions = [newPosition, ...positions];
        }
      } else {
        const newPosition: Position = {
          id: Date.now().toString(),
          ticker: ticker.toUpperCase(),
          buys: [newBuy],
          sells: [],
        };
        updatedPositions = [newPosition, ...positions];
      }
    }
    syncPositions(updatedPositions);
    handleCloseModal();
  };

  const handleOpenAddModal = () => {
    setPositionToSell(null);
    setTransactionToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenSellModal = (position: Position) => {
    setPositionToSell(position);
    setTransactionToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (positionId: string, transactionId: string, type: 'buy' | 'sell') => {
    const position = positions.find(p => p.id === positionId);
    if (!position) return;

    const transaction = type === 'buy'
      ? position.buys.find(t => t.id === transactionId)
      : position.sells.find(t => t.id === transactionId);

    if (transaction) {
      setTransactionToEdit({ positionId, transaction, type, ticker: position.ticker });
      setPositionToSell(position); // Provide position context for both buy/sell edits
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPositionToSell(null);
    setTransactionToEdit(null);
  };

  const handleRequestDelete = (id: string) => {
    setPositionToDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (positionToDeleteId) {
      const updatedPositions = positions.filter(p => p.id !== positionToDeleteId);
      syncPositions(updatedPositions);
      setPositionToDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setPositionToDeleteId(null);
  };

  const handleAnalyze = async () => {
    const positionsToAnalyze = filteredPositions;
    if (positionsToAnalyze.length === 0) {
       setAnalysisError("No positions match the current filters to be analyzed.");
       setIsAnalysisVisible(true);
       return;
    }
    if (positionsToAnalyze.flatMap(p => p.sells).length < 3) {
      setAnalysisError("You need at least 3 sell transactions in the filtered positions to get a meaningful analysis.");
      setIsAnalysisVisible(true);
      return;
    }
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysis(null);
    setIsAnalysisVisible(true);
    try {
      const apiResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ positions: positionsToAnalyze }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error || `API request failed with status: ${apiResponse.status}`);
      }

      const result = await apiResponse.json();
      setAnalysis(result);

    } catch (error: any) {
      console.error("Analysis failed:", error);
      setAnalysisError(error.message || "Failed to analyze trading habits.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCloseAnalysis = () => {
    setIsAnalysisVisible(false);
    setAnalysis(null);
    setAnalysisError(null);
  };
  
  const handleExportData = () => {
      const dataStr = JSON.stringify(positions, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      const today = new Date().toISOString().split('T')[0];
      link.download = `as_trading_journal_backup_${today}.json`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result;
          if (typeof text !== 'string') throw new Error("File could not be read");
          const data = JSON.parse(text);

          if (Array.isArray(data) && (data.length === 0 || (data[0].id && data[0].ticker && data[0].buys && data[0].sells))) {
            setDataToImport(data);
            setIsImportConfirmOpen(true);
          } else {
            alert('Error: Invalid JSON format. The file does not appear to be a valid trading journal backup.');
          }
        } catch (error) {
          console.error("Failed to parse JSON file:", error);
          alert('Error: Failed to read or parse the JSON file.');
        } finally {
          if (event.target) {
            event.target.value = '';
          }
        }
      };
      reader.readAsText(file);
    };

    const handleConfirmImport = () => {
      if (dataToImport) {
        syncPositions(dataToImport);
      }
      handleCancelImport();
    };

    const handleCancelImport = () => {
      setDataToImport(null);
      setIsImportConfirmOpen(false);
    };

  const activeFilterCount = Object.values(filters).filter(value => {
    if (typeof value === 'string' && value) return true;
    if (Array.isArray(value) && value.length > 0) return true;
    if (typeof value !== 'string' && typeof value !== 'object' && value !== 'all') return true;
    return false;
  }).length;


  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans">
      <Header onExport={handleExportData} onImport={() => fileInputRef.current?.click()} onSettings={() => setIsSettingsModalOpen(true)} />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <EquityRiskCard
              equity={equity}
              onEquityChange={setEquity}
              riskPercent={riskPercent}
              onRiskPercentChange={setRiskPercent}
              useDynamicEquity={useDynamicEquity}
              onUseDynamicEquityChange={setUseDynamicEquity}
              currentEquity={currentEquity}
            />
          </div>
          <div className="lg:col-span-1 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <PLSummaryCard summary={tradeStats.summary} />
          </div>
           <div className="lg:col-span-1 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <KeyMetricsCard metrics={tradeStats.metrics} />
          </div>
          <div className="lg:col-span-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
             <DailyPLChartCard positions={filteredPositions} />
          </div>
          <div className="lg:col-span-4 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
             <MonthlyPLChartCard positions={filteredPositions} />
          </div>
          <div className="lg:col-span-4 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
             <EquityChartCard positions={filteredPositions} initialEquity={initialEquity} />
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">My Positions</h1>
            <button
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                className="relative flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-800 text-brand-text-secondary font-semibold rounded-md transition-colors hover:bg-slate-700 hover:text-white"
                aria-expanded={isFilterVisible}
              >
                <FilterIcon className="h-4 w-4" />
                <span>Filter</span>
                 {activeFilterCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">
                        {activeFilterCount}
                    </span>
                )}
            </button>
            <div className="hidden sm:block border-l border-white/20 h-8"></div>
            <div className="flex gap-3">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || filteredPositions.length < 1}
                className="px-4 py-2 bg-transparent border-2 border-brand-accent text-brand-accent font-semibold rounded-lg shadow-md transition-all duration-300 hover:bg-brand-accent hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Habits'}
              </button>
              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold rounded-lg shadow-lg transition-all duration-300 hover:shadow-brand-primary/50 transform hover:scale-105 animate-pulse-glow"
              >
                <PlusIcon />
                Add Trade
              </button>
            </div>
           
          </div>
           <div className="text-center">
             <span className="text-sm text-brand-text-secondary">Filtered Realized P/L</span>
             <p className={`text-3xl font-bold ${totalPL >= 0 ? 'text-brand-profit' : 'text-brand-loss'} [text-shadow:0_0_8px_var(--tw-shadow-color)] ${totalPL >= 0 ? 'shadow-green-500/50' : 'shadow-red-500/50'}`}>
                RM{totalPL.toFixed(2)}
              </p>
           </div>
        </div>
        
        {isFilterVisible && (
            <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '750ms' }}>
                <FilterBar
                    onApplyFilters={setFilters}
                    onClearFilters={() => setFilters(initialFilters)}
                    initialFilters={filters}
                />
            </div>
        )}
        
        {isLoading && (
            <div className="text-center py-16 px-6 bg-brand-surface rounded-lg border border-white/10 shadow-lg">
                <p className="text-brand-text-secondary">Loading trades from server...</p>
            </div>
        )}
        {fetchError && (
             <div className="text-center py-16 px-6 bg-red-900/20 text-red-300 rounded-lg border border-red-500/30 shadow-lg">
                <h2 className="text-xl font-semibold text-white">Error Loading Data</h2>
                <p>{fetchError}</p>
            </div>
        )}

        {!isLoading && !fetchError && (
          <div className="animate-fade-in-up" style={{ animationDelay: '800ms' }}>
              {isAnalysisVisible && (
                <AnalysisCard 
                  analysis={analysis} 
                  isLoading={isAnalyzing} 
                  error={analysisError} 
                  onClose={handleCloseAnalysis} 
                />
              )}
              
              <TradeList 
                positions={filteredPositions}
                originalPositionsCount={positions.length}
                onDelete={handleRequestDelete} 
                onSell={handleOpenSellModal} 
                onEdit={handleOpenEditModal} 
              />
          </div>
        )}
        
        <div className="animate-fade-in-up mt-8" style={{ animationDelay: '900ms' }}>
           <TransactionHistoryCard positions={filteredPositions} />
        </div>
        
        {isModalOpen && (
          <TradeFormModal
            onClose={handleCloseModal}
            onSave={handleSaveTransaction}
            positionToSellFrom={positionToSell}
            transactionToEdit={transactionToEdit}
            baseRiskAmount={baseRiskAmount}
            customSetupImages={customSetupImages}
          />
        )}
        {positionToDeleteId && (
          <ConfirmDeleteModal
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
            positionTicker={positions.find(p => p.id === positionToDeleteId)?.ticker || 'this position'}
          />
        )}
        {isImportConfirmOpen && (
            <ConfirmImportModal
                onConfirm={handleConfirmImport}
                onCancel={handleCancelImport}
            />
        )}
        {isSettingsModalOpen && (
            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                customImages={customSetupImages}
                onCustomImagesChange={setCustomSetupImages}
            />
        )}
      </main>
    </div>
  );
};

export default HomePage;
