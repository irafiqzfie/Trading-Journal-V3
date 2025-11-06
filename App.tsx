


import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Position, SellTransaction, BuyTransaction, AnalysisResult, PLSummary, KeyMetrics, Filters } from './types';
import Header from './components/Header';
import TradeList from './components/TradeList';
import TradeFormModal from './components/TradeFormModal';
import AnalysisCard from './components/AnalysisCard';
import { PlusIcon, FilterIcon } from './components/Icons';
import EquityRiskCard from './components/EquityRiskCard';
import DailyPLChartCard from './components/DailyPLChartCard';
import MonthlyPLChartCard from './components/MonthlyPLChartCard';
import EquityChartCard from './components/EquityChartCard';
import ConfirmImportModal from './components/ConfirmImportModal';
import SettingsModal from './components/SettingsModal';
import KeyMetricsCard from './components/KeyMetricsCard';
import TransactionHistoryCard from './components/TransactionHistoryCard';
import PLSummaryCard from './components/PLSummaryCard';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import FilterBar from './components/FilterBar';
import LoginModal from './components/LoginModal'; // Import the new LoginModal
// FIX: Import SecondOpinionModal to support the second opinion feature.
import SecondOpinionModal from './components/SecondOpinionModal';
import { getPositionStats } from './utils/tradeCalculations';
import { GoogleGenAI } from '@google/genai';

const initialFilters: Filters = {
  ticker: '',
  status: 'all',
  plStatus: 'all',
  dateFrom: '',
  dateTo: '',
  setups: [],
};

// Dummy data for development without backend
const dummyPositions: Position[] = [
    {
        id: "1721832901308",
        ticker: "MSFT",
        buys: [
            {
                id: "1721832901308",
                lotSize: 10,
                buyPrice: 450.5,
                profitTarget: 470,
                stopLossPrice: 445,
                setupRating: "S",
                totalBuyPrice: 45050,
                buyDate: "2024-07-24",
                buyReason: ["Breakout Setup 1: Standard B/O -> 52W/ATH/CWH", "VCP Candlestick"],
                notes: "Strong volume on breakout, looks promising.",
                buyChartImage: "https://picsum.photos/seed/msftbuy/600/400"
            }
        ],
        sells: [
             {
                id: "1721833901308",
                lotSize: 10,
                sellPrice: 465.20,
                totalSellPrice: 46520,
                sellDate: "2024-07-26",
                sellReason: "TP",
                notes: "Reached my profit target zone.",
                sellChartImage: "https://picsum.photos/seed/msftsell/600/400"
            }
        ]
    },
    {
        id: "2",
        ticker: "AAPL",
        buys: [
            { id: "b1", lotSize: 20, buyPrice: 210, stopLossPrice: 205, setupRating: 'A+', totalBuyPrice: 42000, buyDate: "2024-07-20", buyReason: ["Pullback Setup 5: Pullback EMA Cloud B/O"] }
        ],
        sells: []
    }
];

