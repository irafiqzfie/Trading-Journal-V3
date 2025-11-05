import React, { useMemo, useState, useEffect } from 'react';
import { Position } from '../types';
import { TrashIcon, PencilIcon, ChevronDownIcon, DollarIcon, ImageIcon, CloseIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';
import { getPositionStats } from '../utils/tradeCalculations';

interface TradeItemProps {
  position: Position;
  onDelete: (id: string) => void;
  onSell: (position: Position) => void;
  onEdit: (positionId: string, transactionId: string, type: 'buy' | 'sell') => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const ImageModal = ({ src, onClose }: { src: string; onClose: () => void; }) => (
    <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300 animate-fade-in" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-4xl max-h-[90vh] p-4" onClick={e => e.stopPropagation()}>
        <img src={src} alt="Trade chart" className="w-full h-full object-contain rounded-lg shadow-2xl" />
        <button onClick={onClose} className="absolute -top-1 -right-1 p-1.5 bg-stone-800/80 backdrop-blur-sm rounded-full text-brand-text-secondary hover:text-white hover:bg-white/10 transition-colors" aria-label="Close image viewer">
          <CloseIcon />
        </button>
      </div>
    </div>
);

const TradeItem: React.FC<TradeItemProps> = ({ position, onDelete, onSell, onEdit, isExpanded, onToggleExpand }) => {
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const [currentBuyTxIndex, setCurrentBuyTxIndex] = useState(0);
  const [currentSellTxIndex, setCurrentSellTxIndex] = useState(0);
  
  const { isClosed, realizedPL } = useMemo(() => getPositionStats(position), [position]);

  const totalLotsBought = position.buys.reduce((sum, buy) => sum + buy.lotSize, 0);
  const totalBuyValue = position.buys.reduce((sum, buy) => sum + buy.totalBuyPrice, 0);
  const avgBuyPrice = totalLotsBought > 0 ? totalBuyValue / (totalLotsBought * 100) : 0;
  
  const totalLotsSold = position.sells.reduce((sum, sell) => sum + sell.lotSize, 0);
  const remainingLots = totalLotsBought - totalLotsSold;
  
  const isProfit = realizedPL >= 0;

  const totalSellValue = position.sells.reduce((sum, sell) => sum + sell.totalSellPrice, 0);
  const averageSellPrice = totalLotsSold > 0 ? totalSellValue / (totalLotsSold * 100) : null;
  const costOfLotsSold = avgBuyPrice * totalLotsSold * 100;
  const percentagePL = costOfLotsSold > 0 ? (realizedPL / costOfLotsSold) * 100 : 0;

  const { statusText, statusDate } = useMemo(() => {
    if (isClosed) {
        const latestSellDate = position.sells.reduce((latest, sell) => {
            const currentDate = new Date(sell.sellDate);
            if (isNaN(currentDate.getTime())) return latest;
            return currentDate > latest ? currentDate : latest;
        }, new Date(0));

        if (latestSellDate.getTime() > 0) {
             return { 
                 statusText: 'Closed',
                 statusDate: latestSellDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
             };
        }
        return { statusText: 'Closed', statusDate: null };
    }
    return { statusText: 'Open', statusDate: null };
  }, [isClosed, position.sells]);

  const plColor = position.sells.length === 0 ? 'text-brand-text-secondary' : isProfit ? 'text-brand-profit' : 'text-brand-loss';
  const plSign = isProfit ? '+' : '';
  const statusColor = isClosed ? "bg-gray-500/20 text-gray-300" : "bg-yellow-500/20 text-yellow-300";

  const sortedBuys = useMemo(() => 
    [...position.buys].sort((a, b) => new Date(a.buyDate).getTime() - new Date(b.buyDate).getTime()), 
    [position.buys]
  );
  
  const sortedSells = useMemo(() => 
    [...position.sells].sort((a, b) => new Date(a.sellDate).getTime() - new Date(b.sellDate).getTime()), 
    [position.sells]
  );

  const buyChartImagesWithIndex = useMemo(() =>
    sortedBuys
      .map((b, index) => ({ img: b.buyChartImage, txIndex: index }))
      .filter((item): item is { img: string; txIndex: number } => !!item.img),
    [sortedBuys]
  );
  const sellChartImagesWithIndex = useMemo(() =>
    sortedSells
      .map((s, index) => ({ img: s.sellChartImage, txIndex: index }))
      .filter((item): item is { img: string; txIndex: number } => !!item.img),
    [sortedSells]
  );
  
  const [currentBuyImageIndex, setCurrentBuyImageIndex] = useState(0);
  const [currentSellImageIndex, setCurrentSellImageIndex] = useState(0);

  const navigateTx = (
    direction: 'next' | 'prev',
    currentIndex: number,
    maxIndex: number,
    setCurrentIndex: (index: number) => void,
    imagesWithIndex: { txIndex: number }[],
    setCurrentImagetIndex: (index: number) => void,
    transactions: { id: string, buyChartImage?: any, sellChartImage?: any }[]
  ) => {
      const newIndex = direction === 'next'
          ? Math.min(currentIndex + 1, maxIndex)
          : Math.max(currentIndex - 1, 0);

      if (newIndex === currentIndex) return;

      setCurrentIndex(newIndex);
      
      const chartImageProp = 'buyChartImage' in transactions[0] ? 'buyChartImage' : 'sellChartImage';
      const hasImage = transactions[newIndex]?.[chartImageProp];
      if (hasImage) {
          const newImageIndex = imagesWithIndex.findIndex(item => item.txIndex === newIndex);
          if (newImageIndex !== -1) {
              setCurrentImagetIndex(newImageIndex);
          }
      }
  };
  
  const navigateImage = (
    direction: 'next' | 'prev',
    currentIndex: number,
    maxIndex: number,
    setCurrentIndex: (index: number) => void,
    imagesWithIndex: { txIndex: number }[],
    setCurrentTxIndex: (index: number) => void
  ) => {
      if (imagesWithIndex.length === 0) return;
      const newIndex = direction === 'next'
          ? Math.min(currentIndex + 1, maxIndex)
          : Math.max(currentIndex - 1, 0);
      
      if (newIndex === currentIndex) return;
      
      setCurrentIndex(newIndex);

      const newTxIndex = imagesWithIndex[newIndex]?.txIndex;
      if (newTxIndex !== undefined) {
          setCurrentTxIndex(newTxIndex);
      }
  };
  
  useEffect(() => {
    setCurrentBuyTxIndex(0);
    setCurrentBuyImageIndex(0);
  }, [position.id]);

  useEffect(() => {
    setCurrentSellTxIndex(0);
    setCurrentSellImageIndex(0);
  }, [position.id]);

  const gradientColor = useMemo(() => {
    if (position.sells.length === 0) {
      return 'from-orange-500 to-amber-500';
    }
    return isProfit ? 'from-green-500/70 to-teal-400/70' : 'from-red-600/70 to-rose-500/70';
  }, [position.sells, isProfit]);

  return (
    <>
      {modalImageUrl && (
        <ImageModal src={modalImageUrl} onClose={() => setModalImageUrl(null)} />
      )}
      <div className="bg-stone-900/60 backdrop-blur-lg border border-stone-400/20 rounded-lg shadow-lg transition-all duration-300 ease-in-out relative overflow-hidden group hover:shadow-2xl hover:border-brand-accent/50 hover:-translate-y-1">
        <div className={`absolute top-0 left-0 h-full w-1.5 bg-gradient-to-b ${gradientColor} transition-all duration-500 group-hover:w-2.5`}></div>
        
        <div className="p-4 pl-6">
          <div className="flex items-center justify-between gap-4">
            
            {/* Left Part: Ticker & Status */}
            <div className="flex items-center gap-4">
              <div>
                <button onClick={onToggleExpand} aria-expanded={isExpanded} className="flex items-center gap-2 group/ticker">
                  <h3 className="text-2xl font-bold text-white truncate group-hover/ticker:text-brand-accent transition-colors">{position.ticker.toUpperCase()}</h3>
                  <ChevronDownIcon className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                <div className="mt-1">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColor}`}>
                    {statusText}{statusDate && ` ${statusDate}`}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Middle Part: Metrics (hidden on small screens) */}
            <div className="hidden md:flex items-center gap-x-6 text-sm">
              <div className="text-center">
                <p className="text-brand-text-secondary">Avg. Buy</p>
                <p className="font-semibold text-base text-brand-text">RM{avgBuyPrice.toFixed(3)}</p>
              </div>
              {averageSellPrice && (
                <>
                  <div className="text-xl text-brand-text-secondary/50">&rarr;</div>
                  <div className="text-center">
                    <p className="text-brand-text-secondary">Avg. Sell</p>
                    <p className="font-semibold text-base text-brand-text">RM{averageSellPrice.toFixed(3)}</p>
                  </div>
                </>
              )}
              <div className="border-l h-8 border-white/20"></div>
              <div className="text-center">
                <p className="text-brand-text-secondary">Lots Left</p>
                <p className="text-base font-bold text-white">
                  {remainingLots} <span className="font-normal text-brand-text-secondary">/ {totalLotsBought}</span>
                </p>
              </div>
            </div>
            
            {/* Right Part: P/L and Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-right">
                <p className={`text-2xl font-bold ${plColor} truncate`}>
                  {position.sells.length > 0 ? `${plSign}RM${realizedPL.toFixed(2)}` : 'RM0.00'}
                </p>
                <p className={`text-sm ${plColor}`}>
                    {position.sells.length > 0 ? `(${plSign}${percentagePL.toFixed(2)}%)` : ''}
                </p>
              </div>

              {!isClosed && (
                <button
                    onClick={() => onSell(position)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-brand-secondary text-white text-base font-bold rounded-lg shadow-md transition-all duration-300 hover:bg-orange-600 transform hover:scale-105"
                    aria-label={`Sell from ${position.ticker}`}
                >
                    <DollarIcon className="h-6 w-6" />
                    <span className="hidden sm:inline">Sell</span>
                </button>
              )}

              <div className="self-center">
                <button
                  onClick={() => onDelete(position.id)}
                  className="p-1.5 text-brand-text-secondary hover:text-brand-loss rounded-full transition-colors duration-200"
                  aria-label={`Delete position for ${position.ticker}`}
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
            
          </div>
        </div>

        {isExpanded && (
           <div className="mt-2 pt-4 border-t border-white/10 animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-2">
              {/* BUY SECTION */}
              <div className="bg-green-500/5 rounded-lg border border-green-500/10 p-3">
                  <div className="grid grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)] gap-6">
                      {/* Column 1: Buy Chart */}
                      <div>
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                          <ImageIcon className="h-4 w-4" /> Buy Charts
                        </h4>
                        <div className="h-[150px] w-full relative group bg-black/20 rounded-md">
                          {buyChartImagesWithIndex.length > 0 ? (
                            <>
                              <img
                                src={buyChartImagesWithIndex[currentBuyImageIndex].img}
                                alt={`Buy chart ${currentBuyImageIndex + 1}`}
                                className="rounded-md object-fill w-full h-full cursor-pointer shadow-lg"
                                onClick={() => setModalImageUrl(buyChartImagesWithIndex[currentBuyImageIndex].img)}
                              />
                              {buyChartImagesWithIndex.length > 1 && (
                                <>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); navigateImage('prev', currentBuyImageIndex, 0, setCurrentBuyImageIndex, buyChartImagesWithIndex, setCurrentBuyTxIndex); }}
                                    className="absolute top-1/2 left-2 -translate-y-1/2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 focus:opacity-100 z-10 disabled:opacity-20"
                                    aria-label="Previous image"
                                    disabled={currentBuyImageIndex === 0}
                                  >
                                    <ChevronLeftIcon />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); navigateImage('next', currentBuyImageIndex, buyChartImagesWithIndex.length - 1, setCurrentBuyImageIndex, buyChartImagesWithIndex, setCurrentBuyTxIndex); }}
                                    className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 focus:opacity-100 z-10 disabled:opacity-20"
                                    aria-label="Next image"
                                    disabled={currentBuyImageIndex === buyChartImagesWithIndex.length - 1}
                                  >
                                    <ChevronRightIcon />
                                  </button>
                                  <div className="absolute top-2 right-2 px-2 py-0.5 text-xs font-mono bg-black/60 text-white rounded-md pointer-events-none">
                                    {currentBuyImageIndex + 1} / {buyChartImagesWithIndex.length}
                                  </div>
                                </>
                              )}
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center p-4 text-center text-brand-text-secondary text-xs border border-dashed border-white/10 rounded-md">
                              No buy charts uploaded.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Column 2: Buy Data & Notes */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-2">Buy Transactions</h4>
                          <div className="h-[150px] relative">
                            {sortedBuys.length > 0 ? (() => {
                                const buy = sortedBuys[currentBuyTxIndex];
                                return (
                                  <div key={buy.id} className="bg-black/30 p-3 rounded-lg border border-white/5 group relative h-full flex flex-col justify-between animate-fade-in">
                                    <div className="flex-grow flex flex-col justify-between">
                                        <div>
                                          <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3 font-mono">
                                              <span className="font-bold text-sm px-2 py-0.5 rounded bg-green-500/20 text-brand-profit">BUY</span>
                                              <span className="text-xs text-brand-text-secondary">{new Date(buy.buyDate).toLocaleDateString()}</span>
                                            </div>
                                            <button onClick={() => onEdit(position.id, buy.id, 'buy')} className="p-1 text-brand-text-secondary hover:text-brand-accent rounded-full transition-colors duration-200 opacity-0 group-hover:opacity-100 absolute top-2 right-2" aria-label="Edit buy transaction">
                                              <PencilIcon />
                                            </button>
                                          </div>
                                          <div className="flex justify-between items-baseline mt-2">
                                            <p className="text-white text-lg font-semibold">{buy.lotSize} lots @ RM{buy.buyPrice.toFixed(3)}</p>
                                            <p className="text-white text-xl font-bold">RM{buy.totalBuyPrice.toFixed(2)}</p>
                                          </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-brand-text-secondary text-sm">
                                              <span className="font-bold text-white bg-brand-secondary/50 px-2.5 py-1 rounded-full text-xs">Rating: {buy.setupRating}</span>
                                              {buy.profitTarget && <p>TP: <span className="font-mono font-semibold text-brand-profit">RM{buy.profitTarget.toFixed(3)}</span></p>}
                                              {buy.stopLossPrice && <p>SL: <span className="font-mono font-semibold text-brand-loss">RM{buy.stopLossPrice.toFixed(3)}</span></p>}
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 items-center">
                                              {buy.buyReason.map(reason => <span key={reason} className="text-xs font-semibold bg-brand-accent/20 text-brand-accent px-2 py-1 rounded">{reason.split(':')[0]}</span>)}
                                            </div>
                                            {buy.notes && (
                                                <p className="text-xs text-brand-text-secondary truncate" title={buy.notes}>
                                                    <span className="font-semibold text-white/80">Notes:</span> {buy.notes.replace(/\n/g, " ")}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {sortedBuys.length > 1 && (
                                        <div className="absolute -bottom-1 right-1 flex items-center gap-1">
                                          <button onClick={() => navigateTx('prev', currentBuyTxIndex, 0, setCurrentBuyTxIndex, buyChartImagesWithIndex, setCurrentBuyImageIndex, sortedBuys)} disabled={currentBuyTxIndex === 0} className="p-1 bg-black/50 text-white rounded-full transition hover:bg-black/80 disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Previous buy transaction"><ChevronLeftIcon /></button>
                                          <span className="text-xs font-mono text-brand-text-secondary">{currentBuyTxIndex + 1}/{sortedBuys.length}</span>
                                          <button onClick={() => navigateTx('next', currentBuyTxIndex, sortedBuys.length - 1, setCurrentBuyTxIndex, buyChartImagesWithIndex, setCurrentBuyImageIndex, sortedBuys)} disabled={currentBuyTxIndex === sortedBuys.length - 1} className="p-1 bg-black/50 text-white rounded-full transition hover:bg-black/80 disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Next buy transaction"><ChevronRightIcon /></button>
                                        </div>
                                    )}
                                  </div>
                                );
                            })() : (
                              <div className="w-full h-full flex items-center justify-center p-4 text-center text-brand-text-secondary text-xs border border-dashed border-white/10 rounded-md">
                                No buy transactions.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                  </div>
              </div>


              {/* SELL SECTION */}
               <div className="bg-red-500/5 rounded-lg border border-red-500/10 grid grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)] gap-6 p-3">
                  {/* Column 3: Sell Chart */}
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                      <ImageIcon className="h-4 w-4" /> Sell Charts
                    </h4>
                    <div className="h-[150px] w-full relative group bg-black/20 rounded-md">
                      {sellChartImagesWithIndex.length > 0 ? (
                        <>
                          <img
                            src={sellChartImagesWithIndex[currentSellImageIndex].img}
                            alt={`Sell chart ${currentSellImageIndex + 1}`}
                            className="rounded-md object-fill w-full h-full cursor-pointer shadow-lg"
                            onClick={() => setModalImageUrl(sellChartImagesWithIndex[currentSellImageIndex].img)}
                          />
                          {sellChartImagesWithIndex.length > 1 && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); navigateImage('prev', currentSellImageIndex, 0, setCurrentSellImageIndex, sellChartImagesWithIndex, setCurrentSellTxIndex); }}
                                className="absolute top-1/2 left-2 -translate-y-1/2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 focus:opacity-100 z-10 disabled:opacity-20"
                                aria-label="Previous image"
                                disabled={currentSellImageIndex === 0}
                              >
                                <ChevronLeftIcon />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); navigateImage('next', currentSellImageIndex, sellChartImagesWithIndex.length - 1, setCurrentSellImageIndex, sellChartImagesWithIndex, setCurrentSellTxIndex); }}
                                className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 focus:opacity-100 z-10 disabled:opacity-20"
                                aria-label="Next image"
                                disabled={currentSellImageIndex === sellChartImagesWithIndex.length - 1}
                              >
                                <ChevronRightIcon />
                              </button>
                              <div className="absolute top-2 right-2 px-2 py-0.5 text-xs font-mono bg-black/60 text-white rounded-md pointer-events-none">
                                {currentSellImageIndex + 1} / {sellChartImagesWithIndex.length}
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-4 text-center text-brand-text-secondary text-xs border border-dashed border-white/10 rounded-md">
                          No sell charts uploaded.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column 4: Sell Data */}
                  <div>
                    <h4 className="flex justify-between items-center text-sm font-semibold text-white mb-2">
                      <span>Sell Transactions</span>
                    </h4>
                    <div className="h-[150px] relative">
                      {sortedSells.length > 0 ? (() => {
                          const sell = sortedSells[currentSellTxIndex];
                          const costOfLots = avgBuyPrice * sell.lotSize * 100;
                          const pl = sell.totalSellPrice - costOfLots;
                          return (
                            <div key={sell.id} className="bg-black/30 p-3 rounded-lg border border-white/5 group relative h-full flex flex-col justify-between animate-fade-in">
                              <div className="flex-grow flex flex-col justify-between">
                                {/* Top Section */}
                                <div>
                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center gap-3 font-mono">
                                        <span className="font-bold text-sm px-2 py-0.5 rounded bg-red-500/20 text-brand-loss">SELL</span>
                                        <span className="text-xs text-brand-text-secondary">{new Date(sell.sellDate).toLocaleDateString()}</span>
                                      </div>
                                      <button onClick={() => onEdit(position.id, sell.id, 'sell')} className="p-1 text-brand-text-secondary hover:text-brand-accent rounded-full transition-colors duration-200 opacity-0 group-hover:opacity-100 absolute top-2 right-2" aria-label="Edit sell transaction">
                                        <PencilIcon />
                                      </button>
                                    </div>
                                    <div className="flex justify-between items-baseline mt-2">
                                      <p className="text-white text-lg font-semibold">{sell.lotSize} lots @ RM{sell.sellPrice.toFixed(3)}</p>
                                      <p className="text-white text-xl font-bold">RM{sell.totalSellPrice.toFixed(2)}</p>
                                    </div>
                                </div>
                                {/* Bottom Section */}
                                <div>
                                    <p className={`text-2xl font-bold ${pl >= 0 ? 'text-brand-profit' : 'text-brand-loss'}`}>
                                      P/L: RM{pl.toFixed(2)}
                                    </p>
                                    {sell.notes && (
                                      <p className="text-sm text-brand-text-secondary mt-1 truncate" title={sell.notes}>
                                        <span className="font-semibold">Lesson:</span> {sell.notes}
                                      </p>
                                    )}
                                </div>
                              </div>
                              {sortedSells.length > 1 && (
                                <div className="absolute -bottom-1 right-1 flex items-center gap-1">
                                  <button onClick={() => navigateTx('prev', currentSellTxIndex, 0, setCurrentSellTxIndex, sellChartImagesWithIndex, setCurrentSellImageIndex, sortedSells)} disabled={currentSellTxIndex === 0} className="p-1 bg-black/50 text-white rounded-full transition hover:bg-black/80 disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Previous sell transaction"><ChevronLeftIcon /></button>
                                  <span className="text-xs font-mono text-brand-text-secondary">{currentSellTxIndex + 1}/{sortedSells.length}</span>
                                  <button onClick={() => navigateTx('next', currentSellTxIndex, sortedSells.length - 1, setCurrentSellTxIndex, sellChartImagesWithIndex, setCurrentSellImageIndex, sortedSells)} disabled={currentSellTxIndex === sortedSells.length - 1} className="p-1 bg-black/50 text-white rounded-full transition hover:bg-black/80 disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Next sell transaction"><ChevronRightIcon /></button>
                                </div>
                              )}
                            </div>
                          );
                      })() : (
                        <div className="w-full h-full flex items-center justify-center p-4 text-center text-brand-text-secondary text-xs border border-dashed border-white/10 rounded-md">
                          No sell transactions.
                        </div>
                      )}
                    </div>
                  </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TradeItem;