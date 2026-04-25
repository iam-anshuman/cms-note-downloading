import { getDb } from "@/lib/db";

export const metadata = {
  title: "Customer Registry — The Academy CMS",
};

async function getCustomers() {
  const db = await getDb();
  const customers = await db.all(
    "SELECT id, email, full_name, avatar_url, created_at FROM users WHERE role = 'customer' ORDER BY created_at DESC"
  );

  if (!customers) return [];

  const enriched = await Promise.all(
    customers.map(async (customer) => {
      const orders = await db.all("SELECT amount_paise FROM orders WHERE user_id = ? AND status = 'paid'", [customer.id]);
      const access = await db.all("SELECT id FROM user_access WHERE user_id = ? AND expires_at >= datetime('now')", [customer.id]);

      const totalSpent = (orders || []).reduce(
        (sum, o) => sum + o.amount_paise,
        0
      );

      return {
        ...customer,
        totalPurchases: orders?.length || 0,
        totalSpent: totalSpent / 100,
        activeAccess: access?.length || 0,
        status: (access?.length || 0) > 0 ? "Active" : "Inactive",
      };
    })
  );

  return enriched;
}

export default async function CustomersPage() {
  const customers = await getCustomers();

  const initials = (name) =>
    (name || "??")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const bgColors = [
    "bg-secondary-fixed",
    "bg-primary-fixed-dim",
    "bg-tertiary-fixed-dim",
    "bg-stone-200",
    "bg-primary-container",
    "bg-secondary-container",
  ];

  return (
    <>
      <header className="mb-10 animate-fade-in">
        <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
          Customer Registry
        </h2>
        <p className="text-on-surface-variant font-medium mt-1 max-w-xl leading-relaxed">
          Browse, search, and manage your scholarly community of students.
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-slide-up">
        <div className="bg-surface-container-lowest p-6 rounded-xl ghost-border flex justify-between items-center">
          <div>
            <p className="text-sm font-semibold text-on-secondary-container">
              Total Customers
            </p>
            <p className="text-2xl font-extrabold font-headline text-on-surface">
              {customers.length}
            </p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg text-primary">
            <span className="material-symbols-outlined">group</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl ghost-border flex justify-between items-center">
          <div>
            <p className="text-sm font-semibold text-on-secondary-container">
              Active Customers
            </p>
            <p className="text-2xl font-extrabold font-headline text-on-surface">
              {customers.filter((c) => c.status === "Active").length}
            </p>
          </div>
          <div className="p-3 bg-tertiary/10 rounded-lg text-tertiary">
            <span className="material-symbols-outlined">
              check_circle
            </span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl ghost-border flex justify-between items-center">
          <div>
            <p className="text-sm font-semibold text-on-secondary-container">
              Total Revenue
            </p>
            <p className="text-2xl font-extrabold font-headline text-on-surface">
              ₹{customers
                .reduce((t, c) => t + c.totalSpent, 0)
                .toLocaleString("en-IN")}
            </p>
          </div>
          <div className="p-3 bg-secondary-container rounded-lg text-on-secondary-fixed-variant">
            <span className="material-symbols-outlined">payments</span>
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-surface-container-lowest rounded-2xl ghost-border overflow-hidden animate-slide-up">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70">
                  Student
                </th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70">
                  Email
                </th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70">
                  Purchases
                </th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70">
                  Total Spent
                </th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70">
                  Status
                </th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant/70">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-16 text-on-surface-variant"
                  >
                    <span className="material-symbols-outlined text-5xl text-outline-variant/30 block mb-3">
                      group_off
                    </span>
                    No customers yet
                  </td>
                </tr>
              ) : (
                customers.map((customer, i) => (
                  <tr
                    key={customer.id}
                    className="border-t border-surface-container-high hover:bg-surface-container-low/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-9 w-9 rounded-full ${bgColors[i % bgColors.length]} flex items-center justify-center text-xs font-bold`}
                        >
                          {initials(customer.full_name)}
                        </div>
                        <span className="font-bold text-on-surface text-sm">
                          {customer.full_name || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-on-surface-variant">
                      {customer.email}
                    </td>
                    <td className="py-4 px-6 text-sm font-semibold">
                      {customer.totalPurchases}
                    </td>
                    <td className="py-4 px-6 text-sm font-bold">
                      ₹{customer.totalSpent.toLocaleString("en-IN")}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          customer.status === "Active"
                            ? "bg-primary/10 text-primary"
                            : "bg-surface-container-high text-on-surface-variant"
                        }`}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-on-surface-variant">
                      {new Date(customer.created_at).toLocaleDateString(
                        "en-IN",
                        { day: "2-digit", month: "short", year: "numeric" }
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
