export interface DerivTick {
  epoch: number;
  quote: number;
  symbol: string;
  pip_size?: number;
}

export interface DerivCandle {
  epoch: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface DerivTransaction {
  contract_id: number;
  transaction_id: number;
  symbol: string;
  buy_price: number;
  longcode: string;
  contract_type: string;
  payout: number;
  profit: number;
  entry_tick: number;
  exit_tick: number;
  is_sold: boolean;
  purchase_time: number;
  sell_time: number;
}

export interface DerivContract {
  contract_id: string;
  contract_type: string;
  underlying: string;
  shortcode: string;
  date_start: number;
  purchase_time: number;
  buy_price: number;
  currency: string;
  is_sold: boolean;
  is_valid_to_sell: boolean;
  sell_price?: number;
  payout?: number;
  profit?: number;
  exit_tick?: number;
  entry_tick: number;
  status?: 'open' | 'sold' | 'expired';
}

export interface DerivBalance {
  accounts: Record<string, {
    balance: number;
    currency: string;
    id: string;
    is_disabled: boolean;
    type: 'demo' | 'real';
    loginid: string;
  }>;
  total_balance: number;
  total_demo_balance: number;
  total_real_balance: number;
}

export interface DerivProposal {
  id: string;
  ask_price: number;
  date_expiry: number;
  longcode: string;
  payout: number;
  spot: number;
  contract_type: string;
  symbol: string;
  multiplier?: number;
}

export interface BotConfig {
  botId: string;
  botName: string;
  botSlug: string;
  stake: number;
  takeProfit: number;
  stopLoss: number;
  symbol: string;
  contractType: string;
  duration?: number;
  durationUnit?: string;
  martingaleMultiplier: number;
  maxMartingaleSteps: number;
  isPremium: boolean;
  usesHighPayout: boolean;
}

export interface TradeResult {
  id: string;
  botId: string;
  contractId: string;
  symbol: string;
  contractType: string;
  entrySpot: number;
  exitSpot?: number;
  buyPrice: number;
  payout: number;
  profitLoss: number;
  isWin?: boolean;
  timestamp: Date;
}

export interface BotStatistics {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  currentStreak: number;
  consecutiveLosses: number;
}

export type MarketCondition = 'optimal' | 'favorable' | 'risky';

export interface MarketAnalysis {
  symbol: string;
  currentPrice: number;
  ema5: number;
  ema20: number;
  upperBand: number;
  lowerBand: number;
  atr: number;
  momentum: number;
  confidence: number;
  condition: MarketCondition;
  trend: 'bullish' | 'bearish' | 'neutral';
}

export type NavigationTab = 'dashboard' | 'bot-builder' | 'analysis' | 'live-chat';

export type AccountType = 'real' | 'demo';

export interface UserInfo {
  id: string;
  derivAccountId: string;
  accountTypeActive: AccountType;
  isPremium: boolean;
  realBalance: number;
  demoBalance: number;
  activeAccountId: string;
}

export interface AppState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  activeBot: BotConfig | null;
  isEngineRunning: boolean;
  activeTab: NavigationTab;
  showProtocolModal: boolean;
  showAdminPanel: boolean;
}

export const SYMBOLS = {
  VOLATILITY_10_1S: 'R_10_1S',
  VOLATILITY_100_1S: 'R_100_1S',
  VOLATILITY_75_1S: 'R_75_1S',
  VOLATILITY_50_1S: 'R_50_1S',
  VOLATILITY_25_1S: 'R_25_1S',
  VOLATILITY_100: 'R_100',
  VOLATILITY_75: 'R_75',
  VOLATILITY_50: 'R_50',
  VOLATILITY_25: 'R_25',
  VOLATILITY_10: 'R_10',
  FOREX_BTCUSD: 'cryBTCUSD',
  BOOM_500: 'BOOM500',
  BOOM_1000: 'BOOM1000',
  CRASH_500: 'CRASH500',
  CRASH_1000: 'CRASH1000',
} as const;

export const CONTRACT_TYPES = {
  CALL: 'CALL',
  PUT: 'PUT',
  RISE: 'RISE',
  FALL: 'FALL',
  DIGIT_MATCH: 'DIGITMATCH',
  DIGIT_DIFF: 'DIGITDIFF',
  DIGIT_OVER: 'DIGITOVER',
  DIGIT_UNDER: 'DIGITUNDER',
  HIGHER: 'HIGHER',
  LOWER: 'LOWER',
  TOUCH: 'TOUCH',
  NO_TOUCH: 'NOTOUCH',
} as const;

export const ADMIN_ACCOUNT_IDS = [
  'VRTC123456',
  'CR123456',
  'VRTC987654',
];

export const HIGH_PAYOUT_BOTS = [
  'tosh-alpha',
  'tosh-quantum',
  'tosh-matrix',
];
