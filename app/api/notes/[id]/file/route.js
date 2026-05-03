import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { getFromR2 } from "@/lib/r2";
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

    const object = await getFromR2(note.fileUrl);
    if (!object) return Response.json({ error: "File not found" }, { status: 404 });

    const url = new URL(request.url);
    const contentType =
      object.httpMetadata?.contentType || "application/octet-stream";
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "private, no-store");
    headers.set("Content-Length", object.size.toString());

    if (url.searchParams.get("download") === "1") {
      const filename = `${note.title || "note"}.pdf`.replace(/["\r\n]/g, "");
      headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    } else {
      headers.set("Content-Disposition", "inline");
    }

    return new Response(object.body, { headers });
  } catch (err) {
    console.error("[note-file]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
