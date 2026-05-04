import { dbAll, dbGet } from "@/lib/db";

export const metadata = {
  title: "Dashboard — The Academy CMS",
  description: "Overview of your academic content platform performance.",
};

async function getStats() {
  const ordersRes = await dbAll("SELECT amount_paise FROM orders WHERE status = 'paid'");
  const customersRes = await dbGet("SELECT COUNT(*) as count FROM users WHERE role = 'customer'");
  const notesRes = await dbGet("SELECT COUNT(*) as count FROM notes WHERE status = 'published'");
  const bundlesRes = await dbGet("SELECT COUNT(*) as count FROM bundles WHERE status = 'active'");

  const revenue = ordersRes.reduce((sum, o) => sum + (o.amount_paise || 0), 0);

  return {
    revenue: revenue / 100,
    orders: ordersRes.length || 0,
    customers: customersRes.count || 0,
    notes: notesRes.count || 0,
  };
}

async function getRecentOrders() {
  const orders = await dbAll("SELECT * FROM orders WHERE status = 'paid' ORDER BY created_at DESC LIMIT 5");
  
  const enrichedOrders = [];
  for (const order of orders) {
    const user = await dbGet("SELECT full_name, email FROM users WHERE id = ?", [order.user_id]);
    const orderItems = await dbAll("SELECT n.title FROM order_items oi JOIN notes n ON oi.note_id = n.id WHERE oi.order_id = ?", [order.id]);
    
    enrichedOrders.push({
      ...order,
      users: user,
      order_items: orderItems.map(item => ({ notes: { title: item.title } }))
    });
  }
  
  return enrichedOrders;
}

