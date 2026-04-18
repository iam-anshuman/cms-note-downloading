export const metadata = {
  title: "Upload Note — The Academy CMS",
  description: "Upload and catalog new academic notes to the Veridian Scholar archive.",
};

export default function UploadPage() {
  return (
    <>
      {/* Top Header for Context */}
      <header className="flex justify-between items-center mb-10 animate-fade-in">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="p-2 hover:bg-surface-container-high rounded-xl transition-all text-on-surface-variant hover:text-primary"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </a>
          <h2 className="font-headline italic text-2xl tracking-tight text-green-900 font-bold">
            Archiving New Materials
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <button className="font-label text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">
            Discard Draft
          </button>
          <div className="h-4 w-px bg-outline-variant/30"></div>
          <button className="bg-signature-gradient text-on-primary px-6 py-2 rounded-lg font-medium text-sm transition-all active:scale-95 shadow-sm shadow-primary/20 hover:shadow-md">
            Publish
          </button>
        </div>
      </header>

      {/* Form Section */}
      <section className="flex items-start justify-center bg-surface animate-slide-up">
        <div className="w-full max-w-3xl space-y-12">
          {/* Introductory Asymmetry */}
          <div className="max-w-xl">
            <h3 className="font-headline text-4xl text-primary mb-4 font-bold">
              Note Details
            </h3>
            <p className="font-body text-on-surface-variant leading-relaxed">
              Ensure all metadata is cataloged correctly to maintain library
              integrity. High-quality scans and accurate subjects increase
              discoverability for researchers.
            </p>
          </div>

          {/* Input Group */}
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Note Title */}
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant opacity-70">
                  Note Title
                </label>
                <input
                  className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 px-0 py-3 font-headline text-xl text-primary placeholder:text-stone-300 transition-all outline-none"
                  placeholder="e.g. Advanced Macroeconomics Week 4"
                  type="text"
                />
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant opacity-70">
                  Subject
                </label>
                <div className="relative">
                  <select className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 px-0 py-3 font-body text-on-surface appearance-none outline-none cursor-pointer">
                    <option>Select a Discipline</option>
                    <option>Theoretical Physics</option>
                    <option>Digital Humanities</option>
                    <option>Law &amp; Ethics</option>
                    <option>Economic History</option>
                    <option>Architecture</option>
                    <option>Landscape Design</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-0 top-3 pointer-events-none text-on-surface-variant">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Price */}
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant opacity-70">
                  Price (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-0 top-3 text-on-surface-variant font-medium">
                    ₹
                  </span>
                  <input
                    className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 pl-4 pr-0 py-3 font-body text-on-surface placeholder:text-stone-300 transition-all outline-none"
                    placeholder="0.00"
                    step="0.01"
                    type="number"
                  />
                </div>
              </div>

              {/* Tags & Keywords */}
              <div className="space-y-2 md:col-span-2">
                <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant opacity-70">
                  Tags &amp; Keywords
                </label>
                <input
                  className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 px-0 py-3 font-body text-on-surface placeholder:text-stone-300 transition-all outline-none"
                  placeholder="Add keywords separated by commas..."
                  type="text"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Access Duration */}
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant opacity-70 flex items-center gap-2">
                  Access Duration
                  <span
                    className="material-symbols-outlined text-[14px] cursor-help opacity-60"
                    title="Sets when this content becomes unavailable"
                  >
                    info
                  </span>
                </label>
                <div className="relative">
                  <select className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 px-0 py-3 font-body text-on-surface appearance-none outline-none cursor-pointer">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <option key={m} value={m}>
                        {m} Month{m > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-0 top-3 pointer-events-none text-on-surface-variant">
                    expand_more
                  </span>
                </div>
                <p className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant opacity-60 mt-1">
                  Access will expire after the selected number of months from
                  the date of purchase.
                </p>
              </div>
              <div className="hidden md:block"></div>
            </div>

            {/* Upload Area */}
            <div className="space-y-4">
              <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant opacity-70">
                Digital Manuscript
              </label>
              <div className="group relative flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/20 bg-surface-container-low rounded-xl p-16 hover:bg-surface-container-high/50 hover:border-primary/30 transition-all cursor-pointer">
                <div className="w-20 h-20 rounded-full bg-surface-container-lowest flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <span
                    className="material-symbols-outlined text-primary text-4xl"
                    style={{
                      fontVariationSettings: "'FILL' 1",
                    }}
                  >
                    upload_file
                  </span>
                </div>
                <h4 className="font-headline text-2xl text-primary text-center font-bold">
                  Drag and drop your files here
                </h4>
                <p className="font-body text-on-surface-variant text-sm mt-2 text-center">
                  PDF, PNG or High-Res scans (Max 50MB)
                </p>
                <button className="mt-8 bg-surface-container-lowest text-on-surface-variant px-8 py-2 rounded-lg font-label text-xs uppercase tracking-widest hover:text-primary hover:shadow-md transition-all ghost-border">
                  Select Local Files
                </button>
              </div>
            </div>

            {/* Preview Card (Empty State) */}
            <div className="bg-surface-container-lowest p-8 rounded-xl ghost-border relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-signature-gradient rounded-l-xl"></div>
              <div className="flex items-start gap-6">
                <div className="w-24 h-32 bg-surface-container rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-outline-variant text-3xl">
                    image
                  </span>
                </div>
                <div className="flex-1 space-y-3">
                  <h5 className="font-headline text-lg italic text-on-surface-variant">
                    Live Preview...
                  </h5>
                  <div className="h-2 w-3/4 bg-surface-container rounded animate-pulse-soft"></div>
                  <div className="h-2 w-1/2 bg-surface-container rounded animate-pulse-soft"></div>
                  <div className="flex gap-2 pt-3">
                    <div className="h-6 w-16 bg-secondary-fixed rounded-full"></div>
                    <div className="h-6 w-16 bg-secondary-fixed rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-8 flex justify-end">
            <button className="bg-signature-gradient text-on-primary px-12 py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3">
              <span className="material-symbols-outlined">publish</span>
              Publish to Archives
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
