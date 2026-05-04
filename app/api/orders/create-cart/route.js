import { dbAll, dbRun } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { NextResponse } from "next/server";

function getRazorpay() {
  const Razorpay = require("razorpay");
  return new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

export async function POST(request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const { noteIds } = body;

    if (!noteIds || !Array.isArray(noteIds) || noteIds.length === 0) {
      return NextResponse.json({ error: "noteIds array is required" }, { status: 400 });
    }

    const placeholders = noteIds.map(() => "?").join(",");
    const notes = await dbAll(
      `SELECT id, price_paise FROM notes WHERE id IN (${placeholders}) AND status = 'published'`,
      noteIds
    );

    if (notes.length === 0) {
      return NextResponse.json({ error: "No valid notes found" }, { status: 404 });
    }

    const existingAccess = await dbAll(
      `SELECT note_id FROM user_access WHERE user_id = ? AND note_id IN (${placeholders}) AND expires_at >= datetime('now')`,
      [user.id, ...noteIds]
    );
    const alreadyOwned = new Set(existingAccess.map((a) => a.note_id));
    const newNotes = notes.filter((n) => !alreadyOwned.has(n.id));

    if (newNotes.length === 0) {
      return NextResponse.json({ error: "You already have access to all selected notes" }, { status: 400 });
    }

    const amountPaise = newNotes.reduce((sum, n) => sum + (n.price_paise || 0), 0);

    const razorpayOrder = await getRazorpay().orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `cart_${Date.now()}`,
      notes: { user_id: user.id, type: "cart", count: newNotes.length },
    });

    const orderId = crypto.randomUUID();
    await dbRun(
      "INSERT INTO orders (id, user_id, razorpay_order_id, amount_paise, status, type) VALUES (?, ?, ?, ?, ?, ?)",
      [orderId, user.id, razorpayOrder.id, amountPaise, "created", "note"]
    );

    for (const note of newNotes) {
      await dbRun(
        "INSERT INTO order_items (id, order_id, note_id, bundle_id, price_paise) VALUES (?, ?, ?, ?, ?)",
        [crypto.randomUUID(), orderId, note.id, null, note.price_paise]
      );
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
