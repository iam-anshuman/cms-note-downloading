import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { users } from "@/lib/schema";
import { eq, count } from "drizzle-orm";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";



const MAX_USERS = 10_000;

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);

    const [{ value: userCount }] = await db
      .select({ value: count() })
      .from(users);
    if (userCount >= MAX_USERS) {
      return NextResponse.json(
        { error: "Registration is currently unavailable" },
        { status: 503 }
      );
    }

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const hash = await bcrypt.hash(password, 10);

    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim());
    const role = adminEmails.includes(email) ? "admin" : "customer";

    await db.insert(users).values({
      id,
      email,
      passwordHash: hash,
      fullName: "",
      role,
    });

    const token = await signToken({ userId: id, role });

    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: new URL(request.url).protocol === "https:",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({
      message: "Signed up successfully",
      user: { id, email, role, full_name: "", avatar_url: null },
    });
  } catch (err) {
    console.error("[signup]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
