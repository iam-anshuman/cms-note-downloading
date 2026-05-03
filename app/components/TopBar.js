"use client";

export default function TopBar({ onMenuOpen }) {
  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-40 glass flex justify-between items-center h-16 px-4 sm:px-8 shadow-[0_1px_0_0_rgba(189,203,181,0.15)]">

      {/* Left: hamburger (mobile) + search */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Hamburger — only on mobile */}
        <button
          onClick={onMenuOpen}
          className="lg:hidden p-2 -ml-1 rounded-xl text-stone-400 hover:bg-surface-container-high/60 hover:text-green-700 transition-all"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined text-xl">menu</span>
        </button>

        {/* Search */}
        <div className="relative w-full max-w-xs sm:max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-lg">
            search
          </span>
          <input
            className="w-full bg-surface-container-high/60 border-none rounded-full py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all outline-none placeholder:text-stone-400 font-body"
            placeholder="Search resources..."
            type="text"
          />
        </div>
      </div>

      {/* Right: actions + avatar */}
      <div className="flex items-center gap-2 sm:gap-5 ml-3">
        <div className="hidden sm:flex gap-2">
          <button className="p-2 text-stone-400 hover:text-green-600 hover:bg-surface-container-high/60 rounded-xl transition-all">
            <span className="material-symbols-outlined text-xl">notifications</span>
          </button>
          <button className="p-2 text-stone-400 hover:text-green-600 hover:bg-surface-container-high/60 rounded-xl transition-all">
            <span className="material-symbols-outlined text-xl">help_outline</span>
          </button>
        </div>

        <div className="hidden sm:block h-8 w-px bg-surface-container-high" />

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-green-900 font-headline">Administrator</p>
            <p className="text-[10px] text-stone-400 tracking-wider uppercase">Veridian Academy</p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20 flex-shrink-0">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
