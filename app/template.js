import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface">
      {/* Subtle Noise Texture */}
      <div className="noise-overlay fixed inset-0 z-0"></div>

      {/* Sidebar */}
      <Sidebar />

      {/* Top Bar */}
      <TopBar />

      {/* Main Canvas */}
      <main className="ml-64 pt-24 px-8 pb-12 min-h-screen relative z-10">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
