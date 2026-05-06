import { drizzle } from "drizzle-orm/libsql";
import { createClient, type Client } from "@libsql/client";
import * as schema from "./db/schema";
import bcrypt from "bcryptjs";

let db: Awaited<ReturnType<typeof drizzle<typeof schema>>> | null = null;
let client: Client | null = null;
let initialized = false;

const isLocal = !process.env.VERCEL && process.env.NODE_ENV !== "production";
const isBuildTime = process.env.NEXT_PHASE === "build" || process.env.NEXT_PHASE === "phase-production-build";

function createLocalClient() {
  return createClient({
    url: "file:./data/cms.db",
  });
}

function createTursoClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  
  if (!url || !authToken) {
    throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set for production");
  }
  
  return createClient({
    url,
    authToken,
  });
}

export function getDb() {
  if (client && db) return { client: db, raw: client };

  if (isBuildTime) {
    client = createLocalClient();
    db = drizzle(client, { schema });
    return { client: db, raw: client };
  }

  if (isLocal) {
    client = createLocalClient();
  } else {
    client = createTursoClient();
  }

  db = drizzle(client, { schema });
  return { client: db, raw: client };
}

export type DB = Awaited<ReturnType<typeof getDb>>;

async function initDb() {
  if (initialized) return;

  if (!isLocal) {
    // For Turso production, assume schema is already migrated
    initialized = true;
    return;
  }

  const { raw } = getDb();

  await raw.execute(`
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
      deleted_at DATETIME,
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

  const userCount = await raw.execute("SELECT COUNT(*) as count FROM users");
  if (userCount.rows[0].count === 0) {
    const adminEmail = process.env.ADMIN_EMAILS || "admin@academy.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@1234";
    const hash = bcrypt.hashSync(adminPassword, 10);
    const id = crypto.randomUUID();

    await raw.execute({
      sql: "INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)",
      args: [id, adminEmail, hash, "Admin User", "admin"]
    });
    console.log(`[DB] Auto-seeded default admin user: ${adminEmail}`);
  }

  initialized = true;
}

export async function dbAll(sql: string, params: (string | number | null)[] = []) {
  try {
    await initDb();
    const { raw } = getDb();
    const result = await raw.execute({ sql, args: params });
    return result.rows;
  } catch (err: any) {
    console.error("[DB] dbAll error:", err.message || err);
    if (err.cause) console.error("[DB] Cause:", err.cause);
    throw err;
  }
}

export async function dbGet(sql: string, params: (string | number | null)[] = []) {
  try {
    await initDb();
    const rows = await dbAll(sql, params);
    return rows[0] || null;
  } catch (err: any) {
    console.error("[DB] dbGet error:", err.message || err);
    if (err.cause) console.error("[DB] Cause:", err.cause);
    throw err;
  }
}

export async function dbRun(sql: string, params: (string | number | null)[] = []) {
  try {
    await initDb();
    const { raw } = getDb();
    return await raw.execute({ sql, args: params });
  } catch (err: any) {
    console.error("[DB] dbRun error:", err.message || err);
    if (err.cause) console.error("[DB] Cause:", err.cause);
    throw err;
  }
}

export async function dbExec(sql: string) {
  await initDb();
  const { raw } = getDb();
  return await raw.execute(sql);
}
