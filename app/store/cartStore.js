import { create } from "zustand";

/**
 * Cart store — server-authoritative, Zustand as local UI cache.
 *
 * - Authenticated: items persisted in DB via /api/cart. Store = mirror.
 * - Unauthenticated (guest): items live in memory only.
 * - Login  → syncOnLogin() merges guest items into DB, then fetches canonical list.
 * - Logout → clearCart(true) wipes DB row + clears Zustand state.
 */
export const useCartStore = create((set, get) => ({
  items: [],
  isOpen: false,
  syncing: false,
  /** true once fetchCart confirms a valid session */
  isAuthenticated: false,

  // ─── Server sync ────────────────────────────────────────────

  /** Boot-time fetch — run once on layout mount via <CartSync /> */
  fetchCart: async () => {
    set({ syncing: true });
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) {
        // 401 → guest mode; keep any in-memory guest items
        set({ syncing: false, isAuthenticated: false });
        return;
      }
      const data = await res.json();
      set({ items: data.items ?? [], syncing: false, isAuthenticated: true });
    } catch {
      set({ syncing: false });
    }
  },

  /**
   * Called after a successful login.
   * Merges guest cart items into th20e DB then fetches canonical list.
   */
  syncOnLogin: async () => {
    set({ syncing: true });
    const guestItems = get().items;
    try {
      // Persist guest items (idempotent INSERT OR IGNORE on server)
      await Promise.all(
        guestItems.map((item) =>
          fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ noteId: item.id }),
          })
        )
      );
      // Refresh from server
      const res = await fetch("/api/cart");
      const data = await res.json();
      set({ items: data.items ?? [], syncing: false, isAuthenticated: true });
    } catch {
      set({ syncing: false });
    }
  },

  // ─── Actions (optimistic UI + conditional server write) ──────

  addItem: async (note, isLoggedIn) => {
    const loggedIn = isLoggedIn ?? get().isAuthenticated;
    if (!get().items.find((i) => i.id === note.id)) {
      set((state) => ({ items: [...state.items, note] }));
    }
    set({ isOpen: true });

    if (loggedIn) {
      try {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ noteId: note.id }),
        });
      } catch { /* optimistic — already showing */ }
    }
  },

  removeItem: async (id) => {
    set((state) => ({ items: state.items.filter((i) => i.id !== id) }));

    if (get().isAuthenticated) {
      try {
        await fetch("/api/cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ noteId: id }),
        });
      } catch { /* silently fail */ }
    }
  },

  /**
   * @param {boolean} [serverSide=false] - pass true to also delete from DB
   *   (used on logout where we want to clear the server row immediately)
   */
  clearCart: async (serverSide = false) => {
    const wasAuthenticated = get().isAuthenticated;
    set({ items: [], ...(serverSide ? { isAuthenticated: false } : {}) });

    if (serverSide || wasAuthenticated) {
      try {
        await fetch("/api/cart", { method: "DELETE" });
      } catch { /* silently fail */ }
    }
  },

  isInCart: (id) => get().items.some((i) => i.id === id),

  setIsOpen: (val) => set({ isOpen: val }),
}));

/** Selector — subscribe with useCartStore(selectTotalPaise) for targeted re-renders */
export const selectTotalPaise = (state) =>
  state.items.reduce((sum, i) => sum + (i.price_paise || 0), 0);
