import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { bundles, bundleNotes } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";


async function requireAdmin() {
  const user = await getUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function PUT(request, { params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);
    const body = await request.json();

    const patch = {};
    if (body.name !== undefined) patch.name = body.name;
    if (body.description !== undefined) patch.description = body.description;
    if (body.discountPercent !== undefined) patch.discountPercent = body.discountPercent;
    if (body.status !== undefined) patch.status = body.status;
    if (body.badgeText !== undefined) patch.badgeText = body.badgeText;

    if (Object.keys(patch).length > 0) {
      await db.update(bundles).set(patch).where(eq(bundles.id, id));
    }

    if (body.noteIds && Array.isArray(body.noteIds)) {
      await db.delete(bundleNotes).where(eq(bundleNotes.bundleId, id));
      for (const noteId of body.noteIds) {
        await db.insert(bundleNotes).values({
          id: crypto.randomUUID(),
          bundleId: id,
          noteId,
        });
      }
    }

    const [bundle] = await db.select().from(bundles).where(eq(bundles.id, id)).limit(1);
    return NextResponse.json({ bundle });
  } catch (err) {
    console.error("[PUT /api/bundles/admin/:id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);

    await db.delete(bundles).where(eq(bundles.id, id));
    return NextResponse.json({ message: "Bundle deleted" });
  } catch (err) {
    console.error("[DELETE /api/bundles/admin/:id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
