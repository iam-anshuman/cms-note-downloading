import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { notes } from "@/lib/schema";
import { eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";


async function requireAdmin() {
  const user = await getUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

async function updateNote(request, params) {
  try {
    const { id } = await params;
    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);
    const body = await request.json();

    const patch = {};
    if (body.title !== undefined) patch.title = body.title;
    if (body.description !== undefined) patch.description = body.description;
    if (body.subject !== undefined) patch.subject = body.subject;
    if (body.authorName !== undefined) patch.authorName = body.authorName;
    if (body.pages !== undefined) patch.pages = body.pages;
    if (body.price !== undefined) patch.pricePaise = Math.round(body.price * 100);
    if (body.originalPrice !== undefined) patch.originalPricePaise = Math.round(body.originalPrice * 100);
    if (body.tags !== undefined) patch.tags = JSON.stringify(body.tags);
    if (body.thumbnailUrl !== undefined) patch.thumbnailUrl = body.thumbnailUrl;
    if (body.fileUrl !== undefined) patch.fileUrl = body.fileUrl;
    if (body.accessDurationMonths !== undefined) patch.accessDurationMonths = body.accessDurationMonths;
    if (body.status !== undefined) {
      patch.status = body.status;
      if (body.status === "published" || body.status === "draft") {
        patch.deletedAt = null;
      }
    }
    patch.updatedAt = new Date().toISOString();

    await db.update(notes).set(patch).where(eq(notes.id, id));

    const [note] = await db.select().from(notes).where(eq(notes.id, id)).limit(1);
    if (note) note.tags = JSON.parse(note.tags || "[]");

    return NextResponse.json({ note });
  } catch (err) {
    console.error("[updateNote]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return updateNote(request, params);
}

export async function PATCH(request, { params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return updateNote(request, params);
}

export async function DELETE(request, { params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);

    const [note] = await db
      .select({ id: notes.id, title: notes.title })
      .from(notes)
      .where(eq(notes.id, id))
      .limit(1);

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    await db.update(notes).set({
      deletedAt: new Date().toISOString(),
      status: "archived",
      updatedAt: new Date().toISOString(),
    }).where(eq(notes.id, id));

    return NextResponse.json({ ok: true, deleted: note.title });
  } catch (err) {
    console.error("[DELETE /api/notes/admin/:id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
