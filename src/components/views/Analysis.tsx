import { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Clock, Target, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useBotStore } from '../../stores/botStore';

interface MetricCard {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: typeof TrendingUp;
  color: string;
}

const generateMockData = (count: number) => {
  const data = [];
  let cumulativeProfit = 0;
  for (let i = 0; i < count; i++) {
    const profit = Math.random() * 100 - 30;
    cumulativeProfit += profit;
    data.push({
      time: `${i}:00`,
      profit,
      trades: Math.floor(Math.random() * 10) + 1,
      wins: Math.floor(Math.random() * 7) + 1,
      losses: Math.floor(Math.random() * 3),
      cumulativeProfit,
    });
  }
  return data;
};

export function Analysis() {
  const { statistics } = useBotStore();
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');
  const [profitData] = useState(generateMockData(24));

  // Calculate statistics
  const totalProfit = statistics.totalProfit;
  const totalLoss = statistics.totalLoss;
  const netProfit = statistics.netProfit;
  const winRate = statistics.winRate;
  const totalTrades = statistics.totalTrades;

  // Prepare chart data - cumulativeProfit is already in the data
  const chartData = profitData;

  const metrics: MetricCard[] = [
    {
      title: 'Total Profit',
      value: `$${totalProfit.toFixed(2)}`,
      change: `+${winRate.toFixed(1)}% WR`,
      changeType: 'positive',
      icon: TrendingUp,
      color: 'text-success',
    },
    {
      title: 'Total Loss',
      value: `$${totalLoss.toFixed(2)}`,
      icon: TrendingDown,
      color: 'text-danger',
    },
    {
      title: 'Net P/L',
      value: `$${netProfit >= 0 ? '+' : ''}${netProfit.toFixed(2)}`,
      change: `$${(totalProfit + totalLoss).toFixed(2)} traded`,
      changeType: netProfit >= 0 ? 'positive' : 'negative',
      icon: DollarSign,
      color: netProfit >= 0 ? 'text-success' : 'text-danger',
    },
    {
      title: 'Total Trades',
      value: totalTrades,
      change: `${statistics.wins}W / ${statistics.losses}L`,
      changeType: 'neutral',
      icon: BarChart3,
      color: 'text-primary-400',
    },
    {
      title: 'Win Rate',
      value: `${winRate.toFixed(1)}%`,
      change: winRate >= 50 ? 'Above 50%' : 'Below 50%',
      changeType: winRate >= 50 ? 'positive' : 'negative',
      icon: Target,
      color: winRate >= 50 ? 'text-success' : 'text-warning',
    },
    {
      title: 'Avg. Trade Time',
      value: '5s',
      icon: Clock,
      color: 'text-gray-400',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-8 sm:pt-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Performance Analysis</h1>
          <p className="text-gray-400 text-sm">Track your trading bot performance</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-1 p-1 rounded-lg bg-surface-light">
          {(['day', 'week', 'month'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                timeRange === range
                  ? 'bg-primary-500 text-dark-900'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {metrics.map((metric) => (
          <div key={metric.title} className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
              <span className="text-xs text-gray-500">{metric.title}</span>
            </div>
            <div className={`text-xl font-bold ${metric.color}`}>{metric.value}</div>
            {metric.change && (
              <div className="text-xs text-gray-400 mt-1">{metric.change}</div>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Profit Over Time */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-200 mb-4">Cumulative Profit</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a24',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeProfit"
                  stroke="#10b981"
                  fill="url(#profitGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trades Distribution */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-200 mb-4">Trade Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a24',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="wins" fill="#10b981" radius={[2, 2, 0, 0]} />
                <Bar dataKey="losses" fill="#ef4444" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bot Performance Comparison */}
      <div className="card p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-200 mb-4">Bot Performance Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Alpha Bot */}
          <div className="p-4 rounded-lg bg-surface-light/50 border border-emerald-500/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-200">TOSH Alpha Bot</span>
              <span className="text-xs text-success">+24.5%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-dark-300 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '78%' }} />
              </div>
              <span className="text-xs text-gray-400">78% WR</span>
            </div>
          </div>

          {/* Quantum Bot */}
          <div className="p-4 rounded-lg bg-surface-light/50 border border-blue-500/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-200">TOSH Quantum Bot</span>
              <span className="text-xs text-success">+18.2%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-dark-300 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }} />
              </div>
              <span className="text-xs text-gray-400">65% WR</span>
            </div>
          </div>

          {/* Velocity Bot */}
          <div className="p-4 rounded-lg bg-surface-light/50 border border-cyan-500/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-200">TOSH Velocity Bot</span>
              <span className="text-xs text-success">+12.8%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-dark-300 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: '52%' }} />
              </div>
              <span className="text-xs text-gray-400">52% WR</span>
            </div>
          </div>

          {/* Matrix Bot (Premium) */}
          <div className="p-4 rounded-lg bg-surface-light/50 border border-primary-500/20 ring-1 ring-primary-500/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-primary-400">TOSH Matrix Bot</span>
              <span className="text-xs text-success">+38.7%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-dark-300 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full" style={{ width: '85%' }} />
              </div>
              <span className="text-xs text-gray-400">85% WR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="p-4 rounded-xl bg-warning/10 border border-warning/30 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-warning mb-1">Trading Disclaimer</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Past performance does not guarantee future results. All trading involves risk.
            Never trade with money you cannot afford to lose. The data shown is for demonstration purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
