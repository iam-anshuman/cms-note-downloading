import { getDb } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const db = await getDb();

    const access = await db.get(
      "SELECT id FROM user_access WHERE user_id = ? AND note_id = ? AND expires_at >= datetime('now')",
      [user.id, id]
    );

    if (!access && user.role !== 'admin') {
      return NextResponse.json(
        { error: "You do not have access to this note. Please purchase it first." },
        { status: 403 }
      );
    }

    const note = await db.get("SELECT file_url, title FROM notes WHERE id = ?", [id]);

    if (!note || !note.file_url) {
      return NextResponse.json({ error: "File not available" }, { status: 404 });
    }

    // In a real custom backend without signed URLs, you'd just return the actual URL or a proxy URL
    return NextResponse.json({
      downloadUrl: note.file_url,
      fileName: `${note.title}.pdf`,
      expiresIn: 3600,
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
