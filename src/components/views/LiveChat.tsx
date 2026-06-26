import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';
import type { DerivTick } from '../../types';

interface TickPattern {
  tick: DerivTick;
  direction: 'rise' | 'fall';
  change: number;
  timestamp: Date;
}

export function LiveChat() {
  const [recentPatterns, setRecentPatterns] = useState<TickPattern[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [tickCount, setTickCount] = useState(0);

  const SYMBOL = 'Volatility 100 (1s)';

  useEffect(() => {
    // Simulate ticks - real API connection would replace this
    const simulateTicks = () => {
      const simulatedTick = (prev: number) => prev + (Math.random() - 0.5) * 10;
      let lastPrice = 1000 + Math.random() * 200;

      const interval = setInterval(() => {
        lastPrice = simulatedTick(lastPrice);
        setCurrentPrice(lastPrice);
        setTickCount((prev) => prev + 1);

        const change = (Math.random() - 0.5) * 2;
        setPriceChange(change);

        const direction: 'rise' | 'fall' = change >= 0 ? 'rise' : 'fall';

        setRecentPatterns((prev) => {
          const newPattern: TickPattern = {
            tick: {
              epoch: Date.now(),
              quote: lastPrice,
              symbol: 'R_100_1S',
            },
            direction,
            change: Math.abs(change),
            timestamp: new Date(),
          };
          return [newPattern, ...prev.slice(0, 49)];
        });
      }, 100);

      return interval;
    };

    const simulationInterval = simulateTicks();
    // Uncomment to use real connection:
    // setupTicks();

    return () => {
      clearInterval(simulationInterval);
    };
  }, []);

  const formatPrice = (price: number) => {
    if (!price) return '---';
    return price.toFixed(2);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-8 sm:pt-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Live Market Ticker</h1>
        <p className="text-gray-400 text-sm">Real-time rise/fall patterns from {SYMBOL}</p>
      </div>

      {/* Current Price Display */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">Current Spot</p>
            <div className="flex items-baseline gap-3">
              <span className={`text-4xl font-bold ${priceChange >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatPrice(currentPrice)}
              </span>
              <span className={`text-lg font-medium ${priceChange >= 0 ? 'text-success' : 'text-danger'}`}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(4)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 border border-success/30">
              <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
              <span className="text-sm font-medium text-success">LIVE</span>
            </div>

            {/* Tick Count */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-light border border-gray-700/30">
              <Activity className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium text-gray-300">{tickCount} ticks</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="stat-card text-center">
            <p className="text-xs text-gray-500 mb-1">Rise Patterns</p>
            <p className="text-xl font-bold text-success">
              {recentPatterns.filter(p => p.direction === 'rise').length}
            </p>
          </div>
          <div className="stat-card text-center">
            <p className="text-xs text-gray-500 mb-1">Fall Patterns</p>
            <p className="text-xl font-bold text-danger">
              {recentPatterns.filter(p => p.direction === 'fall').length}
            </p>
          </div>
          <div className="stat-card text-center">
            <p className="text-xs text-gray-500 mb-1">Avg. Change</p>
            <p className="text-xl font-bold text-primary-400">
              {recentPatterns.length > 0
                ? (recentPatterns.reduce((sum, p) => sum + p.change, 0) / recentPatterns.length).toFixed(4)
                : '0.0000'}
            </p>
          </div>
          <div className="stat-card text-center">
            <p className="text-xs text-gray-500 mb-1">Direction</p>
            <p className={`text-xl font-bold ${priceChange >= 0 ? 'text-success' : 'text-danger'}`}>
              {priceChange >= 0 ? 'RISE' : 'FALL'}
            </p>
          </div>
        </div>
      </div>

      {/* Pattern Logger */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-800/50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-200">Pattern Logger</h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Zap className="w-3.5 h-3.5 text-primary-400" />
            <span>Auto-updating</span>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto scrollbar-thin p-4">
          {recentPatterns.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-8 h-8 text-gray-600 mx-auto mb-2 animate-pulse" />
              <p className="text-sm text-gray-500">Waiting for tick data...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentPatterns.map((pattern, index) => (
                <div
                  key={`${pattern.tick.epoch}-${index}`}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    pattern.direction === 'rise'
                      ? 'bg-success/5 border border-success/20'
                      : 'bg-danger/5 border border-danger/20'
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    pattern.direction === 'rise'
                      ? 'bg-success/20'
                      : 'bg-danger/20'
                  }`}>
                    {pattern.direction === 'rise' ? (
                      <TrendingUp className="w-4 h-4 text-success" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-danger" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${
                        pattern.direction === 'rise' ? 'text-success' : 'text-danger'
                      }`}>
                        [{pattern.direction === 'rise' ? '🟩 RISE' : '🟥 FALL'}]
                      </span>
                      <span className="text-xs text-gray-500">
                        {pattern.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Spot {formatPrice(pattern.tick.quote)} • Change {pattern.change.toFixed(4)}
                    </div>
                  </div>

                  {/* Index */}
                  <span className="text-xs text-gray-600 font-mono">#{index + 1}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 rounded-lg bg-surface-light/50 border border-gray-700/30">
        <p className="text-xs text-gray-500 text-center">
          This ticker displays real-time market patterns from the Deriv volatility indices.
          Use this information for educational and analysis purposes only.
        </p>
      </div>
    </div>
  );
}
