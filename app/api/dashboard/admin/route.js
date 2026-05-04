import { dbGet } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const revenueRes = await dbGet("SELECT SUM(amount_paise) as total FROM orders WHERE status = 'paid'");
    const ordersRes = await dbGet("SELECT COUNT(*) as count FROM orders WHERE status = 'paid'");
    const customersRes = await dbGet("SELECT COUNT(*) as count FROM users WHERE role = 'customer'");
    const notesRes = await dbGet("SELECT COUNT(*) as count FROM notes WHERE status = 'published'");
    const bundlesRes = await dbGet("SELECT COUNT(*) as count FROM bundles WHERE status = 'active'");

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
