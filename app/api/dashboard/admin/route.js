import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { orders, users, notes, bundles } from "@/lib/schema";
import { eq, sum, count } from "drizzle-orm";
import { NextResponse } from "next/server";



export async function GET() {
  try {
    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);

    const [revenueRes] = await db
      .select({ total: sum(orders.amountPaise) })
      .from(orders)
      .where(eq(orders.status, "paid"));

    const [ordersRes] = await db
      .select({ value: count() })
      .from(orders)
      .where(eq(orders.status, "paid"));

    const [customersRes] = await db
      .select({ value: count() })
      .from(users)
      .where(eq(users.role, "customer"));

    const [notesRes] = await db
      .select({ value: count() })
      .from(notes)
      .where(eq(notes.status, "published"));

    const [bundlesRes] = await db
      .select({ value: count() })
      .from(bundles)
      .where(eq(bundles.status, "active"));

    return NextResponse.json({
      totalRevenue: (Number(revenueRes?.total) || 0) / 100,
      totalOrders: ordersRes?.value || 0,
      totalCustomers: customersRes?.value || 0,
      totalNotes: notesRes?.value || 0,
      totalBundles: bundlesRes?.value || 0,
    });
  } catch (err) {
    console.error("[GET /api/dashboard/admin]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
