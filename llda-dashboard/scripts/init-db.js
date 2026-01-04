// scripts/init-db.js
const db = require("../lib/db");

db.exec(`
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS stations (
  id TEXT PRIMARY KEY,
  code TEXT,
  name TEXT NOT NULL,
  municipality TEXT,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TRIGGER IF NOT EXISTS stations_updated_at
AFTER UPDATE ON stations
FOR EACH ROW
BEGIN
  UPDATE stations
  SET updated_at = datetime('now')
  WHERE id = OLD.id;
END;

CREATE TABLE IF NOT EXISTS measurements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  station_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  quarter TEXT NOT NULL,            -- 'Q1'|'Q2'|'Q3'|'Q4'
  parameter TEXT NOT NULL,          -- e.g. 'do_mgL'
  value REAL,
  UNIQUE(station_id, year, quarter, parameter),
  FOREIGN KEY(station_id) REFERENCES stations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_meas_station_year_q
ON measurements(station_id, year, quarter);

CREATE INDEX IF NOT EXISTS idx_meas_param_year_q
ON measurements(parameter, year, quarter);
`);

console.log("DB initialized at .data/dashboard.db");
