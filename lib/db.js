/**
 * lib/db.js
 *
 * Returns a Drizzle ORM client bound to the Cloudflare D1 binding.
 * The D1 binding (env.DB) is provided by the Cloudflare runtime — pass it
 * from your route handler via getRequestContext().
 *
 * Usage inside a route:
 *   import { getDb } from "@/lib/db";
 *   import { getRequestContext } from "@cloudflare/next-on-pages";
 *
 *   const { env } = getRequestContext();
 *   const db = getDb(env.DB);
 */

import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

/**
 * @param {import("@cloudflare/workers-types").D1Database} d1
 * @returns {import("drizzle-orm/d1").DrizzleD1Database}
 */
export function getDb(d1) {
  return drizzle(d1, { schema });
}
