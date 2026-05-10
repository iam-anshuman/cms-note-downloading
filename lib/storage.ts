import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import fs from "fs";
import * as r2 from "./r2";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function uploadFile(
  buffer: Buffer,
  fileName: string,
  contentType: string,
  noteId?: string
): Promise<{ path: string; url: string }> {
  if (r2.isR2Configured()) {
    const folder = noteId || "general";
    const { url } = await r2.uploadToR2(buffer, fileName, contentType, folder);
    return { path: `/${folder}/${fileName}`, url };
  }

  const subDir = noteId || "general";
  const uploadDir = path.join(UPLOAD_DIR, subDir);

  if (!fs.existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, fileName);
  await writeFile(filePath, buffer);

  const relativePath = `/uploads/${subDir}/${fileName}`;
  return { path: relativePath, url: relativePath };
}

export async function deleteFile(filePath: string): Promise<void> {
  if (filePath.startsWith("/uploads/")) {
    const fullPath = path.join(process.cwd(), "public", filePath);
    if (fs.existsSync(fullPath)) {
      await unlink(fullPath);
    }
    return;
  }

  if (r2.isR2Configured()) {
    const key = filePath.startsWith("http")
      ? new URL(filePath).pathname.replace(/^\//, "")
      : filePath.replace(/^\//, "");
    await r2.deleteFromR2(key);
    return;
  }

  const fullPath = path.join(process.cwd(), "public", filePath);
  if (fs.existsSync(fullPath)) {
    await unlink(fullPath);
  }
}

export async function getFileBuffer(filePath: string): Promise<Buffer | null | undefined> {
  if (filePath.startsWith("/uploads/")) {
    const fullPath = path.join(process.cwd(), "public", filePath);
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath);
    }
    return null;
  }

  if (r2.isR2Configured()) {
    try {
      const key = filePath.replace(/^\//, "");
      const { body } = await r2.getObject(key);
      const chunks = [];
      for await (const chunk of body) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    } catch (err: any) {
      if (err.name === "NoSuchKey" || err.Code === "NoSuchKey") {
        console.log(`[storage] File not in R2, trying local: ${filePath}`);
      } else {
        console.error(`[storage] R2 error:`, err.message);
      }
    }
  }
  const fullPath = path.join(process.cwd(), "public", filePath);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
}

export function fileExists(filePath: string): boolean {
  if (r2.isR2Configured()) {
    return true;
  }
  const fullPath = path.join(process.cwd(), "public", filePath);
  return fs.existsSync(fullPath);
}

export function getContentType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
  };
  return mimeTypes[ext || ""] || "application/octet-stream";
}
