import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { getPresignedUrl } from "@/lib/r2";
import { notes, userAccess } from "@/lib/schema";
import { eq, and, gte, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";


export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);

    if (user.role !== "admin") {
      const [access] = await db
        .select({ id: userAccess.id })
        .from(userAccess)
        .where(
          and(
            eq(userAccess.userId, user.id),
            eq(userAccess.noteId, id),
            gte(userAccess.expiresAt, new Date().toISOString())
          )
        )
        .limit(1);

      if (!access) {
        return NextResponse.json(
          { error: "You do not have access to this note. Please purchase it first." },
          { status: 403 }
        );
      }
    }

    const [note] = await db
      .select({ fileUrl: notes.fileUrl, title: notes.title })
      .from(notes)
      .where(and(eq(notes.id, id), isNull(notes.deletedAt)))
      .limit(1);

    if (!note || !note.fileUrl) {
      return NextResponse.json({ error: "File not available" }, { status: 404 });
    }

    const downloadUrl = await getPresignedUrl(note.fileUrl, 300);

    return NextResponse.json({
      downloadUrl,
      fileName: `${note.title}.pdf`,
      expiresIn: 300,
    });
  } catch (err) {
    console.error("[download]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
