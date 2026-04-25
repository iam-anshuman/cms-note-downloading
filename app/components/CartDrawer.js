"use client";

import { useCartStore, selectTotalPaise } from "@/app/store/cartStore";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const { items, removeItem, clearCart, isOpen, setIsOpen } = useCartStore();
  const totalPaise = useCartStore(selectTotalPaise);
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-[#fbf9f8] z-50 flex flex-col shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              shopping_cart
            </span>
            <h2 className="font-headline text-xl font-bold text-on-surface">Your Cart</h2>
            {items.length > 0 && (
              <span className="bg-primary text-on-primary text-xs font-bold px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <span className="material-symbols-outlined text-6xl text-outline-variant/40">
                shopping_cart
              </span>
              <p className="font-headline text-lg text-on-surface-variant">Your cart is empty</p>
              <p className="text-sm text-on-surface-variant/60">Add some notes to get started!</p>
              <button
                onClick={() => setIsOpen(false)}
                className="mt-2 px-6 py-2 rounded-full bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Browse Notes
              </button>
            </div>
          ) : (
            items.map((item) => {
              let thumb = null;
              try {
                const parsed = JSON.parse(item.thumbnail_url);
                thumb = Array.isArray(parsed) ? parsed[0] : parsed;
              } catch {
                thumb = item.thumbnail_url;
              }

              return (
                <div key={item.id} className="flex gap-4 bg-surface-container-lowest rounded-xl p-4 ghost-border">
                  <div className="w-16 h-20 rounded-lg bg-surface-container-high overflow-hidden flex-shrink-0">
                    {thumb ? (
                      <img src={thumb} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl text-outline-variant/40">auto_stories</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline font-bold text-sm text-on-surface truncate">{item.title}</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">{item.subject}</p>
                    <p className="font-bold text-primary mt-2">₹{(item.price_paise / 100).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex-shrink-0 self-start p-1.5 rounded-lg hover:bg-error/10 hover:text-error transition-colors text-on-surface-variant"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-outline-variant/20 space-y-4 bg-surface-container-low/50">
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant font-medium">Total</span>
              <span className="text-2xl font-extrabold text-on-surface font-headline">
                ₹{(totalPaise / 100).toLocaleString()}
              </span>
            </div>
            <button
              className="w-full bg-signature-gradient text-white py-4 rounded-xl font-bold text-base active:scale-95 transition-transform shadow-lg shadow-primary/20 hover:shadow-xl"
              onClick={() => {
                setIsOpen(false);
                router.push("/checkout");
              }}
            >
              Proceed to Checkout
            </button>
            <button
              onClick={clearCart}
              className="w-full text-center text-xs text-on-surface-variant/60 hover:text-error transition-colors"
            >
              Clear cart
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
