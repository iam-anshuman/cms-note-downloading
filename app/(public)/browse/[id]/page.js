import Link from "next/link";
import { dbAll, dbGet } from "@/lib/db";
import { notFound } from "next/navigation";
import ImageGallery from "./ImageGallery";
import PurchaseActions from "./PurchaseActions";

async function getNote(id) {
  const note = await dbGet("SELECT * FROM notes WHERE id = ? AND status = 'published'", [id]);
  return note;
}

async function getBundlesForNote(noteId) {
  const bundleLinks = await dbAll("SELECT bundle_id FROM bundle_notes WHERE note_id = ?", [noteId]);

  if (!bundleLinks || bundleLinks.length === 0) return [];

  const bundleIds = bundleLinks.map((bl) => bl.bundle_id);
  const bundlesData = await dbAll(
    `SELECT * FROM bundles WHERE id IN (${bundleIds.map(() => '?').join(',')}) AND status = 'active'`,
    bundleIds
  );

  const formattedBundles = [];
  for (let bundle of bundlesData) {
    const bundleNotes = await dbAll(
      "SELECT n.price_paise, n.thumbnail_url FROM bundle_notes bn JOIN notes n ON bn.note_id = n.id WHERE bn.bundle_id = ?",
      [bundle.id]
    );

    const totalPaise = bundleNotes.reduce((sum, n) => sum + (n.price_paise || 0), 0);
    formattedBundles.push({
      id: bundle.id,
      name: bundle.name,
      description: bundle.description,
      discount_percent: bundle.discount_percent,
      badge_text: bundle.badge_text,
      notes_count: bundleNotes.length,
      original_price: totalPaise / 100,
      bundle_price: Math.round(totalPaise * (1 - bundle.discount_percent / 100)) / 100,
      thumbnail_url: bundleNotes[0]?.thumbnail_url || null,
    });
  }

  return formattedBundles;
}

