/**
 * lib/schema.js
 *
 * Drizzle ORM schema — single source of truth for all D1 tables.
 * Replaces the raw SQL CREATE TABLE statements in the old lib/db.js.
 */

import { sqliteTable, text, integer, unique } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ── Users ────────────────────────────────────────────────────────────────────

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull().default(""),
  avatarUrl: text("avatar_url"),
  role: text("role", { enum: ["admin", "customer"] }).notNull().default("customer"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ── Notes ─────────────────────────────────────────────────────────────────────

export const notes = sqliteTable("notes", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").default(""),
  subject: text("subject").default(""),
  authorName: text("author_name").default(""),
  pages: integer("pages").default(0),
  pricePaise: integer("price_paise").notNull().default(0),
  originalPricePaise: integer("original_price_paise").default(0),
  tags: text("tags").default("[]"),
  thumbnailUrl: text("thumbnail_url"),
  /** R2 object key (e.g. "notes/<noteId>/<uuid>.pdf") — NOT a public URL */
  fileUrl: text("file_url"),
  accessDurationMonths: integer("access_duration_months").notNull().default(6),
  status: text("status", { enum: ["draft", "published", "archived"] })
    .notNull()
    .default("draft"),
  uploadedBy: text("uploaded_by").references(() => users.id, {
    onDelete: "set null",
  }),
  deletedAt: text("deleted_at"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ── Bundles ───────────────────────────────────────────────────────────────────

export const bundles = sqliteTable("bundles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").default(""),
  discountPercent: integer("discount_percent").notNull().default(0),
  status: text("status", { enum: ["active", "draft"] }).notNull().default("draft"),
  badgeText: text("badge_text").default(""),
  createdBy: text("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ── Bundle ↔ Notes (join table) ───────────────────────────────────────────────

export const bundleNotes = sqliteTable(
  "bundle_notes",
  {
    id: text("id").primaryKey(),
    bundleId: text("bundle_id")
      .notNull()
      .references(() => bundles.id, { onDelete: "cascade" }),
    noteId: text("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
  },
  (t) => [unique().on(t.bundleId, t.noteId)]
);

// ── Orders ────────────────────────────────────────────────────────────────────

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  razorpayOrderId: text("razorpay_order_id").unique(),
  razorpayPaymentId: text("razorpay_payment_id"),
  amountPaise: integer("amount_paise").notNull().default(0),
  status: text("status", {
    enum: ["created", "paid", "failed", "refunded"],
  })
    .notNull()
    .default("created"),
  type: text("type", { enum: ["note", "bundle"] }).notNull().default("note"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ── Order Items ───────────────────────────────────────────────────────────────

export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  noteId: text("note_id").references(() => notes.id, { onDelete: "set null" }),
  bundleId: text("bundle_id").references(() => bundles.id, {
    onDelete: "set null",
  }),
  pricePaise: integer("price_paise").notNull().default(0),
});

// ── User Access (purchased note access with expiry) ───────────────────────────

export const userAccess = sqliteTable(
  "user_access",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    noteId: text("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    grantedAt: text("granted_at").default(sql`CURRENT_TIMESTAMP`),
    expiresAt: text("expires_at").notNull(),
  },
  (t) => [unique().on(t.userId, t.noteId)]
);

// ── Cart Items ────────────────────────────────────────────────────────────────

export const cartItems = sqliteTable(
  "cart_items",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    noteId: text("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    addedAt: text("added_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [unique().on(t.userId, t.noteId)]
);
