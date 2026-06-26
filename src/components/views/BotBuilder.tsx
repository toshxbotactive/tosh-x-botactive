import { useState, useEffect } from 'react';
import { ArrowLeft, Play, Square, Settings2, Shield, TrendingUp, TrendingDown, DollarSign, Target, XCircle, AlertTriangle } from 'lucide-react';
import { useBotStore } from '../../stores/botStore';
import { useAppStore } from '../../stores/appStore';
import { startTradingEngine, stopTradingEngine } from '../../services/tradingEngine';
import type { BotConfig } from '../../types';
import { SYMBOLS } from '../../types';

const SYMBOL_OPTIONS = [
  { value: 'R_100', label: 'Volatility 100 Index' },
  { value: SYMBOLS.VOLATILITY_100_1S, label: 'Volatility 100 (1s)' },
  { value: 'R_75', label: 'Volatility 75 Index' },
  { value: SYMBOLS.VOLATILITY_75_1S, label: 'Volatility 75 (1s)' },
  { value: 'R_50', label: 'Volatility 50 Index' },
  { value: SYMBOLS.VOLATILITY_50_1S, label: 'Volatility 50 (1s)' },
  { value: 'R_25', label: 'Volatility 25 Index' },
  { value: SYMBOLS.VOLATILITY_25_1S, label: 'Volatility 25 (1s)' },
  { value: 'R_10', label: 'Volatility 10 Index' },
  { value: SYMBOLS.VOLATILITY_10_1S, label: 'Volatility 10 (1s)' },
];

const CONTRACT_TYPES = [
  { value: 'RISE', label: 'Rise' },
  { value: 'FALL', label: 'Fall' },
  { value: 'AUTO', label: 'Auto (Trend Following)' },
];

