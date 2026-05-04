import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { dbAll, dbGet, dbRun } from "@/lib/db";
import { randomUUID } from "crypto";

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ items: [] });
  }

  const items = await dbAll(
    `SELECT n.id, n.title, n.subject, n.thumbnail_url, n.price_paise, n.original_price_paise
     FROM cart_items ci
     JOIN notes n ON n.id = ci.note_id
     WHERE ci.user_id = ?
     ORDER BY ci.added_at ASC`,
    [user.id]
  );

  return NextResponse.json({ items });
}

export async function POST(request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { noteId } = await request.json();
  if (!noteId) {
    return NextResponse.json({ error: "noteId is required" }, { status: 400 });
  }

  const note = await dbGet(
    "SELECT id FROM notes WHERE id = ? AND status = 'published'",
    [noteId]
  );
  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  await dbRun(
    "INSERT OR IGNORE INTO cart_items (id, user_id, note_id) VALUES (?, ?, ?)",
    [randomUUID(), user.id, noteId]
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let noteId;
  try {
    ({ noteId } = await request.json());
  } catch {
    noteId = undefined;
  }

  if (noteId) {
    await dbRun(
      "DELETE FROM cart_items WHERE user_id = ? AND note_id = ?",
      [user.id, noteId]
    );
  } else {
    await dbRun("DELETE FROM cart_items WHERE user_id = ?", [user.id]);
  }

  return NextResponse.json({ ok: true });
}
