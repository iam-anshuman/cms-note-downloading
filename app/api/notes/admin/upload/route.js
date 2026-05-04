import { NextResponse } from "next/server";
import { uploadFile, getContentType } from "@/lib/storage";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const noteId = formData.get("noteId");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type" },
        { status: 400 }
      );
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size exceeds 50MB limit" }, { status: 400 });
    }

    const ext = file.name.split(".").pop();
    const safeName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "-").substring(0, 50);
    const fileName = `${safeName}-${Date.now()}.${ext}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { path, url } = await uploadFile(buffer, fileName, file.type, noteId || undefined);

    return NextResponse.json({
      path: path,
      url: url,
      message: "File uploaded successfully",
    });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