export function BotBuilder() {
  const { activeBot, isEngineRunning, statistics, trades, consecutiveLosses, currentStake, stopBotReason } = useBotStore();
  const { setActiveTab } = useAppStore();

  const [config, setConfig] = useState({
    stake: activeBot?.stake ?? 1,
    takeProfit: activeBot?.takeProfit ?? 10,
    stopLoss: activeBot?.stopLoss ?? 5,
    symbol: activeBot?.symbol ?? 'R_100_1S',
    contractType: activeBot?.contractType ?? 'RISE',
    duration: activeBot?.duration ?? 5,
  });

  const [cooldownTimer, setCooldownTimer] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Initialize bot store with config
  useEffect(() => {
    if (activeBot && isEngineRunning && !isUpdating) {
      setIsUpdating(true);
    }
  }, [activeBot, isEngineRunning]);

  // Handle cooldown countdown
  useEffect(() => {
    if (consecutiveLosses >= 3 && !isEngineRunning) {
      setCooldownTimer(45);
    }
  }, [consecutiveLosses, isEngineRunning]);

  useEffect(() => {
    if (cooldownTimer > 0) {
      const interval = setTimeout(() => {
        setCooldownTimer(cooldownTimer - 1);
      }, 1000);
      return () => clearTimeout(interval);
    }
  }, [cooldownTimer]);

  const handleStartEngine = () => {
    if (!activeBot) return;

    const botConfig: BotConfig = {
      botId: activeBot.botId,
      botName: activeBot.botName,
      botSlug: activeBot.botSlug,
      stake: config.stake,
      takeProfit: config.takeProfit,
      stopLoss: config.stopLoss,
      symbol: config.symbol,
      contractType: config.contractType,
      duration: config.duration,
      durationUnit: 't',
      martingaleMultiplier: 2,
      maxMartingaleSteps: 4,
      isPremium: activeBot.isPremium,
      usesHighPayout: activeBot.usesHighPayout,
    };

    startTradingEngine(botConfig);
  };

  const handleStopEngine = () => {
    stopTradingEngine('Manual stop');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return value.toFixed(1) + '%';
  };

  if (!activeBot) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-8 sm:pt-10">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-100 mb-2">No Bot Selected</h2>
          <button onClick={() => setActiveTab('dashboard')} className="btn-gold">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pt-8 sm:pt-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => {
            useBotStore.getState().resetSession();
            setActiveTab('dashboard');
          }}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back to Dashboard</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Configuration */}
        <div className="lg:col-span-4 space-y-4">
          {/* Bot Info Card */}
          <div className="card p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${activeBot.isPremium ? 'bg-primary-500/20' : 'bg-gray-700/30'}`}>
                <Settings2 className={`w-5 h-5 ${activeBot.isPremium ? 'text-primary-400' : 'text-gray-400'}`} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-100">{activeBot.botName}</h2>
                <p className="text-xs text-gray-400">
                  {activeBot.usesHighPayout ? 'HIGH-PAYOUT MODE' : 'STANDARD MODE'}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{activeBot.usesHighPayout ? 'Martingale recovery enabled (2x multiplier). High-payout contract targeting.' : 'Standard contract execution.'}</p>
          </div>

          {/* Configuration Card */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary-400" />
              Bot Configuration
            </h3>

            <div className="space-y-4">
              {/* Stake Amount */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Stake Amount ($)
                </label>
                <input
                  type="number"
                  value={config.stake}
                  onChange={(e) => setConfig({ ...config, stake: parseFloat(e.target.value) || 1 })}
                  disabled={isEngineRunning}
                  className="input w-full"
                  min={1}
                  max={1000}
                  step={0.1}
                />
              </div>

              {/* Symbol */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Symbol
                </label>
                <select
                  value={config.symbol}
                  onChange={(e) => setConfig({ ...config, symbol: e.target.value })}
                  disabled={isEngineRunning}
                  className="select w-full"
                >
                  {SYMBOL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Contract Type */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Contract Type
                </label>
                <select
                  value={config.contractType}
                  onChange={(e) => setConfig({ ...config, contractType: e.target.value })}
                  disabled={isEngineRunning}
                  className="select w-full"
                >
                  {CONTRACT_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Duration (ticks)
                </label>
                <input
                  type="number"
                  value={config.duration}
                  onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) || 5 })}
                  disabled={isEngineRunning}
                  className="input w-full"
                  min={1}
                  max={60}
                />
              </div>
            </div>
          </div>

          {/* Risk Management Card */}
          <div className="card p-4 border-danger/20">
            <h3 className="text-sm font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-danger" />
              Risk Management
            </h3>

            <div className="space-y-4">
              {/* Take Profit */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  <Target className="w-3 h-3 inline mr-1" />
                  Take Profit ($)
                </label>
                <input
                  type="number"
                  value={config.takeProfit}
                  onChange={(e) => setConfig({ ...config, takeProfit: parseFloat(e.target.value) || 10 })}
                  disabled={isEngineRunning}
                  className="input w-full"
                  min={1}
                  max={10000}
                  step={1}
                />
              </div>

              {/* Stop Loss */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  <XCircle className="w-3 h-3 inline mr-1" />
                  Stop Loss ($)
                </label>
                <input
                  type="number"
                  value={config.stopLoss}
                  onChange={(e) => setConfig({ ...config, stopLoss: parseFloat(e.target.value) || 5 })}
                  disabled={isEngineRunning}
                  className="input w-full"
                  min={1}
                  max={1000}
                  step={1}
                />
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-3">
            {!isEngineRunning ? (
              <button
                onClick={handleStartEngine}
                disabled={cooldownTimer > 0}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${
                  cooldownTimer > 0
                    ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
                    : 'btn-success'
                }`}
              >
                {cooldownTimer > 0 ? (
                  <>
                    <span>Cooldown: {cooldownTimer}s</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    RUN ENGINE
                  </>
                )}
              </button>
            ) : (
              <button onClick={handleStopEngine} className="flex-1 btn-danger flex items-center justify-center gap-2 py-3">
                <Square className="w-5 h-5" />
                STOP ENGINE
              </button>
            )}
          </div>

          {/* Stop Reason */}
          {stopBotReason && (
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-warning text-sm">
              {stopBotReason}
            </div>
          )}
        </div>

        {/* Right Column - Workspace */}
        <div className="lg:col-span-8 space-y-4">
          {/* Scoreboard */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-200 mb-4">Live Scoreboard</h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="stat-card text-center">
                <DollarSign className="w-4 h-4 text-primary-400 mx-auto mb-1" />
                <div className="text-xs text-gray-400 mb-0.5">Total Stake</div>
                <div className="text-lg font-bold text-gray-100">
                  {formatCurrency(statistics.totalProfit + statistics.totalLoss)}
                </div>
              </div>
              <div className="stat-card text-center">
                <Target className="w-4 h-4 text-success mx-auto mb-1" />
                <div className="text-xs text-gray-400 mb-0.5">Payout</div>
                <div className="text-lg font-bold text-success">
                  {formatCurrency(statistics.totalProfit)}
                </div>
              </div>
              <div className="stat-card text-center">
                <TrendingUp className="w-4 h-4 text-success mx-auto mb-1" />
                <div className="text-xs text-gray-400 mb-0.5">Wins</div>
                <div className="text-lg font-bold text-success">{statistics.wins}</div>
              </div>
              <div className="stat-card text-center">
                <TrendingDown className="w-4 h-4 text-danger mx-auto mb-1" />
                <div className="text-xs text-gray-400 mb-0.5">Losses</div>
                <div className="text-lg font-bold text-danger">{statistics.losses}</div>
              </div>
            </div>

            {/* Net Profit/Loss */}
            <div className={`p-4 rounded-xl text-center ${
              statistics.netProfit >= 0
                ? 'bg-success/10 border border-success/30'
                : 'bg-danger/10 border border-danger/30'
            }`}>
              <div className="text-xs text-gray-400 mb-1">Net Profit/Loss</div>
              <div className={`text-3xl font-bold ${
                statistics.netProfit >= 0 ? 'text-success' : 'text-danger'
              }`}>
                {statistics.netProfit >= 0 ? '+' : ''}{formatCurrency(statistics.netProfit)}
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-xs text-gray-500">Win Rate:</span>
                <span className={`text-sm font-semibold ${
                  statistics.winRate >= 50 ? 'text-success' : 'text-danger'
                }`}>
                  {formatPercent(statistics.winRate)}
                </span>
              </div>
            </div>

            {/* Martingale Status */}
            <div className="mt-4 p-3 rounded-lg bg-surface-light/50 border border-gray-700/30">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Consecutive Losses</span>
                <span className={`text-sm font-semibold ${
                  consecutiveLosses >= 3 ? 'text-danger' : 'text-gray-300'
                }`}>
                  {consecutiveLosses}/4
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">Next Stake</span>
                <span className="text-sm font-semibold text-primary-400">
                  {formatCurrency(currentStake)}
                </span>
              </div>
            </div>
          </div>

          {/* Trade History */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-800/50">
              <h3 className="text-sm font-semibold text-gray-200">Transaction History</h3>
            </div>
            <div className="max-h-[300px] overflow-y-auto scrollbar-thin">
              {trades.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-gray-500">No trades executed yet</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-dark-400 sticky top-0">
                    <tr className="text-left text-xs text-gray-500">
                      <th className="px-4 py-2">Time</th>
                      <th className="px-4 py-2">Symbol</th>
                      <th className="px-4 py-2">Type</th>
                      <th className="px-4 py-2">Entry</th>
                      <th className="px-4 py-2">Exit</th>
                      <th className="px-4 py-2">Stake</th>
                      <th className="px-4 py-2">P/L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((trade) => (
                      <tr key={trade.id} className="table-row">
                        <td className="px-4 py-2 text-xs text-gray-400">
                          {new Date(trade.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-300">{trade.symbol}</td>
                        <td className="px-4 py-2 text-xs">
                          <span className={trade.contractType === 'RISE' || trade.contractType === 'CALL' ? 'text-success' : 'text-danger'}>
                            {trade.contractType}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-300 font-mono">{trade.entrySpot.toFixed(2)}</td>
                        <td className="px-4 py-2 text-xs text-gray-300 font-mono">{trade.exitSpot?.toFixed(2) ?? '-'}</td>
                        <td className="px-4 py-2 text-xs text-gray-300">{formatCurrency(trade.buyPrice)}</td>
                        <td className={`px-4 py-2 text-xs font-semibold ${
                          trade.isWin ? 'text-success' : 'text-danger'
                        }`}>
                          {trade.isWin ? '+' : ''}{formatCurrency(trade.profitLoss)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
