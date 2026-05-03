import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { bundles, bundleNotes, notes } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";



export async function GET() {
  try {
    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);

    const allBundles = await db.select().from(bundles).orderBy(desc(bundles.createdAt));
    const formatted = [];

    for (const bundle of allBundles) {
      const bNotes = await db
        .select({ id: notes.id, title: notes.title, pricePaise: notes.pricePaise })
        .from(bundleNotes)
        .innerJoin(notes, eq(bundleNotes.noteId, notes.id))
        .where(eq(bundleNotes.bundleId, bundle.id));

      const totalPaise = bNotes.reduce((s, n) => s + (n.pricePaise || 0), 0);

      formatted.push({
        ...bundle,
        notes_count: bNotes.length,
        original_price: totalPaise / 100,
        bundle_price: Math.round(totalPaise * (1 - bundle.discountPercent / 100)) / 100,
      });
    }

    return NextResponse.json({ bundles: formatted });
  } catch (err) {
    console.error("[GET /api/bundles/admin]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);
    const body = await request.json();

    if (!body.name || !body.noteIds || body.noteIds.length < 2) {
      return NextResponse.json(
        { error: "Bundle name and at least 2 notes are required" },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();

    await db.insert(bundles).values({
      id,
      name: body.name,
      description: body.description || "",
      discountPercent: body.discountPercent || 20,
      status: body.status || "draft",
      badgeText: body.badgeText || "",
      createdBy: user.id,
    });

    for (const noteId of body.noteIds) {
      await db.insert(bundleNotes).values({
        id: crypto.randomUUID(),
        bundleId: id,
        noteId,
      });
    }

    const [bundle] = await db.select().from(bundles).where(eq(bundles.id, id)).limit(1);
    return NextResponse.json({ bundle }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/bundles/admin]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