export default async function NoteDetailPage({ params }) {
  const { id } = await params;
  const note = await getNote(id);

  if (!note) {
    notFound();
  }

  const bundles = await getBundlesForNote(id);

  const price = note.price_paise / 100;
  const originalPrice = note.original_price_paise / 100;
  const discountPercent =
    originalPrice > price
      ? Math.round((1 - price / originalPrice) * 100)
      : 0;

  const includes = [
    `${note.pages} Pages of Detailed Notes`,
    "Printable PDF Study Material",
    `${note.access_duration_months} Months Access`,
  ];
  
  const tags = JSON.parse(note.tags || "[]");

  let thumbnails = [];
  try {
    const parsed = JSON.parse(note.thumbnail_url);
    if (Array.isArray(parsed)) thumbnails = parsed;
    else if (parsed) thumbnails = [parsed];
  } catch(e) {
    if (note.thumbnail_url) thumbnails = [note.thumbnail_url];
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-on-surface-variant/60 mb-8 animate-fade-in">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span className="material-symbols-outlined text-sm">
          chevron_right
        </span>
        <Link href="/browse" className="hover:text-primary transition-colors">
          Notes
        </Link>
        <span className="material-symbols-outlined text-sm">
          chevron_right
        </span>
        <span className="text-primary font-medium">{note.title}</span>
      </div>

      {/* Hero Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start animate-slide-up">
        {/* Product Image Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <ImageGallery images={thumbnails} title={note.title} />
        </div>

        {/* Product Purchase Actions */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-surface-container-high rounded-full text-[10px] font-bold uppercase tracking-wider text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-4 font-headline">
              {note.title}
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-6">
              {note.description}
            </p>
            <p className="text-sm text-on-secondary-container mb-6">
              By{" "}
              <span className="font-bold text-on-surface">
                {note.author_name}
              </span>{" "}
              • {note.pages} Pages
            </p>
            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-bold text-on-surface">
                ₹{price.toLocaleString()}
              </span>
              {discountPercent > 0 && (
                <>
                  <span className="text-xl text-on-surface-variant line-through opacity-50">
                    ₹{originalPrice.toLocaleString()}
                  </span>
                  <span className="bg-primary-container/10 text-primary px-3 py-1 rounded-lg font-bold text-sm">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>
            <PurchaseActions note={{ id: note.id, title: note.title, subject: note.subject, price_paise: note.price_paise, thumbnail_url: note.thumbnail_url }} />
          </div>

          {/* What's Included */}
          <div className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-4">
            <h3 className="font-bold text-on-surface flex items-center gap-2 font-headline">
              <span className="material-symbols-outlined text-primary">
                verified
              </span>
              What&apos;s Included
            </h3>
            <ul className="space-y-3 text-on-surface-variant text-sm">
              {includes.map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-sm text-primary">
                    check_circle
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Combo Offers Section */}
      {bundles.length > 0 && (
        <section className="mt-24 animate-slide-up">
          <div className="flex flex-col gap-2 mb-10">
            <span className="text-primary font-bold tracking-widest text-xs uppercase">
              Curated Learning Bundles
            </span>
            <h2 className="text-3xl font-extrabold text-on-surface font-headline">
              Combo Offers: Save While You Study
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bundles.map((bundle, i) => (
              <div
                key={bundle.id}
                className={`${
                  i === 0 && bundles.length > 1
                    ? "md:col-span-2 bg-surface-container-low flex flex-col lg:flex-row"
                    : "bg-surface-container-lowest flex flex-col justify-between"
                } rounded-2xl overflow-hidden ghost-border hover:shadow-xl transition-all duration-500`}
              >
                {i === 0 && bundles.length > 1 ? (
                  <>
                    <div className="lg:w-2/5 h-64 lg:h-auto relative">
                      {bundle.thumbnail_url ? (
                        <img
                          alt={bundle.name}
                          className="w-full h-full object-cover"
                          src={bundle.thumbnail_url}
                        />
                      ) : (
                        <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                          <span className="material-symbols-outlined text-6xl text-outline-variant/30">
                            inventory_2
                          </span>
                        </div>
                      )}
                      {bundle.badge_text && (
                        <div className="absolute top-4 left-4 bg-signature-gradient text-white px-4 py-2 rounded-full font-bold text-xs uppercase tracking-tighter">
                          {bundle.badge_text}
                        </div>
                      )}
                    </div>
                    <div className="lg:w-3/5 p-8 flex flex-col justify-between">
                      <div>
                        <h3 className="text-2xl font-extrabold text-on-surface mb-3 font-headline">
                          {bundle.name}
                        </h3>
                        <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
                          {bundle.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-6 pt-6 border-t border-outline-variant/20">
                        <div>
                          <span className="block text-xs text-on-surface-variant uppercase font-bold opacity-50">
                            Bundle Price
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-extrabold text-on-surface">
                              ₹{bundle.bundle_price.toLocaleString()}
                            </span>
                            <span className="text-base text-on-surface-variant line-through opacity-40">
                              ₹{bundle.original_price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <span className="bg-tertiary-container/10 text-tertiary-container px-3 py-1 rounded-lg font-extrabold text-xs">
                            Save {bundle.discount_percent}%
                          </span>
                          <button className="bg-signature-gradient text-white px-6 py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform">
                            Buy Bundle
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-8">
                    <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-6">
                      <span className="material-symbols-outlined text-primary">
                        auto_stories
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-on-surface mb-3 font-headline">
                      {bundle.name}
                    </h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                      {bundle.description}
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-lg font-bold">
                            ₹{bundle.bundle_price.toLocaleString()}
                          </span>
                          <span className="text-xs text-on-surface-variant line-through opacity-50">
                            ₹{bundle.original_price.toLocaleString()}
                          </span>
                        </div>
                        <span className="bg-secondary-container text-on-secondary-fixed-variant px-2 py-1 rounded-md font-bold text-[10px]">
                          Save {bundle.discount_percent}%
                        </span>
                      </div>
                      <button className="w-full ghost-border text-primary py-3 rounded-xl font-bold text-sm hover:bg-primary hover:text-white transition-all duration-300">
                        Add Combo to Cart
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Academic Info Section */}
      <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 animate-slide-up">
        <div>
          <h4 className="text-2xl font-extrabold text-primary mb-4 tracking-tight font-headline">
            Academic Rigor
          </h4>
          <p className="text-on-surface-variant leading-relaxed">
            Our materials are reviewed by a board of seasoned educators to
            ensure alignment with the latest curriculum standards.
          </p>
        </div>
        <div>
          <h4 className="text-2xl font-extrabold text-primary mb-4 tracking-tight font-headline">
            Study Anywhere
          </h4>
          <p className="text-on-surface-variant leading-relaxed">
            Access your courses and notes across all devices. Offline mode
            available for all students using our premium mobile application.
          </p>
        </div>
        <div>
          <h4 className="text-2xl font-extrabold text-primary mb-4 tracking-tight font-headline">
            Expert Support
          </h4>
          <p className="text-on-surface-variant leading-relaxed">
            Stuck on a concept? Our teaching assistants are available 12 hours a
            day to resolve your academic queries through our dedicated portal.
          </p>
        </div>
      </section>
    </div>
  );
}
