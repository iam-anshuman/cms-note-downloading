import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { notes } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";



export async function GET(request) {
  try {
    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const rows = await db
      .select()
      .from(notes)
      .where(status ? eq(notes.status, status) : undefined)
      .orderBy(desc(notes.createdAt));

    return NextResponse.json({
      notes: rows.map((n) => ({ ...n, tags: JSON.parse(n.tags || "[]") })),
    });
  } catch (err) {
    console.error("[GET /api/notes/admin]", err);
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

    const id = crypto.randomUUID();

    await db.insert(notes).values({
      id,
      title: body.title,
      description: body.description || "",
      subject: body.subject || "",
      authorName: body.authorName || "",
      pages: body.pages || 0,
      pricePaise: Math.round((body.price || 0) * 100),
      originalPricePaise: Math.round((body.originalPrice || body.price || 0) * 100),
      tags: JSON.stringify(body.tags || []),
      thumbnailUrl: body.thumbnailUrl || null,
      fileUrl: body.fileUrl || null,
      accessDurationMonths: body.accessDurationMonths || 6,
      status: body.status || "draft",
      uploadedBy: user.id,
    });

    const [note] = await db.select().from(notes).where(eq(notes.id, id)).limit(1);
    note.tags = JSON.parse(note.tags || "[]");

    return NextResponse.json({ note }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/notes/admin]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
