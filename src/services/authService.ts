import { derivService } from './derivWebSocket';
import { useAuthStore } from '../stores/authStore';
import { ADMIN_ACCOUNT_IDS } from '../types';

const APP_ID = '1089';
const DERIV_WS_URL = `wss://ws.derivws.com/websockets/v3?app_id=${APP_ID}`;

// Environment detection
export const isDevelopment = (): boolean => {
  // Check multiple indicators for development/iframe environment
  try {
    // Check if in iframe
    const inIframe = window.self !== window.top;

    // Check for localhost/development hosts
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');

    // Check for Bolt preview environment or other development indicators
    const isPreview = hostname.includes('bolt') ||
                       hostname.includes('stackblitz') ||
                       hostname.includes('webcontainer') ||
                       hostname.includes('local-credentialless') ||
                       window.location.port !== '';

    // Check for production domains (customize as needed)
    const productionDomains = ['vercel.app', 'netlify.app'];
    const isProductionHost = productionDomains.some(domain => hostname.includes(domain));

    // Only true if NOT on production host AND (in iframe OR localhost OR preview)
    return !isProductionHost && (inIframe || isLocalhost || isPreview);
  } catch {
    // If we can't access window.top due to cross-origin, assume development
    return true;
  }
};

export const isProduction = (): boolean => {
  return !isDevelopment();
};

export const generateOAuthURL = (): string => {
  // Use the current origin and pathname for the redirect
  const currentPath = window.location.pathname;
  const redirectUrl = encodeURIComponent(window.location.origin + currentPath);
  return `https://app.deriv.com/oauth2/authorize?app_id=${APP_ID}&l=en&redirect_uri=${redirectUrl}`;
};

// Parse URL parameters for OAuth callback
export const parseOAuthCallback = (): { token: string | null; accountId: string | null } => {
  const urlParams = new URLSearchParams(window.location.search);

  // Try multiple parameter names for flexibility
  const token = urlParams.get('token1') || urlParams.get('token') || urlParams.get('access_token');
  const accountId = urlParams.get('acct1') || urlParams.get('acct') || urlParams.get('account_id');

  if (token && accountId) {
    // Clean URL by removing query parameters
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
    return { token, accountId };
  }

  return { token: null, accountId: null };
};

// Simulate OAuth in development environment with realistic mock data
export const simulateOAuthCallback = async (): Promise<{ token: string; accountId: string }> => {
  // Generate realistic mock token
  const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  const mockAccountId = 'VRTC123456'; // Admin account for testing

  // Set mock URL parameters temporarily (for visual feedback)
  const url = new URL(window.location.href);
  url.searchParams.set('token1', mockToken);
  url.searchParams.set('acct1', mockAccountId);
  window.history.replaceState({}, document.title, url.toString());

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Clean the URL
  window.history.replaceState({}, document.title, window.location.pathname);

  return { token: mockToken, accountId: mockAccountId };
};

// Setup mock WebSocket connection for development
const setupMockConnection = (): void => {
  // Simulate tick updates for development
  setInterval(() => {
    const mockTick = {
      epoch: Date.now(),
      quote: 1000 + Math.random() * 200,
      symbol: 'R_100_1S',
    };
    derivService['tickCallbacks'].forEach(cb => cb(mockTick));
  }, 100);
};

// Login with Deriv OAuth - Dual Mode
export const loginWithDeriv = async (): Promise<void> => {
  const devMode = isDevelopment();

  console.log(`[AUTH] Environment: ${devMode ? 'Development/Iframe' : 'Production'}`);

  if (devMode) {
    // DEVELOPMENT/IFRAME MODE: Simulate authentication
    console.log('[AUTH] Running in development mode - simulating OAuth');

    try {
      const { token, accountId } = await simulateOAuthCallback();
      await authenticateUserMock(token, accountId);
    } catch (error) {
      console.error('[AUTH] Simulated authentication failed:', error);
      throw error;
    }
  } else {
    // PRODUCTION MODE: Redirect to live Deriv OAuth
    console.log('[AUTH] Running in production mode - redirecting to Deriv OAuth');
    const oauthUrl = generateOAuthURL();
    console.log('[AUTH] OAuth URL:', oauthUrl);
    window.location.href = oauthUrl;
  }
};

// Authenticate user with mock data (development mode)
export const authenticateUserMock = async (token: string, accountId: string): Promise<void> => {
  console.log('[AUTH] Setting up mock authenticated state');

  const isAdmin = ADMIN_ACCOUNT_IDS.includes(accountId);

  // Create realistic mock user info
  const userInfo = {
    id: crypto.randomUUID(),
    derivAccountId: accountId,
    accountTypeActive: 'demo' as const,
    isPremium: isAdmin,
    realBalance: 0,
    demoBalance: 10000 + Math.floor(Math.random() * 5000),
    activeAccountId: accountId,
  };

  // Setup mock accounts
  const accounts = {
    [accountId]: {
      id: accountId,
      type: 'demo' as const,
      currency: 'USD',
      balance: userInfo.demoBalance,
    },
    'CR_RELATED_001': {
      id: 'CR_RELATED_001',
      type: 'real' as const,
      currency: 'USD',
      balance: 543.21,
    },
  };

  // Set auth state
  const authStore = useAuthStore.getState();
  authStore.setToken(token);
  authStore.setUser(userInfo);
  authStore.setAccounts(accounts);

  // Store in localStorage
  localStorage.setItem('deriv_token', token);
  localStorage.setItem('deriv_account_id', accountId);
  localStorage.setItem('auth_mode', 'mock');

  // Setup mock connection for live indicator
  setupMockConnection();

  console.log('[AUTH] Mock authentication complete:', userInfo);
};

