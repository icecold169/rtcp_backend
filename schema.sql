CREATE TABLE IF NOT EXISTS command_results (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  command_id TEXT NOT NULL,
  output TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_results_agent
  ON command_results(agent_id);

CREATE INDEX IF NOT EXISTS idx_results_command
  ON command_results(command_id);
