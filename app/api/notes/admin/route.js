import { dbAll, dbGet, dbRun } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = "SELECT * FROM notes";
    let params = [];

    if (status) {
      query += " WHERE status = ?";
      params.push(status);
    }
    query += " ORDER BY created_at DESC";

    const notes = await dbAll(query, params);

    return NextResponse.json({ notes: notes.map(n => ({...n, tags: JSON.parse(n.tags || "[]")})) });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    const id = crypto.randomUUID();
    const tags = JSON.stringify(body.tags || []);
    
    await dbRun(`
      INSERT INTO notes (
        id, title, description, subject, author_name, pages, price_paise, 
        original_price_paise, tags, thumbnail_url, file_url, access_duration_months, 
        status, uploaded_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, body.title, body.description || "", body.subject || "", body.authorName || "",
      body.pages || 0, Math.round((body.price || 0) * 100), Math.round((body.originalPrice || body.price || 0) * 100),
      tags, JSON.stringify(body.thumbnailUrls || (body.thumbnailUrl ? [body.thumbnailUrl] : [])), body.fileUrl || null, body.accessDurationMonths || 6,
      body.status || "draft", user.id
    ]);

    const note = await dbGet("SELECT * FROM notes WHERE id = ?", [id]);
    note.tags = JSON.parse(note.tags || "[]");

    return NextResponse.json({ note }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
