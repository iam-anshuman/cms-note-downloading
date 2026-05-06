import { dbGet, dbRun } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const { email, password, fullName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const existing = await dbGet("SELECT id FROM users WHERE email = ?", [email]);
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const hash = await bcrypt.hash(password, 10);
    
    const isAdmin = email === 'admin@academy.com';
    const role = isAdmin ? 'admin' : 'customer';

    await dbRun(
      "INSERT INTO users (id, email, password_hash, role, full_name) VALUES (?, ?, ?, ?, ?)",
      [id, email, hash, role, fullName || '']
    );

    const token = await signToken({ userId: id, role });
    
    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    const user = { id, email, role, full_name: fullName || '', avatar_url: null };

    return NextResponse.json({
      message: "Signed up successfully",
      user,
    });
  } catch (err) {
    console.error("[SIGNUP] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
