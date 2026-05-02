import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { uploadToR2 } from "@/lib/r2";
import { NextResponse } from "next/server";



const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

export async function POST(request) {
  try {
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const noteId = formData.get("noteId") || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: PDF, PNG, JPEG, WEBP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File exceeds 50 MB limit" },
        { status: 413 }
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const key = `notes/${noteId}/${crypto.randomUUID()}.${ext}`;

    const buffer = await file.arrayBuffer();
    await uploadToR2(key, buffer, file.type);

    return NextResponse.json({
      key,
      message: "File uploaded successfully",
    });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
