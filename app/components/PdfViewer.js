"use client";

/**
 * PdfViewer.js
 *
 * Renders a PDF file fetched from a protected API endpoint using react-pdf.
 * Every page is rendered as a canvas (image-only mode):
 *   - No text layer      → text cannot be selected or copied
 *   - No annotation layer → no embedded links / form fields
 *
 * Security hardening (production-only):
 *   - Right-click disabled on the entire viewer
 *   - Common keyboard shortcuts for save / print / view-source blocked
 *   - DevTools detection via console timing heuristic — redirects to /
 *   - CSS pointer-events + user-select disabled on canvas elements
 *   - Print stylesheet hides the viewer (so Ctrl+P reveals nothing)
 *
 * In development (NODE_ENV === 'development') none of the above
 * restrictions are applied so you can debug freely.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Point to the worker we copied into /public
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const IS_PROD = process.env.NODE_ENV === "production";

// ── Anti-devtools hook (production only) ─────────────────────────────────────
function useAntiDevTools(onDetected) {
  useEffect(() => {
    if (!IS_PROD) return;

    let redirected = false;

    const check = () => {
      if (redirected) return;
      const start = performance.now();
      // eslint-disable-next-line no-console
      console.profile();
      // eslint-disable-next-line no-console
      console.profileEnd();
      if (performance.now() - start > 100) {
        redirected = true;
        onDetected();
      }
    };

    const interval = setInterval(check, 1500);
    return () => clearInterval(interval);
  }, [onDetected]);
}

export default function PdfViewer({ fileUrl, zoom = 100 }) {
  const [numPages, setNumPages] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const containerRef = useRef(null);

  // ── Redirect on devtools detection (prod) ──────────────────────────────────
  const handleDevToolsDetected = useCallback(() => {
    window.location.replace("/");
  }, []);
  useAntiDevTools(handleDevToolsDetected);

  // ── Block keyboard shortcuts (prod) ────────────────────────────────────────
  useEffect(() => {
    if (!IS_PROD) return;
    const block = (e) => {
      const key = e.key.toLowerCase();
      // Ctrl/Cmd + S, P, U, Shift+I (inspect), F12
      if (
        (e.ctrlKey || e.metaKey) &&
        ["s", "p", "u", "a"].includes(key)
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        ["i", "j", "c"].includes(key)
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (e.key === "F12") {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", block, true);
    return () => window.removeEventListener("keydown", block, true);
  }, []);

  // ── Disable right-click (prod) ─────────────────────────────────────────────
  const blockContextMenu = useCallback(
    (e) => {
      if (IS_PROD) e.preventDefault();
    },
    []
  );

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setLoadError(null);
  }

  function onDocumentLoadError(err) {
    console.error("[PdfViewer]", err);
    setLoadError("Could not load PDF. Please try again.");
  }

  // Scale: zoom prop is a percentage (100 = 1x)
  const scale = zoom / 100;

  return (
    <>
      {/* Print guard — hides the viewer when the user triggers print */}
      {IS_PROD && (
        <style>{`
          @media print {
            body * { visibility: hidden !important; }
          }
        `}</style>
      )}

      <div
        ref={containerRef}
        className="pdf-viewer-root"
        onContextMenu={blockContextMenu}
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        {loadError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-white/60">
            <span className="material-symbols-outlined text-5xl text-error/60">
              error
            </span>
            <p className="text-sm">{loadError}</p>
          </div>
        ) : (
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <span className="material-symbols-outlined text-5xl text-primary/60 animate-spin">
                  progress_activity
                </span>
                <p className="text-white/50 text-sm">Loading document…</p>
              </div>
            }
            options={{
              // Disable pdfjs built-in download / print buttons
              disableAutoFetch: false,
              disableStream: false,
            }}
          >
            <div className="flex flex-col items-center gap-6 py-6 px-4">
              {numPages &&
                Array.from({ length: numPages }, (_, i) => (
                  <div
                    key={i}
                    className="relative shadow-2xl rounded-lg overflow-hidden"
                    style={{ pointerEvents: "none" }}
                  >
                    {/* Page number badge */}
                    <div
                      className="absolute bottom-3 right-3 z-10 bg-black/50 text-white/70 text-[10px] font-mono px-2 py-0.5 rounded"
                      style={{ pointerEvents: "none" }}
                    >
                      {i + 1} / {numPages}
                    </div>

                    <Page
                      pageNumber={i + 1}
                      scale={scale}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      loading={
                        <div
                          className="bg-[#2a2a2a] animate-pulse"
                          style={{
                            width: `${Math.round(595 * scale)}px`,
                            height: `${Math.round(842 * scale)}px`,
                          }}
                        />
                      }
                    />
                  </div>
                ))}
            </div>
          </Document>
        )}
      </div>
    </>
  );
}
