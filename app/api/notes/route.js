import { dbAll, dbGet } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const subject = searchParams.get("subject");
    const search = searchParams.get("search");

    const offset = (page - 1) * limit;

    let queryStr = "SELECT id, title, description, subject, author_name, pages, price_paise, original_price_paise, tags, thumbnail_url, access_duration_months, created_at FROM notes WHERE status = 'published' AND deleted_at IS NULL";
    let countStr = "SELECT COUNT(*) as count FROM notes WHERE status = 'published' AND deleted_at IS NULL";
    let params = [];

    if (subject) {
      queryStr += " AND subject = ?";
      countStr += " AND subject = ?";
      params.push(subject);
    }

    if (search) {
      queryStr += " AND title LIKE ?";
      countStr += " AND title LIKE ?";
      params.push(`%${search}%`);
    }

    queryStr += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    
    const countRow = await dbGet(countStr, params);
    const count = countRow.count;

    const notes = await dbAll(queryStr, [...params, limit, offset]);

    const formattedNotes = notes.map((note) => ({
      ...note,
      tags: JSON.parse(note.tags || "[]"),
      price: note.price_paise / 100,
      originalPrice: note.original_price_paise / 100,
    }));

    return NextResponse.json({
      notes: formattedNotes,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
