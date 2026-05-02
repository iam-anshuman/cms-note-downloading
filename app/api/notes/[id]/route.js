import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { notes, bundleNotes, bundles } from "@/lib/schema";
import { eq, and, isNull, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";


export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);

    const [note] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.status, "published"), isNull(notes.deletedAt)))
      .limit(1);

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const bundleLinks = await db
      .select({ bundleId: bundleNotes.bundleId })
      .from(bundleNotes)
      .where(eq(bundleNotes.noteId, id));

    let bundlesOut = [];

    if (bundleLinks.length > 0) {
      const bundleIds = bundleLinks.map((bl) => bl.bundleId);

      const activeBundles = await db
        .select()
        .from(bundles)
        .where(and(inArray(bundles.id, bundleIds), eq(bundles.status, "active")));

      for (const bundle of activeBundles) {
        const bundleNoteRows = await db
          .select({
            id: notes.id,
            title: notes.title,
            pricePaise: notes.pricePaise,
          })
          .from(bundleNotes)
          .innerJoin(notes, eq(bundleNotes.noteId, notes.id))
          .where(eq(bundleNotes.bundleId, bundle.id));

        const totalPaise = bundleNoteRows.reduce((s, n) => s + (n.pricePaise || 0), 0);

        bundlesOut.push({
          id: bundle.id,
          name: bundle.name,
          description: bundle.description,
          discount_percent: bundle.discountPercent,
          badge_text: bundle.badgeText,
          notes_count: bundleNoteRows.length,
          original_price: totalPaise / 100,
          bundle_price: Math.round(totalPaise * (1 - bundle.discountPercent / 100)) / 100,
        });
      }
    }

    return NextResponse.json({
      note: {
        ...note,
        tags: JSON.parse(note.tags || "[]"),
        price: note.pricePaise / 100,
        originalPrice: note.originalPricePaise / 100,
      },
      bundles: bundlesOut,
    });
  } catch (err) {
    console.error("[GET /api/notes/:id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
