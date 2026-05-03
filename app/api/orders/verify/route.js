import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { orders, orderItems, notes, userAccess } from "@/lib/schema";
import { eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";



export async function POST(request) {
  try {
    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);
    const body = await request.json();

    const razorpayOrderId = body.razorpayOrderId || body.razorpay_order_id;
    const razorpayPaymentId = body.razorpayPaymentId || body.razorpay_payment_id;
    const razorpaySignature = body.razorpaySignature || body.razorpay_signature;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // HMAC signature verification using Web Crypto API (edge-compatible)
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(process.env.RAZORPAY_KEY_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBytes = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(`${razorpayOrderId}|${razorpayPaymentId}`)
    );
    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.razorpayOrderId, razorpayOrderId))
      .limit(1);

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    if (order.status === "paid") {
      return NextResponse.json({ message: "Already verified", alreadyProcessed: true });
    }

    await db
      .update(orders)
      .set({ status: "paid", razorpayPaymentId })
      .where(eq(orders.id, order.id));

    const items = await db
      .select({ noteId: orderItems.noteId })
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    const noteIds = items.map((i) => i.noteId).filter(Boolean);

    const noteRows = await db
      .select({ id: notes.id, accessDurationMonths: notes.accessDurationMonths })
      .from(notes)
      .where(inArray(notes.id, noteIds));

    for (const note of noteRows) {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + (note.accessDurationMonths || 6));

      const [existing] = await db
        .select({ id: userAccess.id, expiresAt: userAccess.expiresAt })
        .from(userAccess)
        .where(eq(userAccess.userId, order.userId))
        .limit(1);

      if (existing) {
        const currentExpiry = new Date(existing.expiresAt);
        const now = new Date();
        const newExpiry =
          currentExpiry > now
            ? new Date(currentExpiry.setMonth(currentExpiry.getMonth() + (note.accessDurationMonths || 6)))
            : expiresAt;

        await db
          .update(userAccess)
          .set({ expiresAt: newExpiry.toISOString() })
          .where(eq(userAccess.id, existing.id));
      } else {
        await db.insert(userAccess).values({
          id: crypto.randomUUID(),
          userId: order.userId,
          noteId: note.id,
          orderId: order.id,
          expiresAt: expiresAt.toISOString(),
        });
      }
    }

    return NextResponse.json({ message: "Payment verified", accessGranted: noteIds.length });
  } catch (err) {
    console.error("[orders/verify]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
