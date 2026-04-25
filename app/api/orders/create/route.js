import { getDb } from "@/lib/db";
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

    const db = await getDb();
    const body = await request.json();

    let amountPaise = 0;
    let orderType = "note";
    let noteIds = [];

    if (body.bundleId) {
      orderType = "bundle";

      const bundle = await db.get("SELECT * FROM bundles WHERE id = ? AND status = 'active'", [body.bundleId]);
      if (!bundle) return NextResponse.json({ error: "Bundle not found" }, { status: 404 });

      const bundleNotes = await db.all(
        "SELECT n.id, n.price_paise FROM bundle_notes bn JOIN notes n ON bn.note_id = n.id WHERE bn.bundle_id = ?",
        [body.bundleId]
      );

      const totalPaise = bundleNotes.reduce((sum, n) => sum + (n.price_paise || 0), 0);
      amountPaise = Math.round(totalPaise * (1 - bundle.discount_percent / 100));
      noteIds = bundleNotes.map((n) => n.id);
    } else if (body.noteId) {
      const note = await db.get("SELECT id, price_paise FROM notes WHERE id = ? AND status = 'published'", [body.noteId]);
      if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });

      amountPaise = note.price_paise;
      noteIds = [note.id];
    } else {
      return NextResponse.json({ error: "Either noteId or bundleId is required" }, { status: 400 });
    }

    const existingAccess = await db.all(
      `SELECT note_id FROM user_access WHERE user_id = ? AND note_id IN (${noteIds.map(() => '?').join(',')}) AND expires_at >= datetime('now')`,
      [user.id, ...noteIds]
    );

    const alreadyOwned = existingAccess.map((a) => a.note_id);
    const newNotes = noteIds.filter((id) => !alreadyOwned.includes(id));

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
    await db.run(
      "INSERT INTO orders (id, user_id, razorpay_order_id, amount_paise, status, type) VALUES (?, ?, ?, ?, ?, ?)",
      [orderId, user.id, razorpayOrder.id, amountPaise, "created", orderType]
    );

    for (let noteId of newNotes) {
      await db.run(
        "INSERT INTO order_items (id, order_id, note_id, bundle_id, price_paise) VALUES (?, ?, ?, ?, ?)",
        [crypto.randomUUID(), orderId, noteId, body.bundleId || null, Math.round(amountPaise / newNotes.length)]
      );
    }

    return NextResponse.json({
      orderId,
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amountPaise,
      currency: "INR",
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
