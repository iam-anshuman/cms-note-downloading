"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useCartStore } from "@/app/store/cartStore";
import { NAV_CATEGORIES } from "@/lib/categories";

const navLinks = [
  { label: "Home", href: "/" },
  ...NAV_CATEGORIES.map((c) => ({ label: c.label, href: `/browse?category=${c.value}` })),
];

export default function PublicNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { items, setIsOpen, clearCart } = useCartStore();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        setUser(data.user || null);
      } catch {
        setUser(null);
      }
      setLoading(false);
    }
    fetchUser();
  }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    // Clear cart in Zustand immediately (optimistic)
    clearCart(true);
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  const initials = (name) =>
    (name || "??")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#fbf9f8]/80 backdrop-blur-md shadow-sm">
      <div className="flex justify-between items-center px-8 py-4 max-w-full font-headline tracking-tight">
        {/* Brand */}
        <Link
          href="/"
          className="text-xl font-bold text-green-800 hover:text-green-700 transition-colors"
        >
          Architectural Academy
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href.split("?")[0]);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium transition-colors active:scale-95 duration-200 ${
                  isActive
                    ? "text-green-700 font-bold border-b-2 border-green-700"
                    : "text-slate-600 hover:text-green-600"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/browse"
            className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-md bg-secondary-container text-on-secondary-container font-medium hover:bg-surface-container-highest transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">
              description
            </span>
            Browse Notes
          </Link>

          {/* Cart Icon */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
            aria-label="Open cart"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            {items.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-on-primary text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {items.length}
              </span>
            )}
          </button>

          {loading ? (
            /* Skeleton while checking auth */
            <div className="w-20 h-9 bg-surface-container-high rounded-full animate-pulse" />
          ) : user ? (
            /* ── Logged In State ── */
            <div className="flex items-center gap-3">
              {/* Admin Panel Link (admin only) */}
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 transition-all"
                >
                  <span className="material-symbols-outlined text-base">
                    admin_panel_settings
                  </span>
                  Admin Panel
                </Link>
              )}

              {/* My Notes Link (customers) */}
              {user.role === "customer" && (
                <Link
                  href="/profile"
                  className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-lg text-on-surface-variant font-medium text-sm hover:bg-surface-container-high transition-all"
                >
                  <span className="material-symbols-outlined text-base">
                    auto_stories
                  </span>
                  My Notes
                </Link>
              )}

              {/* Profile Dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-surface-container-high transition-all"
                >
                  <div className="w-9 h-9 rounded-full bg-signature-gradient flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {initials(user.full_name)}
                  </div>
                  <span className="hidden md:block text-sm font-semibold text-on-surface max-w-[120px] truncate">
                    {user.full_name || user.email}
                  </span>
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">
                    {menuOpen ? "expand_less" : "expand_more"}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-surface-container-lowest rounded-2xl shadow-xl ghost-border py-2 animate-fade-in z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-surface-container-high">
                      <p className="font-bold text-sm text-on-surface truncate">
                        {user.full_name}
                      </p>
                      <p className="text-xs text-on-surface-variant truncate">
                        {user.email}
                      </p>
                      <span
                        className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          user.role === "admin"
                            ? "bg-primary/10 text-primary"
                            : "bg-tertiary/10 text-tertiary"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg text-primary">
                            admin_panel_settings
                          </span>
                          Admin Panel
                        </Link>
                      )}
                      <Link
                        href="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg text-on-surface-variant">
                          person
                        </span>
                        My Profile
                      </Link>
                      {user.role === "customer" && (
                        <Link
                          href="/profile"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg text-on-surface-variant">
                            auto_stories
                          </span>
                          My Purchased Notes
                        </Link>
                      )}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-surface-container-high pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-error hover:bg-error-container/30 transition-colors w-full text-left"
                      >
                        <span className="material-symbols-outlined text-lg">
                          logout
                        </span>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ── Logged Out State ── */
            <>
              <Link
                href="/login"
                className={`px-5 py-2 rounded-full font-semibold transition-all active:scale-95 ${
                  pathname === "/login"
                    ? "bg-primary text-on-primary shadow-md"
                    : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high"
                }`}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2 rounded-full bg-signature-gradient text-on-primary font-semibold shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="bg-surface-container-low h-[1px] w-full"></div>
    </nav>
  );
}
