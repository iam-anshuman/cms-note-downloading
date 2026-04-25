import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let wrappedDbInstance = null;

export function getDb() {
  if (wrappedDbInstance) {
    return wrappedDbInstance;
  }

  const dbDir = path.join(process.cwd(), "data");

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, "cms.db");

  const rawDb = new Database(dbPath);

  // Enable FK enforcement (off by default in SQLite)
  rawDb.pragma("foreign_keys = ON");
  rawDb.pragma("journal_mode = WAL");

  initDb(rawDb);

  // Return a wrapper that mimics the asynchronous sqlite driver API
  // This prevents us from having to rewrite the entire application
  wrappedDbInstance = {
    all: async (sql, params = []) => rawDb.prepare(sql).all(params),
    get: async (sql, params = []) => rawDb.prepare(sql).get(params),
    run: async (sql, params = []) => rawDb.prepare(sql).run(params),
    exec: async (sql) => rawDb.exec(sql),
  };

  return wrappedDbInstance;
}

function initDb(rawDb) {
  rawDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL DEFAULT '',
      avatar_url TEXT,
      role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      subject TEXT DEFAULT '',
      author_name TEXT DEFAULT '',
      pages INTEGER DEFAULT 0,
      price_paise INTEGER NOT NULL DEFAULT 0,
      original_price_paise INTEGER DEFAULT 0,
      tags TEXT DEFAULT '[]',
      thumbnail_url TEXT,
      file_url TEXT,
      access_duration_months INTEGER NOT NULL DEFAULT 6,
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
      uploaded_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(uploaded_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS bundles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      discount_percent INTEGER NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'draft')),
      badge_text TEXT DEFAULT '',
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS bundle_notes (
      id TEXT PRIMARY KEY,
      bundle_id TEXT NOT NULL,
      note_id TEXT NOT NULL,
      FOREIGN KEY(bundle_id) REFERENCES bundles(id) ON DELETE CASCADE,
      FOREIGN KEY(note_id) REFERENCES notes(id) ON DELETE CASCADE,
      UNIQUE(bundle_id, note_id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      razorpay_order_id TEXT UNIQUE,
      razorpay_payment_id TEXT,
      amount_paise INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed', 'refunded')),
      type TEXT NOT NULL DEFAULT 'note' CHECK (type IN ('note', 'bundle')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      note_id TEXT,
      bundle_id TEXT,
      price_paise INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY(note_id) REFERENCES notes(id) ON DELETE SET NULL,
      FOREIGN KEY(bundle_id) REFERENCES bundles(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS user_access (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      note_id TEXT NOT NULL,
      order_id TEXT NOT NULL,
      granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(note_id) REFERENCES notes(id) ON DELETE CASCADE,
      FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
      UNIQUE(user_id, note_id)
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      note_id TEXT NOT NULL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(note_id) REFERENCES notes(id) ON DELETE CASCADE,
      UNIQUE(user_id, note_id)
    );
  `);

  // Auto-seed an admin user if the table is completely empty
  const userCount = rawDb.prepare("SELECT COUNT(*) as count FROM users").get();
  if (userCount.count === 0) {
    const adminEmail = process.env.ADMIN_EMAILS || "admin@academy.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@1234";
    const bcrypt = require("bcryptjs");
    const crypto = require("crypto");
    const hash = bcrypt.hashSync(adminPassword, 10);
    rawDb.prepare("INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)").run(
      crypto.randomUUID(), adminEmail, hash, "Admin User", "admin"
    );
    console.log(`[DB] Auto-seeded default admin user: ${adminEmail}`);
  }
}