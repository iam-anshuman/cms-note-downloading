import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { notes } from "@/lib/schema";
import { eq, and, isNull, desc, like, count } from "drizzle-orm";
import { NextResponse } from "next/server";



export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12")));
    const subject = searchParams.get("subject");
    const search = searchParams.get("search");
    const offset = (page - 1) * limit;

    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);

    // Build dynamic where conditions
    let where = and(eq(notes.status, "published"), isNull(notes.deletedAt));
    if (subject) where = and(where, eq(notes.subject, subject));
    if (search) where = and(where, like(notes.title, `%${search}%`));

    const [{ total }] = await db
      .select({ total: count() })
      .from(notes)
      .where(where);

    const rows = await db
      .select({
        id: notes.id,
        title: notes.title,
        description: notes.description,
        subject: notes.subject,
        authorName: notes.authorName,
        pages: notes.pages,
        pricePaise: notes.pricePaise,
        originalPricePaise: notes.originalPricePaise,
        tags: notes.tags,
        thumbnailUrl: notes.thumbnailUrl,
        accessDurationMonths: notes.accessDurationMonths,
        createdAt: notes.createdAt,
      })
      .from(notes)
      .where(where)
      .orderBy(desc(notes.createdAt))
      .limit(limit)
      .offset(offset);

    const formatted = rows.map((note) => ({
      ...note,
      tags: JSON.parse(note.tags || "[]"),
      price: note.pricePaise / 100,
      originalPrice: note.originalPricePaise / 100,
    }));

    return NextResponse.json({
      notes: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("[GET /api/notes]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
