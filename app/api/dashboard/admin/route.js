import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const db = await getDb();

    const revenueRes = await db.get("SELECT SUM(amount_paise) as total FROM orders WHERE status = 'paid'");
    const ordersRes = await db.get("SELECT COUNT(*) as count FROM orders WHERE status = 'paid'");
    const customersRes = await db.get("SELECT COUNT(*) as count FROM users WHERE role = 'customer'");
    const notesRes = await db.get("SELECT COUNT(*) as count FROM notes WHERE status = 'published'");
    const bundlesRes = await db.get("SELECT COUNT(*) as count FROM bundles WHERE status = 'active'");

    return NextResponse.json({
      totalRevenue: (revenueRes?.total || 0) / 100,
      totalOrders: ordersRes?.count || 0,
      totalCustomers: customersRes?.count || 0,
      totalNotes: notesRes?.count || 0,
      totalBundles: bundlesRes?.count || 0,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
