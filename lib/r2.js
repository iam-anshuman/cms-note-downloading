/**
 * lib/r2.js
 *
 * R2 object-storage helpers.
 * All file I/O goes through these functions — no fs, no local disk.
 *
 * The R2 binding (env.R2) is provided by the Cloudflare runtime.
 * Accessed via getCloudflareContext() from @opennextjs/cloudflare.
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Upload an ArrayBuffer / Buffer to R2.
 *
 * @param {string} key - R2 object key, e.g. "notes/<noteId>/<uuid>.pdf"
 * @param {ArrayBuffer|Buffer} body - File bytes
 * @param {string} contentType - MIME type
 * @returns {Promise<string>} The object key that was stored
 */
export async function uploadToR2(key, body, contentType) {
  const { env } = await getCloudflareContext();
  await env.R2.put(key, body, {
    httpMetadata: { contentType },
  });
  return key;
}

/**
 * Delete an object from R2.
 *
 * @param {string} key - R2 object key to delete
 */
export async function deleteFromR2(key) {
  const { env } = await getCloudflareContext();
  await env.R2.delete(key);
}

/**
 * Read an object from R2 by key.
 *
 * @param {string} key
 * @returns {Promise<import("@cloudflare/workers-types").R2ObjectBody | null>}
 */
export async function getFromR2(key) {
  const { env } = await getCloudflareContext();
  return env.R2.get(key);
}

/**
 * Check whether an object exists in R2.
 *
 * @param {string} key
 * @returns {Promise<boolean>}
 */
export async function existsInR2(key) {
  const { env } = await getCloudflareContext();
  const obj = await env.R2.head(key);
  return obj !== null;
}
