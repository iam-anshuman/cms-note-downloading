import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { orders, orderItems, notes, bundles, bundleNotes, userAccess } from "@/lib/schema";
import { eq, and, gte, inArray } from "drizzle-orm";
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
    const body = await request.json();

    let amountPaise = 0;
    let orderType = "note";
    let noteIds = [];

    if (body.bundleId) {
      orderType = "bundle";

      const [bundle] = await db
        .select()
        .from(bundles)
        .where(and(eq(bundles.id, body.bundleId), eq(bundles.status, "active")))
        .limit(1);

      if (!bundle) return NextResponse.json({ error: "Bundle not found" }, { status: 404 });

      const bNotes = await db
        .select({ id: notes.id, pricePaise: notes.pricePaise })
        .from(bundleNotes)
        .innerJoin(notes, eq(bundleNotes.noteId, notes.id))
        .where(eq(bundleNotes.bundleId, body.bundleId));

      const totalPaise = bNotes.reduce((s, n) => s + (n.pricePaise || 0), 0);
      amountPaise = Math.round(totalPaise * (1 - bundle.discountPercent / 100));
      noteIds = bNotes.map((n) => n.id);
    } else if (body.noteId) {
      const [note] = await db
        .select({ id: notes.id, pricePaise: notes.pricePaise })
        .from(notes)
        .where(and(eq(notes.id, body.noteId), eq(notes.status, "published")))
        .limit(1);

      if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });
      amountPaise = note.pricePaise;
      noteIds = [note.id];
    } else {
      return NextResponse.json({ error: "Either noteId or bundleId is required" }, { status: 400 });
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
    const newNotes = noteIds.filter((id) => !alreadyOwned.has(id));

    if (newNotes.length === 0) {
      return NextResponse.json({ error: "You already have access to all notes in this purchase" }, { status: 400 });
    }

    const razorpayOrder = await getRazorpay().orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: { user_id: user.id, type: orderType },
    });

    const orderId = crypto.randomUUID();
    await db.insert(orders).values({
      id: orderId,
      userId: user.id,
      razorpayOrderId: razorpayOrder.id,
      amountPaise,
      status: "created",
      type: orderType,
    });

    for (const noteId of newNotes) {
      await db.insert(orderItems).values({
        id: crypto.randomUUID(),
        orderId,
        noteId,
        bundleId: body.bundleId || null,
        pricePaise: Math.round(amountPaise / newNotes.length),
      });
    }

    return NextResponse.json({
      orderId,
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amountPaise,
      currency: "INR",
    });
  } catch (err) {
    console.error("[orders/create]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
