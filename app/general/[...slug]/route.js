import { NextResponse } from "next/server";
import * as r2 from "@/lib/r2";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const key = `general/${slug.join("/")}`;

    if (!r2.isR2Configured()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const signedUrl = await r2.getSignedDownloadUrl(key, 3600);

    return NextResponse.redirect(signedUrl, 302);
  } catch (err) {
    console.error("[general-proxy]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
