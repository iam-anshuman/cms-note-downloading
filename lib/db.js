
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

/**
 * @param {import("@cloudflare/workers-types").D1Database} d1
 * @returns {import("drizzle-orm/d1").DrizzleD1Database}
 */
export function getDb(d1) {
  return drizzle(d1, { schema });
}
