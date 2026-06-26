import { useState } from 'react';
import { X, Users, Bot, Activity, Shield, BarChart3, Award } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import { ADMIN_ACCOUNT_IDS } from '../../types';

interface AdminMetric {
  label: string;
  value: string | number;
  icon: typeof Users;
  color: string;
}

const MOCK_USERS = [
  { id: '1', derivAccountId: 'VRTC123456', accountType: 'demo', isPremium: false, balance: 10500, trades: 42, winRate: 67.8 },
  { id: '2', derivAccountId: 'VRTE789012', accountType: 'real', isPremium: true, balance: 2345.67, trades: 128, winRate: 73.5 },
  { id: '3', derivAccountId: 'VRTG345678', accountType: 'demo', isPremium: false, balance: 1000, trades: 5, winRate: 40.0 },
  { id: '4', derivAccountId: 'VRTZ901234', accountType: 'real', isPremium: false, balance: 850.25, trades: 67, winRate: 51.5 },
  { id: '5', derivAccountId: 'VRTA567890', accountType: 'demo', isPremium: true, balance: 10000, trades: 89, winRate: 82.1 },
];

const BOT_PERFORMANCE = [
  { name: 'TOSH Alpha Bot', trades: 1245, wins: 921, winRate: 74.0, profit: 3847.50, status: 'active' },
  { name: 'TOSH Quantum Bot', trades: 892, wins: 580, winRate: 65.0, profit: 2156.80, status: 'active' },
  { name: 'TOSH Velocity Bot', trades: 456, wins: 237, winRate: 52.0, profit: 672.30, status: 'active' },
  { name: 'TOSH Phantom Bot', trades: 234, wins: 154, winRate: 65.8, profit: 945.20, status: 'active' },
  { name: 'TOSH Nova Bot', trades: 567, wins: 341, winRate: 60.1, profit: 1567.90, status: 'active' },
  { name: 'TOSH Titan Bot', trades: 189, wins: 105, winRate: 55.6, profit: 542.10, status: 'idle' },
  { name: 'TOSH Matrix Bot', trades: 678, wins: 576, winRate: 85.0, profit: 8234.50, status: 'active' },
  { name: 'TOSH Elite Bot', trades: 445, wins: 373, winRate: 83.8, profit: 5678.25, status: 'active' },
];

export function AdminPanel() {
  const { showAdminPanel, toggleAdminPanel } = useAppStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'users' | 'bots' | 'logs'>('users');

  // Check if user is admin
  const isAdmin = user && ADMIN_ACCOUNT_IDS.includes(user.derivAccountId);

  if (!showAdminPanel || !isAdmin) return null;

  const metrics: AdminMetric[] = [
    { label: 'Total Users', value: MOCK_USERS.length, icon: Users, color: 'text-primary-400' },
    { label: 'Premium Users', value: MOCK_USERS.filter(u => u.isPremium).length, icon: Award, color: 'text-warning' },
    { label: 'Active Sessions', value: 3, icon: Activity, color: 'text-success' },
    { label: 'Total Trades (All)', value: MOCK_USERS.reduce((sum, u) => sum + u.trades, 0), icon: BarChart3, color: 'text-cyan-400' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-gray-700/50 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-500/20 border border-primary-500/30">
              <Shield className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-100">Admin Control Panel</h2>
              <p className="text-xs text-gray-400">System administration & monitoring</p>
            </div>
          </div>
          <button
            onClick={toggleAdminPanel}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-surface-light transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700/50">
          <div className="flex">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'users'
                  ? 'text-primary-400 border-b-2 border-primary-500'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Users
            </button>
            <button
              onClick={() => setActiveTab('bots')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'bots'
                  ? 'text-primary-400 border-b-2 border-primary-500'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Bot className="w-4 h-4 inline mr-2" />
              Bot Performance
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'logs'
                  ? 'text-primary-400 border-b-2 border-primary-500'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Activity Logs
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)] scrollbar-thin">
          {/* Metrics */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {metrics.map((metric) => (
              <div key={metric.label} className="p-4 rounded-lg bg-surface-light border border-gray-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <metric.icon className={`w-4 h-4 ${metric.color}`} />
                  <span className="text-xs text-gray-500">{metric.label}</span>
                </div>
                <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
              </div>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'users' && (
            <div className="rounded-lg border border-gray-700/50 overflow-hidden">
              <table className="w-full">
                <thead className="bg-dark-400">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Account ID</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Type</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Premium</th>
                    <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">Balance</th>
                    <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">Trades</th>
                    <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">Win Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_USERS.map((u) => (
                    <tr key={u.id} className="border-t border-gray-800/50 hover:bg-surface-light/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-100 font-mono">{u.derivAccountId}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          u.accountType === 'real' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
                        }`}>
                          {u.accountType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.isPremium ? (
                          <Award className="w-4 h-4 text-primary-400" />
                        ) : (
                          <span className="text-xs text-gray-600">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-300">${u.balance.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-400">{u.trades}</td>
                      <td className={`px-4 py-3 text-sm text-right font-medium ${u.winRate >= 50 ? 'text-success' : 'text-danger'}`}>
                        {u.winRate.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'bots' && (
            <div className="space-y-3">
              {BOT_PERFORMANCE.map((bot) => (
                <div key={bot.name} className={`p-4 rounded-lg border ${
                  bot.name.includes('Matrix') || bot.name.includes('Elite')
                    ? 'bg-premium/5 border-primary-500/20'
                    : 'bg-surface-light border-gray-700/30'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Bot className={`w-5 h-5 ${
                        bot.name.includes('Matrix') || bot.name.includes('Elite') ? 'text-primary-400' : 'text-gray-400'
                      }`} />
                      <span className="text-sm font-medium text-gray-100">{bot.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        bot.status === 'active' ? 'bg-success/20 text-success' : 'bg-gray-700/30 text-gray-500'
                      }`}>
                        {bot.status}
                      </span>
                      {bot.winRate >= 80 && (
                        <Award className="w-4 h-4 text-warning" />
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Trades</p>
                      <p className="text-sm font-semibold text-gray-300">{bot.trades}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Wins</p>
                      <p className="text-sm font-semibold text-success">{bot.wins}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Win Rate</p>
                      <p className={`text-sm font-semibold ${bot.winRate >= 50 ? 'text-success' : 'text-danger'}`}>
                        {bot.winRate.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Profit</p>
                      <p className="text-sm font-semibold text-primary-400">+${bot.profit.toLocaleString()}</p>
                    </div>
                    <div className="col-span-full md:col-span-1">
                      <p className="text-xs text-gray-500 mb-1">Performance</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-dark-300 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${bot.winRate >= 75 ? 'bg-success' : bot.winRate >= 50 ? 'bg-warning' : 'bg-danger'}`}
                            style={{ width: `${bot.winRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-success font-medium">[INFO] User VRTC123456 started TOSH Alpha Bot</span>
                  <span className="text-xs text-gray-600">12:34:56</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-warning font-medium">[WARN] Stop triggered for VRTG345678 - Max Streak</span>
                  <span className="text-xs text-gray-600">12:33:21</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-primary-500/5 border border-primary-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-primary-400 font-medium">[AUTH] New login from VRTE789012</span>
                  <span className="text-xs text-gray-600">12:30:15</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-danger/5 border border-danger/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-danger font-medium">[ERROR] Trade execution failed - Insufficient balance</span>
                  <span className="text-xs text-gray-600">12:28:45</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-surface-light border border-gray-700/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">[SYSTEM] WebSocket connection restored</span>
                  <span className="text-xs text-gray-600">12:25:30</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
