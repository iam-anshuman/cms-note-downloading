import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { randomUUID } from "crypto";

/**
 * GET /api/cart
 * Returns the authenticated user's cart with full note details.
 */
export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ items: [] }); // unauthenticated → empty
  }

  const db = await getDb();
  const items = await db.all(
    `SELECT n.id, n.title, n.subject, n.thumbnail_url, n.price_paise, n.original_price_paise
     FROM cart_items ci
     JOIN notes n ON n.id = ci.note_id
     WHERE ci.user_id = ?
     ORDER BY ci.added_at ASC`,
    [user.id]
  );

  return NextResponse.json({ items });
}

/**
 * POST /api/cart
 * Body: { noteId: string }
 * Adds a note to the cart. Idempotent — duplicate adds are ignored.
 */
export async function POST(request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { noteId } = await request.json();
  if (!noteId) {
    return NextResponse.json({ error: "noteId is required" }, { status: 400 });
  }

  const db = await getDb();

  // Verify the note exists and is published
  const note = await db.get(
    "SELECT id FROM notes WHERE id = ? AND status = 'published'",
    [noteId]
  );
  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  // INSERT OR IGNORE handles the UNIQUE(user_id, note_id) constraint gracefully
  await db.run(
    "INSERT OR IGNORE INTO cart_items (id, user_id, note_id) VALUES (?, ?, ?)",
    [randomUUID(), user.id, noteId]
  );

  return NextResponse.json({ ok: true });
}

/**
 * DELETE /api/cart
 * Body: { noteId?: string }
 * Omit noteId to clear the entire cart; provide noteId to remove a single item.
 */
export async function DELETE(request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const db = await getDb();
  let noteId;
  try {
    ({ noteId } = await request.json());
  } catch {
    noteId = undefined;
  }

  if (noteId) {
    await db.run(
      "DELETE FROM cart_items WHERE user_id = ? AND note_id = ?",
      [user.id, noteId]
    );
  } else {
    await db.run("DELETE FROM cart_items WHERE user_id = ?", [user.id]);
  }

  return NextResponse.json({ ok: true });
}