const App: React.FC = () => {
  const [positions, setPositions] = useLocalStorage<Position[]>('positions', dummyPositions);
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage<boolean>('isAuthenticated', false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [positionToSell, setPositionToSell] = useState<Position | null>(null);
  const [transactionToEdit, setTransactionToEdit] = useState<{
    positionId: string;
    transaction: BuyTransaction | SellTransaction;
    type: 'buy' | 'sell';
    ticker: string;
  } | null>(null);
  const [positionToDeleteId, setPositionToDeleteId] = useState<string | null>(null);

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
  
  const [hasMounted, setHasMounted] = useState(false);

  // FIX: Add state for the Second Opinion Modal feature.
  const [isSecondOpinionModalOpen, setIsSecondOpinionModalOpen] = useState(false);
  const [secondOpinionData, setSecondOpinionData] = useState<{ ticker: string; buyReasons: string[]; chartImage: string; } | null>(null);
  const [secondOpinionAnalysis, setSecondOpinionAnalysis] = useState('');
  const [isSecondOpinionLoading, setIsSecondOpinionLoading] = useState(false);
  const [secondOpinionError, setSecondOpinionError] = useState<string | null>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);


  const initialEquity = useMemo(() => {
    const equityNum = parseFloat(equity);
    return isNaN(equityNum) ? 0 : equityNum;
  }, [equity]);

  const filteredPositions = useMemo(() => {
    return positions.filter(position => {
      const stats = getPositionStats(position);

      if (filters.ticker && !position.ticker.toLowerCase().includes(filters.ticker.toLowerCase().trim())) {
        return false;
      }
      if (filters.status === 'open' && stats.isClosed) return false;
      if (filters.status === 'closed' && !stats.isClosed) return false;
      if (stats.isClosed && filters.plStatus !== 'all') {
        if (filters.plStatus === 'profit' && stats.realizedPL <= 0) return false;
        if (filters.plStatus === 'loss' && stats.realizedPL > 0) return false;
      } else if (!stats.isClosed && filters.plStatus !== 'all') {
        return false;
      }
       if (filters.dateFrom || filters.dateTo) {
            const allDates = [...position.buys.map(b => new Date(b.buyDate).getTime()), ...position.sells.map(s => new Date(s.sellDate).getTime())];
            const fromTime = filters.dateFrom ? new Date(filters.dateFrom).getTime() : 0;
            const toTime = filters.dateTo ? new Date(filters.dateTo).setHours(23, 59, 59, 999) : Infinity;
            if (!allDates.some(date => date >= fromTime && date <= toTime)) return false;
        }
      if (filters.setups.length > 0) {
        const positionSetups = new Set(position.buys.flatMap(b => b.buyReason));
        if (!filters.setups.every(s => positionSetups.has(s))) return false;
      }
      return true;
    }).sort((a,b) => {
        const aDate = Math.max(...a.buys.map(buy => new Date(buy.buyDate).getTime()));
        const bDate = Math.max(...b.buys.map(buy => new Date(buy.buyDate).getTime()));
        return bDate - aDate;
    });
  }, [positions, filters]);

  const tradeStats = useMemo(() => {
    const closedPositionsWithPL = filteredPositions
      .map(p => { const stats = getPositionStats(p); return stats.isClosed ? { pl: stats.realizedPL } : null; })
      .filter((p): p is { pl: number } => p !== null);

    const totalTrades = closedPositionsWithPL.length;

    if (totalTrades === 0) {
      return { 
          summary: { totalPL: 0, winRate: 0, avgPL: 0, winners: 0, losers: 0, totalTrades: 0, hasData: false },
          metrics: { totalTrades: 0, avgPL: 0, profitFactor: 0, maxDrawdown: 0, hasData: false }
      };
    }

    const totalPL = closedPositionsWithPL.reduce((sum, trade) => sum + trade.pl, 0);
    const winners = closedPositionsWithPL.filter(t => t.pl > 0).length;
    const losers = totalTrades - winners;
    const winRate = (winners / totalTrades) * 100;
    const avgPL = totalPL / totalTrades;
    const grossProfit = closedPositionsWithPL.filter(t => t.pl > 0).reduce((sum, t) => sum + t.pl, 0);
    const grossLoss = Math.abs(closedPositionsWithPL.filter(t => t.pl <= 0).reduce((sum, t) => sum + t.pl, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : Infinity;

    const equityCurve = closedPositionsWithPL.reduce(
      (curve, trade) => {
        const lastEquity = curve[curve.length - 1];
        curve.push(lastEquity + trade.pl);
        return curve;
      },
      [initialEquity]
    );
    let peak = -Infinity;
    let maxDrawdown = 0;
    equityCurve.forEach(equityPoint => {
      if (equityPoint > peak) peak = equityPoint;
      const drawdown = peak > 0 ? ((peak - equityPoint) / peak) * 100 : 0;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });

    return {
      summary: { totalPL, winRate, avgPL, winners, losers, totalTrades, hasData: true },
      metrics: { totalTrades, avgPL, profitFactor, maxDrawdown, hasData: true }
    };
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
    if (positionId && transactionId) {
      updatedPositions = positions.map(p => {
        if (p.id === positionId) {
          const isBuy = 'buyPrice' in transactionData;
          return {
            ...p,
            buys: isBuy ? p.buys.map(b => b.id === transactionId ? { ...b, ...transactionData, buyChartImage: transactionData.chartImage } : b) : p.buys,
            sells: !isBuy ? p.sells.map(s => s.id === transactionId ? { ...s, ...transactionData } : s) : p.sells,
          };
        }
        return p;
      });
    }
    else if (positionId) {
        updatedPositions = positions.map(p => {
          if (p.id === positionId) {
            return { ...p, sells: [...p.sells, { id: Date.now().toString(), ...transactionData }] };
          }
          return p;
        });
    }
    else {
      const { ticker, chartImage, ...buyData } = transactionData;
      const newBuy: BuyTransaction = { id: Date.now().toString(), ...buyData, buyChartImage: chartImage };
      const existingOpenPosition = positions.find(p => p.ticker === ticker.toUpperCase() && !getPositionStats(p).isClosed);
      if (existingOpenPosition) {
        updatedPositions = positions.map(p => p.id === existingOpenPosition.id ? { ...p, buys: [...p.buys, newBuy] } : p);
      } else {
        const newPosition: Position = { id: Date.now().toString(), ticker: ticker.toUpperCase(), buys: [newBuy], sells: [] };
        updatedPositions = [newPosition, ...positions];
      }
    }
    setPositions(updatedPositions);
    handleCloseModal();
  };

  const handleOpenAddModal = () => { setIsModalOpen(true); setPositionToSell(null); setTransactionToEdit(null); };
  const handleOpenSellModal = (position: Position) => { setIsModalOpen(true); setPositionToSell(position); setTransactionToEdit(null); };
  const handleOpenEditModal = (positionId: string, transactionId: string, type: 'buy' | 'sell') => {
    const position = positions.find(p => p.id === positionId);
    if (!position) return;
    const transaction = type === 'buy' ? position.buys.find(t => t.id === transactionId) : position.sells.find(t => t.id === transactionId);
    if (transaction) { setTransactionToEdit({ positionId, transaction, type, ticker: position.ticker }); setPositionToSell(position); setIsModalOpen(true); }
  };
  const handleCloseModal = () => { setIsModalOpen(false); setPositionToSell(null); setTransactionToEdit(null); };
  const handleRequestDelete = (id: string) => setPositionToDeleteId(id);
  const handleConfirmDelete = () => { if (positionToDeleteId) { setPositions(positions.filter(p => p.id !== positionToDeleteId)); setPositionToDeleteId(null); } };
  const handleCancelDelete = () => setPositionToDeleteId(null);
  
  // FIX: Add handler for second opinion requests from the trade form modal.
  const handleRequestSecondOpinion = async (data: { ticker: string; buyReasons: string[]; chartImage: string; }) => {
    setSecondOpinionData(data);
    setIsSecondOpinionModalOpen(true);
    setIsSecondOpinionLoading(true);
    setSecondOpinionAnalysis('');
    setSecondOpinionError(null);

    try {
      const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});

      const { ticker, buyReasons, chartImage } = data;

      const match = chartImage.match(/^data:(image\/.+);base64,(.+)$/);
      if (!match) {
        throw new Error('Invalid image format. Expected a data URL.');
      }
      
      const mimeType = match[1];
      const base64Data = match[2];

      const prompt = `
You are an expert trading analyst providing a "second opinion" on a trade setup.
Your tone should be objective, balanced, and educational, like a mentor.
Do not give direct financial advice to buy or sell.
Analyze the provided chart image and the trader's stated reasons for entry.
Provide a concise analysis in Markdown format.

**Ticker:** ${ticker.toUpperCase()}
**Stated Buy Reasons:** ${buyReasons.join(', ')}

Based on the chart and reasons, provide the following:
- **Strengths:** 2-3 bullet points on what looks promising about this setup.
- **Potential Risks:** 2-3 bullet points on potential weaknesses, risks, or things to watch out for.
- **Key Level to Watch:** Identify one critical price level (e.g., support, resistance, breakout point) and explain its significance.

Keep the entire analysis brief and to the point.
      `;

      const imagePart = {
          inlineData: {
              mimeType: mimeType,
              data: base64Data,
          },
      };

      const textPart = {
          text: prompt,
      };

      const responseStream = await ai.models.generateContentStream({
          model: 'gemini-2.5-flash',
          contents: { parts: [textPart, imagePart] },
      });
      
      for await (const chunk of responseStream) {
        setSecondOpinionAnalysis(prev => prev + chunk.text);
      }

    } catch (error: any) {
      setSecondOpinionError(error.message || 'Failed to get analysis from the AI service.');
    } finally {
      setIsSecondOpinionLoading(false);
    }
  };
  
  const handleAnalyze = async () => {
    const positionsToAnalyze = filteredPositions;
    if (positionsToAnalyze.flatMap(p => p.sells).length < 3) {
      setAnalysisError("You need at least 3 sell transactions in the filtered positions for a meaningful analysis.");
      setIsAnalysisVisible(true);
      return;
    }
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysis(null);
    setIsAnalysisVisible(true);
    try {
        const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
        // This is a simplified client-side implementation. In a real app, this would be a backend call.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze these trades and find patterns: ${JSON.stringify(positionsToAnalyze)}`,
        });
        const text = response.text;
        // Basic parsing - a real implementation would use a structured schema.
        setAnalysis({
            positiveHabits: ["Good risk management on winning trades."],
            areasForImprovement: ["Seems to cut winners short sometimes."],
            actionableFeedback: text
        });
    } catch (error: any) {
        setAnalysisError(error.message || "Failed to analyze trading habits.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleCloseAnalysis = () => setIsAnalysisVisible(false);
  
  // FIX: Add a handler to close the second opinion modal.
  const handleCloseSecondOpinionModal = () => {
    setIsSecondOpinionModalOpen(false);
    setSecondOpinionData(null);
    setSecondOpinionAnalysis('');
    setSecondOpinionError(null);
  };
  
  const handleExportData = () => {
      const dataStr = JSON.stringify(positions, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.download = `trading_journal_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          setDataToImport(data);
          setIsImportConfirmOpen(true);
        } catch (error) { alert('Error reading file.'); }
      };
      reader.readAsText(file);
      e.target.value = ''; // Reset file input
    };

    const handleConfirmImport = () => { if (dataToImport) { setPositions(dataToImport); } handleCancelImport(); };
    const handleCancelImport = () => { setIsImportConfirmOpen(false); setDataToImport(null); };

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'setups') return Array.isArray(value) && value.length > 0;
    if (typeof value === 'string' && value && value !== 'all') return true;
    return false;
  }).length;
  
  const handleLogin = (id: string, pass: string) => {
    console.log("Logging in with:", { id, pass });
    // In a real app, you would verify credentials here.
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!hasMounted) {
    return null; // or a loading spinner
  }
  
  if (!isAuthenticated) {
    return (
        <div className="min-h-screen text-brand-text font-sans">
            <LoginModal onLogin={handleLogin} />
        </div>
    );
  }

  return (
    <div className="min-h-screen text-brand-text font-sans">
        <Header onExport={handleExportData} onImport={() => fileInputRef.current?.click()} onSettings={() => setIsSettingsModalOpen(true)} onLogout={handleLogout} isAuthenticated={isAuthenticated} />
        <main className="container mx-auto p-4 md:p-6 lg:p-8">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <div className="lg:col-span-2"><EquityRiskCard equity={equity} onEquityChange={setEquity} riskPercent={riskPercent} onRiskPercentChange={setRiskPercent} useDynamicEquity={useDynamicEquity} onUseDynamicEquityChange={setUseDynamicEquity} currentEquity={currentEquity} /></div>
                <div className="lg:col-span-1"><PLSummaryCard summary={tradeStats.summary} /></div>
                <div className="lg:col-span-1"><KeyMetricsCard metrics={tradeStats.metrics} /></div>
                <div className="lg:col-span-4"><DailyPLChartCard positions={filteredPositions} /></div>
                <div className="lg:col-span-4"><MonthlyPLChartCard positions={filteredPositions} /></div>
                <div className="lg:col-span-4"><EquityChartCard positions={filteredPositions} initialEquity={initialEquity} /></div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex flex-wrap items-center gap-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">My Positions</h1>
                    <button onClick={() => setIsFilterVisible(!isFilterVisible)} className="relative flex items-center gap-2 px-3 py-1.5 text-sm bg-stone-800 text-brand-text-secondary font-semibold rounded-md transition-colors hover:bg-brand-primary hover:text-white">
                        <FilterIcon className="h-4 w-4" />
                        <span>Filter</span>
                        {activeFilterCount > 0 && <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-white text-xs font-bold">{activeFilterCount}</span>}
                    </button>
                    <div className="hidden sm:block border-l border-white/20 h-8"></div>
                    <div className="flex gap-3">
                        <button onClick={handleAnalyze} disabled={isAnalyzing || filteredPositions.length < 1} className="px-4 py-2 bg-transparent border-2 border-brand-accent text-brand-accent font-semibold rounded-lg shadow-md transition-all duration-300 hover:bg-brand-accent hover:text-white disabled:opacity-40">Analyze Habits</button>
                        <button onClick={handleOpenAddModal} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold rounded-lg shadow-lg transition-all duration-300 hover:shadow-brand-primary/50 transform hover:scale-105 animate-pulse-glow"><PlusIcon /> Add Trade</button>
                    </div>
                </div>
                <div>
                    <span className="text-sm text-brand-text-secondary">Filtered Realized P/L</span>
                    <p className={`text-3xl font-bold ${totalPL >= 0 ? 'text-brand-profit' : 'text-brand-loss'}`}>RM{totalPL.toFixed(2)}</p>
                </div>
            </div>
            
            {isFilterVisible && <div className="mb-6 animate-fade-in-up"><FilterBar onApplyFilters={setFilters} onClearFilters={() => setFilters(initialFilters)} initialFilters={filters} /></div>}
            
            <div className="animate-fade-in-up">
                {isAnalysisVisible && <AnalysisCard analysis={analysis} isLoading={isAnalyzing} error={analysisError} onClose={handleCloseAnalysis} />}
                <TradeList positions={filteredPositions} originalPositionsCount={positions.length} onDelete={handleRequestDelete} onSell={handleOpenSellModal} onEdit={handleOpenEditModal} />
            </div>
            
            <div className="animate-fade-in-up mt-8"><TransactionHistoryCard positions={filteredPositions} /></div>
            
            {/* FIX: Pass the required 'onRequestSecondOpinion' prop to TradeFormModal. */}
            {isModalOpen && <TradeFormModal onClose={handleCloseModal} onSave={handleSaveTransaction} positionToSellFrom={positionToSell} transactionToEdit={transactionToEdit} baseRiskAmount={baseRiskAmount} customSetupImages={customSetupImages} onRequestSecondOpinion={handleRequestSecondOpinion} />}
            {/* FIX: Render the SecondOpinionModal when its data is available. */}
            {secondOpinionData && (
              <SecondOpinionModal
                isOpen={isSecondOpinionModalOpen}
                onClose={handleCloseSecondOpinionModal}
                ticker={secondOpinionData.ticker}
                buyReasons={secondOpinionData.buyReasons}
                chartImage={secondOpinionData.chartImage}
                analysis={secondOpinionAnalysis}
                isLoading={isSecondOpinionLoading}
                error={secondOpinionError}
              />
            )}
            {positionToDeleteId && <ConfirmDeleteModal onConfirm={handleConfirmDelete} onCancel={handleCancelDelete} positionTicker={positions.find(p => p.id === positionToDeleteId)?.ticker || ''} />}
            {isImportConfirmOpen && <ConfirmImportModal onConfirm={handleConfirmImport} onCancel={handleCancelImport} />}
            {isSettingsModalOpen && <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} customImages={customSetupImages} onCustomImagesChange={setCustomSetupImages} />}
        </main>
    </div>
  );
};

export default App;