import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AccountType, UserInfo } from '../types';
import { ADMIN_ACCOUNT_IDS } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  token: string | null;
  accounts: Record<string, { id: string; type: 'real' | 'demo'; currency: string; balance: number }>;

  setToken: (token: string | null) => void;
  setUser: (user: UserInfo | null) => void;
  setAccounts: (accounts: AuthState['accounts']) => void;
  switchAccount: (accountType: AccountType) => void;
  updateBalance: (accountId: string, balance: number) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      accounts: {},

      setToken: (token) => {
        set({ token, isAuthenticated: !!token });
        if (token) {
          localStorage.setItem('deriv_token', token);
        } else {
          localStorage.removeItem('deriv_token');
        }
      },

      setUser: (user) => set({ user }),

      setAccounts: (accounts) => set({ accounts }),

      switchAccount: (accountType) => {
        const { user, accounts } = get();
        if (!user) return;

        const targetAccount = Object.entries(accounts).find(
          ([_, acc]) => acc.type === accountType
        );

        if (targetAccount) {
          set({
            user: {
              ...user,
              accountTypeActive: accountType,
              activeAccountId: targetAccount[1].id,
            },
          });
        }
      },

      updateBalance: (accountId, balance) => {
        const { accounts, user } = get();
        const updated = { ...accounts };
        if (updated[accountId]) {
          updated[accountId].balance = balance;
        }

        const realBalance = Object.values(updated)
          .filter(a => a.type === 'real')
          .reduce((sum, a) => sum + a.balance, 0);
        const demoBalance = Object.values(updated)
          .filter(a => a.type === 'demo')
          .reduce((sum, a) => sum + a.balance, 0);

        set({
          accounts: updated,
          user: user ? { ...user, realBalance, demoBalance } : null,
        });
      },

      logout: () => {
        localStorage.removeItem('deriv_token');
        localStorage.removeItem('deriv_accounts');
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          accounts: {},
        });
      },

      isAdmin: () => {
        const { user } = get();
        return user ? ADMIN_ACCOUNT_IDS.includes(user.derivAccountId) : false;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        accounts: state.accounts,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
