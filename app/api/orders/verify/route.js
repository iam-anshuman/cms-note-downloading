import { dbAll, dbGet, dbRun } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request) {
  try {
    const body = await request.json();

    const razorpayOrderId = body.razorpayOrderId || body.razorpay_order_id;
    const razorpayPaymentId = body.razorpayPaymentId || body.razorpay_payment_id;
    const razorpaySignature = body.razorpaySignature || body.razorpay_signature;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    const order = await dbGet("SELECT * FROM orders WHERE razorpay_order_id = ?", [razorpayOrderId]);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "paid") {
      return NextResponse.json({ message: "Already verified", alreadyProcessed: true });
    }

    await dbRun(
      "UPDATE orders SET status = 'paid', razorpay_payment_id = ? WHERE id = ?",
      [razorpayPaymentId, order.id]
    );

    const orderItems = await dbAll("SELECT note_id FROM order_items WHERE order_id = ?", [order.id]);
    const noteIds = orderItems.map((item) => item.note_id);

    const notes = await dbAll(`SELECT id, access_duration_months FROM notes WHERE id IN (${noteIds.map(() => '?').join(',')})`, noteIds);

    for (let note of notes) {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + (note.access_duration_months || 6));
      
      const existingAccess = await dbGet(
        "SELECT id, expires_at FROM user_access WHERE user_id = ? AND note_id = ?",
        [order.user_id, note.id]
      );

      if (existingAccess) {
        const currentExpiry = new Date(existingAccess.expires_at);
        const newExpiry = currentExpiry > new Date() ? new Date(currentExpiry.setMonth(currentExpiry.getMonth() + (note.access_duration_months || 6))) : expiresAt;
        
        await dbRun(
          "UPDATE user_access SET expires_at = ? WHERE id = ?",
          [newExpiry.toISOString(), existingAccess.id]
        );
      } else {
        await dbRun(
          "INSERT INTO user_access (id, user_id, note_id, order_id, expires_at) VALUES (?, ?, ?, ?, ?)",
          [crypto.randomUUID(), order.user_id, note.id, order.id, expiresAt.toISOString()]
        );
      }
    }

    return NextResponse.json({
      message: "Payment verified",
      accessGranted: noteIds.length,
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
