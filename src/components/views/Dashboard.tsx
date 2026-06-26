import { useState, useEffect, useRef } from 'react';
import { Lock, TrendingUp, Activity, Zap, Ghost, Sun, Mountain, Grid, Crown, Shield } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useAppStore } from '../../stores/appStore';
import { useBotStore } from '../../stores/botStore';
import type { BotConfig, MarketCondition } from '../../types';
import { ADMIN_ACCOUNT_IDS, HIGH_PAYOUT_BOTS } from '../../types';

interface BotDefinition {
  id: string;
  name: string;
  slug: string;
  description: string;
  premium: boolean;
  icon: typeof TrendingUp;
  color: string;
  borderGlow: string;
  symbol: string;
}

// Smoothed metrics state for rolling average
interface SmoothedMetrics {
  confidence: number;
  condition: MarketCondition;
  confidenceHistory: number[];
}

const BOTS: BotDefinition[] = [
  {
    id: 'tosh-alpha',
    name: 'TOSH Alpha Bot',
    slug: 'tosh-alpha',
    description: 'Trend-following strategy executing entries on 1-tick intervals using calculated EMA crossovers combined with momentum confirmation tracking.',
    premium: false,
    icon: TrendingUp,
    color: 'from-emerald-500/20 to-emerald-600/10',
    borderGlow: 'hover:border-emerald-500/50 hover:shadow-emerald-500/20',
    symbol: 'R_100', // Volatility 100 Index
  },
  {
    id: 'tosh-quantum',
    name: 'TOSH Quantum Bot',
    slug: 'tosh-quantum',
    description: 'Volatility breakout strategy assessing live Bollinger Band width expansions and ATR spike analysis to time structural market entries.',
    premium: false,
    icon: Activity,
    color: 'from-blue-500/20 to-blue-600/10',
    borderGlow: 'hover:border-blue-500/50 hover:shadow-blue-500/20',
    symbol: 'R_100', // Volatility 100 Index
  },
  {
    id: 'tosh-velocity',
    name: 'TOSH Velocity Bot',
    slug: 'tosh-velocity',
    description: 'Short-term hyper-scalping strategy relying on sudden high-frequency, multi-tick directional momentum detection.',
    premium: false,
    icon: Zap,
    color: 'from-cyan-500/20 to-cyan-600/10',
    borderGlow: 'hover:border-cyan-500/50 hover:shadow-cyan-500/20',
    symbol: 'R_100_1S',
  },
  {
    id: 'tosh-phantom',
    name: 'TOSH Phantom Bot',
    slug: 'tosh-phantom',
    description: 'Pattern recognition framework matching consecutive micro-candle tick signatures to anticipate direct reversals.',
    premium: false,
    icon: Ghost,
    color: 'from-purple-500/20 to-purple-600/10',
    borderGlow: 'hover:border-purple-500/50 hover:shadow-purple-500/20',
    symbol: 'R_100_1S',
  },
  {
    id: 'tosh-nova',
    name: 'TOSH Nova Bot',
    slug: 'tosh-nova',
    description: 'Classic horizontal support/resistance breakout strategy tracking recent high/low tick boundaries.',
    premium: false,
    icon: Sun,
    color: 'from-orange-500/20 to-orange-600/10',
    borderGlow: 'hover:border-orange-500/50 hover:shadow-orange-500/20',
    symbol: 'R_100_1S',
  },
  {
    id: 'tosh-titan',
    name: 'TOSH Titan Bot',
    slug: 'tosh-titan',
    description: 'Macro-trend confirmation system ensuring trades are only authorized when the broader 50-tick market directional velocity matches the entry.',
    premium: false,
    icon: Mountain,
    color: 'from-stone-500/20 to-stone-600/10',
    borderGlow: 'hover:border-stone-500/50 hover:shadow-stone-500/20',
    symbol: 'R_100_1S',
  },
  {
    id: 'tosh-matrix',
    name: 'TOSH Matrix Bot',
    slug: 'tosh-matrix',
    description: 'Multi-indicator consensus system requiring matching confirmation from EMA, ATR, and momentum indicators concurrently.',
    premium: true,
    icon: Grid,
    color: 'from-primary-500/20 to-primary-600/10',
    borderGlow: 'hover:border-primary-500/50 hover:shadow-primary-500/20',
    symbol: 'R_100_1S',
  },
  {
    id: 'tosh-elite',
    name: 'TOSH Elite Bot',
    slug: 'tosh-elite',
    description: 'Advanced combined multi-layer defense strategy featuring dynamic trend scalping paired with adaptive micro-candle confirmations.',
    premium: true,
    icon: Crown,
    color: 'from-amber-500/20 to-amber-600/10',
    borderGlow: 'hover:border-amber-500/50 hover:shadow-amber-500/20',
    symbol: 'R_100_1S',
  },
];

