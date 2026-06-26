import type { DerivTick, DerivProposal, DerivContract, MarketAnalysis } from '../types';

const WS_URL = 'wss://ws.derivws.com/websockets/v3?app_id=1089';

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}

class DerivWebSocketService {
  private ws: WebSocket | null = null;
  private isConnected: boolean = false;
  private requestCounter: number = 1;
  private pendingRequests: Map<number, PendingRequest> = new Map();
  public tickCallbacks: Set<(tick: DerivTick) => void> = new Set();
  private balanceCallbacks: Set<(data: { accounts: Record<string, { balance: number; type: string }> }) => void> = new Set();
  private proposalCallbacks: Set<(proposal: DerivProposal) => void> = new Set();
  private transactionCallbacks: Set<(transaction: DerivContract) => void> = new Set();
  private connectionCallbacks: Set<(connected: boolean) => void> = new Set();
  private reconnectTimeout: number | null = null;
  private tickHistory: DerivTick[] = [];
  private currentSubscriptionId: string | null = null;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.connectionCallbacks.forEach(cb => cb(true));
        resolve();
      };

      this.ws.onclose = (event) => {
        this.isConnected = false;
        this.connectionCallbacks.forEach(cb => cb(false));
        this.scheduleReconnect();

        if (!event.wasClean) {
          console.warn('WebSocket connection closed unexpectedly');
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };
    });
  }

  private handleMessage(data: { req_id?: number; msg_type?: string; error?: { message?: string } } & Record<string, unknown>) {
    const { req_id, msg_type } = data;

    if (req_id !== undefined && this.pendingRequests.has(req_id)) {
      const pending = this.pendingRequests.get(req_id)!;
      this.pendingRequests.delete(req_id);

      if (data.error) {
        pending.reject(new Error(data.error.message || 'Deriv API Error'));
      } else {
        pending.resolve(data);
      }
      return;
    }

    switch (msg_type) {
      case 'tick':
        this.handleTick(data);
        break;
      case 'ohlc':
        this.handleOHLC(data);
        break;
      case 'balance':
        this.handleBalance(data);
        break;
      case 'proposal':
        this.handleProposal(data);
        break;
      case 'buy':
        this.handleBuy(data);
        break;
      case 'transaction':
        this.handleTransaction(data);
        break;
      case 'profit_table':
        this.handleProfitTable(data);
        break;
      case 'authorize':
        this.handleAuthorize(data);
        break;
      case 'contracts_for':
        this.handleContractsFor(data);
        break;
    }
  }

  private handleTick(data: unknown) {
    const tickData = data as { tick: DerivTick };
    if (tickData.tick) {
      this.tickHistory.push(tickData.tick);
      if (this.tickHistory.length > 100) {
        this.tickHistory.shift();
      }
      this.tickCallbacks.forEach(cb => cb(tickData.tick));
    }
  }

  private handleOHLC(_data: unknown) {
    // Handle OHLC data for charts
  }

  private handleBalance(data: unknown) {
    const balanceData = data as { balance: number; currency: string; accounts?: Record<string, { balance: number; type: string }> };
    const accounts = balanceData.accounts ?? {};
    this.balanceCallbacks.forEach(cb => cb({ accounts }));
  }

  private handleProposal(data: unknown) {
    const proposalData = data as { proposal: DerivProposal };
    if (proposalData.proposal) {
      this.proposalCallbacks.forEach(cb => cb(proposalData.proposal));
    }
  }

  private handleBuy(data: unknown) {
    const buyData = data as { buy: DerivContract };
    if (buyData.buy) {
      this.transactionCallbacks.forEach(cb => cb(buyData.buy));
    }
  }

  private handleTransaction(data: unknown) {
    const txData = data as { transaction: DerivContract };
    if (txData.transaction) {
      this.transactionCallbacks.forEach(cb => cb(txData.transaction));
    }
  }

  private handleProfitTable(_data: unknown) {
    // Handle profit table response
  }

  private handleAuthorize(data: unknown) {
    const authData = data as { authorize: Record<string, unknown>; account_list?: Array<{ id: string; type: string; is_disabled: boolean }> };
    if (authData.account_list) {
      const accounts: Record<string, { balance: number; type: string }> = {};
      authData.account_list.forEach((acc) => {
        accounts[acc.id] = {
          balance: 0,
          type: acc.type,
        };
      });
      this.balanceCallbacks.forEach(cb => cb({ accounts }));
    }
  }

  private handleContractsFor(_data: unknown) {
    // Handle available contracts
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.reconnectTimeout = window.setTimeout(() => {
      this.connect().catch(console.error);
    }, 5000);
  }

  async sendRequest<T>(payload: Record<string, unknown>): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket is not connected'));
        return;
      }

      const req_id = this.requestCounter++;
      const requestPayload = { ...payload, req_id };

      this.pendingRequests.set(req_id, {
        resolve: resolve as (value: unknown) => void,
        reject,
      });

      // Set timeout for request
      setTimeout(() => {
        if (this.pendingRequests.has(req_id)) {
          this.pendingRequests.delete(req_id);
          reject(new Error('Request timeout'));
        }
      }, 30000);

      try {
        this.ws.send(JSON.stringify(requestPayload));
      } catch (error) {
        this.pendingRequests.delete(req_id);
        reject(error);
      }
    });
  }

  async authorize(token: string): Promise<unknown> {
    return this.sendRequest({
      authorize: token,
    });
  }

  async getBalance(): Promise<unknown> {
    return this.sendRequest({
      balance: 1,
    });
  }

  async getAccountList(): Promise<unknown> {
    return this.sendRequest({
      account_listing: 1,
    });
  }

  subscribeToTicks(symbol: string): void {
    if (this.currentSubscriptionId) {
      this.ws?.send(JSON.stringify({
        forget: this.currentSubscriptionId,
      }));
    }

    this.sendRequest<{ subscription: { id: string } }>({
      ticks: symbol,
      subscribe: 1,
    }).then((result) => {
      this.currentSubscriptionId = result.subscription?.id;
    }).catch(console.error);
  }

  unsubscribeFromTicks(): void {
    if (this.currentSubscriptionId) {
      this.ws?.send(JSON.stringify({
        forget: this.currentSubscriptionId,
      }));
      this.currentSubscriptionId = null;
    }
  }

  subscribeToBalance(): void {
    this.sendRequest({
      balance: 1,
      subscribe: 1,
    }).catch(console.error);
  }

  async getProposal(config: {
    amount: number;
    basis: string;
    contract_type: string;
    currency: string;
    duration: number;
    duration_unit: string;
    symbol: string;
  }): Promise<DerivProposal> {
    const result = await this.sendRequest<{ proposal: DerivProposal }>({
      proposal: 1,
      subscribe: 1,
      ...config,
    });
    return result.proposal;
    // This will be caught by handleProposal
  }

  async buyContract(proposalId: string, price: number): Promise<DerivContract> {
    const result = await this.sendRequest<{ buy: DerivContract }>({
      buy: proposalId,
      price,
    });
    return result.buy;
  }

  async sellContract(contractId: string, price: number): Promise<unknown> {
    return this.sendRequest({
      sell: contractId,
      price,
    });
  }

  getTransactionObserver(): void {
    this.sendRequest({
      transaction: 1,
      subscribe: 1,
    }).catch(console.error);
  }

  onTick(callback: (tick: DerivTick) => void): () => void {
    this.tickCallbacks.add(callback);
    return () => this.tickCallbacks.delete(callback);
  }

  onBalance(callback: (data: { accounts: Record<string, { balance: number; type: string }> }) => void): () => void {
    this.balanceCallbacks.add(callback);
    return () => this.balanceCallbacks.delete(callback);
  }

  onProposal(callback: (proposal: DerivProposal) => void): () => void {
    this.proposalCallbacks.add(callback);
    return () => this.proposalCallbacks.delete(callback);
  }

  onTransaction(callback: (transaction: DerivContract) => void): () => void {
    this.transactionCallbacks.add(callback);
    return () => this.transactionCallbacks.delete(callback);
  }

  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionCallbacks.add(callback);
    return () => this.connectionCallbacks.delete(callback);
  }

  getTickHistory(): DerivTick[] {
    return this.tickHistory;
  }

  getLastTick(): DerivTick | null {
    return this.tickHistory[this.tickHistory.length - 1] ?? null;
  }

  isConnectedStatus(): boolean {
    return this.isConnected;
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.close(1000, 'User logout');
      this.ws = null;
    }
    this.isConnected = false;
    this.pendingRequests.clear();
    this.tickCallbacks.clear();
    this.balanceCallbacks.clear();
    this.proposalCallbacks.clear();
    this.transactionCallbacks.clear();
    this.tickHistory = [];
    this.currentSubscriptionId = null;
  }
}

