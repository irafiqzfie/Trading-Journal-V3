import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Position, BuyTransaction, SellTransaction } from '../types';
import { CloseIcon, CalendarIcon, ImageIcon, TrashIcon } from './Icons';

interface TradeFormModalProps {
  onClose: () => void;
  onSave: (data: any, positionId?: string, transactionId?: string) => void;
  positionToSellFrom?: Position | null;
  transactionToEdit?: {
    positionId: string;
    transaction: BuyTransaction | SellTransaction;
    type: 'buy' | 'sell';
    ticker: string;
  } | null;
  baseRiskAmount: number;
  customSetupImages: Record<string, string>;
}

export const buySetups = [
  { name: "Breakout Setup 1: Standard B/O -> 52W/ATH/CWH" },
  { name: "Breakout Setup 2: Ranges at Cheat B/O" },
  { name: "Breakout Setup 3: DTL B/O" },
  { name: "Breakout Setup 4: IPO B/O" },
  { name: "Pullback Setup 5: Pullback EMA Cloud B/O" },
  { name: "Pullback Setup 6: Pullback Recent 52W/ATH/CWH B/O" },
  { name: "VCP Candlestick" },
];


interface ImageTooltipState {
  visible: boolean;
  ChartComponent: React.FC | null;
  chartImage: string | null;
  name: string;
  top: number;
  left: number;
  position: 'top' | 'bottom';
}


