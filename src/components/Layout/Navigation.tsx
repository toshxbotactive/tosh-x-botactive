import { LayoutDashboard, Bot, BarChart3, MessageCircle } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import type { NavigationTab } from '../../types';

const NAV_ITEMS: { id: NavigationTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'bot-builder', label: 'Bot Builder', icon: Bot },
  { id: 'analysis', label: 'Analysis', icon: BarChart3 },
  { id: 'live-chat', label: 'Live', icon: MessageCircle },
];

export function Navigation() {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <nav className="bg-dark-300/50 border-b border-gray-800/50 sticky top-[57px] sm:top-[65px] z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-2 bg-surface/50 p-1.5 rounded-xl border border-gray-700/30">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                activeTab === item.id
                  ? 'bg-primary-500/10 text-primary-400 border border-primary-500/50 shadow-gold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-surface-light border border-transparent'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
