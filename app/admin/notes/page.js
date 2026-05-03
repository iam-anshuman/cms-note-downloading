"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NAV_CATEGORIES } from "@/lib/categories";

// ── Helpers ────────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  published: "bg-primary/10 text-primary",
  draft:     "bg-stone-100 text-stone-500",
  archived:  "bg-error-container text-on-error-container",
  deleted:   "bg-red-100 text-red-600",
};

function formatINR(paise) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

// ── Edit Modal ─────────────────────────────────────────────────────────────
function EditModal({ note, onClose, onSaved }) {
  const [form, setForm] = useState({
    title:       note.title,
    subject:     note.subject,
    price:       (note.price_paise / 100).toString(),
    description: note.description || "",
    author_name: note.author_name || "",
    pages:       note.pages?.toString() || "0",
    tags:        Array.isArray(note.tags)
                   ? note.tags.join(", ")
                   : JSON.parse(note.tags || "[]").join(", "),
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setErr("");
    try {
      const res = await fetch(`/api/notes/admin/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:       form.title,
          subject:     form.subject,
          price:       parseFloat(form.price),
          description: form.description,
          authorName:  form.author_name,
          pages:       parseInt(form.pages) || 0,
          tags:        form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      onSaved(data.note);
      onClose();
    } catch (e) {
      setErr(e.message);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#fbf9f8] rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90dvh] overflow-y-auto p-6 sm:p-8 space-y-6 animate-slide-up">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold font-headline text-on-surface">Edit Note</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-container-high text-on-surface-variant">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {err && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>{err}
          </div>
        )}

        <div className="space-y-4">
          {[
            { label: "Title",       key: "title",       type: "text" },
            { label: "Author Name", key: "author_name", type: "text" },
            { label: "Price (₹)",   key: "price",       type: "number" },
            { label: "Pages",       key: "pages",       type: "number" },
          ].map(({ label, key, type }) => (
            <div key={key} className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm"
              />
            </div>
          ))}

          {/* Subject dropdown — synced to nav categories */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Subject / Category</label>
            <select
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-container-low focus:border-primary outline-none text-sm"
            >
              <option value="">Select a category</option>
              {NAV_CATEGORIES.map((c) => (
                <option key={c.value} value={c.subject}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Tags (comma-separated)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm"
              placeholder="e.g. Physics, NEET, Class 12"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl ghost-border text-on-surface-variant font-semibold text-sm hover:bg-surface-container-high transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-signature-gradient text-white font-bold text-sm shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function AdminNotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // note id
  const [actionMsg, setActionMsg] = useState(null); // { type, text }

  useEffect(() => {
    async function load() {
      const notesRes = await fetch("/api/notes/admin?all=1");
      const notesData = await notesRes.json();
      setNotes(notesData.notes || []);
      setLoading(false);
    }
    load();
  }, []);

  function flash(type, text) {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg(null), 3000);
  }

  async function handleStatusChange(note, newStatus) {
    const res = await fetch(`/api/notes/admin/${note.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setNotes((prev) => prev.map((n) => n.id === note.id ? { ...n, status: newStatus } : n));
      flash("success", `Note "${note.title}" set to ${newStatus}.`);
    } else {
      flash("error", "Failed to update status.");
    }
  }

  async function handleDelete(id) {
    // Soft delete via the DELETE endpoint
    const res = await fetch(`/api/notes/admin/${id}`, { method: "DELETE" });
    if (res.ok) {
      // Mark locally as deleted so we can show the restore button immediately
      setNotes((prev) => prev.map((n) => n.id === id ? { ...n, status: "archived", deleted_at: new Date().toISOString() } : n));
      flash("success", "Note soft-deleted. You can restore it from the table.");
    } else {
      flash("error", "Failed to delete note.");
    }
    setConfirmDelete(null);
  }

  async function handleRestore(note) {
    const res = await fetch(`/api/notes/admin/${note.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "published" }),
    });
    if (res.ok) {
      setNotes((prev) => prev.map((n) => n.id === note.id ? { ...n, status: "published", deleted_at: null } : n));
      flash("success", `"${note.title}" restored and published.`);
    } else {
      flash("error", "Failed to restore note.");
    }
  }

  function handleSaved(updated) {
    setNotes((prev) => prev.map((n) => n.id === updated.id ? { ...n, ...updated } : n));
    flash("success", `"${updated.title}" updated.`);
  }

  const published = notes.filter((n) => n.status === "published").length;
  const drafts    = notes.filter((n) => n.status === "draft").length;

  return (
    <>
      {/* Edit Modal */}
      {editingNote && (
        <EditModal
          note={editingNote}
          onClose={() => setEditingNote(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#fbf9f8] rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center space-y-5 animate-slide-up">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl text-error">delete_forever</span>
            </div>
            <h3 className="font-headline text-lg font-bold text-on-surface">Delete Note?</h3>
            <p className="text-on-surface-variant text-sm">
              The note will be hidden from students and marked as deleted. You can restore it anytime from this table.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-5 py-2.5 rounded-xl ghost-border text-on-surface-variant font-semibold text-sm hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-5 py-2.5 rounded-xl bg-error text-white font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {actionMsg && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl font-semibold text-sm flex items-center gap-2 animate-slide-up ${
          actionMsg.type === "success" ? "bg-primary text-white" : "bg-error text-white"
        }`}>
          <span className="material-symbols-outlined text-base">
            {actionMsg.type === "success" ? "check_circle" : "error"}
          </span>
          {actionMsg.text}
        </div>
      )}

      <header className="mb-8 animate-fade-in">
        <h2 className="text-2xl sm:text-4xl font-extrabold font-headline tracking-tight text-on-surface">Notes Analytics</h2>
        <p className="text-on-surface-variant font-medium mt-1 max-w-xl leading-relaxed text-sm sm:text-base">
          Track performance, manage status, and edit your published study materials.
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-8 animate-slide-up">
        {[
          { label: "Total Notes",  value: notes.length,  color: "text-on-surface" },
          { label: "Published",    value: published,      color: "text-primary" },
          { label: "Drafts",       value: drafts,         color: "text-on-surface-variant" },
          { label: "Archived",     value: notes.filter((n) => n.status === "archived").length, color: "text-error" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-surface-container-lowest p-6 rounded-xl ghost-border">
            <p className="text-sm font-semibold text-on-secondary-container">{label}</p>
            <p className={`text-2xl font-extrabold font-headline mt-2 ${color}`}>{loading ? "…" : value}</p>
          </div>
        ))}
      </div>

      {/* Notes Table */}
      <section className="animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-extrabold font-headline tracking-tight">All Notes</h3>
          <Link
            href="/admin/upload"
            className="bg-signature-gradient text-white px-5 py-2 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            New Note
          </Link>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl ghost-border overflow-hidden">

          {/* ── Mobile card list (hidden on md+) ── */}
          <div className="md:hidden divide-y divide-surface-container-high">
            {loading ? (
              <div className="text-center py-16 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl animate-spin block mb-2">progress_activity</span>
                Loading…
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-16 text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl text-outline-variant/30 block mb-3">note_stack</span>
                No notes yet.
              </div>
            ) : notes.map((note) => {
              let thumbSrc = null;
              try {
                const p = JSON.parse(note.thumbnail_url);
                thumbSrc = Array.isArray(p) ? p[0] : p;
              } catch { thumbSrc = note.thumbnail_url; }

              return (
                <div key={note.id} className="flex items-start gap-3 p-4">
                  {/* Thumb */}
                  <div className="h-14 w-14 rounded-lg bg-surface-container-high overflow-hidden flex-shrink-0">
                    {thumbSrc
                      ? <img alt={note.title} className="w-full h-full object-cover" src={thumbSrc} />
                      : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-sm text-outline-variant/60">description</span></div>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-on-surface truncate">{note.title}</p>
                    <p className="text-[11px] text-on-surface-variant">
                      {note.subject}{note.author_name ? ` · ${note.author_name}` : ""}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        note.deleted_at ? "bg-red-100 text-red-600" : STATUS_STYLES[note.status] || STATUS_STYLES.draft
                      }`}>
                        {note.deleted_at ? "Deleted" : note.status}
                      </span>
                      <span className="text-xs font-bold text-on-surface">{formatINR(note.price_paise)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {note.deleted_at ? (
                      <button
                        onClick={() => handleRestore(note)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-[11px] font-bold transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">restore</span>
                        Restore
                      </button>
                    ) : (
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => setEditingNote(note)} title="Edit" className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary text-on-surface-variant">
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        {note.status === "published"
                          ? <button onClick={() => handleStatusChange(note, "archived")} title="Archive" className="p-1.5 rounded-lg hover:bg-amber-50 hover:text-amber-600 text-on-surface-variant">
                              <span className="material-symbols-outlined text-base">visibility_off</span>
                            </button>
                          : <button onClick={() => handleStatusChange(note, "published")} title="Publish" className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary text-on-surface-variant">
                              <span className="material-symbols-outlined text-base">visibility</span>
                            </button>
                        }
                        <button onClick={() => setConfirmDelete(note.id)} title="Delete" className="p-1.5 rounded-lg hover:bg-error/10 hover:text-error text-on-surface-variant">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Desktop table (hidden on mobile) ── */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low">
                  {["Title", "Subject", "Price", "Status", "Created", "Actions"].map((h) => (
                    <th key={h} className="py-4 px-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl animate-spin block mb-2">progress_activity</span>
                      Loading…
                    </td>
                  </tr>
                ) : notes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-on-surface-variant">
                      <span className="material-symbols-outlined text-5xl text-outline-variant/30 block mb-3">note_stack</span>
                      No notes yet.
                    </td>
                  </tr>
                ) : notes.map((note) => {
                  let thumbSrc = null;
                  try {
                    const p = JSON.parse(note.thumbnail_url);
                    thumbSrc = Array.isArray(p) ? p[0] : p;
                  } catch { thumbSrc = note.thumbnail_url; }

                  return (
                    <tr key={note.id} className="border-t border-surface-container-high hover:bg-surface-container-low/50 transition-colors">
                      {/* Title */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-surface-container-high overflow-hidden flex-shrink-0">
                            {thumbSrc
                              ? <img alt={note.title} className="w-full h-full object-cover" src={thumbSrc} />
                              : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-sm text-outline-variant/60">description</span></div>
                            }
                          </div>
                          <div>
                            <p className="font-bold text-sm text-on-surface truncate max-w-[180px]">{note.title}</p>
                            <p className="text-[11px] text-on-surface-variant">{note.author_name}{note.pages > 0 ? ` • ${note.pages}p` : ""}</p>
                          </div>
                        </div>
                      </td>
                      {/* Subject */}
                      <td className="py-4 px-5 text-sm text-on-surface-variant">{note.subject}</td>
                      {/* Price */}
                      <td className="py-4 px-5 text-sm font-bold">{formatINR(note.price_paise)}</td>
                      {/* Status */}
                      <td className="py-4 px-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          note.deleted_at
                            ? "bg-red-100 text-red-600"
                            : STATUS_STYLES[note.status] || STATUS_STYLES.draft
                        }`}>
                          {note.deleted_at ? "Deleted" : note.status}
                        </span>
                      </td>
                      {/* Created */}
                      <td className="py-4 px-5 text-sm text-on-surface-variant">
                        {new Date(note.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      {/* Actions */}
                      <td className="py-4 px-5">
                        {note.deleted_at ? (
                          /* ── Soft-deleted — show restore only ── */
                          <button
                            onClick={() => handleRestore(note)}
                            title="Restore note"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-colors"
                          >
                            <span className="material-symbols-outlined text-base">restore</span>
                            Restore
                          </button>
                        ) : (
                          /* ── Normal actions ── */
                          <div className="flex items-center gap-1">
                            {/* Edit */}
                            <button
                              onClick={() => setEditingNote(note)}
                              title="Edit"
                              className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary text-on-surface-variant transition-colors"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>

                            {/* Toggle publish / archive */}
                            {note.status === "published" ? (
                              <button
                                onClick={() => handleStatusChange(note, "archived")}
                                title="Disable (archive)"
                                className="p-1.5 rounded-lg hover:bg-amber-50 hover:text-amber-600 text-on-surface-variant transition-colors"
                              >
                                <span className="material-symbols-outlined text-lg">visibility_off</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStatusChange(note, "published")}
                                title="Publish"
                                className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary text-on-surface-variant transition-colors"
                              >
                                <span className="material-symbols-outlined text-lg">visibility</span>
                              </button>
                            )}

                            {/* Soft Delete */}
                            <button
                              onClick={() => setConfirmDelete(note.id)}
                              title="Soft-delete"
                              className="p-1.5 rounded-lg hover:bg-error/10 hover:text-error text-on-surface-variant transition-colors"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>{/* end desktop table */}
        </div>
      </section>
    </>
  );
}