const TradeFormModal: React.FC<TradeFormModalProps> = ({ onClose, onSave, positionToSellFrom, transactionToEdit, baseRiskAmount, customSetupImages }) => {
  const isEditing = !!transactionToEdit;
  const isSellMode = (isEditing && transactionToEdit.type === 'sell') || (!isEditing && !!positionToSellFrom);

  // Common state
  const [ticker, setTicker] = useState('');
  const [buyDate, setBuyDate] = useState(new Date().toISOString().split('T')[0]);
  const [buyReason, setBuyReason] = useState<string[]>([]);
  
  // New "Buy" form state
  const [lotSize, setLotSize] = useState<string | number>('');
  const [setupRating, setSetupRating] = useState<'S' | 'A+' | 'A'>('A+');
  const [buyPrice, setBuyPrice] = useState('');
  const [profitTarget, setProfitTarget] = useState('');
  const [stopLossPrice, setStopLossPrice] = useState('');
  const [selectedR, setSelectedR] = useState<number | null>(2); // Default to 2R for new trades
  const [positionNotes, setPositionNotes] = useState('');
  const [buyChartImage, setBuyChartImage] = useState<string | null>(null);

  // State for an "Add/Edit Sell" transaction
  const [sellLotSize, setSellLotSize] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [sellDate, setSellDate] = useState(new Date().toISOString().split('T')[0]);
  const [sellReason, setSellReason] = useState<'TP' | 'Cut Loss' | ''>('');
  const [transactionNotes, setTransactionNotes] = useState('');
  const [sellChartImage, setSellChartImage] = useState<string | null>(null);

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  
  const [isSetupDropdownOpen, setIsSetupDropdownOpen] = useState(false);
  const [setupSearchTerm, setSetupSearchTerm] = useState('');
  const setupRef = useRef<HTMLDivElement>(null);
  const buyFileInputRef = useRef<HTMLInputElement>(null);
  const sellFileInputRef = useRef<HTMLInputElement>(null);

  const [imageTooltip, setImageTooltip] = useState<ImageTooltipState>({ visible: false, ChartComponent: null, chartImage: null, name: '', top: 0, left: 0, position: 'bottom' });
  const [isDraggingOver, setIsDraggingOver] = useState(false);


  const avgBuyPrice = useMemo(() => {
    if (!positionToSellFrom) return 0;
    const totalLotsBought = positionToSellFrom.buys.reduce((acc, b) => acc + b.lotSize, 0);
    const totalBuyValue = positionToSellFrom.buys.reduce((acc, b) => acc + b.totalBuyPrice, 0);
    return totalLotsBought > 0 ? totalBuyValue / (totalLotsBought * 100) : 0;
  }, [positionToSellFrom]);
  
  // Automate Sell Reason based on sell price vs avg buy price
  useEffect(() => {
    if (isSellMode && avgBuyPrice > 0) {
        const price = parseFloat(sellPrice);
        if (!isNaN(price) && price > 0) {
            setSellReason(price > avgBuyPrice ? 'TP' : 'Cut Loss');
        } else {
            setSellReason(''); // Clear reason if price is invalid or empty
        }
    }
  }, [sellPrice, isSellMode, avgBuyPrice]);

  // Populate form for editing or selling from a position
  useEffect(() => {
    if (transactionToEdit) {
      setSelectedR(null); // Clear R-selection for edits to show the saved value
      const { transaction, type, ticker } = transactionToEdit;
      if (type === 'buy') {
        const tx = transaction as BuyTransaction;
        setTicker(ticker);
        setBuyPrice(tx.buyPrice.toString());
        setProfitTarget(tx.profitTarget?.toString() || '');
        setStopLossPrice(tx.stopLossPrice.toString());
        setLotSize(tx.lotSize);
        setBuyDate(tx.buyDate);
        setBuyReason(tx.buyReason);
        setSetupRating(tx.setupRating);
        setBuyChartImage(tx.buyChartImage || null);
        setPositionNotes(tx.notes || '');
      } else { // 'sell'
        const tx = transaction as SellTransaction;
        setSellLotSize(tx.lotSize.toString());
        setSellPrice(tx.sellPrice.toString());
        setSellDate(tx.sellDate);
        const reason = tx.sellReason;
        setSellReason(reason === 'TP' || reason === 'Cut Loss' ? reason : '');
        setTransactionNotes(tx.notes || '');
        setSellChartImage(tx.sellChartImage || null);
        setPositionNotes(''); // Not used in sell mode
      }
    } else if (positionToSellFrom) { // Adding a new sell from an existing position
      setPositionNotes('');
      setSellChartImage(null); // Reset for new sell transaction
    } else { // Adding a completely new position (new buy)
      setPositionNotes('');
      setBuyChartImage(null);
    }
  }, [transactionToEdit, positionToSellFrom]);


  // Auto-calculate profit target based on R selection
  useEffect(() => {
    if (isSellMode || selectedR === null) return;

    const buy = parseFloat(buyPrice);
    const sl = parseFloat(stopLossPrice);
    
    if (buy > 0 && sl > 0 && buy > sl) {
      const riskPerUnit = buy - sl;
      const target = buy + (riskPerUnit * selectedR);
      setProfitTarget(target.toFixed(3)); // Use 3 decimal points for precision
    }
  }, [buyPrice, stopLossPrice, selectedR, isSellMode]);
  
  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (setupRef.current && !setupRef.current.contains(event.target as Node)) {
            setIsSetupDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-calculate setup rating
  useEffect(() => {
    if (isSellMode) return;
    const selectionCount = buyReason.length;
    if (selectionCount >= 3) setSetupRating('S');
    else if (selectionCount === 2) setSetupRating('A+');
    else if (selectionCount === 1) setSetupRating('A');
    else setSetupRating('A+');
  }, [buyReason, isSellMode]);


  // ===== Calculations for new Buy Form =====
  const riskMultiplier = useMemo(() => {
    if (setupRating === 'S') return 2;
    if (setupRating === 'A') return 0.5;
    return 1;
  }, [setupRating]);

  const tradeRiskAmount = useMemo(() => baseRiskAmount * riskMultiplier, [baseRiskAmount, riskMultiplier]);

  const riskPerUnit = useMemo(() => {
    const buy = parseFloat(buyPrice);
    const sl = parseFloat(stopLossPrice);
    if (buy > 0 && sl > 0 && buy > sl) return buy - sl;
    return 0;
  }, [buyPrice, stopLossPrice]);

  const rewardPerUnit = useMemo(() => {
    const buy = parseFloat(buyPrice);
    const pt = parseFloat(profitTarget);
    if (buy > 0 && pt > 0 && pt > buy) return pt - buy;
    return 0;
  }, [buyPrice, profitTarget]);

  const riskRewardRatio = useMemo(() => {
    if (riskPerUnit > 0 && rewardPerUnit > 0) {
      return rewardPerUnit / riskPerUnit;
    }
    return 0;
  }, [riskPerUnit, rewardPerUnit]);

  const stopLossPercentage = useMemo(() => {
    const buy = parseFloat(buyPrice);
    if (riskPerUnit > 0 && buy > 0) return (riskPerUnit / buy) * 100;
    return 0;
  }, [riskPerUnit, buyPrice]);

  const profitTargetPercentage = useMemo(() => {
    const buy = parseFloat(buyPrice);
    const pt = parseFloat(profitTarget);
    if (buy > 0 && pt > 0 && pt > buy) {
      return ((pt - buy) / buy) * 100;
    }
    return 0;
  }, [buyPrice, profitTarget]);

  const calculatedLotSizeForNewTrade = useMemo(() => {
    if (tradeRiskAmount > 0 && riskPerUnit > 0) {
      return Math.round(tradeRiskAmount / (riskPerUnit * 100));
    }
    return 0;
  }, [tradeRiskAmount, riskPerUnit]);
  
  // Sync calculated lot size to state for new trades only
  useEffect(() => {
    if (!isEditing) {
      setLotSize(calculatedLotSizeForNewTrade > 0 ? calculatedLotSizeForNewTrade : '');
    }
  }, [calculatedLotSizeForNewTrade, isEditing]);
  
  const totalBuyPrice = useMemo(() => {
    const price = parseFloat(buyPrice);
    const lots = parseInt(String(lotSize), 10);
    if (!isNaN(price) && price > 0 && !isNaN(lots) && lots > 0) {
      return price * lots * 100;
    }
    return 0;
  }, [buyPrice, lotSize]);
  
  // ===== End Buy Form Calculations =====

  const remainingLots = useMemo(() => {
    if (!positionToSellFrom) return 0;
    const totalLotsBought = positionToSellFrom.buys.reduce((acc, b) => acc + b.lotSize, 0);
    let lotsSold = positionToSellFrom.sells.reduce((acc, s) => acc + s.lotSize, 0);
    // If editing a sell, don't count its lots as already sold
    if (isEditing && transactionToEdit?.type === 'sell') {
      lotsSold -= (transactionToEdit.transaction as SellTransaction).lotSize;
    }
    return totalLotsBought - lotsSold;
  }, [positionToSellFrom, transactionToEdit, isEditing]);
  
  useEffect(() => {
    if (isSellMode && !isEditing) setSellDate(new Date().toISOString().split('T')[0]);
    else if (!isSellMode && !isEditing) setBuyDate(new Date().toISOString().split('T')[0]);
  }, [isSellMode, isEditing]);
  
  const totalSellPrice = useMemo(() => {
    const price = parseFloat(sellPrice);
    const lots = parseInt(sellLotSize, 10);
    if (!isNaN(price) && price >= 0 && !isNaN(lots) && lots > 0) return price * lots * 100;
    return 0;
  }, [sellPrice, sellLotSize]);

  const validate = () => {
    const newErrors: Partial<Record<string, string>> = {};
    if (isSellMode) {
      const sellLotsNum = parseInt(sellLotSize, 10);
      if (!sellLotSize || isNaN(sellLotsNum) || sellLotsNum <= 0) {
        newErrors.sellLotSize = 'A valid positive lot size is required.';
      } else if (sellLotsNum > remainingLots) {
        newErrors.sellLotSize = `Cannot sell more than available lots (${remainingLots}).`;
      }
      if (!sellPrice || isNaN(parseFloat(sellPrice)) || parseFloat(sellPrice) <= 0) {
        newErrors.sellPrice = 'A valid positive sell price is required.';
      }
      if (!sellDate) newErrors.sellDate = 'Sell date is required.';
      if (!sellReason) newErrors.sellReason = 'A sell reason must be selected.';
    } else { // Validation for a new buy
      if (!ticker) newErrors.ticker = 'Ticker symbol is required.';
      const buyPriceNum = parseFloat(buyPrice);
      const stopLossPriceNum = parseFloat(stopLossPrice);
      const profitTargetNum = parseFloat(profitTarget);

      if (!buyPrice || isNaN(buyPriceNum) || buyPriceNum <= 0) newErrors.buyPrice = 'A valid buy price is required.';
      
      if (profitTarget && (isNaN(profitTargetNum) || profitTargetNum <= 0)) {
        newErrors.profitTarget = 'Profit target must be a valid positive number.';
      } else if (buyPriceNum > 0 && profitTargetNum > 0 && profitTargetNum <= buyPriceNum) {
        newErrors.profitTarget = 'Profit target must be above the buy price.';
      }

      if (!stopLossPrice || isNaN(stopLossPriceNum) || stopLossPriceNum <= 0) newErrors.stopLossPrice = 'A valid stop loss price is required.';
      else if (buyPriceNum > 0 && stopLossPriceNum >= buyPriceNum) newErrors.stopLossPrice = 'Stop loss must be below buy price.';
      
      const lots = parseInt(String(lotSize), 10);
      if (isNaN(lots) || lots <= 0) newErrors.lotSize = 'Lot size must be a positive number.';

      if (!buyDate) newErrors.buyDate = 'Buy date is required.';
      if (buyReason.length === 0) newErrors.buyReason = 'At least one setup must be selected.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    if (isEditing) {
      const { positionId, transaction } = transactionToEdit;
      if (transactionToEdit.type === 'sell') {
        onSave({
          lotSize: parseInt(sellLotSize, 10),
          sellPrice: parseFloat(sellPrice),
          totalSellPrice: totalSellPrice,
          sellDate,
          sellReason: sellReason || null,
          notes: transactionNotes.trim() ? transactionNotes.trim() : null,
          sellChartImage: sellChartImage,
        }, positionId, transaction.id);
      } else { // editing a buy
        onSave({
          lotSize: parseInt(String(lotSize), 10),
          buyPrice: parseFloat(buyPrice),
          profitTarget: profitTarget ? parseFloat(profitTarget) : undefined,
          stopLossPrice: parseFloat(stopLossPrice),
          setupRating,
          totalBuyPrice,
          buyDate,
          buyReason,
          notes: positionNotes.trim() ? positionNotes.trim() : null,
          chartImage: buyChartImage,
        }, positionId, transaction.id);
      }
    } else if (isSellMode) { // Adding a new sell
      onSave({
        lotSize: parseInt(sellLotSize, 10),
        sellPrice: parseFloat(sellPrice),
        totalSellPrice: totalSellPrice,
        sellDate,
        sellReason: sellReason || null,
        notes: transactionNotes.trim() ? transactionNotes.trim() : null,
        sellChartImage: sellChartImage,
      }, positionToSellFrom?.id);
    } else { // Adding a new buy
      onSave({
        ticker: ticker.toUpperCase(),
        lotSize: parseInt(String(lotSize), 10),
        buyPrice: parseFloat(buyPrice),
        profitTarget: profitTarget ? parseFloat(profitTarget) : undefined,
        stopLossPrice: parseFloat(stopLossPrice),
        setupRating,
        totalBuyPrice,
        buyDate,
        buyReason,
        notes: positionNotes.trim() ? positionNotes.trim() : null,
        chartImage: buyChartImage,
      });
    }
  };
  
  const processImageFile = (file: File | null, setter: React.Dispatch<React.SetStateAction<string | null>>, isBuyChart: boolean) => {
      if (!file || !file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          const imageUrl = e.target?.result as string;

          if (!isBuyChart) {
              setter(imageUrl);
              return;
          }

          const img = new Image();
          img.onload = () => {
              const canvas = document.createElement('canvas');
              const targetWidth = 500;
              const targetHeight = 340;
              canvas.width = targetWidth;
              canvas.height = targetHeight;

              const ctx = canvas.getContext('2d');
              if (!ctx) {
                  setter(imageUrl); // Fallback to original image
                  return;
              }
              
              // Stretch the image to fill the canvas, ignoring aspect ratio.
              ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

              const resizedImageUrl = canvas.toDataURL(file.type);
              setter(resizedImageUrl);
          };
          img.onerror = () => {
              setter(imageUrl); // Fallback if image fails to load
          };
          img.src = imageUrl;
      };
      reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string | null>>, isBuyChart: boolean) => {
      const file = e.target.files?.[0];
      processImageFile(file || null, setter, isBuyChart);
      if (e.target) e.target.value = ''; // Reset input
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, setter: React.Dispatch<React.SetStateAction<string | null>>, isBuyChart: boolean) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);
      const file = e.dataTransfer.files?.[0];
      processImageFile(file || null, setter, isBuyChart);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
              const file = items[i].getAsFile();
              processImageFile(file, isSellMode ? setSellChartImage : setBuyChartImage, !isSellMode);
              break; 
          }
      }
  };
  
  const handleSetupTagClick = (event: React.MouseEvent, setupName: string) => {
    event.stopPropagation();
    const customImage = customSetupImages[setupName];
    const setup = buySetups.find(s => s.name === setupName);
    
    if (!setup && !customImage) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const tooltipWidth = 500;
    const tooltipHeight = 400; // Approximate height of the tooltip
    
    let position: 'top' | 'bottom' = 'bottom';
    let top = rect.bottom + window.scrollY + 12; // 12px gap

    // Check if there's enough space below
    if (window.innerHeight - rect.bottom < tooltipHeight) {
        position = 'top';
        top = rect.top + window.scrollY - tooltipHeight - 12; // 12px gap
    }

    // Adjust horizontal position to stay in viewport
    let left = rect.left + window.scrollX + rect.width / 2 - tooltipWidth / 2;
    if (left < 16) left = 16; // 16px padding from left edge
    if (left + tooltipWidth > window.innerWidth - 16) {
        left = window.innerWidth - tooltipWidth - 16; // 16px padding from right edge
    }

    setImageTooltip({
      visible: true,
      ChartComponent: null,
      chartImage: customImage || null,
      name: setupName,
      top,
      left,
      position,
    });
  };

  const handleCloseTooltip = () => {
    setImageTooltip(prev => ({ ...prev, visible: false }));
  };
  
  const inputClasses = "mt-1 block w-full bg-black/30 border-2 border-white/20 rounded-md shadow-sm text-white focus:ring-0 focus:border-brand-accent focus:shadow-[0_0_0_3px_rgba(59,130,246,0.4)] transition-all duration-200 py-2 px-3";

  const filteredSetups = useMemo(() => buySetups.filter(s => !buyReason.includes(s.name) && s.name.toLowerCase().includes(setupSearchTerm.toLowerCase())), [buyReason, setupSearchTerm]);
  const handleAddSetup = (setupName: string) => { setBuyReason(prev => [...prev, setupName]); setSetupSearchTerm(''); };
  const handleRemoveSetup = (setupToRemove: string) => setBuyReason(prev => prev.filter(s => s !== setupToRemove));

  const renderImageTooltip = () => {
    const { visible, ChartComponent, chartImage, name, top, left, position } = imageTooltip;
    if (!visible || (!ChartComponent && !chartImage)) return null;

    const animationStyle = { '--tooltip-translate-y': position === 'bottom' ? '10px' : '-10px' } as React.CSSProperties;

    return (
      <div className="fixed inset-0 z-[55]" onClick={handleCloseTooltip}>
        <div
          className="fixed z-[60] bg-brand-surface/80 backdrop-blur-sm border border-white/10 rounded-lg shadow-2xl w-[500px] max-w-[95vw] animate-tooltip-pop"
          style={{ top: `${top}px`, left: `${left}px`, ...animationStyle }}
          onClick={e => e.stopPropagation()}
        >
          {/* Arrow / Beak */}
          <div className={`absolute w-4 h-4 bg-brand-surface/80 border-t border-l border-white/10 transform rotate-45 ${
            position === 'bottom' ? '-top-2' : '-bottom-2'
          }`} style={{ left: 'calc(50% - 8px)'}} />
          
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center p-3 border-b border-white/10 bg-black/20 rounded-t-lg">
                <h4 className="font-semibold text-white text-sm pr-2">{name.split(': ')[1] || name}</h4>
                <button onClick={handleCloseTooltip} className="p-1 rounded-full text-brand-text-secondary hover:bg-white/10 flex-shrink-0" aria-label="Close image tooltip">
                    <CloseIcon className="h-5 w-5"/>
                </button>
            </div>
            {/* Content */}
            <div className="p-3">
              <div className="rounded-md w-full bg-black/30 p-2 h-[340px]">
                {chartImage ? <img src={chartImage} alt={name} className="w-full h-full object-contain" /> : ChartComponent && <ChartComponent />}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBuyForm = () => {
    const gliderClass = { 'S': 'translate-x-0', 'A+': 'translate-x-full', 'A': 'translate-x-[200%]' }[setupRating];
    const calcBoxBase = "p-2 rounded-md text-center bg-black/30";
    const calcLabel = "text-xs text-slate-400 block";
    const calcValue = "font-semibold text-white text-lg";
    const riskValue = "font-semibold text-brand-accent text-lg";

    return (
      <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
          {/* ===== LEFT COLUMN ===== */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label htmlFor="ticker" className="block text-sm font-medium text-brand-text-secondary">Ticker Symbol</label>
                <input type="text" id="ticker" value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())} className={inputClasses} placeholder="e.g., MSFT" />
                {errors.ticker && <p className="text-red-400 text-xs mt-1">{errors.ticker}</p>}
              </div>
              <div>
                <label htmlFor="buyDate" className="block text-sm font-medium text-brand-text-secondary">Buy Date</label>
                 <div className="relative">
                  <input type="date" id="buyDate" value={buyDate} onChange={e => setBuyDate(e.target.value)} className={`${inputClasses} pr-24`} />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                     <button type="button" onClick={() => setBuyDate(new Date().toISOString().split('T')[0])} className="text-xs font-semibold text-brand-accent hover:text-cyan-400 px-2 pointer-events-auto">TODAY</button>
                     <CalendarIcon className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
                {errors.buyDate && <p className="text-red-400 text-xs mt-1">{errors.buyDate}</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-brand-text-secondary">Buy Reason / Setup</label>
              <div className="relative mt-1" ref={setupRef}>
                  <div className={`${inputClasses} flex flex-wrap items-center gap-2 min-h-[46px] cursor-text`} onClick={() => setupRef.current?.querySelector('input')?.focus()}>
                      {buyReason.map(setupName => {
                        const setupObject = buySetups.find(s => s.name === setupName);
                        return (
                          <div key={setupName} className="relative group">
                              <span onClick={(e) => handleSetupTagClick(e, setupName)} role="button" tabIndex={0} className="flex items-center gap-1.5 bg-brand-accent/50 text-white text-xs font-semibold pl-2.5 pr-1.5 py-1 rounded-full animate-fade-in cursor-pointer">
                                  {setupName.split(':')[0]}
                                  <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveSetup(setupName); }} className="text-white/70 hover:text-white bg-white/10 rounded-full" aria-label={`Remove ${setupName}`}><CloseIcon className="h-3 w-3" /></button>
                              </span>
                              <div className="absolute bottom-full mb-2 w-max max-w-xs left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1.5 px-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 shadow-lg whitespace-normal text-center">
                                  {setupName}
                                  {(customSetupImages[setupName]) && <span className="block text-brand-accent/80 text-[10px] mt-1">(Click tag for chart)</span>}
                              </div>
                          </div>
                        )
                      })}
                      <input type="text" value={setupSearchTerm} onChange={e => setSetupSearchTerm(e.target.value)} onFocus={() => setIsSetupDropdownOpen(true)} placeholder={buyReason.length === 0 ? "Click to select setups..." : ""} className="bg-transparent outline-none flex-grow text-white p-0" />
                  </div>
                  {isSetupDropdownOpen && filteredSetups.length > 0 && (
                      <div className="absolute z-20 mt-1 w-full bg-slate-800 border border-white/20 rounded-md shadow-lg max-h-60 overflow-y-auto animate-fade-in">
                          <ul>{filteredSetups.map(setup => (<li key={setup.name} onClick={() => { handleAddSetup(setup.name); setIsSetupDropdownOpen(false); }} className="px-4 py-2 text-sm text-brand-text hover:bg-brand-accent/20 cursor-pointer">{setup.name}</li>))}</ul>
                      </div>
                  )}
              </div>
              {errors.buyReason && <p className="text-red-400 text-xs mt-1">{errors.buyReason}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">Setup Rating (Auto)</label>
                <div className="relative flex bg-black/30 rounded-lg p-1 w-full">
                    <div className={`absolute top-1 bottom-1 left-1 w-1/3 bg-brand-accent rounded-md transition-transform duration-300 ease-in-out shadow-lg shadow-brand-accent/30 ${gliderClass}`} />
                    <div className="relative z-10 flex-1 px-4 py-2 text-sm font-bold text-white text-center">S</div>
                    <div className="relative z-10 flex-1 px-4 py-2 text-sm font-bold text-white text-center">A+</div>
                    <div className="relative z-10 flex-1 px-4 py-2 text-sm font-bold text-white text-center">A</div>
                </div>
                <p className="text-xs text-brand-text-secondary mt-1 text-center">Rating is based on the number of setups selected: 1=A, 2=A+, 3+=S.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label htmlFor="buyPrice" className="block text-sm font-medium text-brand-text-secondary">Buy Price (per unit)</label>
                  <input type="number" step="0.01" id="buyPrice" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} className={inputClasses} />
                  {errors.buyPrice && <p className="text-red-400 text-xs mt-1">{errors.buyPrice}</p>}
                </div>
                <div>
                  <label htmlFor="stopLossPrice" className="block text-sm font-medium text-brand-text-secondary flex justify-between items-baseline">
                    <span>Stop Loss Price</span>
                    {stopLossPercentage > 0 && (
                      <span className="text-xs font-mono text-brand-loss">(-{stopLossPercentage.toFixed(2)}%)</span>
                    )}
                  </label>
                  <input type="number" step="0.01" id="stopLossPrice" value={stopLossPrice} onChange={e => setStopLossPrice(e.target.value)} className={inputClasses} />
                  {errors.stopLossPrice && <p className="text-red-400 text-xs mt-1">{errors.stopLossPrice}</p>}
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="profitTarget" className="block text-sm font-medium text-brand-text-secondary flex justify-between items-baseline">
                        <span>Profit Target & R:R</span>
                        {profitTargetPercentage > 0 && (
                            <span className="text-xs font-mono text-brand-profit">(+{profitTargetPercentage.toFixed(2)}%)</span>
                        )}
                    </label>
                    <div className="mt-1 flex">
                        {[1, 2, 3, 4, 5].map(r => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setSelectedR(r)}
                                className={`relative inline-flex shrink-0 items-center justify-center p-2 w-14 border-2 border-r-0 border-white/20 text-sm font-semibold transition-colors focus:z-10 focus:outline-none focus:ring-2 focus:ring-brand-accent ${r === 1 ? 'rounded-l-md' : ''} ${selectedR === r ? 'bg-brand-accent text-white border-brand-accent z-10' : 'bg-black/40 text-brand-text-secondary hover:bg-white/10'}`}
                            >
                                {r}R
                            </button>
                        ))}
                        <input
                            type="number"
                            step="0.01"
                            id="profitTarget"
                            value={profitTarget}
                            onChange={e => {
                                setProfitTarget(e.target.value);
                                setSelectedR(null);
                            }}
                            className={`${inputClasses} rounded-l-none !mt-0`}
                            placeholder="e.g., 1.250"
                        />
                    </div>
                    {errors.profitTarget && <p className="text-red-400 text-xs mt-1">{errors.profitTarget}</p>}
                </div>
            </div>
          </div>

          {/* ===== RIGHT COLUMN ===== */}
          <div className="space-y-4 flex flex-col">
              <div>
                <label htmlFor="positionNotes" className="block text-sm font-medium text-brand-text-secondary">Notes (Optional)</label>
                <textarea
                  id="positionNotes"
                  value={positionNotes}
                  onChange={e => setPositionNotes(e.target.value)}
                  rows={6}
                  className={inputClasses}
                  placeholder="e.g., Thesis for this trade, market sentiment, potential catalysts..."
                />
              </div>
              <div className="flex-grow flex flex-col">
                <label className="block text-sm font-medium text-brand-text-secondary">Chart Image (Optional)</label>
                <input
                    type="file"
                    ref={buyFileInputRef}
                    onChange={(e) => handleImageUpload(e, setBuyChartImage, true)}
                    accept="image/png, image/jpeg, image/gif"
                    className="hidden"
                />
                <div className="mt-1 flex-grow">
                    {!buyChartImage ? (
                        <div
                            onClick={() => buyFileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, setBuyChartImage, true)}
                            className={`w-full h-full flex flex-col justify-center items-center border-2 border-dashed rounded-md cursor-pointer transition-colors ${isDraggingOver ? 'border-brand-accent bg-brand-accent/10 text-brand-accent' : 'border-white/20 text-brand-text-secondary hover:border-brand-accent hover:text-brand-accent'}`}
                        >
                            <ImageIcon className="h-10 w-10" />
                            <span className="mt-2 text-sm font-semibold">
                                {isDraggingOver ? 'Drop image here' : 'Upload, drag, or paste an image'}
                            </span>
                        </div>
                    ) : (
                        <div 
                            className="relative group h-full"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, setBuyChartImage, true)}
                        >
                            <img src={buyChartImage} alt="Chart preview" className="w-full h-full object-fill rounded-md bg-black/20" />
                            <div className={`absolute inset-0 bg-black/60 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity ${isDraggingOver ? '!opacity-100' : ''}`}>
                                 {isDraggingOver && <span className="text-white font-bold text-lg">Drop to replace</span>}
                                 {!isDraggingOver && (
                                    <button type="button" onClick={() => setBuyChartImage(null)} className="p-2 text-brand-text-secondary hover:text-brand-loss bg-brand-surface/80 rounded-full">
                                        <TrashIcon />
                                    </button>
                                 )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>
        <div className="mt-6">
            <div className="bg-black/25 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-brand-text-secondary mb-3 text-center">Position Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                   <div key={`trade-risk-${tradeRiskAmount}-${setupRating}`} className={`${calcBoxBase} animate-value-flash`}>
                      <span className={calcLabel}>Risk ({setupRating})</span>
                      <p className={riskValue}>RM{tradeRiskAmount.toFixed(2)}</p>
                  </div>
                   <div key={`rr-ratio-${riskRewardRatio}`} className={`${calcBoxBase} animate-value-flash`}>
                      <span className={calcLabel}>R:R Ratio</span>
                      <p className={`${calcValue} ${riskRewardRatio < 1 ? 'text-brand-loss' : 'text-brand-profit'}`}>{riskRewardRatio > 0 ? `1 : ${riskRewardRatio.toFixed(2)}` : '-'}</p>
                  </div>
                   <div key={`risk-per-unit-${riskPerUnit}`} className={`${calcBoxBase} animate-value-flash`}>
                      <span className={calcLabel}>Risk per Unit</span>
                      <p className={calcValue}>{riskPerUnit > 0 ? riskPerUnit.toFixed(3) : '-'}</p>
                  </div>
                  <div key={`sl-pct-${stopLossPercentage}`} className={`${calcBoxBase} animate-value-flash`}>
                      <span className={calcLabel}>SL %</span>
                      <p className={calcValue}>{stopLossPercentage > 0 ? `${stopLossPercentage.toFixed(2)}%` : '-'}</p>
                  </div>
                  
                  <div className={`${calcBoxBase} bg-brand-accent/20 col-span-2 sm:col-span-2 md:col-span-2`}>
                    <label htmlFor="lotSize" className={`${calcLabel} text-cyan-300`}>Lot Size</label>
                     {isEditing ? (
                        <input id="lotSize" type="number" value={lotSize} onChange={e => setLotSize(e.target.value)} className="w-full bg-transparent text-center font-bold text-brand-accent text-xl outline-none" />
                     ) : (
                      <p className="font-bold text-brand-accent text-xl">{lotSize || '0'}</p>
                     )}
                  </div>

                  <div key={`total-buy-${totalBuyPrice}`} className={`${calcBoxBase} animate-value-flash col-span-2 sm:col-span-3 md:col-span-6`}>
                      <span className={calcLabel}>Total Buy Price</span>
                      <p className={`${calcValue} text-lg`}>RM{totalBuyPrice.toFixed(2)}</p>
                  </div>
                  {errors.lotSize && <p className="text-red-400 text-xs mt-1 col-span-full text-center">{errors.lotSize}</p>}
              </div>
            </div>
        </div>
      </>
    );
  };

  const renderSellForm = () => {
      const sellReasonGliderClass = { 'TP': 'translate-x-0', 'Cut Loss': 'translate-x-full', '': 'opacity-0' }[sellReason];

      return (
        <>
          <div className="bg-black/30 p-3 rounded-md mb-4">
              <h3 className="text-lg font-bold text-white">{positionToSellFrom?.ticker.toUpperCase()}</h3>
              <p className="text-sm text-brand-text-secondary">Avg. Buy Price: RM{avgBuyPrice.toFixed(3)}</p>
              <p className="text-base font-semibold text-yellow-400 mt-1">{remainingLots} {remainingLots === 1 ? 'lot' : 'lots'} available</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
            {/* Left Column */}
            <div className="flex flex-col h-full space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sellLotSize" className="block text-sm font-medium text-brand-text-secondary">Sell Lot Size</label>
                  <div className="relative mt-1">
                    <input type="number" id="sellLotSize" value={sellLotSize} onChange={e => setSellLotSize(e.target.value)} min="1" max={remainingLots} className={`${inputClasses} pr-28`} />
                    <div className="absolute inset-y-0 right-0 flex items-center divide-x divide-white/20">
                         <button type="button" onClick={() => {
                                const halfLots = Math.floor(remainingLots / 2);
                                if (halfLots > 0) setSellLotSize(halfLots.toString());
                            }} className="px-3 text-xs font-bold text-brand-accent hover:text-cyan-400" aria-label="Set half sell lot size">1/2</button>
                        <button type="button" onClick={() => setSellLotSize(remainingLots.toString())} className="px-3 text-xs font-bold text-brand-accent hover:text-cyan-400" aria-label="Set maximum sell lot size">MAX</button>
                    </div>
                  </div>
                  {errors.sellLotSize && <p className="text-red-400 text-xs mt-1">{errors.sellLotSize}</p>}
                </div>
                <div>
                  <label htmlFor="sellPrice" className="block text-sm font-medium text-brand-text-secondary">Sell Price (per unit)</label>
                  <input type="number" id="sellPrice" value={sellPrice} onChange={e => setSellPrice(e.target.value)} step="0.01" className={inputClasses} />
                  {errors.sellPrice && <p className="text-red-400 text-xs mt-1">{errors.sellPrice}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="sellDate" className="block text-sm font-medium text-brand-text-secondary">Sell Date</label>
                <div className="relative">
                    <input type="date" id="sellDate" value={sellDate} onChange={e => setSellDate(e.target.value)} className={`${inputClasses} pr-24`} />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <button type="button" onClick={() => setSellDate(new Date().toISOString().split('T')[0])} className="text-xs font-semibold text-brand-accent hover:text-cyan-400 px-2 pointer-events-auto">TODAY</button>
                        <CalendarIcon className="h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                {errors.sellDate && <p className="text-red-400 text-xs mt-1">{errors.sellDate}</p>}
              </div>
              <div className="flex-grow" />
              <div>
                <label className="block text-sm font-medium text-brand-text-secondary">Total Sell Amount</label>
                <div className={`mt-1 text-2xl font-semibold text-brand-accent bg-black/40 px-3 py-4 rounded-md ${!sellPrice ? 'opacity-50' : ''}`}>RM{totalSellPrice.toFixed(2)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">Sell Reason</label>
                <div className="relative flex bg-black/30 rounded-lg p-1 w-full">
                    <div className={`absolute top-1 bottom-1 left-1 w-1/2 bg-brand-accent rounded-md transition-all duration-300 ease-in-out shadow-lg shadow-brand-accent/30 ${sellReasonGliderClass}`} />
                    <button type="button" onClick={() => setSellReason('TP')} className="relative z-10 flex-1 px-4 py-2 text-sm font-semibold text-white">TP</button>
                    <button type="button" onClick={() => setSellReason('Cut Loss')} className="relative z-10 flex-1 px-4 py-2 text-sm font-semibold text-white">Cut Loss</button>
                </div>
                {errors.sellReason && <p className="text-red-400 text-xs mt-1">{errors.sellReason}</p>}
              </div>
            </div>
            {/* Right Column */}
            <div className="space-y-4 flex flex-col">
                <div className="flex-grow flex flex-col">
                  <label className="block text-sm font-medium text-brand-text-secondary">Sell Chart (Optional)</label>
                  <input
                      type="file"
                      ref={sellFileInputRef}
                      onChange={(e) => handleImageUpload(e, setSellChartImage, false)}
                      accept="image/png, image/jpeg, image/gif"
                      className="hidden"
                  />
                  <div className="mt-1 flex-grow">
                      {!sellChartImage ? (
                          <div
                              onClick={() => sellFileInputRef.current?.click()}
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, setSellChartImage, false)}
                              className={`w-full h-full flex flex-col justify-center items-center border-2 border-dashed rounded-md cursor-pointer transition-colors min-h-[12rem] ${isDraggingOver ? 'border-brand-accent bg-brand-accent/10 text-brand-accent' : 'border-white/20 text-brand-text-secondary hover:border-brand-accent hover:text-brand-accent'}`}
                          >
                              <ImageIcon className="h-10 w-10" />
                              <span className="mt-2 text-sm font-semibold">
                                  {isDraggingOver ? 'Drop image here' : 'Upload, drag, or paste'}
                              </span>
                          </div>
                      ) : (
                          <div 
                              className="relative group h-full"
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, setSellChartImage, false)}
                          >
                              <img src={sellChartImage} alt="Sell chart preview" className="w-full h-full object-fill rounded-md bg-black/20" />
                              <div className={`absolute inset-0 bg-black/60 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity ${isDraggingOver ? '!opacity-100' : ''}`}>
                                   {isDraggingOver && <span className="text-white font-bold text-lg">Drop to replace</span>}
                                   {!isDraggingOver && (
                                      <button type="button" onClick={() => setSellChartImage(null)} className="p-2 text-brand-text-secondary hover:text-brand-loss bg-brand-surface/80 rounded-full">
                                          <TrashIcon />
                                      </button>
                                   )}
                              </div>
                          </div>
                      )}
                  </div>
                </div>
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-brand-text-secondary">Notes / Lesson Learnt (Optional)</label>
                  <textarea
                    id="notes"
                    value={transactionNotes}
                    onChange={e => setTransactionNotes(e.target.value)}
                    rows={4}
                    className={inputClasses}
                    placeholder="e.g., Should have taken profit earlier based on resistance..."
                  />
                </div>
            </div>
          </div>
        </>
      )
  };

  const modalTitle = `${isEditing ? 'Edit' : 'Add'} ${isSellMode ? 'Sell Transaction' : 'New Trade'}`;
  const saveButtonText = `${isEditing ? 'Update' : 'Save'} ${isSellMode ? 'Sell' : 'Trade'}`;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={onClose}>
      {renderImageTooltip()}
      <div 
        className={`bg-brand-surface rounded-lg shadow-2xl p-6 w-full ${isSellMode ? 'max-w-3xl' : 'max-w-4xl'} m-4 animate-slide-up-fade border border-white/10 max-h-[95vh] overflow-y-auto`} 
        onClick={e => e.stopPropagation()}
        onPaste={handlePaste}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="modal-title" className="text-2xl font-bold text-white">{modalTitle}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-brand-text-secondary hover:bg-white/10" aria-label="Close modal">
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          
          {isSellMode ? renderSellForm() : renderBuyForm()}

          <div className="flex justify-end pt-6 space-x-3 border-t border-white/10 mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500 transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold rounded-lg shadow-lg transition-all duration-300 hover:shadow-brand-primary/50 transform hover:scale-105">{saveButtonText}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TradeFormModal;