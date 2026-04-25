import { getDb } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const db = await getDb();

    const bundlesData = await db.all("SELECT * FROM bundles ORDER BY created_at DESC");
    const formatted = [];

    for (let bundle of bundlesData) {
      const bundleNotes = await db.all(
        `SELECT n.id, n.title, n.price_paise 
         FROM bundle_notes bn 
         JOIN notes n ON bn.note_id = n.id 
         WHERE bn.bundle_id = ?`,
        [bundle.id]
      );
      
      const totalPaise = bundleNotes.reduce((sum, n) => sum + (n.price_paise || 0), 0);

      formatted.push({
        ...bundle,
        notes_count: bundleNotes.length,
        original_price: totalPaise / 100,
        bundle_price: Math.round(totalPaise * (1 - bundle.discount_percent / 100)) / 100,
      });
    }

    return NextResponse.json({ bundles: formatted });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await getDb();
    const body = await request.json();

    if (!body.name || !body.noteIds || body.noteIds.length < 2) {
      return NextResponse.json(
        { error: "Bundle name and at least 2 notes are required" },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();

    await db.run(
      `INSERT INTO bundles (id, name, description, discount_percent, status, badge_text, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, body.name, body.description || "", body.discountPercent || 20, body.status || "draft", body.badgeText || "", user.id]
    );

    for (let noteId of body.noteIds) {
      const bnId = crypto.randomUUID();
      await db.run(
        "INSERT INTO bundle_notes (id, bundle_id, note_id) VALUES (?, ?, ?)",
        [bnId, id, noteId]
      );
    }

    const bundle = await db.get("SELECT * FROM bundles WHERE id = ?", [id]);

    return NextResponse.json({ bundle }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
