import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { bundles, bundleNotes, notes } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";



export async function GET() {
  try {
    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);

    const activeBundles = await db
      .select()
      .from(bundles)
      .where(eq(bundles.status, "active"))
      .orderBy(desc(bundles.createdAt));

    const formatted = [];
    for (const bundle of activeBundles) {
      const bNotes = await db
        .select({ id: notes.id, title: notes.title, thumbnailUrl: notes.thumbnailUrl, pricePaise: notes.pricePaise })
        .from(bundleNotes)
        .innerJoin(notes, eq(bundleNotes.noteId, notes.id))
        .where(eq(bundleNotes.bundleId, bundle.id));

      const totalPaise = bNotes.reduce((s, n) => s + (n.pricePaise || 0), 0);

      formatted.push({
        id: bundle.id,
        name: bundle.name,
        description: bundle.description,
        discount_percent: bundle.discountPercent,
        badge_text: bundle.badgeText,
        notes: bNotes.map((n) => ({ id: n.id, title: n.title, thumbnail_url: n.thumbnailUrl })),
        original_price: totalPaise / 100,
        bundle_price: Math.round(totalPaise * (1 - bundle.discountPercent / 100)) / 100,
      });
    }

    return NextResponse.json({ bundles: formatted });
  } catch (err) {
    console.error("[GET /api/bundles]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
