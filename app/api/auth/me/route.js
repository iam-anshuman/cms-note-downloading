import { getUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error("[AUTH/ME] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
