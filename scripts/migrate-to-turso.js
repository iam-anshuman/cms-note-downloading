const { createClient } = require("@libsql/client");
const fs = require("fs");
const path = require("path");

const LOCAL_DB_PATH = path.join(process.cwd(), "data", "cms.db");
const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_AUTH_TOKEN) {
  console.error("Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env.local");
  process.exit(1);
}

if (!fs.existsSync(LOCAL_DB_PATH)) {
  console.error("Error: Local database not found at", LOCAL_DB_PATH);
  process.exit(1);
}

const localClient = createClient({
  url: `file:${LOCAL_DB_PATH}`,
});

const tursoClient = createClient({
  url: TURSO_URL,
  authToken: TURSO_AUTH_TOKEN,
});

const tables = [
  "users",
  "notes",
  "bundles",
  "bundle_notes",
  "orders",
  "order_items",
  "user_access",
  "cart_items",
];

async function getTableColumns(client, table) {
  const result = await client.execute(`PRAGMA table_info(${table})`);
  return result.rows;
}

async function migrateTable(table) {
  console.log(`\nMigrating table: ${table}`);

  // Get column info
  const columns = await getTableColumns(localClient, table);
  const columnNames = columns.map((c) => c.name);

  // Read all data from local
  const { rows } = await localClient.execute(`SELECT * FROM ${table}`);
  console.log(`  Found ${rows.length} rows`);

  if (rows.length === 0) {
    console.log(`  Skipping (empty)`);
    return;
  }

  // Truncate Turso table first (optional - comment out if you want to append)
  try {
    await tursoClient.execute(`DELETE FROM ${table}`);
    console.log(`  Cleared existing data in Turso`);
  } catch (err) {
    // Table might not exist yet
    console.log(`  Note: Could not clear table (may not exist yet)`);
  }

  // Insert rows
  const placeholders = columnNames.map(() => "?").join(", ");
  const insertSql = `INSERT INTO ${table} (${columnNames.join(", ")}) VALUES (${placeholders})`;

  let inserted = 0;
  for (const row of rows) {
    const values = columnNames.map((col) => row[col] ?? null);
    try {
      await tursoClient.execute({ sql: insertSql, args: values });
      inserted++;
    } catch (err) {
      console.error(`  Error inserting row into ${table}:`, err.message);
      console.error(`  Row:`, row);
    }
  }

  console.log(`  Inserted ${inserted}/${rows.length} rows`);
}

async function createSchema() {
  console.log("Creating schema in Turso...");
  const schema = `
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
  `;

  const statements = schema
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    try {
      await tursoClient.execute(stmt);
    } catch (err) {
      // Ignore "already exists" errors
      if (!err.message.includes("already exists")) {
        console.error(`Schema error:`, err.message);
      }
    }
  }
  console.log("Schema created/verified.");
}

async function main() {
  console.log("=== Turso Migration Tool ===");
  console.log("Local DB:", LOCAL_DB_PATH);
  console.log("Turso URL:", TURSO_URL);

  try {
    // Create schema first
    await createSchema();

    // Migrate tables in order (respecting foreign keys)
    await migrateTable("users");
    await migrateTable("notes");
    await migrateTable("bundles");
    await migrateTable("bundle_notes");
    await migrateTable("orders");
    await migrateTable("order_items");
    await migrateTable("user_access");
    await migrateTable("cart_items");

    console.log("\n=== Migration Complete ===");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

main();
