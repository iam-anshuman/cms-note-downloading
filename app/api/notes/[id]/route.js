import { dbAll, dbGet } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const note = await dbGet(
      "SELECT * FROM notes WHERE id = ? AND status = 'published' AND deleted_at IS NULL",
      [id]
    );

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const bundleLinks = await dbAll(
      "SELECT bundle_id FROM bundle_notes WHERE note_id = ?",
      [id]
    );

    let bundles = [];
    if (bundleLinks && bundleLinks.length > 0) {
      const bundleIds = bundleLinks.map((bl) => bl.bundle_id);
      const placeholders = bundleIds.map(() => "?").join(",");
      
      const bundlesData = await dbAll(
        `SELECT * FROM bundles WHERE id IN (${placeholders}) AND status = 'active'`,
        bundleIds
      );

      for (let bundle of bundlesData) {
        const bundleNotes = await dbAll(
          `SELECT n.id, n.title, n.price_paise 
           FROM bundle_notes bn 
           JOIN notes n ON bn.note_id = n.id 
           WHERE bn.bundle_id = ?`,
          [bundle.id]
        );
        
        const totalPaise = bundleNotes.reduce(
          (sum, n) => sum + (n.price_paise || 0),
          0
        );

        bundles.push({
          id: bundle.id,
          name: bundle.name,
          description: bundle.description,
          discount_percent: bundle.discount_percent,
          badge_text: bundle.badge_text,
          notes_count: bundleNotes.length,
          original_price: totalPaise / 100,
          bundle_price: Math.round(totalPaise * (1 - bundle.discount_percent / 100)) / 100,
        });
      }
    }

    return NextResponse.json({
      note: {
        ...note,
        tags: JSON.parse(note.tags || "[]"),
        price: note.price_paise / 100,
        originalPrice: note.original_price_paise / 100,
      },
      bundles,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
