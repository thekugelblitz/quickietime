ALTER TABLE plans ADD COLUMN allowed_providers TEXT;
ALTER TABLE plans ADD COLUMN billing_type TEXT NOT NULL DEFAULT 'one_time';
ALTER TABLE plans ADD COLUMN billing_interval TEXT NOT NULL DEFAULT 'month';
ALTER TABLE plans ADD COLUMN paypal_plan_id TEXT;
ALTER TABLE plans ADD COLUMN stripe_price_id TEXT;

ALTER TABLE orders ADD COLUMN billing_type TEXT NOT NULL DEFAULT 'one_time';
ALTER TABLE orders ADD COLUMN subscription_id TEXT;

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  provider TEXT NOT NULL,
  provider_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  credits_per_cycle INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  interval TEXT NOT NULL DEFAULT 'month',
  current_period_end TEXT,
  cancel_at_period_end INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS subscriptions_user ON subscriptions(user_id, status);
