const bcrypt = require("bcryptjs");
const { randomUUID } = require("crypto");
const path = require("path");

// Define users, notes, bundles directly here to keep it self-contained
const users = [
  { email: "admin@academy.com", password: "Admin@1234", full_name: "Admin User", role: "admin" },
  { email: "rajesh.kumar@gmail.com", password: "Student@123", full_name: "Rajesh Kumar", role: "customer" },
];

const notes = [
  {
    title: "Structural Systems Vol. 4",
    description: "Master the fundamentals of architectural structural systems.",
    subject: "Architecture",
    author_name: "Professor Julian Vance",
    pages: 128,
    price_paise: 149900,
    original_price_paise: 199900,
    tags: ["Architecture", "Engineering"],
    thumbnail_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuADWsSEeLDt4Ytj8v0sTIQbi2A8ckvnllStZQcXPqnsKbwQkzDJOnH_eUQIkR0umnaXU17xsF10GNeU4z1syPMsbhz3GaHrtobBqCF-g8J0S7fh-tUWgdhSGD7QqiLdk67nb7_n6oAoFTufxCjdARZAiK5cGG9tdEnXV0YLFH42uMQFRC6Lhm-Cs7M9LD0l6CtTTv2EgUQNY71M2KrExe1WRziqpE-LPrY-mCcPvX1JNmFSvHtpCYcxdp7RYBjwbKCk3Iq18dqr6YzQ",
    access_duration_months: 6,
    status: "published",
  },
];

const bundles = [
  {
    name: "Architecture Master Pack",
    description: "Everything you need for your architecture degree.",
    discount_percent: 30,
    status: "active",
    badge_text: "Most Popular",
    note_titles: ["Structural Systems Vol. 4"],
  },
];

async function seed() {
  console.log("🌱 Starting SQLite database seed...\n");

  // Load sqlite dynamically inside the script
  const Database = require('better-sqlite3');
  const fs = require('fs');

  const dbDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const rawDb = new Database(path.join(dbDir, "cms.db"));

  const db = {
    exec: async (sql) => rawDb.exec(sql),
    get: async (sql, params = []) => rawDb.prepare(sql).get(params),
    run: async (sql, params = []) => rawDb.prepare(sql).run(params),
    all: async (sql, params = []) => rawDb.prepare(sql).all(params),
  };

  // Re-initialize tables in case it's a new db
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, full_name TEXT NOT NULL DEFAULT '', avatar_url TEXT, role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')), created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT DEFAULT '', subject TEXT DEFAULT '', author_name TEXT DEFAULT '', pages INTEGER DEFAULT 0, price_paise INTEGER NOT NULL DEFAULT 0, original_price_paise INTEGER DEFAULT 0, tags TEXT DEFAULT '[]', thumbnail_url TEXT, file_url TEXT, access_duration_months INTEGER NOT NULL DEFAULT 6, status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')), uploaded_by TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(uploaded_by) REFERENCES users(id) ON DELETE SET NULL);
    CREATE TABLE IF NOT EXISTS bundles (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT DEFAULT '', discount_percent INTEGER NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100), status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'draft')), badge_text TEXT DEFAULT '', created_by TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL);
    CREATE TABLE IF NOT EXISTS bundle_notes (id TEXT PRIMARY KEY, bundle_id TEXT NOT NULL, note_id TEXT NOT NULL, FOREIGN KEY(bundle_id) REFERENCES bundles(id) ON DELETE CASCADE, FOREIGN KEY(note_id) REFERENCES notes(id) ON DELETE CASCADE, UNIQUE(bundle_id, note_id));
  `);

  console.log("👤 Creating users...");
  const userMap = {};

  for (const user of users) {
    const existing = await db.get("SELECT id FROM users WHERE email = ?", [user.email]);
    if (existing) {
      console.log(`   ⏭  ${user.email} already exists`);
      userMap[user.email] = existing.id;
      continue;
    }

    const id = randomUUID();
    const hash = await bcrypt.hash(user.password, 10);
    await db.run(
      "INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)",
      [id, user.email, hash, user.full_name, user.role]
    );
    userMap[user.email] = id;
    console.log(`   ✅ ${user.email} (${user.role}) — password: ${user.password}`);
  }

  const adminId = userMap["admin@academy.com"];

  console.log("\n📝 Creating notes...");
  const noteMap = {};

  for (const note of notes) {
    const existing = await db.get("SELECT id FROM notes WHERE title = ?", [note.title]);
    if (existing) {
      noteMap[note.title] = existing.id;
      console.log(`   ⏭  Note '${note.title}' exists`);
      continue;
    }

    const id = randomUUID();
    await db.run(`
      INSERT INTO notes (id, title, description, subject, author_name, pages, price_paise, original_price_paise, tags, thumbnail_url, access_duration_months, status, uploaded_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, note.title, note.description, note.subject, note.author_name, note.pages, note.price_paise, note.original_price_paise, JSON.stringify(note.tags), note.thumbnail_url, note.access_duration_months, note.status, adminId
    ]);

    noteMap[note.title] = id;
    console.log(`   ✅ ${note.title}`);
  }

  console.log("\n📦 Creating bundles...");
  for (const bundle of bundles) {
    const existing = await db.get("SELECT id FROM bundles WHERE name = ?", [bundle.name]);
    if (existing) {
      console.log(`   ⏭  Bundle '${bundle.name}' exists`);
      continue;
    }

    const id = randomUUID();
    await db.run(
      "INSERT INTO bundles (id, name, description, discount_percent, status, badge_text, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, bundle.name, bundle.description, bundle.discount_percent, bundle.status, bundle.badge_text, adminId]
    );

    for (const title of bundle.note_titles) {
      if (noteMap[title]) {
        await db.run(
          "INSERT INTO bundle_notes (id, bundle_id, note_id) VALUES (?, ?, ?)",
          [randomUUID(), id, noteMap[title]]
        );
      }
    }
    console.log(`   ✅ ${bundle.name}`);
  }

  console.log("\n🎉 Seed complete!");
}

seed().catch(console.error);
