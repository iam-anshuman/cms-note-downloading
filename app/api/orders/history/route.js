import { dbAll } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (user.role === "admin") {
      const notes = await dbAll(
        `SELECT id, title, thumbnail_url, price_paise
         FROM notes
         WHERE status = 'published'
         ORDER BY created_at DESC`
      );

      if (notes.length === 0) {
        return NextResponse.json({ orders: [] });
      }

      const syntheticOrder = {
        id: "admin-all-access",
        amount: 0,
        type: "note",
        createdAt: new Date().toISOString(),
        isAdminAccess: true,
        items: notes.map((n) => ({
          noteId: n.id,
          title: n.title,
          thumbnail: n.thumbnail_url,
          price: n.price_paise / 100,
        })),
      };

      return NextResponse.json({ orders: [syntheticOrder] });
    }

    const orders = await dbAll(
      "SELECT * FROM orders WHERE user_id = ? AND status = 'paid' ORDER BY created_at DESC",
      [user.id]
    );

    const formatted = [];

    for (let order of orders) {
      const items = await dbAll(
        `SELECT oi.price_paise, n.id, n.title, n.thumbnail_url 
         FROM order_items oi 
         JOIN notes n ON oi.note_id = n.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );

      formatted.push({
        id: order.id,
        amount: order.amount_paise / 100,
        type: order.type,
        createdAt: order.created_at,
        items: items.map((item) => ({
          noteId: item.id,
          title: item.title,
          thumbnail: item.thumbnail_url,
          price: item.price_paise / 100,
        })),
      });
    }

    return NextResponse.json({ orders: formatted });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
