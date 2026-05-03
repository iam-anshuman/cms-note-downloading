"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      {/* Subtle Noise Texture */}
      <div className="noise-overlay fixed inset-0 z-0" />

      {/* Sidebar — desktop fixed / mobile drawer */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Top Bar */}
      <TopBar onMenuOpen={() => setSidebarOpen(true)} />

      {/* Main Canvas — left margin only on desktop */}
      <main className="lg:ml-64 pt-20 px-4 sm:px-6 lg:px-8 pb-12 min-h-screen relative z-10">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
