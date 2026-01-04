// lib/db.js
const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(process.cwd(), ".data", "dashboard.db");

// Keep a single connection across hot reloads in dev
if (!global.__db) {
  global.__db = new Database(dbPath);
  global.__db.pragma("foreign_keys = ON");
}

module.exports = global.__db;
