-- Victims/Agents table
CREATE TABLE IF NOT EXISTS victims (
  agent_id TEXT PRIMARY KEY,
  first_seen TEXT NOT NULL,
  last_seen TEXT NOT NULL,
  ip TEXT,
  country TEXT,
  user_agent TEXT,
  hostname TEXT,
  username TEXT,
  os TEXT
);

-- Index for sorting by last_seen (used in /api/victims)
CREATE INDEX IF NOT EXISTS idx_victims_last_seen
  ON victims(last_seen DESC);

-- Command results table
CREATE TABLE IF NOT EXISTS command_results (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  agent_id TEXT NOT NULL,
  command_id TEXT NOT NULL,
  output TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (agent_id) REFERENCES victims(agent_id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_command_results_agent
  ON command_results(agent_id);

CREATE INDEX IF NOT EXISTS idx_command_results_command
  ON command_results(command_id);

CREATE INDEX IF NOT EXISTS idx_command_results_created
  ON command_results(created_at DESC);