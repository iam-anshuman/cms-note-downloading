import { defineConfig } from "drizzle-kit";
import path from "node:path";
require("dotenv").config({
  path: path.resolve(process.cwd(), ".env.local"),
});

const isLocal = !process.env.VERCEL && process.env.NODE_ENV !== "production";
const tursoUrl = isLocal
  ? process.env.TURSO_DEV_DATABASE_URL
  : process.env.TURSO_DATABASE_URL;
const tursoAuthToken = isLocal ? process.env.TURSO_DEV_AUTH_TOKEN : process.env.TURSO_AUTH_TOKEN;

const dbCredentials = { url: tursoUrl, authToken: tursoAuthToken! }

console.log("[Drizzle Config] Using database URL:", dbCredentials);
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials:{
    url: tursoUrl!,
    authToken: tursoAuthToken!,
  },
});
