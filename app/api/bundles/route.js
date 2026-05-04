import { dbAll } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const bundlesData = await dbAll(
      "SELECT * FROM bundles WHERE status = 'active' ORDER BY created_at DESC"
    );

    const formatted = [];

    for (let bundle of bundlesData) {
      const bundleNotes = await dbAll(
        `SELECT n.id, n.title, n.price_paise, n.thumbnail_url 
         FROM bundle_notes bn 
         JOIN notes n ON bn.note_id = n.id 
         WHERE bn.bundle_id = ?`,
        [bundle.id]
      );
      
      const totalPaise = bundleNotes.reduce(
        (sum, n) => sum + (n.price_paise || 0),
        0
      );

      formatted.push({
        id: bundle.id,
        name: bundle.name,
        description: bundle.description,
        discount_percent: bundle.discount_percent,
        badge_text: bundle.badge_text,
        notes: bundleNotes.map((n) => ({
          id: n.id,
          title: n.title,
          thumbnail_url: n.thumbnail_url,
        })),
        original_price: totalPaise / 100,
        bundle_price: Math.round(totalPaise * (1 - bundle.discount_percent / 100)) / 100,
      });
    }

    return NextResponse.json({ bundles: formatted });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
