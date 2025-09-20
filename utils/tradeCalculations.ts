import type { Position } from '../types';

export const getPositionStats = (position: Position) => {
    const totalLotsBought = position.buys.reduce((sum, buy) => sum + buy.lotSize, 0);

    if (totalLotsBought === 0) {
        return { isClosed: false, realizedPL: 0, totalLotsBought: 0, totalLotsSold: 0 };
    }
    
    const totalBuyValue = position.buys.reduce((sum, buy) => sum + buy.totalBuyPrice, 0);
    const avgBuyPrice = totalBuyValue / (totalLotsBought * 100);

    const totalLotsSold = position.sells.reduce((sum, sell) => sum + sell.lotSize, 0);
    const isClosed = totalLotsSold >= totalLotsBought;

    const totalSellValue = position.sells.reduce((sum, sell) => sum + sell.totalSellPrice, 0);
    const costOfLotsSold = avgBuyPrice * totalLotsSold * 100;
    const realizedPL = totalSellValue - costOfLotsSold;

    return { isClosed, realizedPL, totalLotsBought, totalLotsSold };
};
