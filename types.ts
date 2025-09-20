export interface SellTransaction {
  id: string;
  lotSize: number;
  sellPrice: number; // Unit Price
  totalSellPrice: number;
  sellDate: string;
  sellReason: string | null;
  notes: string | null;
  sellChartImage?: string | null;
}

export interface BuyTransaction {
  id: string;
  lotSize: number;
  buyPrice: number; // Unit Price
  profitTarget?: number;
  stopLossPrice: number;
  setupRating: 'S' | 'A+' | 'A';
  totalBuyPrice: number;
  buyDate: string;
  buyReason: string[];
  buyChartImage?: string | null;
  notes?: string | null;
}

export interface Position {
  id: string;
  ticker: string;
  buys: BuyTransaction[];
  sells: SellTransaction[];
}

export interface AnalysisResult {
  positiveHabits: string[];
  areasForImprovement: string[];
  actionableFeedback: string;
}

export interface PLSummary {
  totalPL: number;
  winRate: number;
  avgPL: number;
  winners: number;
  losers: number;
  totalTrades: number;
  hasData: boolean;
}

export interface KeyMetrics {
  totalTrades: number;
  avgPL: number;
  profitFactor: number;
  maxDrawdown: number;
  hasData: boolean;
}

export interface Filters {
  ticker: string;
  status: 'all' | 'open' | 'closed';
  plStatus: 'all' | 'profit' | 'loss';
  dateFrom: string;
  dateTo: string;
  setups: string[];
}
