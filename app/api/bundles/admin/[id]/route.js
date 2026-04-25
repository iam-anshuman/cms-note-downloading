import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const db = await getDb();
    const body = await request.json();

    const updates = [];
    const values = [];

    if (body.name !== undefined) { updates.push("name = ?"); values.push(body.name); }
    if (body.description !== undefined) { updates.push("description = ?"); values.push(body.description); }
    if (body.discountPercent !== undefined) { updates.push("discount_percent = ?"); values.push(body.discountPercent); }
    if (body.status !== undefined) { updates.push("status = ?"); values.push(body.status); }
    if (body.badgeText !== undefined) { updates.push("badge_text = ?"); values.push(body.badgeText); }

    if (updates.length > 0) {
      await db.run(`UPDATE bundles SET ${updates.join(", ")} WHERE id = ?`, [...values, id]);
    }

    if (body.noteIds && Array.isArray(body.noteIds)) {
      await db.run("DELETE FROM bundle_notes WHERE bundle_id = ?", [id]);
      for (let noteId of body.noteIds) {
        await db.run("INSERT INTO bundle_notes (id, bundle_id, note_id) VALUES (?, ?, ?)", [crypto.randomUUID(), id, noteId]);
      }
    }

    const bundle = await db.get("SELECT * FROM bundles WHERE id = ?", [id]);

    return NextResponse.json({ bundle });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const db = await getDb();

    await db.run("DELETE FROM bundles WHERE id = ?", [id]);

    return NextResponse.json({ message: "Bundle deleted" });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
