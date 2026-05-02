import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { getPresignedUrl } from "@/lib/r2";
import { notes, userAccess } from "@/lib/schema";
import { eq, and, gte, isNull } from "drizzle-orm";


export async function GET(request, { params }) {
  try {
    const user = await getUser();
    if (!user) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
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
        return Response.json(
          { error: "Access denied. Purchase this note to read it." },
          { status: 403 }
        );
      }
    }

    const [note] = await db
      .select({ id: notes.id, title: notes.title, fileUrl: notes.fileUrl })
      .from(notes)
      .where(and(eq(notes.id, id), isNull(notes.deletedAt)))
      .limit(1);

    if (!note) return Response.json({ error: "Note not found" }, { status: 404 });
    if (!note.fileUrl) return Response.json({ error: "No file attached" }, { status: 404 });

    const signedUrl = await getPresignedUrl(note.fileUrl, 300);
    return Response.redirect(signedUrl, 302);
  } catch (err) {
    console.error("[note-file]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
