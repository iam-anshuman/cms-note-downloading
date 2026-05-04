import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").default(""),
  avatarUrl: text("avatar_url"),
  role: text("role").notNull().default("customer"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

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
  fileUrl: text("file_url"),
  accessDurationMonths: integer("access_duration_months").notNull().default(6),
  status: text("status").notNull().default("draft"),
  uploadedBy: text("uploaded_by"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;

export const bundles = sqliteTable("bundles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").default(""),
  discountPercent: integer("discount_percent").notNull().default(0),
  status: text("status").notNull().default("draft"),
  badgeText: text("badge_text").default(""),
  createdBy: text("created_by"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export type Bundle = typeof bundles.$inferSelect;
export type NewBundle = typeof bundles.$inferInsert;

export const bundleNotes = sqliteTable("bundle_notes", {
  id: text("id").primaryKey(),
  bundleId: text("bundle_id").notNull(),
  noteId: text("note_id").notNull(),
});

export type BundleNote = typeof bundleNotes.$inferSelect;
export type NewBundleNote = typeof bundleNotes.$inferInsert;

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  razorpayOrderId: text("razorpay_order_id").unique(),
  razorpayPaymentId: text("razorpay_payment_id"),
  amountPaise: integer("amount_paise").notNull().default(0),
  status: text("status").notNull().default("created"),
  type: text("type").notNull().default("note"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull(),
  noteId: text("note_id"),
  bundleId: text("bundle_id"),
  pricePaise: integer("price_paise").notNull().default(0),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

export const userAccess = sqliteTable("user_access", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  noteId: text("note_id").notNull(),
  orderId: text("order_id").notNull(),
  grantedAt: integer("granted_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export type UserAccess = typeof userAccess.$inferSelect;
export type NewUserAccess = typeof userAccess.$inferInsert;

export const cartItems = sqliteTable("cart_items", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  noteId: text("note_id").notNull(),
  addedAt: integer("added_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;