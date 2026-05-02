import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { cartItems, notes } from "@/lib/schema";
import { eq, and, asc, count } from "drizzle-orm";
import { NextResponse } from "next/server";



const MAX_CART_ITEMS = 50;

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ items: [] });

  const { env } = await getCloudflareContext();
  const db = getDb(env.DB);

  const items = await db
    .select({
      id: notes.id,
      title: notes.title,
      subject: notes.subject,
      thumbnailUrl: notes.thumbnailUrl,
      pricePaise: notes.pricePaise,
      originalPricePaise: notes.originalPricePaise,
    })
    .from(cartItems)
    .innerJoin(notes, eq(cartItems.noteId, notes.id))
    .where(eq(cartItems.userId, user.id))
    .orderBy(asc(cartItems.addedAt));

  return NextResponse.json({ items });
}

export async function POST(request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { noteId } = await request.json();
  if (!noteId) return NextResponse.json({ error: "noteId is required" }, { status: 400 });

  const { env } = await getCloudflareContext();
  const db = getDb(env.DB);

  const [note] = await db
    .select({ id: notes.id })
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.status, "published")))
    .limit(1);

  if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });

  const [{ value: cartCount }] = await db
    .select({ value: count() })
    .from(cartItems)
    .where(eq(cartItems.userId, user.id));

  if (cartCount >= MAX_CART_ITEMS) {
    return NextResponse.json({ error: "Cart item limit reached" }, { status: 429 });
  }

  await db
    .insert(cartItems)
    .values({ id: crypto.randomUUID(), userId: user.id, noteId })
    .onConflictDoNothing();

  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { env } = await getCloudflareContext();
  const db = getDb(env.DB);

  let noteId;
  try {
    ({ noteId } = await request.json());
  } catch {
    noteId = undefined;
  }

  if (noteId) {
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.userId, user.id), eq(cartItems.noteId, noteId)));
  } else {
    await db.delete(cartItems).where(eq(cartItems.userId, user.id));
  }

  return NextResponse.json({ ok: true });
}
