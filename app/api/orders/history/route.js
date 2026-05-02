import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { orders, orderItems, notes } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";
import { NextResponse } from "next/server";



export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);

    if (user.role === "admin") {
      const allNotes = await db
        .select({ id: notes.id, title: notes.title, thumbnailUrl: notes.thumbnailUrl, pricePaise: notes.pricePaise })
        .from(notes)
        .where(eq(notes.status, "published"))
        .orderBy(desc(notes.createdAt));

      if (allNotes.length === 0) return NextResponse.json({ orders: [] });

      return NextResponse.json({
        orders: [{
          id: "admin-all-access",
          amount: 0,
          type: "note",
          createdAt: new Date().toISOString(),
          isAdminAccess: true,
          items: allNotes.map((n) => ({
            noteId: n.id,
            title: n.title,
            thumbnail: n.thumbnailUrl,
            price: n.pricePaise / 100,
          })),
        }],
      });
    }

    const paidOrders = await db
      .select()
      .from(orders)
      .where(and(eq(orders.userId, user.id), eq(orders.status, "paid")))
      .orderBy(desc(orders.createdAt));

    const formatted = [];
    for (const order of paidOrders) {
      const items = await db
        .select({
          pricePaise: orderItems.pricePaise,
          id: notes.id,
          title: notes.title,
          thumbnailUrl: notes.thumbnailUrl,
        })
        .from(orderItems)
        .innerJoin(notes, eq(orderItems.noteId, notes.id))
        .where(eq(orderItems.orderId, order.id));

      formatted.push({
        id: order.id,
        amount: order.amountPaise / 100,
        type: order.type,
        createdAt: order.createdAt,
        items: items.map((item) => ({
          noteId: item.id,
          title: item.title,
          thumbnail: item.thumbnailUrl,
          price: item.pricePaise / 100,
        })),
      });
    }

    return NextResponse.json({ orders: formatted });
  } catch (err) {
    console.error("[orders/history]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
