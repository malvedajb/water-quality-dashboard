// scripts/init-db.js
const db = require("../lib/db");

db.exec(`
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS stations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  municipality TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Auto-update updated_at on edits
CREATE TRIGGER IF NOT EXISTS stations_updated_at
AFTER UPDATE ON stations
FOR EACH ROW
BEGIN
  UPDATE stations
  SET updated_at = datetime('now')
  WHERE id = OLD.id;
END;
`);

console.log("DB initialized at .data/dashboard.db");
