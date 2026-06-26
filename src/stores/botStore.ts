import { create } from 'zustand';
import type { BotConfig, BotStatistics, MarketAnalysis, TradeResult } from '../types';
import { HIGH_PAYOUT_BOTS } from '../types';

interface BotState {
  activeBot: BotConfig | null;
  isEngineRunning: boolean;
  currentStake: number;
  baseStake: number;
  consecutiveLosses: number;
  totalProfit: number;
  trades: TradeResult[];
  statistics: BotStatistics;
  marketAnalysis: MarketAnalysis | null;
  isCooldownActive: boolean;
  cooldownSeconds: number;
  stopBotReason: string | null;

  // Actions
  setActiveBot: (bot: BotConfig | null) => void;
  startEngine: () => void;
  stopEngine: (reason?: string) => void;
  updateStatistics: (stats: Partial<BotStatistics>) => void;
  addTrade: (trade: TradeResult) => void;
  updateMarketAnalysis: (analysis: MarketAnalysis) => void;
  setCurrentStake: (stake: number) => void;
  resetStake: () => void;
  incrementLosses: () => void;
  resetLosses: () => void;
  startCooldown: (seconds: number) => void;
  tickCooldown: () => void;
  clearTrades: () => void;
  resetSession: () => void;
}

export const useBotStore = create<BotState>((set, get) => ({
  activeBot: null,
  isEngineRunning: false,
  currentStake: 1,
  baseStake: 1,
  consecutiveLosses: 0,
  totalProfit: 0,
  trades: [],
  statistics: {
    totalTrades: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    totalProfit: 0,
    totalLoss: 0,
    netProfit: 0,
    currentStreak: 0,
    consecutiveLosses: 0,
  },
  marketAnalysis: null,
  isCooldownActive: false,
  cooldownSeconds: 0,
  stopBotReason: null,

  setActiveBot: (bot) => {
    set({
      activeBot: bot,
      trades: [],
      statistics: {
        totalTrades: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        totalProfit: 0,
        totalLoss: 0,
        netProfit: 0,
        currentStreak: 0,
        consecutiveLosses: 0,
      },
      consecutiveLosses: 0,
      totalProfit: 0,
      currentStake: bot?.stake ?? 1,
      baseStake: bot?.stake ?? 1,
      isEngineRunning: false,
      isCooldownActive: false,
      cooldownSeconds: 0,
      stopBotReason: null,
    });
  },

  startEngine: () => {
    set({ isEngineRunning: true, stopBotReason: null });
  },

  stopEngine: (reason) => {
    set({ isEngineRunning: false, stopBotReason: reason ?? null });
  },

  updateStatistics: (stats) => {
    set((state) => ({
      statistics: { ...state.statistics, ...stats },
    }));
  },

  addTrade: (trade) => {
    set((state) => {
      const newTrades = [...state.trades, trade];
      const wins = newTrades.filter(t => t.isWin === true).length;
      const losses = newTrades.filter(t => t.isWin === false).length;
      const totalTrades = newTrades.length;
      const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
      const totalProfit = newTrades.filter(t => t.isWin).reduce((sum, t) => sum + t.profitLoss, 0);
      const totalLoss = Math.abs(newTrades.filter(t => !t.isWin).reduce((sum, t) => sum + t.profitLoss, 0));
      const netProfit = newTrades.reduce((sum, t) => sum + t.profitLoss, 0);

      let consecutiveLosses = state.consecutiveLosses;
      if (trade.isWin === false) {
        consecutiveLosses += 1;
      } else if (trade.isWin === true) {
        consecutiveLosses = 0;
      }

      return {
        trades: newTrades,
        consecutiveLosses,
        statistics: {
          totalTrades,
          wins,
          losses,
          winRate,
          totalProfit,
          totalLoss,
          netProfit,
          currentStreak: trade.isWin ? state.statistics.currentStreak + 1 : -(state.statistics.currentStreak > 0 ? 1 : Math.abs(state.statistics.currentStreak) + 1),
          consecutiveLosses,
        },
      };
    });
  },

  updateMarketAnalysis: (analysis) => {
    set({ marketAnalysis: analysis });
  },

  setCurrentStake: (stake) => {
    set({ currentStake: stake });
  },

  resetStake: () => {
    const { baseStake } = get();
    set({ currentStake: baseStake, consecutiveLosses: 0 });
  },

  incrementLosses: () => {
    set((state) => {
      const { activeBot, baseStake, currentStake, consecutiveLosses } = state;
      const maxSteps = activeBot?.maxMartingaleSteps ?? 4;

      if (consecutiveLosses >= maxSteps) {
        return {
          currentStake: baseStake,
          consecutiveLosses: 0,
        };
      }

      // Check if this bot uses high payout recovery
      const usesHighPayout = activeBot?.usesHighPayout ?? false;
      const newStake = usesHighPayout ? currentStake * 2 : currentStake + baseStake;

      return {
        currentStake: newStake,
        consecutiveLosses: consecutiveLosses + 1,
      };
    });
  },

  resetLosses: () => {
    set({ consecutiveLosses: 0 });
  },

  startCooldown: (seconds) => {
    set({ isCooldownActive: true, cooldownSeconds: seconds });
  },

  tickCooldown: () => {
    set((state) => {
      const newSeconds = state.cooldownSeconds - 1;
      return {
        cooldownSeconds: newSeconds,
        isCooldownActive: newSeconds > 0,
      };
    });
  },

  clearTrades: () => {
    set({
      trades: [],
      statistics: {
        totalTrades: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        totalProfit: 0,
        totalLoss: 0,
        netProfit: 0,
        currentStreak: 0,
        consecutiveLosses: 0,
      },
      consecutiveLosses: 0,
      totalProfit: 0,
    });
  },

  resetSession: () => {
    set({
      activeBot: null,
      isEngineRunning: false,
      currentStake: 1,
      baseStake: 1,
      consecutiveLosses: 0,
      totalProfit: 0,
      trades: [],
      statistics: {
        totalTrades: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        totalProfit: 0,
        totalLoss: 0,
        netProfit: 0,
        currentStreak: 0,
        consecutiveLosses: 0,
      },
      isCooldownActive: false,
      cooldownSeconds: 0,
      stopBotReason: null,
    });
  },
}));

export const getBotConfig = (slug: string, customConfig?: Partial<BotConfig>): Omit<BotConfig, 'botId' | 'botName' | 'botSlug'> => {
  const isHighPayout = HIGH_PAYOUT_BOTS.includes(slug);
  const isPremium = slug === 'tosh-matrix' || slug === 'tosh-elite';

  const baseConfig = {
    stake: 1,
    takeProfit: 10,
    stopLoss: 5,
    symbol: 'R_100_1S',
    contractType: 'RISE',
    duration: 5,
    durationUnit: 't',
    martingaleMultiplier: 2,
    maxMartingaleSteps: 4,
    isPremium,
    usesHighPayout: isHighPayout,
  };

  return { ...baseConfig, ...customConfig };
};
