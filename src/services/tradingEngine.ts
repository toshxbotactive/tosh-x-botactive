import { derivService, analyzeMarket } from './derivWebSocket';
import { useBotStore } from '../stores/botStore';
import { useAuthStore } from '../stores/authStore';
import type { DerivProposal, BotConfig, TradeResult } from '../types';
import { HIGH_PAYOUT_BOTS } from '../types';

export interface TradingEngineConfig {
  stake: number;
  takeProfit: number;
  stopLoss: number;
  symbol: string;
  contractType: string;
  duration: number;
  durationUnit: string;
}

let tradingInterval: number | null = null;
let cooldownInterval: number | null = null;

export class TradingEngine {
  private isRunning: boolean = false;
  private currentProposal: DerivProposal | null = null;
  private activeContractId: string | null = null;
  private botConfig: BotConfig | null = null;

  constructor() {
    // Set up transaction observer
    derivService.onTransaction((tx) => {
      this.handleContractResult(tx);
    });
  }

  setConfig(config: BotConfig): void {
    this.botConfig = config;
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    // Subscribe to ticks and transaction stream
    derivService.subscribeToTicks(this.botConfig?.symbol ?? 'R_100_1S');
    derivService.getTransactionObserver();

    // Begin trading loop
    this.tradingLoop();
  }

  stop(reason?: string): void {
    this.isRunning = false;
    if (tradingInterval) {
      clearInterval(tradingInterval);
      tradingInterval = null;
    }
    useBotStore.getState().stopEngine(reason);
  }

  private tradingLoop(): void {
    if (!this.isRunning) return;

    const store = useBotStore.getState();
    const { botConfig } = this;

    if (!botConfig) {
      this.stop('Configuration missing');
      return;
    }

    // Check cooldown
    if (store.isCooldownActive) {
      if (cooldownInterval) clearInterval(cooldownInterval);
      cooldownInterval = window.setInterval(() => {
        useBotStore.getState().tickCooldown();
      }, 1000);
      return;
    }

    // Check stop conditions
    const stats = store.statistics;
    if (stats.netProfit >= botConfig.takeProfit) {
      this.stop('Take Profit target reached! 🎉');
      return;
    }
    if (stats.netProfit <= -botConfig.stopLoss) {
      this.stop('Stop Loss limit reached! ⚠️');
      return;
    }

    // Check consecutive losses for cooldown
    if (store.consecutiveLosses >= 3) {
      useBotStore.getState().startCooldown(45);
      this.scheduleTradeAfterCooldown();
      return;
    }

    // Check market condition
    const ticks = derivService.getTickHistory();
    const analysis = analyzeMarket(botConfig.symbol, ticks);
    useBotStore.getState().updateMarketAnalysis(analysis);

    if (analysis.confidence < 80) {
      // Pause trading - risky conditions
      useBotStore.getState().stopEngine('Waiting for optimal market conditions...');
      return;
    }

    // Execute trade
    this.executeTrade();
  }

  private async executeTrade(): Promise<void> {
    const store = useBotStore.getState();
    const authStore = useAuthStore.getState();
    const { botConfig } = this;

    if (!botConfig || !authStore.isAuthenticated) return;

    try {
      // Determine trade direction based on market analysis
      const ticks = derivService.getTickHistory();
      const analysis = analyzeMarket(botConfig.symbol, ticks);

      let contractType = botConfig.contractType;
      if (contractType === 'AUTO' || contractType === 'RISE') {
        contractType = analysis.trend === 'bullish' ? 'RISE' : analysis.trend === 'bearish' ? 'FALL' : 'RISE';
      }

      // Prepare proposal parameters
      const proposalParams: Record<string, unknown> = {
        proposal: 1,
        subscribe: 1,
        amount: store.currentStake,
        basis: 'stake',
        contract_type: contractType,
        currency: 'USD',
        duration: botConfig.duration ?? 5,
        duration_unit: botConfig.durationUnit ?? 't',
        symbol: botConfig.symbol,
      };

      // For high-payout bots, use match/diff contracts
      if (HIGH_PAYOUT_BOTS.includes(botConfig.botSlug)) {
        const lastDigit = Math.floor(derivService.getLastTick()?.quote ?? 0) % 10;
        proposalParams.contract_type = 'DIGITMATCH';
        proposalParams.barrier = lastDigit.toString();
        proposalParams.barrier_count = 1;
      }

      // Get proposal
      derivService.onProposal((proposal) => {
        this.currentProposal = proposal;
        this.buyContract();
      });

      await derivService.sendRequest(proposalParams);

    } catch (error) {
      console.error('Trade execution failed:', error);
      this.handleError(error);
    }
  }