export default async function AdminDashboardPage() {
  const [stats, recentOrders] = await Promise.all([
    getStats(),
    getRecentOrders(),
  ]);

  const initials = (name) =>
    (name || "??")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} Min${mins !== 1 ? "s" : ""} Ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} Hour${hours !== 1 ? "s" : ""} Ago`;
    const days = Math.floor(hours / 24);
    return `${days} Day${days !== 1 ? "s" : ""} Ago`;
  };

  const avatarBgs = [
    "bg-secondary-fixed",
    "bg-primary-fixed-dim",
    "bg-tertiary-fixed-dim",
    "bg-stone-200",
    "bg-primary-container",
  ];

  return (
    <>
      {/* Page Header */}
      <header className="mb-8 animate-fade-in">
        <h2 className="text-2xl sm:text-4xl font-extrabold font-headline tracking-tight text-on-surface">
          Welcome back, Admin
        </h2>
        <p className="text-on-surface-variant font-medium mt-1 max-w-xl leading-relaxed text-sm sm:text-base">
          Here&apos;s a real-time snapshot of your Veridian Scholar Panel
          performance and activity.
        </p>
      </header>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-surface-container-lowest p-6 rounded-xl ghost-border flex flex-col justify-between animate-slide-up stagger-1 hover:shadow-lg hover:shadow-stone-200/40 transition-shadow duration-300">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-primary/10 rounded-lg text-primary">
              <span className="material-symbols-outlined">
                account_balance_wallet
              </span>
            </div>
            <span className="text-xs font-bold text-primary flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">
                trending_up
              </span>{" "}
              +12.5%
            </span>
          </div>
          <div className="mt-5">
            <p className="text-sm font-semibold text-on-secondary-container">
              Total Revenue
            </p>
            <p className="text-2xl font-extrabold font-headline text-on-surface">
              ₹ {stats.revenue.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl ghost-border flex flex-col justify-between animate-slide-up stagger-2 hover:shadow-lg hover:shadow-stone-200/40 transition-shadow duration-300">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-tertiary/10 rounded-lg text-tertiary">
              <span className="material-symbols-outlined">group</span>
            </div>
          </div>
          <div className="mt-5">
            <p className="text-sm font-semibold text-on-secondary-container">
              Total Customers
            </p>
            <p className="text-2xl font-extrabold font-headline text-on-surface">
              {stats.customers.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl ghost-border flex flex-col justify-between animate-slide-up stagger-3 hover:shadow-lg hover:shadow-stone-200/40 transition-shadow duration-300">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-secondary-container rounded-lg text-on-secondary-fixed-variant">
              <span className="material-symbols-outlined">history_edu</span>
            </div>
          </div>
          <div className="mt-5">
            <p className="text-sm font-semibold text-on-secondary-container">
              Published Notes
            </p>
            <p className="text-2xl font-extrabold font-headline text-on-surface">
              {stats.notes}
            </p>
          </div>
        </div>
        <div className="bg-signature-gradient p-6 rounded-xl shadow-lg shadow-primary/20 flex flex-col justify-between text-white animate-slide-up stagger-4 relative overflow-hidden">
          <div className="flex justify-between items-start relative z-10">
            <div className="p-3 bg-white/20 rounded-lg">
              <span className="material-symbols-outlined">shopping_cart</span>
            </div>
          </div>
          <div className="mt-5 relative z-10">
            <p className="text-sm font-medium opacity-80">Total Orders</p>
            <p className="text-2xl font-extrabold font-headline">
              {stats.orders}
            </p>
          </div>
          <span className="material-symbols-outlined text-[96px] opacity-[0.08] absolute -right-3 -bottom-3 rotate-12">
            receipt_long
          </span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
        <section className="lg:col-span-2 animate-slide-up stagger-4">
          <h3 className="text-xl font-extrabold font-headline tracking-tight mb-6">
            Quick Actions
          </h3>
          <div className="bg-surface-container-low rounded-3xl p-10 relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-block px-3 py-1 bg-tertiary/10 text-tertiary text-[10px] font-extrabold uppercase tracking-widest rounded-full mb-4">
                Manage
              </div>
              <h4 className="text-2xl font-extrabold font-headline text-green-900 mb-4 leading-tight max-w-lg">
                Manage your scholarly platform
              </h4>
              <div className="flex gap-3 flex-wrap mt-6">
                <a
                  href="/admin/upload"
                  className="bg-signature-gradient text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">upload_file</span>
                  Upload Notes
                </a>
                <a
                  href="/admin/bundles"
                  className="bg-surface-container-lowest text-on-surface px-6 py-2.5 rounded-xl font-bold text-sm ghost-border hover:shadow-md transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">inventory_2</span>
                  Bundles
                </a>
                <a
                  href="/admin/customers"
                  className="bg-surface-container-lowest text-on-surface px-6 py-2.5 rounded-xl font-bold text-sm ghost-border hover:shadow-md transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">group</span>
                  Customers
                </a>
              </div>
            </div>
            <span className="material-symbols-outlined text-[180px] opacity-[0.04] absolute -right-8 -bottom-8 rotate-12">
              auto_stories
            </span>
          </div>
        </section>

        <section className="animate-slide-up stagger-5">
          <h3 className="text-xl font-extrabold font-headline tracking-tight mb-6">
            Recent Activity
          </h3>
          <div className="bg-surface-container-low rounded-2xl p-6 space-y-5">
            {recentOrders.length === 0 ? (
              <p className="text-center text-on-surface-variant py-8 text-sm">
                No orders yet
              </p>
            ) : (
              recentOrders.map((order, i) => (
                <div key={order.id} className="flex gap-4 items-start">
                  <div
                    className={`h-10 w-10 rounded-full ${avatarBgs[i % avatarBgs.length]} flex-shrink-0 flex items-center justify-center font-bold text-sm`}
                  >
                    {initials(order.users?.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">
                      {order.users?.full_name || order.users?.email}
                    </p>
                    <p className="text-xs text-on-secondary-container truncate">
                      Purchased{" "}
                      <span className="text-primary font-bold">
                        {order.order_items?.[0]?.notes?.title || "Note"}
                      </span>
                    </p>
                    <p className="text-[10px] font-medium text-stone-400 mt-0.5 uppercase">
                      {timeAgo(order.created_at)}
                    </p>
                  </div>
                  <div className="text-sm font-bold text-on-surface">
                    ₹{(order.amount_paise / 100).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </>
  );
}
