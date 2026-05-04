import { dbGet, dbRun } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const user = await getUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

async function updateNote(request, params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updates = [];
    const values = [];

    if (body.title !== undefined)                { updates.push("title = ?");                 values.push(body.title); }
    if (body.description !== undefined)          { updates.push("description = ?");            values.push(body.description); }
    if (body.subject !== undefined)              { updates.push("subject = ?");                values.push(body.subject); }
    if (body.authorName !== undefined)           { updates.push("author_name = ?");            values.push(body.authorName); }
    if (body.pages !== undefined)                { updates.push("pages = ?");                  values.push(body.pages); }
    if (body.price !== undefined)                { updates.push("price_paise = ?");            values.push(Math.round(body.price * 100)); }
    if (body.originalPrice !== undefined)        { updates.push("original_price_paise = ?");   values.push(Math.round(body.originalPrice * 100)); }
    if (body.tags !== undefined)                 { updates.push("tags = ?");                   values.push(JSON.stringify(body.tags)); }
    if (body.thumbnailUrl !== undefined)         { updates.push("thumbnail_url = ?");          values.push(body.thumbnailUrl); }
    if (body.fileUrl !== undefined)              { updates.push("file_url = ?");               values.push(body.fileUrl); }
    if (body.accessDurationMonths !== undefined) { updates.push("access_duration_months = ?"); values.push(body.accessDurationMonths); }
    if (body.status !== undefined) {
      updates.push("status = ?");
      values.push(body.status);
      if (body.status === "published" || body.status === "draft") {
        updates.push("deleted_at = NULL");
      }
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");

    await dbRun(`UPDATE notes SET ${updates.join(", ")} WHERE id = ?`, [...values, id]);

    const note = await dbGet("SELECT * FROM notes WHERE id = ?", [id]);
    if (note) note.tags = JSON.parse(note.tags || "[]");

    return NextResponse.json({ note });
  } catch (err) {
    console.error("[updateNote]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return updateNote(request, params);
}

export async function PATCH(request, { params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return updateNote(request, params);
}

export async function DELETE(request, { params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;

    const note = await dbGet("SELECT id, title FROM notes WHERE id = ? AND deleted_at IS NULL", [id]);
    if (!note) {
      return NextResponse.json({ error: "Note not found or already deleted" }, { status: 404 });
    }

    await dbRun(
      "UPDATE notes SET deleted_at = CURRENT_TIMESTAMP, status = 'archived', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id]
    );

    return NextResponse.json({ ok: true, deleted: note.title });
  } catch (err) {
    console.error("[DELETE /api/notes/admin/:id]", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
