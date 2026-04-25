import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");

    const offset = (page - 1) * limit;

    let queryStr = "SELECT id, email, full_name, avatar_url, created_at FROM users WHERE role = 'customer'";
    let countStr = "SELECT COUNT(*) as count FROM users WHERE role = 'customer'";
    let params = [];

    if (search) {
      const searchParam = `%${search}%`;
      queryStr += " AND (email LIKE ? OR full_name LIKE ?)";
      countStr += " AND (email LIKE ? OR full_name LIKE ?)";
      params.push(searchParam, searchParam);
    }

    queryStr += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    
    const countRow = await db.get(countStr, params);
    const count = countRow.count;

    const customers = await db.all(queryStr, [...params, limit, offset]);

    const enriched = [];
    for (let customer of customers) {
      const orders = await db.all("SELECT amount_paise FROM orders WHERE user_id = ? AND status = 'paid'", [customer.id]);
      const totalSpent = orders.reduce((sum, o) => sum + o.amount_paise, 0);

      const accessCountRow = await db.get(
        "SELECT COUNT(*) as count FROM user_access WHERE user_id = ? AND expires_at >= datetime('now')", 
        [customer.id]
      );

      enriched.push({
        ...customer,
        totalPurchases: orders.length,
        totalSpent: totalSpent / 100,
        activeAccess: accessCountRow.count,
        status: accessCountRow.count > 0 ? "Active" : "Inactive",
      });
    }

    return NextResponse.json({
      customers: enriched,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
