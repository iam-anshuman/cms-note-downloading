"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch current user
        const userRes = await fetch("/api/auth/me");
        const userData = await userRes.json();

        if (!userData.user) {
          router.push("/login?redirect=/profile");
          return;
        }

        setUser(userData.user);

        // Fetch order history
        const ordersRes = await fetch("/api/orders/history");
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
      setLoading(false);
    }
    fetchData();
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-20 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin block mb-4">
            progress_activity
          </span>
          <p className="text-on-surface-variant font-medium">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const initials = (name) =>
    (name || "??")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const totalSpent = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const totalNotes = orders.reduce(
    (sum, o) => sum + (o.items?.length || 0),
    0
  );

  // Flatten all purchased notes from orders
  const purchasedNotes = [];
  const seenNoteIds = new Set();
  orders.forEach((order) => {
    (order.items || []).forEach((item) => {
      if (item.noteId && !seenNoteIds.has(item.noteId)) {
        seenNoteIds.add(item.noteId);
        purchasedNotes.push({
          ...item,
          orderDate: order.createdAt,
          orderAmount: order.amount,
        });
      }
    });
  });

  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      {/* Profile Header */}
      <div className="bg-surface-container-low rounded-3xl p-8 lg:p-12 mb-10 relative overflow-hidden animate-fade-in">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-signature-gradient flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-primary/20">
            {initials(user.full_name)}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">
              {user.full_name || "Student"}
            </h1>
            <p className="text-on-surface-variant font-medium mt-1">
              {user.email}
            </p>
            <div className="flex items-center gap-3 mt-3">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-tertiary/10 text-tertiary">
                {user.role}
              </span>
              <span className="text-xs text-on-surface-variant">
                Joined{" "}
                {new Date(user.created_at).toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {user.role === "admin" && (
              <Link
                href="/admin"
                className="px-5 py-2.5 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">
                  admin_panel_settings
                </span>
                Admin Panel
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-xl ghost-border text-on-surface-variant font-semibold text-sm hover:bg-surface-container-high hover:text-error transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">
                logout
              </span>
              Sign Out
            </button>
          </div>
        </div>

        {/* Background decoration */}
        <span className="material-symbols-outlined text-[200px] opacity-[0.03] absolute -right-8 -bottom-12 rotate-12">
          school
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-slide-up">
        <div className="bg-surface-container-lowest p-6 rounded-xl ghost-border flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg text-primary">
            <span className="material-symbols-outlined">auto_stories</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-on-secondary-container">
              Notes Owned
            </p>
            <p className="text-2xl font-extrabold font-headline text-on-surface">
              {totalNotes}
            </p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl ghost-border flex items-center gap-4">
          <div className="p-3 bg-tertiary/10 rounded-lg text-tertiary">
            <span className="material-symbols-outlined">receipt_long</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-on-secondary-container">
              Total Orders
            </p>
            <p className="text-2xl font-extrabold font-headline text-on-surface">
              {orders.length}
            </p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl ghost-border flex items-center gap-4">
          <div className="p-3 bg-secondary-container rounded-lg text-on-secondary-fixed-variant">
            <span className="material-symbols-outlined">payments</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-on-secondary-container">
              Total Spent
            </p>
            <p className="text-2xl font-extrabold font-headline text-on-surface">
              ₹{totalSpent.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* Purchased Notes */}
      <section className="animate-slide-up">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold font-headline tracking-tight text-on-surface">
              {user.role === "admin" ? "All Notes (Admin Access)" : "My Purchased Notes"}
            </h2>
            <p className="text-on-surface-variant text-sm mt-1">
              Access your study materials anytime
            </p>
          </div>
          <Link
            href="/browse"
            className="px-5 py-2.5 rounded-xl bg-signature-gradient text-white font-bold text-sm shadow-md shadow-primary/20 hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">
              explore
            </span>
            Browse More
          </Link>
        </div>

        {purchasedNotes.length === 0 ? (
          /* Empty State */
          <div className="bg-surface-container-lowest rounded-2xl ghost-border p-16 text-center">
            <span className="material-symbols-outlined text-7xl text-outline-variant/30 block mb-4">
              library_books
            </span>
            <h3 className="text-xl font-bold font-headline text-on-surface mb-2">
              No notes purchased yet
            </h3>
            <p className="text-on-surface-variant max-w-md mx-auto mb-6">
              Browse our collection of premium handwritten notes and start your
              learning journey today.
            </p>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 px-8 py-3 bg-signature-gradient text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-lg">
                auto_stories
              </span>
              Explore Notes
            </Link>
          </div>
        ) : (
          /* Notes Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchasedNotes.map((note, i) => (
              <div
                key={note.noteId}
                className="bg-surface-container-lowest rounded-2xl overflow-hidden ghost-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group animate-slide-up flex flex-col"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Image */}
                <div className="h-40 bg-surface-container-high relative overflow-hidden">
                  {(() => {
                    let thumb = null;
                    try {
                      const p = JSON.parse(note.thumbnail);
                      thumb = Array.isArray(p) ? p[0] : p;
                    } catch { thumb = note.thumbnail; }
                    return thumb ? (
                      <img
                        alt={note.title}
                        className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                        src={thumb}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-5xl text-outline-variant/30">
                          auto_stories
                        </span>
                      </div>
                    );
                  })()}
                  {/* Badge */}
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                    user.role === "admin"
                      ? "bg-amber-500 text-white"
                      : "bg-primary text-white"
                  }`}>
                    <span className="material-symbols-outlined text-xs">
                      {user.role === "admin" ? "star" : "check_circle"}
                    </span>
                    {user.role === "admin" ? "All Access" : "Owned"}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-headline font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">
                    {note.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant mb-4">
                    Purchased{" "}
                    {new Date(note.orderDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <div className="mt-auto flex gap-2">
                    <Link
                      href={`/notes/${note.noteId}/read`}
                      className="flex-1 py-2.5 rounded-xl bg-signature-gradient text-white font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-md shadow-primary/20"
                    >
                      <span className="material-symbols-outlined text-base">
                        menu_book
                      </span>
                      Read Now
                    </Link>
                    <Link
                      href={`/browse/${note.noteId}`}
                      className="px-4 py-2.5 rounded-xl ghost-border text-on-surface-variant font-semibold text-sm hover:bg-surface-container-high transition-colors flex items-center justify-center"
                      title="View details"
                    >
                      <span className="material-symbols-outlined text-base">info</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Order History — hidden for admin (synthetic order is not meaningful) */}
      {orders.length > 0 && user.role !== "admin" && (
        <section className="mt-16 animate-slide-up">
          <h2 className="text-2xl font-extrabold font-headline tracking-tight text-on-surface mb-6">
            Order History
          </h2>
          <div className="bg-surface-container-lowest rounded-2xl ghost-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70">
                      Order
                    </th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70">
                      Notes
                    </th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70">
                      Amount
                    </th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70">
                      Date
                    </th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-t border-surface-container-high hover:bg-surface-container-low/50 transition-colors"
                    >
                      <td className="py-4 px-6 text-sm font-mono text-on-surface-variant">
                        {order.id.slice(0, 8)}...
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-0.5">
                          {(order.items || []).map((item, j) => (
                            <span
                              key={j}
                              className="text-sm font-semibold text-on-surface truncate max-w-xs"
                            >
                              {item.title}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm font-bold text-on-surface">
                        ₹{(order.amount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6 text-sm text-on-surface-variant">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase">
                          Paid
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
