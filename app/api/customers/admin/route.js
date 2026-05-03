import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { users, orders, userAccess } from "@/lib/schema";
import { eq, and, gte, like, count, desc, or } from "drizzle-orm";
import { NextResponse } from "next/server";



export async function GET(request) {
  try {
    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const search = searchParams.get("search");
    const offset = (page - 1) * limit;

    // Build where clause dynamically
    let where = eq(users.role, "customer");
    if (search) {
      where = and(where, or(like(users.email, `%${search}%`), like(users.fullName, `%${search}%`)));
    }

    const [{ total }] = await db
      .select({ total: count() })
      .from(users)
      .where(where);

    const customers = await db
      .select({ id: users.id, email: users.email, fullName: users.fullName, avatarUrl: users.avatarUrl, createdAt: users.createdAt })
      .from(users)
      .where(where)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    const now = new Date().toISOString();
    const enriched = [];

    for (const customer of customers) {
      const paidOrders = await db
        .select({ amountPaise: orders.amountPaise })
        .from(orders)
        .where(and(eq(orders.userId, customer.id), eq(orders.status, "paid")));

      const totalSpent = paidOrders.reduce((s, o) => s + o.amountPaise, 0);

      const [{ activeCount }] = await db
        .select({ activeCount: count() })
        .from(userAccess)
        .where(and(eq(userAccess.userId, customer.id), gte(userAccess.expiresAt, now)));

      enriched.push({
        ...customer,
        totalPurchases: paidOrders.length,
        totalSpent: totalSpent / 100,
        activeAccess: activeCount,
        status: activeCount > 0 ? "Active" : "Inactive",
      });
    }

    return NextResponse.json({
      customers: enriched,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[GET /api/customers/admin]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