// Authenticate user with real Deriv API (production mode)
export const authenticateUserLive = async (token: string, accountId: string): Promise<void> => {
  console.log('[AUTH] Authenticating with live Deriv API');

  try {
    // Connect to Deriv WebSocket if not connected
    if (!derivService.isConnectedStatus()) {
      console.log('[AUTH] Connecting to Deriv WebSocket:', DERIV_WS_URL);
      await derivService.connect();
      console.log('[AUTH] WebSocket connected successfully');
    }

    // Authorize with the provided token
    console.log('[AUTH] Authorizing with token...');
    const authResponse = await derivService.authorize(token);
    console.log('[AUTH] Authorization response:', authResponse);

    // Get account list and balance
    console.log('[AUTH] Fetching account information...');
    await derivService.getBalance();

    // Subscribe to real-time balance updates
    derivService.subscribeToBalance();

    // Subscribe to tick stream for live indicator
    derivService.subscribeToTicks('R_100_1S');

    // Check if admin
    const isAdmin = ADMIN_ACCOUNT_IDS.includes(accountId);

    // Create user info from API response
    const userInfo = {
      id: crypto.randomUUID(),
      derivAccountId: accountId,
      accountTypeActive: 'demo' as const,
      isPremium: isAdmin,
      realBalance: 0,
      demoBalance: 10000,
      activeAccountId: accountId,
    };

    // Set auth state
    const authStore = useAuthStore.getState();
    authStore.setToken(token);
    authStore.setUser(userInfo);

    // Setup balance update callback
    derivService.onBalance((data) => {
      console.log('[AUTH] Balance update received:', data);
      Object.entries(data.accounts).forEach(([id, acc]) => {
        authStore.updateBalance(id, acc.balance);
      });
    });

    // Store in localStorage
    localStorage.setItem('deriv_token', token);
    localStorage.setItem('deriv_account_id', accountId);
    localStorage.setItem('auth_mode', 'live');

    console.log('[AUTH] Live authentication complete:', userInfo);
  } catch (error) {
    console.error('[AUTH] Live authentication failed:', error);
    throw error;
  }
};

// Main authenticate function - handles both modes
export const authenticateUser = async (token: string, accountId: string): Promise<void> => {
  const authMode = localStorage.getItem('auth_mode');
  const devMode = isDevelopment();

  if (devMode || authMode === 'mock') {
    return authenticateUserMock(token, accountId);
  } else {
    return authenticateUserLive(token, accountId);
  }
};

// Logout
export const logoutUser = async (): Promise<void> => {
  console.log('[AUTH] Logging out...');

  const authStore = useAuthStore.getState();
  authStore.logout();

  // Clear localStorage
  localStorage.removeItem('deriv_token');
  localStorage.removeItem('deriv_account_id');
  localStorage.removeItem('auth_mode');

  // Disconnect WebSocket
  derivService.disconnect();

  // Redirect to home
  window.location.href = window.location.pathname;
};

// Initialize authentication on app load
export const initializeAuth = async (): Promise<void> => {
  console.log('[AUTH] Initializing authentication...');

  // Check for OAuth callback parameters first
  const { token, accountId } = parseOAuthCallback();

  if (token && accountId) {
    console.log('[AUTH] OAuth callback detected - authenticating...');
    localStorage.setItem('auth_mode', isDevelopment() ? 'mock' : 'live');
    await authenticateUser(token, accountId);
    localStorage.setItem('deriv_token', token);
    localStorage.setItem('deriv_account_id', accountId);
    return;
  }

  // Check for existing stored credentials
  const savedToken = localStorage.getItem('deriv_token');
  const savedAccountId = localStorage.getItem('deriv_account_id');
  const authMode = localStorage.getItem('auth_mode');

  if (savedToken && savedAccountId) {
    console.log(`[AUTH] Found stored credentials (mode: ${authMode})`);
    try {
      await authenticateUser(savedToken, savedAccountId);
    } catch (error) {
      console.error('[AUTH] Stored credentials invalid, clearing...');
      localStorage.removeItem('deriv_token');
      localStorage.removeItem('deriv_account_id');
      localStorage.removeItem('auth_mode');
    }
  }

  console.log('[AUTH] Initialization complete');
};

// Listen for OAuth callbacks in postMessage (for cross-window communication)
export const setupOAuthListener = (): void => {
  window.addEventListener('message', (event) => {
    // Verify origin if in production
    if (isProduction() && event.origin !== window.location.origin) {
      return;
    }

    if (event.data && typeof event.data === 'string') {
      try {
        const data = JSON.parse(event.data);
        if (data.token1 && data.acct1) {
          console.log('[AUTH] OAuth callback via postMessage');
          authenticateUser(data.token1, data.acct1);
        }
      } catch {
        // Not JSON, ignore
      }
    }
  });
};

// Export helper to check current auth mode
export const getAuthMode = (): 'mock' | 'live' | null => {
  return localStorage.getItem('auth_mode') as 'mock' | 'live' | null;
};

// Persistent user storage
const originalSetUser = useAuthStore.getState().setUser;
useAuthStore.getState().setUser = (user) => {
  if (user) {
    localStorage.setItem('deriv_account_id', user.derivAccountId);
  }
  originalSetUser(user);
};