export function Dashboard() {
  const { isAuthenticated, user } = useAuthStore();
  const { setActiveTab } = useAppStore();
  const { setActiveBot } = useBotStore();
  const [smoothedMetrics, setSmoothedMetrics] = useState<Map<string, SmoothedMetrics>>(new Map());
  const metricsRef = useRef<Map<string, SmoothedMetrics>>(new Map());

  // Rolling average window size
  const ROLLING_WINDOW = 8;

  // Simulate confidence metrics for logged-out display with smoothing
  useEffect(() => {
    if (isAuthenticated) return;

    // Initialize with starting values
    const initialValues = new Map();
    BOTS.forEach((bot) => {
      const initialConfidence = 70 + Math.random() * 20;
      initialValues.set(bot.id, {
        confidence: initialConfidence,
        condition: initialConfidence >= 80 ? 'optimal' : initialConfidence >= 60 ? 'favorable' : 'risky',
        confidenceHistory: Array(ROLLING_WINDOW).fill(initialConfidence),
      });
    });
    setSmoothedMetrics(initialValues);
    metricsRef.current = initialValues;

    // Update every 400ms with smoothed values
    const interval = setInterval(() => {
      const newMap = new Map();

      BOTS.forEach((bot) => {
        const current = metricsRef.current.get(bot.id);
        if (!current) return;

        // Generate new raw value
        const newRawValue = 65 + Math.random() * 30;

        // Update rolling history
        const newHistory = [...current.confidenceHistory.slice(1), newRawValue];

        // Calculate smoothed average
        const smoothedConfidence = newHistory.reduce((a, b) => a + b, 0) / newHistory.length;

        // Determine condition
        const condition: MarketCondition = smoothedConfidence >= 80 ? 'optimal' : smoothedConfidence >= 60 ? 'favorable' : 'risky';

        const updated = {
          confidence: smoothedConfidence,
          condition,
          confidenceHistory: newHistory,
        };

        newMap.set(bot.id, updated);
      });

      setSmoothedMetrics(newMap);
      metricsRef.current = newMap;
    }, 400);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const isAdmin = user && ADMIN_ACCOUNT_IDS.includes(user.derivAccountId);

  const handleLoadBot = (bot: BotDefinition) => {
    const botConfig: BotConfig = {
      botId: bot.id,
      botName: bot.name,
      botSlug: bot.slug,
      stake: 1,
      takeProfit: 10,
      stopLoss: 5,
      symbol: bot.symbol,
      contractType: 'RISE',
      duration: 5,
      durationUnit: 't',
      martingaleMultiplier: 2,
      maxMartingaleSteps: 4,
      isPremium: bot.premium,
      usesHighPayout: HIGH_PAYOUT_BOTS.includes(bot.slug),
    };

    setActiveBot(botConfig);
    setActiveTab('bot-builder');
  };

  const isBotLocked = (bot: BotDefinition): boolean => {
    if (!bot.premium) return false;
    return !isAdmin && (!user || !user.isPremium);
  };

  const getConditionBadge = (condition: MarketCondition) => {
    switch (condition) {
      case 'optimal':
        return <span className="badge badge-success">Optimal Entry</span>;
      case 'favorable':
        return <span className="badge badge-warning">Favorable</span>;
      case 'risky':
        return <span className="badge badge-danger">Risky to Trade</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-8 sm:pt-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100 mb-2">Trading Bot Factory</h1>
        <p className="text-gray-400 text-sm">
          Select a trading strategy to begin automated execution
        </p>
      </div>

      {/* Bot Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {BOTS.map((bot) => {
          const metrics = smoothedMetrics.get(bot.id);
          const isLocked = isBotLocked(bot);
          const isPremiumBot = bot.premium;

          return (
            <div
              key={bot.id}
              className={`relative card overflow-hidden transition-all duration-300 ${isLocked ? '' : bot.borderGlow}`}
            >
              {/* Premium Lock Overlay */}
              {isLocked && (
                <div className="premium-lock">
                  <Lock className="w-8 h-8 text-primary-400 mb-3" />
                  <p className="text-sm font-semibold text-primary-400 mb-2">ACTIVATE PRO</p>
                  <button
                    onClick={() => {
                      // Could show premium upsell modal
                    }}
                    className="btn-gold text-xs px-4"
                  >
                    Upgrade Now
                  </button>
                </div>
              )}

              {/* Card Content */}
              <div className={`bg-gradient-to-br ${bot.color} p-4 h-full flex flex-col`}>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${bot.color} border border-gray-700/30`}>
                    <bot.icon className="w-5 h-5 text-gray-200" />
                  </div>
                  {isPremiumBot && !isLocked && (
                    <Crown className="w-4 h-4 text-primary-400" />
                  )}
                  {metrics && !isLocked && (
                    getConditionBadge(metrics.condition)
                  )}
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-gray-100 mb-2">{bot.name}</h3>

                {/* Strategy Type */}
                <div className="text-xs text-primary-400 font-medium mb-2">
                  {bot.premium ? 'PREMIUM' : 'FREE'} • {bot.id === 'tosh-alpha' || bot.id === 'tosh-quantum' || bot.id === 'tosh-matrix' ? 'HIGH-PAYOUT' : ' STANDARD'}
                </div>

                {/* Description */}
                <p className="text-xs text-gray-400 leading-relaxed flex-grow mb-4 line-clamp-3">
                  {bot.description}
                </p>

                {/* Metrics Preview */}
                {metrics && !isLocked && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">Confidence</span>
                      <span className="font-medium text-gray-300">{metrics.confidence.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-dark-300 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          metrics.confidence >= 80
                            ? 'bg-success'
                            : metrics.confidence >= 60
                            ? 'bg-warning'
                            : 'bg-danger'
                        }`}
                        style={{ width: `${metrics.confidence}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={() => handleLoadBot(bot)}
                  disabled={isLocked && !isAuthenticated}
                  className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isLocked && !isAuthenticated
                      ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                      : isLocked
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30 hover:bg-primary-500/30'
                      : 'btn-gold'
                  }`}
                >
                  {!isAuthenticated ? (
                    isLocked ? 'Login to Trade' : 'LOAD BOT (DEMO MODE)'
                  ) : isLocked ? (
                    'UPGRADE TO PRO'
                  ) : (
                    'LOAD BOT'
                  )}
                </button>

                {/* High-Payout Recovery Badge */}
                {HIGH_PAYOUT_BOTS.includes(bot.slug) && !isLocked && (
                  <div className="mt-2 flex items-center justify-center gap-1 text-xs text-success">
                    <Shield className="w-3 h-3" />
                    <span>Martingale Recovery (2x)</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
