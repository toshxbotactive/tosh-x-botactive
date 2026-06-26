import { useEffect, useState } from 'react';
import { Header } from './components/Layout/Header';
import { Navigation } from './components/Layout/Navigation';
import { Footer } from './components/Layout/Footer';
import { ProtocolModal } from './components/Layout/ProtocolModal';
import { Dashboard } from './components/views/Dashboard';
import { BotBuilder } from './components/views/BotBuilder';
import { Analysis } from './components/views/Analysis';
import { LiveChat } from './components/views/LiveChat';
import { AdminPanel } from './components/views/AdminPanel';
import { useAppStore } from './stores/appStore';
import { useAuthStore } from './stores/authStore';
import { initializeAuth, setupOAuthListener } from './services/authService';
import { derivService } from './services/derivWebSocket';

function App() {
  const { activeTab } = useAppStore();
  useAuthStore(); // Initialize auth store
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        setupOAuthListener();
        await initializeAuth();
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();

    // Initialize WebSocket connection
    derivService.connect().catch(console.error);

    return () => {
      derivService.disconnect();
    };
  }, []);

  // Handle responsive
  useEffect(() => {
    const checkMobile = () => {
      useAppStore.getState().setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-500 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary-400/20 border-t-primary-400 animate-spin" />
          </div>
          <div className="text-xl font-display font-bold gold-gradient-text">TOSH-X-BOT</div>
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'bot-builder':
        return <BotBuilder />;
      case 'analysis':
        return <Analysis />;
      case 'live-chat':
        return <LiveChat />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-500 flex flex-col">
      {/* Header */}
      <Header />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="flex-1 relative">
        {renderView()}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <ProtocolModal />
      <AdminPanel />
    </div>
  );
}

export default App;
