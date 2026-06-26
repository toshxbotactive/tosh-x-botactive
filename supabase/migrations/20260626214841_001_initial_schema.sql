-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deriv_account_id TEXT UNIQUE NOT NULL,
  account_type_active TEXT DEFAULT 'demo' CHECK (account_type_active IN ('real', 'demo')),
  is_premium_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bots Table
CREATE TABLE bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_name TEXT NOT NULL,
  bot_slug TEXT UNIQUE NOT NULL,
  underlying_strategy TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  operational_status TEXT DEFAULT 'idle' CHECK (operational_status IN ('idle', 'running')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trades Table
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bot_id UUID REFERENCES bots(id) ON DELETE SET NULL,
  deriv_contract_id TEXT,
  symbol TEXT NOT NULL,
  contract_type TEXT NOT NULL,
  entry_spot DECIMAL(18, 5),
  exit_spot DECIMAL(18, 5),
  buy_price DECIMAL(18, 5) NOT NULL,
  gross_payout DECIMAL(18, 5) DEFAULT 0,
  net_profit_loss DECIMAL(18, 5) DEFAULT 0,
  is_win BOOLEAN,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users (public access for demo)
CREATE POLICY "users_select_all" ON users FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "users_insert_all" ON users FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "users_update_all" ON users FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- RLS Policies for bots (public read for demo)
CREATE POLICY "bots_select_all" ON bots FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "bots_insert_all" ON bots FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "bots_update_all" ON bots FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- RLS Policies for trades
CREATE POLICY "trades_select_all" ON trades FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "trades_insert_all" ON trades FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "trades_update_all" ON trades FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Insert default bots
INSERT INTO bots (bot_name, bot_slug, underlying_strategy, is_premium) VALUES
('TOSH Alpha Bot', 'tosh-alpha', 'Trend-following strategy executing entries on 1-tick intervals using calculated Exponential Moving Average (EMA) crossovers combined with momentum confirmation tracking.', FALSE),
('TOSH Quantum Bot', 'tosh-quantum', 'Volatility breakout strategy assessing live Bollinger Band width expansions and Average True Range (ATR) spike analysis to time structural market entries.', FALSE),
('TOSH Velocity Bot', 'tosh-velocity', 'Short-term hyper-scalping strategy relying on sudden high-frequency, multi-tick directional momentum detection.', FALSE),
('TOSH Phantom Bot', 'tosh-phantom', 'Pattern recognition framework matching consecutive micro-candle tick signatures to anticipate direct reversals.', FALSE),
('TOSH Nova Bot', 'tosh-nova', 'Classic horizontal support/resistance breakout strategy tracking recent high/low tick boundaries.', FALSE),
('TOSH Titan Bot', 'tosh-titan', 'Macro-trend confirmation system ensuring trades are only authorized when the broader 50-tick market directional velocity matches the entry.', FALSE),
('TOSH Matrix Bot', 'tosh-matrix', 'Multi-indicator consensus system requiring matching confirmation from EMA, ATR, and momentum indicators concurrently.', TRUE),
('TOSH Elite Bot', 'tosh-elite', 'Advanced combined multi-layer defense strategy featuring dynamic trend scalping paired with adaptive micro-candle confirmations.', TRUE);