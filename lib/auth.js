/**
 * lib/auth.js
 *
 * JWT helpers + getUser() server utility.
 * Uses `jose` (Web Crypto — works in Cloudflare Workers edge runtime).
 */

import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "./db";
import { users } from "./schema";
import { eq } from "drizzle-orm";

const secretKey = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET || "dev-secret-min-32-chars-long-ok"
  );

/**
 * Sign a JWT with HS256, valid for 7 days.
 * @param {Record<string, unknown>} payload
 * @returns {Promise<string>}
 */
export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secretKey());
}

/**
 * Verify a JWT. Returns the payload or null if invalid/expired.
 * @param {string} token
 */
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload;
  } catch {
    return null;
  }
}

/**
 * Read the auth cookie and return the authenticated user from D1, or null.
 * Designed for use inside Next.js Server Components and API Route Handlers.
 */
export async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) return null;

  const decoded = await verifyToken(token);
  if (!decoded?.userId) return null;

  const { env } = await getCloudflareContext();
  const db = getDb(env.DB);

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(eq(users.id, decoded.userId))
    .limit(1);

  return user ?? null;
}
