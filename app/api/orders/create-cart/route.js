import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { orders, orderItems, notes, userAccess } from "@/lib/schema";
import { eq, and, inArray, gte } from "drizzle-orm";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";



function getRazorpay() {
  return new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

export async function POST(request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);
    const { noteIds } = await request.json();

    if (!noteIds || !Array.isArray(noteIds) || noteIds.length === 0) {
      return NextResponse.json({ error: "noteIds array is required" }, { status: 400 });
    }

    const noteRows = await db
      .select({ id: notes.id, pricePaise: notes.pricePaise })
      .from(notes)
      .where(and(inArray(notes.id, noteIds), eq(notes.status, "published")));

    if (noteRows.length === 0) {
      return NextResponse.json({ error: "No valid notes found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    const existingAccess = await db
      .select({ noteId: userAccess.noteId })
      .from(userAccess)
      .where(
        and(
          eq(userAccess.userId, user.id),
          inArray(userAccess.noteId, noteIds),
          gte(userAccess.expiresAt, now)
        )
      );

    const alreadyOwned = new Set(existingAccess.map((a) => a.noteId));
    const newNotes = noteRows.filter((n) => !alreadyOwned.has(n.id));

    if (newNotes.length === 0) {
      return NextResponse.json({ error: "You already have access to all selected notes" }, { status: 400 });
    }

    const amountPaise = newNotes.reduce((s, n) => s + (n.pricePaise || 0), 0);

    const razorpayOrder = await getRazorpay().orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `cart_${Date.now()}`,
      notes: { user_id: user.id, type: "cart", count: newNotes.length },
    });

    const orderId = crypto.randomUUID();
    await db.insert(orders).values({
      id: orderId,
      userId: user.id,
      razorpayOrderId: razorpayOrder.id,
      amountPaise,
      status: "created",
      type: "note",
    });

    for (const note of newNotes) {
      await db.insert(orderItems).values({
        id: crypto.randomUUID(),
        orderId,
        noteId: note.id,
        bundleId: null,
        pricePaise: note.pricePaise,
      });
    }

    return NextResponse.json({
      orderId,
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amountPaise,
      currency: "INR",
      itemCount: newNotes.length,
    });
  } catch (err) {
    console.error("[create-cart]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
