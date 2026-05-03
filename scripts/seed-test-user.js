/**
 * scripts/seed-test-user.js
 *
 * Creates a test customer user and grants them access to ALL published notes.
 * Safe to run multiple times — uses INSERT OR IGNORE / upsert patterns.
 *
 * Usage:  node scripts/seed-test-user.js
 */

const bcrypt = require("bcryptjs");
const { randomUUID } = require("crypto");
const path = require("path");
const Database = require("better-sqlite3");
const fs = require("fs");

// ── Config ────────────────────────────────────────────────────────────────────
const TEST_USER = {
  email: "test@academy.com",
  password: "Test@1234",
  full_name: "Test Student",
  role: "customer",
};
// Access granted for this many months from today
const ACCESS_MONTHS = 12;
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🧪 Seeding test user...\n");

  const dbDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

  const db = new Database(path.join(dbDir, "cms.db"));

  // ── 1. Ensure cart_items table exists (added in recent migration) ─────────
  db.exec(`
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

  // ── 2. Create / fetch test user ───────────────────────────────────────────
  let user = db.prepare("SELECT * FROM users WHERE email = ?").get(TEST_USER.email);

  if (!user) {
    const hash = bcrypt.hashSync(TEST_USER.password, 10);
    const id = randomUUID();
    db.prepare(
      "INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)"
    ).run(id, TEST_USER.email, hash, TEST_USER.full_name, TEST_USER.role);
    user = db.prepare("SELECT * FROM users WHERE email = ?").get(TEST_USER.email);
    console.log(`✅ Created user: ${TEST_USER.email}  (password: ${TEST_USER.password})`);
  } else {
    console.log(`⏭  User already exists: ${TEST_USER.email}`);
  }

  // ── 3. Fetch all published notes ──────────────────────────────────────────
  const notes = db
    .prepare("SELECT id, title, price_paise FROM notes WHERE status = 'published'")
    .all();

  if (notes.length === 0) {
    console.log("\n⚠  No published notes found. Run `npm run seed` first to create some.");
    process.exit(0);
  }

  console.log(`\n📝 Found ${notes.length} published note(s). Granting access...\n`);

  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + ACCESS_MONTHS);
  const expiresAtStr = expiresAt.toISOString().replace("T", " ").slice(0, 19);

  // Fetch or create a dummy "test" admin user for FK reference
  const admin = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
  if (!admin) {
    console.log("⚠  No admin user found — cannot create order. Run `npm run seed` first.");
    process.exit(1);
  }

  for (const note of notes) {
    // Create a synthetic paid order for FK requirement on user_access.order_id
    const existingAccess = db
      .prepare("SELECT id FROM user_access WHERE user_id = ? AND note_id = ?")
      .get(user.id, note.id);

    if (existingAccess) {
      console.log(`   ⏭  Already has access: ${note.title}`);
      continue;
    }

    const orderId = randomUUID();
    db.prepare(
      `INSERT INTO orders (id, user_id, razorpay_order_id, amount_paise, status, type)
       VALUES (?, ?, ?, ?, 'paid', 'note')`
    ).run(orderId, user.id, `test_order_${orderId.slice(0, 8)}`, note.price_paise);

    db.prepare(
      `INSERT INTO order_items (id, order_id, note_id, price_paise) VALUES (?, ?, ?, ?)`
    ).run(randomUUID(), orderId, note.id, note.price_paise);

    db.prepare(
      `INSERT OR IGNORE INTO user_access (id, user_id, note_id, order_id, expires_at)
       VALUES (?, ?, ?, ?, ?)`
    ).run(randomUUID(), user.id, note.id, orderId, expiresAtStr);

    console.log(`   ✅ Granted access: ${note.title}`);
  }

  console.log("\n🎉 Done!\n");
  console.log("┌─────────────────────────────────────────┐");
  console.log("│           Test User Credentials         │");
  console.log("├─────────────────────────────────────────┤");
  console.log(`│  Email   : ${TEST_USER.email.padEnd(30)}│`);
  console.log(`│  Password: ${TEST_USER.password.padEnd(30)}│`);
  console.log("└─────────────────────────────────────────┘\n");

  db.close();
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