export const derivService = new DerivWebSocketService();

// Market Analysis helper functions
export const calculateEMA = (ticks: DerivTick[], period: number): number[] => {
  if (ticks.length < period) return [];

  const prices = ticks.map(t => t.quote);
  const multiplier = 2 / (period + 1);
  const emaValues: number[] = [];

  // First EMA value is SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[i];
  }
  const sma = sum / period;
  emaValues.push(sma);

  // Calculate EMA for remaining values
  for (let i = period; i < prices.length; i++) {
    const ema = (prices[i] - emaValues[emaValues.length - 1]) * multiplier + emaValues[emaValues.length - 1];
    emaValues.push(ema);
  }

  return emaValues;
};

export const calculateBollingerBands = (ticks: DerivTick[], period: number = 20, stdDev: number = 2): { upper: number; middle: number; lower: number } => {
  if (ticks.length < period) return { upper: 0, middle: 0, lower: 0 };

  const prices = ticks.slice(-period).map(t => t.quote);
  const sma = prices.reduce((a, b) => a + b, 0) / period;
  const squaredDiffs = prices.map(p => Math.pow(p - sma, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
  const std = Math.sqrt(variance);

  return {
    upper: sma + stdDev * std,
    middle: sma,
    lower: sma - stdDev * std,
  };
};

export const calculateATR = (ticks: DerivTick[], period: number = 14): number => {
  if (ticks.length < period + 1) return 0;

  const trueRanges: number[] = [];
  for (let i = 1; i < ticks.length; i++) {
    const current = ticks[i].quote;
    const prev = ticks[i - 1].quote;
    const tr = Math.abs(current - prev);
    trueRanges.push(tr);
  }

  // Use only last 'period' true ranges
  const recentTR = trueRanges.slice(-period);
  return recentTR.reduce((a, b) => a + b, 0) / recentTR.length;
};

export const calculateMomentum = (ticks: DerivTick[], period: number = 5): number => {
  if (ticks.length < period) return 0;

  const current = ticks[ticks.length - 1].quote;
  const past = ticks[ticks.length - period].quote;

  return ((current - past) / past) * 100;
};

export const analyzeMarket = (symbol: string, ticks: DerivTick[]): MarketAnalysis => {
  const ema5Values = calculateEMA(ticks, 5);
  const ema20Values = calculateEMA(ticks, 20);
  const bollingerBands = calculateBollingerBands(ticks, 20);
  const atr = calculateATR(ticks, 14);
  const momentum = calculateMomentum(ticks, 5);

  const ema5 = ema5Values[ema5Values.length - 1] ?? 0;
  const ema20 = ema20Values[ema20Values.length - 1] ?? 0;
  const currentPrice = ticks[ticks.length - 1]?.quote ?? 0;

  // Calculate confidence score
  let confidenceScore = 50;
  if (ema5 > ema20) confidenceScore += 15; // Bullish trend
  if (ema5 < ema20) confidenceScore += 10; // Bearish trend
  if (Math.abs(momentum) > 1) confidenceScore += 15; // Strong momentum
  if (currentPrice > bollingerBands.upper || currentPrice < bollingerBands.lower) {
    confidenceScore -= 20; // Outside bands = possible reversal
  }
  if (atr > 0.5) confidenceScore += 10; // Good volatility

  confidenceScore = Math.max(0, Math.min(100, confidenceScore));

  const trend = ema5 > ema20 ? 'bullish' : ema5 < ema20 ? 'bearish' : 'neutral';
  let condition: 'optimal' | 'favorable' | 'risky' = 'favorable';
  if (confidenceScore >= 80) condition = 'optimal';
  else if (confidenceScore < 60) condition = 'risky';

  return {
    symbol,
    currentPrice,
    ema5,
    ema20,
    upperBand: bollingerBands.upper,
    lowerBand: bollingerBands.lower,
    atr,
    momentum,
    confidence: confidenceScore,
    condition,
    trend,
  };
};
