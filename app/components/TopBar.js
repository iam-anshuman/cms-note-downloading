"use client";

export default function TopBar({ title, subtitle }) {
  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 glass flex justify-between items-center h-16 px-8 shadow-[0_1px_0_0_rgba(189,203,181,0.15)]">
      {/* Search */}
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
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

      {/* Right Actions */}
      <div className="flex items-center gap-5">
        <div className="flex gap-2">
          <button className="p-2 text-stone-400 hover:text-green-600 hover:bg-surface-container-high/60 rounded-xl transition-all duration-200">
            <span className="material-symbols-outlined text-xl">
              notifications
            </span>
          </button>
          <button className="p-2 text-stone-400 hover:text-green-600 hover:bg-surface-container-high/60 rounded-xl transition-all duration-200">
            <span className="material-symbols-outlined text-xl">
              help_outline
            </span>
          </button>
        </div>

        <div className="h-8 w-px bg-surface-container-high"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-green-900 font-headline">
              Administrator
            </p>
            <p className="text-[10px] text-stone-400 tracking-wider uppercase">
              Veridian Academy
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
