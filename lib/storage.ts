import * as r2 from "./r2";

export async function uploadFile(
  buffer: Buffer,
  fileName: string,
  contentType: string,
  noteId?: string
): Promise<{ path: string; url: string }> {
  const folder = noteId || "general";
  const { url } = await r2.uploadToR2(buffer, fileName, contentType, folder);
  console.log(`[storage] Uploaded to R2: ${url}`);
  return { path: `/${folder}/${fileName}`, url };
}

export async function deleteFile(filePath: string): Promise<void> {
  const key = filePath.replace(/^\//, "");
  await r2.deleteFromR2(key);
}

export async function getFileBuffer(filePath: string): Promise<Buffer | null> {
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
      console.log(`[storage] File not found in R2: ${filePath}`);
    } else {
      console.error(`[storage] R2 error:`, err.message);
    }
    return null;
  }
}

export async function fileExists(filePath: string): Promise<boolean> {
  const key = filePath.replace(/^\//, "");
  return r2.fileExists(key);
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
