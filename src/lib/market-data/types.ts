export type StockSearchResult = {
  code: string;
  name: string;
  exchange: "SH" | "SZ" | "BJ" | "UNKNOWN";
  marketName: string;
  secid: string;
  source: string;
};

export type MarketSnapshot = {
  code: string;
  name: string;
  exchange: "SH" | "SZ" | "BJ" | "UNKNOWN";
  secid: string;
  price: number;
  peTtm: number | null;
  pb: number | null;
  totalMarketCap: number | null;
  floatMarketCap: number | null;
  totalShares: number | null;
  floatShares: number | null;
  turnoverRate: number | null;
  amplitude: number | null;
  asOf: string;
  fetchedAt: string;
  source: string;
  sourceUrl: string;
  warnings: string[];
};

export type FinancialIndicatorRecord = {
  reportDate: string;
  reportType: string;
  revenue: number | null;
  parentNetProfit: number | null;
  deductedNetProfit: number | null;
  eps: number | null;
  bps: number | null;
  operatingCashFlowPerShare: number | null;
  grossMargin: number | null;
  netMargin: number | null;
  roe: number | null;
  roic: number | null;
  debtToAssetRatio: number | null;
  revenueGrowth: number | null;
  profitGrowth: number | null;
  freeCashFlow: number | null;
};

export type InstitutionForecastRecord = {
  year: number;
  yearMark: string;
  eps: number | null;
  pe: number | null;
  roe: number | null;
  parentNetProfit: number | null;
  parentNetProfitGrowth: number | null;
  revenue: number | null;
  revenueGrowth: number | null;
};

export type FinancialSnapshot = {
  code: string;
  name: string;
  latest: FinancialIndicatorRecord | null;
  yearly: FinancialIndicatorRecord[];
  quarterly: FinancialIndicatorRecord[];
  forecasts: InstitutionForecastRecord[];
  source: string;
  sourceUrl: string;
  fetchedAt: string;
  warnings: string[];
};
