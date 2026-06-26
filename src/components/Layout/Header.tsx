import { useState, useEffect } from 'react';
import { Shield, ChevronDown, Wallet, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useAppStore } from '../../stores/appStore';
import { loginWithDeriv, logoutUser } from '../../services/authService';
import { derivService } from '../../services/derivWebSocket';

const SIGN_UP_URL = 'https://partner-tracking.deriv.com/click?a=31609&o=1&c=3&link_id=1';

export function Header() {
  const { isAuthenticated, user, switchAccount, isAdmin } = useAuthStore();
  const { toggleProtocolModal } = useAppStore();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);

  // Subscribe to tick updates for live sync indicator
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = derivService.onTick(() => {
      setIsLive(true);
      setTimeout(() => setIsLive(false), 100);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [isAuthenticated]);

  const activeBalance = user?.accountTypeActive === 'real' ? user.realBalance : user?.demoBalance ?? 0;

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(balance);
  };

  return (
    <header className="sticky top-0 z-40 bg-dark-400/95 backdrop-blur-md border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="text-2xl sm:text-3xl font-display font-bold gold-gradient-text tracking-wider">
                TOSH-X-BOT
              </div>
              <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-primary-500/50 via-primary-500 to-primary-500/50" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Protocol Shield Button */}
            <button
              onClick={toggleProtocolModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                       bg-warning/10 border border-warning/30
                       text-warning hover:bg-warning/20 hover:border-warning/50
                       transition-all duration-200 animate-pulse-slow"
              title="TOSH Systemic Discipline Protocol"
            >
              <Shield className="w-4 h-4" />
              <span className="text-sm font-semibold hidden sm:inline">Δ</span>
            </button>

            {!isAuthenticated ? (
              /* Unauthenticated State */
              <div className="flex items-center gap-2">
                <button onClick={loginWithDeriv} className="btn-gold text-sm px-4 py-2">
                  Login
                </button>
                <a
                  href={SIGN_UP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                           bg-transparent border-2 border-primary-500 text-primary-400
                           hover:bg-primary-500/10 hover:border-primary-400
                           transition-all duration-200 shadow-gold"
                >
                  Sign Up
                </a>
              </div>
            ) : (
              /* Authenticated State */
              <div className="flex items-center gap-4">
                {/* Account Switcher */}
                <div className="relative">
                  <button
                    onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                             bg-surface-light border border-gray-700/50
                             hover:border-primary-500/30 transition-all duration-200"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300 hidden sm:inline">
                      {user?.accountTypeActive === 'real' ? 'Real' : 'Demo'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isAccountMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-surface border border-gray-700/50 rounded-xl shadow-xl animate-scale-in">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            switchAccount('demo');
                            setIsAccountMenuOpen(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-surface-light transition-colors ${
                            user?.accountTypeActive === 'demo' ? 'text-primary-400' : 'text-gray-300'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-success" />
                          Demo Account
                        </button>
                        <button
                          onClick={() => {
                            switchAccount('real');
                            setIsAccountMenuOpen(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-surface-light transition-colors ${
                            user?.accountTypeActive === 'real' ? 'text-primary-400' : 'text-gray-300'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-warning" />
                          Real Account
                        </button>
                        {isAdmin() && (
                          <div className="border-t border-gray-700/50">
                            <button
                              onClick={() => {
                                useAppStore.getState().toggleAdminPanel();
                                setIsAccountMenuOpen(false);
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-surface-light transition-colors text-primary-400"
                            >
                              <Shield className="w-4 h-4" />
                              Admin Panel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Balance Display */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-primary-500/20">
                  <Wallet className="w-4 h-4 text-primary-400" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary-400">
                      {formatBalance(activeBalance)}
                    </span>
                    <div className={`w-2 h-2 rounded-full transition-opacity duration-100 ${isLive ? 'bg-success' : 'bg-success/50'}`} />
                  </div>
                </div>

                {/* Logout */}
                <button
                  onClick={logoutUser}
                  className="p-2 rounded-lg text-gray-400 hover:text-danger hover:bg-danger/10 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
