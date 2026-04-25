"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

// Load PdfViewer client-side only (pdfjs uses browser APIs)
const PdfViewer = dynamic(() => import("@/app/components/PdfViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <span className="material-symbols-outlined text-5xl text-primary/60 animate-spin">
        progress_activity
      </span>
      <p className="text-white/50 text-sm">Initialising viewer…</p>
    </div>
  ),
});

const IS_PROD = process.env.NODE_ENV === "production";

export default function NoteViewerPage() {
  const router = useRouter();
  const params = useParams();
  const noteId = params.id;

  const [note, setNote] = useState(null);
  const [accessStatus, setAccessStatus] = useState("loading"); // loading | granted | denied | error
  const [fileType, setFileType] = useState("pdf"); // pdf | image
  const [zoom, setZoom] = useState(100);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // ── Auth + access probe ──────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        if (!meData.user) {
          router.push(`/login?redirect=/notes/${noteId}/read`);
          return;
        }

        // Probe secure file endpoint to check access & detect file type
        const probe = await fetch(`/api/notes/${noteId}/file`);
        if (probe.status === 403) { setAccessStatus("denied"); return; }
        if (!probe.ok)            { setAccessStatus("error");  return; }

        const ct = probe.headers.get("content-type") || "";
        setFileType(ct.startsWith("image/") ? "image" : "pdf");
        setAccessStatus("granted");

        const noteRes = await fetch(`/api/notes/${noteId}`);
        if (noteRes.ok) {
          const d = await noteRes.json();
          setNote(d.note || d);
        }
      } catch {
        setAccessStatus("error");
      }
    }
    load();
  }, [noteId, router]);

  // ── Disable right-click globally on this page (prod only) ──────────────
  const blockContext = useCallback((e) => {
    if (IS_PROD) e.preventDefault();
  }, []);

  useEffect(() => {
    if (!IS_PROD) return;
    document.addEventListener("contextmenu", blockContext);
    return () => document.removeEventListener("contextmenu", blockContext);
  }, [blockContext]);

  // ── Keyboard shortcut block (prod only) ──────────────────────────────────
  useEffect(() => {
    if (!IS_PROD) return;
    const block = (e) => {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ["s", "p", "u", "a"].includes(key)) {
        e.preventDefault(); e.stopPropagation();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "j", "c"].includes(key)) {
        e.preventDefault(); e.stopPropagation();
      }
      if (e.key === "F12") { e.preventDefault(); e.stopPropagation(); }
    };
    window.addEventListener("keydown", block, true);
    return () => window.removeEventListener("keydown", block, true);
  }, []);

  const handleZoomIn  = () => setZoom((z) => Math.min(z + 10, 200));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 10, 50));
  const handleZoomReset = () => setZoom(100);

  const fileUrl = `/api/notes/${noteId}/file`;

  // ── LOADING ───────────────────────────────────────────────────────────────
  if (accessStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin block mb-4">
            progress_activity
          </span>
          <p className="text-on-surface-variant font-medium">Verifying access…</p>
        </div>
      </div>
    );
  }

  // ── ACCESS DENIED ─────────────────────────────────────────────────────────
  if (accessStatus === "denied") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-6">
        <div className="max-w-md w-full text-center bg-surface-container-lowest rounded-3xl p-12 ghost-border shadow-xl animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-error">lock</span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface mb-3">Access Required</h1>
          <p className="text-on-surface-variant mb-8 leading-relaxed">
            You need to purchase this note to read it. Access is granted instantly after payment.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href={`/browse/${noteId}`}
              className="bg-signature-gradient text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined">bolt</span>
              Buy This Note
            </Link>
            <Link
              href="/browse"
              className="ghost-border text-on-surface-variant py-3 rounded-xl font-medium hover:bg-surface-container-low transition-colors text-sm"
            >
              Back to Browse
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── ERROR ─────────────────────────────────────────────────────────────────
  if (accessStatus === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-6">
        <div className="max-w-md w-full text-center">
          <span className="material-symbols-outlined text-6xl text-error/60 block mb-4">error</span>
          <h1 className="font-headline text-2xl font-bold text-on-surface mb-3">Something went wrong</h1>
          <p className="text-on-surface-variant mb-6">Could not load the note. Please try again.</p>
          <button
            onClick={() => router.refresh()}
            className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── VIEWER ────────────────────────────────────────────────────────────────
  return (
    <div
      className="h-screen flex flex-col overflow-hidden bg-[#1a1a1a]"
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
      onContextMenu={blockContext}
    >
      {/* Print guard */}
      {IS_PROD && (
        <style>{`@media print { body * { visibility: hidden !important; } }`}</style>
      )}

      {/* ── Top Toolbar ── */}
      <header className="flex-shrink-0 bg-[#242424] border-b border-white/10 px-4 py-2 flex items-center justify-between gap-4 z-10">
        {/* Left: back + title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/profile"
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span className="hidden sm:inline">My Notes</span>
          </Link>
          <div className="w-px h-5 bg-white/10" />
          <div className="min-w-0">
            <p className="text-white font-headline font-bold text-sm truncate">
              {note?.title || "Loading…"}
            </p>
            {note?.subject && (
              <p className="text-white/40 text-xs truncate">{note.subject}</p>
            )}
          </div>
        </div>

        {/* Center: zoom controls (PDF only) */}
        {fileType === "pdf" && (
          <div className="flex items-center gap-1 bg-white/5 rounded-xl px-2 py-1">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:pointer-events-none"
              title="Zoom out"
            >
              <span className="material-symbols-outlined text-lg">zoom_out</span>
            </button>
            <button
              onClick={handleZoomReset}
              className="px-3 py-1 text-xs text-white/70 hover:text-white font-mono rounded-lg hover:bg-white/10 transition-all min-w-[3.5rem] text-center"
            >
              {zoom}%
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:pointer-events-none"
              title="Zoom in"
            >
              <span className="material-symbols-outlined text-lg">zoom_in</span>
            </button>
          </div>
        )}

        {/* Right: security badge + sidebar toggle */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/30">
            <span
              className="material-symbols-outlined text-primary text-xs"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield
            </span>
            <span className="text-primary text-xs font-bold">View Only</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
            title="Toggle sidebar"
          >
            <span className="material-symbols-outlined text-lg">
              {isSidebarOpen ? "sidebar" : "dock_to_right"}
            </span>
          </button>
        </div>
      </header>

      {/* ── Main Area ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Document Viewer ── */}
        <div className="flex-1 overflow-auto bg-[#1a1a1a]">
          {fileType === "image" ? (
            /* Image-only files */
            <div className="flex items-start justify-center p-6">
              <div
                style={{
                  width: `${zoom}%`,
                  maxWidth: "100%",
                  transition: "width 0.2s ease",
                  pointerEvents: "none",
                }}
              >
                <img
                  src={fileUrl}
                  alt={note?.title || "Note"}
                  className="w-full rounded-lg shadow-2xl block"
                  draggable={false}
                  style={{ pointerEvents: "none" }}
                />
              </div>
            </div>
          ) : (
            /* PDF rendered via react-pdf — canvas only, no text/annotation layer */
            <PdfViewer fileUrl={fileUrl} zoom={zoom} />
          )}
        </div>

        {/* ── Info Sidebar ── */}
        {isSidebarOpen && (
          <aside className="w-72 flex-shrink-0 bg-[#242424] border-l border-white/10 flex flex-col overflow-hidden">
            <div className="p-5 border-b border-white/10">
              <h2 className="text-white font-headline font-bold text-base">Note Details</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Cover thumbnail */}
              {note?.thumbnail_url && (() => {
                let thumb = null;
                try {
                  const p = JSON.parse(note.thumbnail_url);
                  thumb = Array.isArray(p) ? p[0] : p;
                } catch { thumb = note.thumbnail_url; }
                return thumb ? (
                  <div className="rounded-xl overflow-hidden aspect-[4/3] w-full">
                    <img src={thumb} alt={note.title} className="w-full h-full object-cover" />
                  </div>
                ) : null;
              })()}

              <div className="space-y-3">
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">Title</p>
                  <p className="text-white text-sm font-semibold leading-snug">{note?.title || "—"}</p>
                </div>
                {note?.subject && (
                  <div>
                    <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">Subject</p>
                    <p className="text-white/80 text-sm">{note.subject}</p>
                  </div>
                )}
                {note?.author_name && (
                  <div>
                    <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">Author</p>
                    <p className="text-white/80 text-sm">{note.author_name}</p>
                  </div>
                )}
                {note?.pages > 0 && (
                  <div>
                    <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">Pages</p>
                    <p className="text-white/80 text-sm">{note.pages}</p>
                  </div>
                )}
              </div>

              {/* Tags */}
              {note?.tags && (() => {
                let tags = [];
                try { tags = JSON.parse(note.tags); } catch {}
                return tags.length > 0 ? (
                  <div>
                    <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((t) => (
                        <span key={t} className="px-2 py-0.5 bg-white/10 text-white/70 text-xs rounded-full">{t}</span>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Security notice */}
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-2">
                  <span
                    className="material-symbols-outlined text-primary text-base mt-0.5"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    shield
                  </span>
                  <div>
                    <p className="text-primary text-xs font-bold mb-1">Protected Content</p>
                    <p className="text-white/50 text-xs leading-relaxed">
                      This material is for personal study only. Downloading, printing, or sharing is not permitted.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer CTA */}
            <div className="p-4 border-t border-white/10">
              <Link
                href="/browse"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-sm font-medium"
              >
                <span className="material-symbols-outlined text-base">explore</span>
                Browse More Notes
              </Link>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
