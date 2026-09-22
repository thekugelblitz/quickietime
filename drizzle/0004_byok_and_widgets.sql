CREATE TABLE IF NOT EXISTS user_byok (
  user_id TEXT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  api_key TEXT NOT NULL,
  model TEXT,
  base_url TEXT,
  enabled INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public_widgets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  project TEXT,
  title TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT 'auto',
  created_at TEXT NOT NULL
);
