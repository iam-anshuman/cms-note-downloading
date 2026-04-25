"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { NAV_CATEGORIES } from "@/lib/categories";

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get("category"); // e.g. "class-12"

  const [notes, setNotes] = useState([]);
  const [salesCounts, setSalesCounts] = useState({});
  const [loading, setLoading] = useState(true);

  // Active category — find matching nav entry or null (= All)
  const activeCategory = NAV_CATEGORIES.find((c) => c.value === categoryParam) ?? null;

  useEffect(() => {
    async function load() {
      setLoading(true);
      const cat = NAV_CATEGORIES.find((c) => c.value === categoryParam) ?? null;
      const url = cat
        ? `/api/notes?subject=${encodeURIComponent(cat.subject)}&limit=50`
        : "/api/notes?limit=50";
      const res = await fetch(url);
      const data = await res.json();
      setNotes(data.notes || []);
      setSalesCounts({});
      setLoading(false);
    }
    load();
  }, [categoryParam]); // re-run when URL param changes — categoryParam is a primitive string

  // Notes are already server-filtered when category is active
  const filteredNotes = notes;

  function setCategory(value) {
    if (!value) {
      router.push("/browse");
    } else {
      router.push(`/browse?category=${value}`);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      {/* Header */}
      <header className="mb-12 animate-fade-in">
        <h1 className="font-headline text-4xl lg:text-5xl font-extrabold text-on-surface tracking-tight mb-4">
          {activeCategory ? activeCategory.label + " Notes" : "Browse Notes"}
        </h1>
        <p className="text-secondary max-w-xl text-lg leading-relaxed">
          {activeCategory
            ? `Showing all premium handwritten notes for ${activeCategory.label}.`
            : "Discover premium handwritten notes crafted by top educators. Filter by subject."}
        </p>
      </header>

      {/* Category Filter Pills — mirrors the public nav */}
      <div className="flex flex-wrap gap-3 mb-12 animate-slide-up">
        {/* All */}
        <button
          onClick={() => setCategory(null)}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
            !activeCategory
              ? "bg-primary text-on-primary shadow-sm"
              : "bg-surface-container-lowest text-on-surface-variant ghost-border hover:bg-surface-container-high hover:text-primary"
          }`}
        >
          All
        </button>

        {NAV_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              activeCategory?.value === cat.value
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container-lowest text-on-surface-variant ghost-border hover:bg-surface-container-high hover:text-primary"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-24">
          <span className="material-symbols-outlined text-6xl text-outline-variant/40 mb-4 block">
            auto_stories
          </span>
          <h3 className="font-headline text-xl font-bold text-on-surface mb-2">
            No notes available{activeCategory ? ` for ${activeCategory.label}` : ""}
          </h3>
          <p className="text-on-surface-variant">
            {activeCategory ? "Try a different category or check back soon." : "Notes will appear here once they are published."}
          </p>
          {activeCategory && (
            <button
              onClick={() => setCategory(null)}
              className="mt-6 px-6 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              View All Notes
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredNotes.map((note, index) => {
            const price = note.price_paise / 100;
            const originalPrice = note.original_price_paise / 100;
            const discount = originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : 0;
            const sales = salesCounts[note.id] || 0;

            let tags = [];
            try { tags = JSON.parse(note.tags || "[]"); } catch {}

            let thumbSrc = null;
            try {
              const parsed = JSON.parse(note.thumbnail_url);
              thumbSrc = Array.isArray(parsed) ? parsed[0] : parsed;
            } catch { thumbSrc = note.thumbnail_url; }

            return (
              <Link
                key={note.id}
                href={`/browse/${note.id}`}
                className="bg-surface-container-lowest rounded-2xl overflow-hidden ghost-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group animate-slide-up flex flex-col"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Image */}
                <div className="h-52 bg-surface-container-high relative overflow-hidden">
                  {thumbSrc ? (
                    <img
                      alt={note.title}
                      className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                      src={thumbSrc}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-6xl text-outline-variant/40">auto_stories</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="absolute top-4 left-4 bg-signature-gradient text-white px-3 py-1 rounded-full text-xs font-bold">
                      {discount}% OFF
                    </div>
                  )}
                  {/* Category pill */}
                  {note.subject && (
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {note.subject}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-0.5 bg-surface-container-high rounded-full text-[10px] font-bold uppercase tracking-wider text-primary">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-headline text-lg font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">
                    {note.title}
                  </h3>
                  <p className="text-sm text-on-secondary-container mb-4">
                    By {note.author_name} • {note.pages} Pages
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-extrabold text-on-surface">₹{price.toLocaleString()}</span>
                      {discount > 0 && (
                        <span className="text-sm text-on-surface-variant line-through opacity-50">
                          ₹{originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Bundle CTA */}
      <div className="bg-surface-container-low rounded-3xl p-10 lg:p-14 relative overflow-hidden animate-slide-up">
        <div className="relative z-10 max-w-xl">
          <span className="inline-block px-3 py-1 bg-tertiary/10 text-tertiary text-[10px] font-extrabold uppercase tracking-widest rounded-full mb-4">
            Save More
          </span>
          <h3 className="font-headline text-3xl font-extrabold text-green-900 mb-4 leading-tight">
            Curated Bundles Available
          </h3>
          <p className="text-on-surface-variant leading-relaxed mb-6">
            Combine multiple note sets and save up to 35%. Our hand-picked bundles give you everything you need.
          </p>
          <Link
            href="/browse"
            className="bg-signature-gradient text-white px-8 py-3 rounded-xl font-bold text-sm inline-flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-lg">inventory_2</span>
            View All Bundles
          </Link>
        </div>
        <span className="material-symbols-outlined text-[180px] opacity-[0.04] absolute -right-8 -bottom-8 rotate-12">
          inventory_2
        </span>
      </div>
    </div>
  );
}