  private async buyContract(): Promise<void> {
    if (!this.currentProposal || !this.isRunning) return;

    const store = useBotStore.getState();
    const authStore = useAuthStore.getState();

    if (!authStore.isAuthenticated) {
      this.stop('Authentication required');
      return;
    }

    try {
      const contract = await derivService.buyContract(
        this.currentProposal.id,
        store.currentStake
      );
      this.activeContractId = contract.contract_id;
      console.log('Contract purchased:', contract);
    } catch (error) {
      console.error('Buy contract failed:', error);
      this.handleError(error);
    }
  }

  private handleContractResult(tx: { contract_id?: string; profit?: number; payout?: number; entry_tick?: number; exit_tick?: number; buy_price?: number; underlying?: string }): void {
    if (!this.activeContractId || tx.contract_id !== this.activeContractId) return;

    const store = useBotStore.getState();
    const { botConfig } = this;

    if (!botConfig) return;

    const isWin = (tx.profit ?? 0) > 0;
    const entrySpot = tx.entry_tick ?? 0;
    const exitSpot = tx.exit_tick ?? tx.entry_tick ?? 0;
    const buyPrice = tx.buy_price ?? store.currentStake;
    const payout = tx.payout ?? 0;

    // Create trade result
    const tradeResult: TradeResult = {
      id: crypto.randomUUID(),
      botId: botConfig.botId,
      contractId: this.activeContractId,
      symbol: tx.underlying ?? botConfig.symbol,
      contractType: botConfig.contractType,
      entrySpot,
      exitSpot,
      buyPrice,
      payout,
      profitLoss: tx.profit ?? 0,
      isWin,
      timestamp: new Date(),
    };

    // Add trade to store
    store.addTrade(tradeResult);

    // Handle stake adjustment based on win/loss
    if (isWin) {
      // Reset stake to base on win
      store.resetStake();
    } else {
      // Increase stake on loss (martingale)
      store.incrementLosses();
    }

    // Clear active contract
    this.activeContractId = null;
    this.currentProposal = null;

    // Schedule next trade
    if (this.isRunning) {
      setTimeout(() => this.tradingLoop(), 1000);
    }
  }

  private scheduleTradeAfterCooldown(): void {
    const checkCooldown = () => {
      const store = useBotStore.getState();
      if (!store.isCooldownActive && this.isRunning) {
        if (cooldownInterval) {
          clearInterval(cooldownInterval);
          cooldownInterval = null;
        }
        this.tradingLoop();
      }
    };

    // Check every second
    if (cooldownInterval) clearInterval(cooldownInterval);
    cooldownInterval = window.setInterval(checkCooldown, 1000);
  }

  private handleError(error: unknown): void {
    console.error('Trading engine error:', error);
    if (this.isRunning) {
      setTimeout(() => this.tradingLoop(), 5000);
    }
  }
}

export const tradingEngine = new TradingEngine();

// Start trading engine
export const startTradingEngine = (config: BotConfig): void => {
  tradingEngine.setConfig(config);
  useBotStore.getState().startEngine();
  tradingEngine.start();
};

// Stop trading engine
export const stopTradingEngine = (reason?: string): void => {
  tradingEngine.stop(reason);
};
