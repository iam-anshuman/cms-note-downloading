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
 * Generate a presigned (temporary) URL for an R2 object.
 * The URL is valid for `expiresInSeconds` seconds (default: 5 minutes).
 *
 * @param {string} key - R2 object key
 * @param {number} expiresInSeconds - How long the URL is valid (max 604800 = 7 days)
 * @returns {Promise<string>} Presigned URL
 */
export async function getPresignedUrl(key, expiresInSeconds = 300) {
  const { env } = await getCloudflareContext();
  const url = await env.R2.createSignedUrl(key, {
    expiresIn: expiresInSeconds,
  });
  return url;
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
