"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", icon: "dashboard", href: "/" },
  { label: "Customers", icon: "group", href: "/customers" },
  { label: "Upload", icon: "upload_file", href: "/upload" },
  { label: "Notes List", icon: "description", href: "/notes" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-stone-50 flex flex-col py-8 px-6 z-50">
      {/* Noise Overlay */}
      <div className="noise-overlay absolute inset-0 rounded-none z-0"></div>

      {/* Brand Header */}
      <div className="mb-10 relative z-10">
        <h1 className="text-xl font-extrabold tracking-tight text-green-800 font-headline">
          The Academy CMS
        </h1>
        <p className="text-[10px] text-stone-400 uppercase tracking-[0.2em] mt-1.5 font-label">
          Veridian Scholar Panel
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 relative z-10">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
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
                  isActive
                    ? "text-primary"
                    : "text-stone-400 group-hover:text-green-700"
                }`}
                style={
                  isActive
                    ? { fontVariationSettings: "'FILL' 1, 'wght' 500" }
                    : {}
                }
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sign Out Button */}
      <div className="relative z-10 mt-auto space-y-4">
        <button className="w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm text-stone-400 font-medium hover:bg-red-50 hover:text-red-600 transition-all duration-200 group">
          <span className="material-symbols-outlined text-xl group-hover:text-red-500 transition-colors">
            logout
          </span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
