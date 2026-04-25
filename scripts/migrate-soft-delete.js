/**
 * scripts/migrate-soft-delete.js
 * Adds deleted_at column to the notes table for soft-delete support.
 * Safe to run multiple times.
 */
const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(process.cwd(), "data", "cms.db"));
db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

// Add column only if it doesn't exist yet
const cols = db.prepare("PRAGMA table_info(notes)").all();
const hasDeletedAt = cols.some((c) => c.name === "deleted_at");

if (hasDeletedAt) {
  console.log("⏭  deleted_at column already exists — nothing to do.");
} else {
  db.exec("ALTER TABLE notes ADD COLUMN deleted_at DATETIME DEFAULT NULL;");
  console.log("✅ Added deleted_at column to notes table.");
}

db.close();
