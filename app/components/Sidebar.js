"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const navItems = [
  { label: "Dashboard", icon: "dashboard",     href: "/admin" },
  { label: "Customers", icon: "group",          href: "/admin/customers" },
  { label: "Upload",    icon: "upload_file",    href: "/admin/upload" },
  { label: "Notes",     icon: "description",    href: "/admin/notes" },
  { label: "Bundles",   icon: "inventory_2",    href: "/admin/bundles" },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const router   = useRouter();

  // Close on route change
  useEffect(() => { onClose?.(); }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const content = (
    <aside className="h-full w-64 bg-stone-50 flex flex-col py-8 px-6 relative">
      {/* Noise */}
      <div className="noise-overlay absolute inset-0 z-0" />

      {/* Brand */}
      <div className="mb-10 relative z-10 flex items-center justify-between">
        <Link href="/admin" onClick={onClose}>
          <h1 className="text-xl font-extrabold tracking-tight text-green-800 font-headline leading-tight">
            The Academy<br />
            <span className="text-[10px] text-stone-400 uppercase tracking-[0.2em] font-label font-normal">
              Veridian Scholar Panel
            </span>
          </h1>
        </Link>
        {/* Close button — only shown in drawer mode */}
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-lg hover:bg-stone-200 text-stone-400"
          aria-label="Close menu"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 relative z-10">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl text-sm transition-all duration-200 group ${
                isActive
                  ? "sidebar-active font-semibold"
                  : "text-stone-500 font-medium hover:bg-stone-200/50"
              }`}
            >
              <span
                className={`material-symbols-outlined text-xl ${
                  isActive ? "text-primary" : "text-stone-400 group-hover:text-green-700"
                }`}
                style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 500" } : {}}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="relative z-10 mt-auto space-y-1">
        <Link
          href="/"
          className="w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm text-stone-400 font-medium hover:bg-primary/5 hover:text-primary transition-all group"
        >
          <span className="material-symbols-outlined text-xl group-hover:text-primary transition-colors">language</span>
          <span>View Site</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm text-stone-400 font-medium hover:bg-red-50 hover:text-red-600 transition-all group"
        >
          <span className="material-symbols-outlined text-xl group-hover:text-red-500 transition-colors">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* ── Desktop: fixed sidebar ── */}
      <div className="hidden lg:block fixed left-0 top-0 h-screen w-64 z-50 shadow-sm">
        {content}
      </div>

      {/* ── Mobile: slide-in drawer ── */}
      {/* Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer panel */}
      <div
        className={`lg:hidden fixed left-0 top-0 h-full z-50 shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {content}
      </div>
    </>
  );
}
