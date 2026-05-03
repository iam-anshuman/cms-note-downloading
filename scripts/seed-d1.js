const bcrypt = require("bcryptjs");
const { execFileSync } = require("child_process");
const { mkdtempSync, writeFileSync, rmSync } = require("fs");
const { tmpdir } = require("os");
const { join } = require("path");

const mode = process.argv.includes("--remote") ? "--remote" : "--local";
const database = "cms-notes-db";

const admin = {
  id: "seed-admin-user",
  email: "admin@academy.com",
  password: "Admin@1234",
  fullName: "Admin User",
};

const note = {
  id: "seed-structural-systems-vol-4",
  title: "Structural Systems Vol. 4",
  description: "Master the fundamentals of architectural structural systems.",
  subject: "Architecture",
  authorName: "Professor Julian Vance",
  pages: 128,
  pricePaise: 149900,
  originalPricePaise: 199900,
  tags: JSON.stringify(["Architecture", "Engineering"]),
  thumbnailUrl:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuADWsSEeLDt4Ytj8v0sTIQbi2A8ckvnllStZQcXPqnsKbwQkzDJOnH_eUQIkR0umnaXU17xsF10GNeU4z1syPMsbhz3GaHrtobBqCF-g8J0S7fh-tUWgdhSGD7QqiLdk67nb7_n6oAoFTufxCjdARZAiK5cGG9tdEnXV0YLFH42uMQFRC6Lhm-Cs7M9LD0l6CtTTv2EgUQNY71M2KrExe1WRziqpE-LPrY-mCcPvX1JNmFSvHtpCYcxdp7RYBjwbKCk3Iq18dqr6YzQ",
};

const bundle = {
  id: "seed-architecture-master-pack",
  noteLinkId: "seed-architecture-master-pack-note",
  name: "Architecture Master Pack",
  description: "Everything you need for your architecture degree.",
  discountPercent: 30,
  badgeText: "Most Popular",
};

function sqlString(value) {
  if (value == null) return "NULL";
  return `'${String(value).replaceAll("'", "''")}'`;
}

async function main() {
  const passwordHash = await bcrypt.hash(admin.password, 10);
  const dir = mkdtempSync(join(tmpdir(), "cms-d1-seed-"));
  const file = join(dir, "seed.sql");

  writeFileSync(
    file,
    `
INSERT INTO users (id, email, password_hash, full_name, role)
VALUES (${sqlString(admin.id)}, ${sqlString(admin.email)}, ${sqlString(passwordHash)}, ${sqlString(admin.fullName)}, 'admin')
ON CONFLICT(email) DO UPDATE SET
  password_hash = excluded.password_hash,
  full_name = excluded.full_name,
  role = excluded.role,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO notes (
  id, title, description, subject, author_name, pages, price_paise,
  original_price_paise, tags, thumbnail_url, access_duration_months,
  status, uploaded_by
)
VALUES (
  ${sqlString(note.id)}, ${sqlString(note.title)}, ${sqlString(note.description)},
  ${sqlString(note.subject)}, ${sqlString(note.authorName)}, ${note.pages},
  ${note.pricePaise}, ${note.originalPricePaise}, ${sqlString(note.tags)},
  ${sqlString(note.thumbnailUrl)}, 6, 'published', ${sqlString(admin.id)}
)
ON CONFLICT(id) DO UPDATE SET
  title = excluded.title,
  description = excluded.description,
  subject = excluded.subject,
  author_name = excluded.author_name,
  pages = excluded.pages,
  price_paise = excluded.price_paise,
  original_price_paise = excluded.original_price_paise,
  tags = excluded.tags,
  thumbnail_url = excluded.thumbnail_url,
  access_duration_months = excluded.access_duration_months,
  status = excluded.status,
  uploaded_by = excluded.uploaded_by,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO bundles (id, name, description, discount_percent, status, badge_text, created_by)
VALUES (
  ${sqlString(bundle.id)}, ${sqlString(bundle.name)}, ${sqlString(bundle.description)},
  ${bundle.discountPercent}, 'active', ${sqlString(bundle.badgeText)}, ${sqlString(admin.id)}
)
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  discount_percent = excluded.discount_percent,
  status = excluded.status,
  badge_text = excluded.badge_text,
  created_by = excluded.created_by;

INSERT OR IGNORE INTO bundle_notes (id, bundle_id, note_id)
VALUES (${sqlString(bundle.noteLinkId)}, ${sqlString(bundle.id)}, ${sqlString(note.id)});
`.trimStart()
  );

  try {
    execFileSync("npx", ["wrangler", "d1", "execute", database, mode, "--file", file], {
      stdio: "inherit",
    });
    console.log(`\nSeed complete (${mode}).`);
    console.log(`Admin: ${admin.email}`);
    console.log(`Password: ${admin.password}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
