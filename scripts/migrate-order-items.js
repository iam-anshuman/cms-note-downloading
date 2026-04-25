const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(process.cwd(), "data", "cms.db"));

db.pragma("foreign_keys = OFF");

db.exec(`
  CREATE TABLE IF NOT EXISTS order_items_new (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    note_id TEXT,
    bundle_id TEXT,
    price_paise INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY(note_id) REFERENCES notes(id) ON DELETE SET NULL,
    FOREIGN KEY(bundle_id) REFERENCES bundles(id) ON DELETE SET NULL
  );
  INSERT INTO order_items_new SELECT id, order_id, note_id, bundle_id, price_paise FROM order_items;
  DROP TABLE order_items;
  ALTER TABLE order_items_new RENAME TO order_items;
`);

db.pragma("foreign_keys = ON");

console.log("✅ Migration complete: order_items.note_id is now nullable (ON DELETE SET NULL).");
db.close();
