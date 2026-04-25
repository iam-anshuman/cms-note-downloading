"use client";

import { useState, useEffect } from "react";

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [bundleName, setBundleName] = useState("");
  const [bundleDesc, setBundleDesc] = useState("");
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [discount, setDiscount] = useState(20);
  const [badgeText, setBadgeText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [bundlesRes, notesRes] = await Promise.all([
        fetch("/api/bundles/admin"),
        fetch("/api/notes/admin"),
      ]);
      const bundlesData = await bundlesRes.json();
      const notesData = await notesRes.json();
      setBundles(bundlesData.bundles || []);
      setNotes(
        (notesData.notes || []).filter((n) => n.status === "published")
      );
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
    setLoading(false);
  }

  function toggleNote(noteId) {
    setSelectedNotes((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId]
    );
  }

  function getSelectedTotal() {
    return selectedNotes.reduce((sum, id) => {
      const note = notes.find((n) => n.id === id);
      return sum + (note?.price_paise || 0);
    }, 0);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");

    if (selectedNotes.length < 2) {
      setError("Please select at least 2 notes for the bundle.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/bundles/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: bundleName,
          description: bundleDesc,
          noteIds: selectedNotes,
          discountPercent: discount,
          status: "active",
          badgeText,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create bundle");
        setSaving(false);
        return;
      }

      // Reset form and refresh
      setBundleName("");
      setBundleDesc("");
      setSelectedNotes([]);
      setDiscount(20);
      setBadgeText("");
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError("Something went wrong");
    }
    setSaving(false);
  }

  async function deleteBundle(id) {
    if (!confirm("Delete this bundle?")) return;
    try {
      await fetch(`/api/bundles/admin/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  }

  const totalPaise = getSelectedTotal();
  const discountedPaise = Math.round(totalPaise * (1 - discount / 100));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <>
      <header className="mb-10 animate-fade-in">
        <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
          Bundle Manager
        </h2>
        <p className="text-on-surface-variant font-medium mt-1 max-w-xl leading-relaxed">
          Create curated bundles of notes with custom discounts to boost sales
          and provide more value to students.
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-slide-up">
        <div className="bg-surface-container-lowest p-6 rounded-xl ghost-border">
          <p className="text-sm font-semibold text-on-secondary-container">
            Total Bundles
          </p>
          <p className="text-2xl font-extrabold font-headline text-on-surface mt-2">
            {bundles.length}
          </p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl ghost-border">
          <p className="text-sm font-semibold text-on-secondary-container">
            Active Bundles
          </p>
          <p className="text-2xl font-extrabold font-headline text-primary mt-2">
            {bundles.filter((b) => b.status === "active").length}
          </p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl ghost-border">
          <p className="text-sm font-semibold text-on-secondary-container">
            Available Notes
          </p>
          <p className="text-2xl font-extrabold font-headline text-on-surface mt-2">
            {notes.length}
          </p>
        </div>
      </div>

      {/* Toggle Create Form */}
      <div className="mb-8 animate-slide-up">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-signature-gradient text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">
            {showForm ? "close" : "add_circle"}
          </span>
          {showForm ? "Close Form" : "Create New Bundle"}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-surface-container-lowest rounded-2xl ghost-border p-8 mb-12 animate-slide-up">
          <h3 className="text-xl font-extrabold font-headline text-on-surface mb-6">
            New Bundle
          </h3>

          {error && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                  Bundle Name
                </label>
                <input
                  className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  type="text"
                  required
                  value={bundleName}
                  onChange={(e) => setBundleName(e.target.value)}
                  placeholder="e.g. Science Complete Pack"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                  Badge Text (optional)
                </label>
                <input
                  className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="e.g. Bestseller Bundle"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                Description
              </label>
              <textarea
                className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                rows="3"
                value={bundleDesc}
                onChange={(e) => setBundleDesc(e.target.value)}
                placeholder="Describe what's included in this bundle..."
              />
            </div>

            {/* Select Notes */}
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-3">
                Select Notes ({selectedNotes.length} selected)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto pr-2">
                {notes.map((note) => {
                  const isSelected = selectedNotes.includes(note.id);
                  return (
                    <button
                      type="button"
                      key={note.id}
                      onClick={() => toggleNote(note.id)}
                      className={`p-4 rounded-xl text-left transition-all duration-200 ${
                        isSelected
                          ? "bg-primary/10 ring-2 ring-primary"
                          : "bg-surface-container-high hover:bg-surface-container-highest"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center ${
                            isSelected
                              ? "bg-primary text-white"
                              : "bg-surface-container-lowest ghost-border"
                          }`}
                        >
                          {isSelected && (
                            <span className="material-symbols-outlined text-sm">
                              check
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-on-surface truncate">
                            {note.title}
                          </p>
                          <p className="text-xs text-on-surface-variant mt-1">
                            ₹{(note.price_paise / 100).toLocaleString()} •{" "}
                            {note.subject}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Discount Slider */}
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-3">
                Discount: {discount}%
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={discount}
                onChange={(e) => setDiscount(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-on-surface-variant mt-1">
                <span>5%</span>
                <span>50%</span>
              </div>
            </div>

            {/* Price Preview */}
            {selectedNotes.length >= 2 && (
              <div className="bg-surface-container-low p-6 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-sm text-on-surface-variant mb-1">
                    Original Total
                  </p>
                  <p className="text-lg font-bold text-on-surface-variant line-through">
                    ₹{(totalPaise / 100).toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-on-surface-variant mb-1">
                    Discount
                  </p>
                  <p className="text-lg font-bold text-primary">
                    −₹
                    {((totalPaise - discountedPaise) / 100).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-on-surface-variant mb-1">
                    Bundle Price
                  </p>
                  <p className="text-2xl font-extrabold font-headline text-on-surface">
                    ₹{(discountedPaise / 100).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={saving || selectedNotes.length < 2}
              className="bg-signature-gradient text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">
                    progress_activity
                  </span>
                  Creating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">
                    inventory_2
                  </span>
                  Create Bundle
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Existing Bundles */}
      <div className="bg-surface-container-lowest rounded-2xl ghost-border overflow-hidden animate-slide-up">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70">
                  Bundle
                </th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70">
                  Notes
                </th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70">
                  Discount
                </th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70">
                  Price
                </th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70">
                  Status
                </th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {bundles.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-16 text-on-surface-variant"
                  >
                    <span className="material-symbols-outlined text-5xl text-outline-variant/30 block mb-3">
                      inventory_2
                    </span>
                    No bundles yet. Create your first one!
                  </td>
                </tr>
              ) : (
                bundles.map((bundle) => (
                  <tr
                    key={bundle.id}
                    className="border-t border-surface-container-high hover:bg-surface-container-low/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-bold text-sm text-on-surface">
                          {bundle.name}
                        </p>
                        {bundle.badge_text && (
                          <span className="text-[10px] text-primary font-bold">
                            {bundle.badge_text}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm font-semibold">
                      {bundle.notes_count || bundle.bundle_notes?.length || 0}
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-tertiary-container/10 text-tertiary-container px-2 py-1 rounded-md text-xs font-bold">
                        {bundle.discount_percent}%
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm font-bold">
                          ₹
                          {(bundle.bundle_price || 0).toLocaleString("en-IN")}
                        </p>
                        <p className="text-[10px] text-on-surface-variant line-through">
                          ₹
                          {(bundle.original_price || 0).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          bundle.status === "active"
                            ? "bg-primary/10 text-primary"
                            : "bg-stone-100 text-stone-500"
                        }`}
                      >
                        {bundle.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => deleteBundle(bundle.id)}
                        className="text-on-surface-variant hover:text-error transition-colors"
                        title="Delete bundle"
                      >
                        <span className="material-symbols-outlined text-lg">
                          delete
                        </span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
