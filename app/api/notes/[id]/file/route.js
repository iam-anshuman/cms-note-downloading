import { getDb } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request, { params }) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;

    const db = await getDb();

    // Check the user has valid, non-expired access to this note
    const access = await db.get(
      `SELECT ua.id FROM user_access ua 
       WHERE ua.user_id = ? AND ua.note_id = ? AND ua.expires_at >= datetime('now')`,
      [user.id, id]
    );

    // Admins bypass access checks
    if (!access && user.role !== "admin") {
      return NextResponse.json({ error: "Access denied. Purchase this note to read it." }, { status: 403 });
    }

    // Get note metadata + file path
    const note = await db.get("SELECT id, title, subject, file_url FROM notes WHERE id = ? AND deleted_at IS NULL", [id]);
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (!note.file_url) {
      return NextResponse.json({ error: "No file attached to this note" }, { status: 404 });
    }

    // Resolve file on disk (file_url is stored as e.g. /uploads/filename.pdf)
    const filePath = path.join(process.cwd(), "public", note.file_url);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found on server" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(note.file_url).toLowerCase();
    const contentTypeMap = {
      ".pdf": "application/pdf",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
    };
    const contentType = contentTypeMap[ext] || "application/octet-stream";

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // Inline display only — no download prompt
        "Content-Disposition": `inline; filename="${note.title.replace(/[^a-z0-9]/gi, "_")}${ext}"`,
        // Prevent caching the raw file URL
        "Cache-Control": "private, no-store",
        // Block right-click save, iframe breakouts, etc.
        "X-Frame-Options": "SAMEORIGIN",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[note-file]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
