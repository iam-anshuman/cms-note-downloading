import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/schema.js",
  out: "./drizzle/migrations",
  dialect: "sqlite",
});
