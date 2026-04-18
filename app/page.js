export const metadata = {
  title: "Dashboard — The Academy CMS",
  description: "Overview of your academic content platform performance, revenue, and engagement metrics.",
};

export default function DashboardPage() {
  return (
    <>
      {/* Page Header */}
      <header className="mb-10 animate-fade-in">
        <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
          Welcome back, Admin
        </h2>
        <p className="text-on-surface-variant font-medium mt-1 max-w-xl leading-relaxed">
          Here&apos;s a real-time snapshot of your Veridian Scholar Panel
          performance and activity.
        </p>
      </header>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {/* Total Revenue Card */}
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
              ₹ 4,82,950
            </p>
          </div>
        </div>

        {/* Customers Card */}
        <div className="bg-surface-container-lowest p-6 rounded-xl ghost-border flex flex-col justify-between animate-slide-up stagger-2 hover:shadow-lg hover:shadow-stone-200/40 transition-shadow duration-300">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-tertiary/10 rounded-lg text-tertiary">
              <span className="material-symbols-outlined">group</span>
            </div>
            <span className="text-xs font-bold text-tertiary flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">
                trending_up
              </span>{" "}
              +8.2%
            </span>
          </div>
          <div className="mt-5">
            <p className="text-sm font-semibold text-on-secondary-container">
              Total Customers
            </p>
            <p className="text-2xl font-extrabold font-headline text-on-surface">
              1,284
            </p>
          </div>
        </div>

        {/* Notes Uploaded Card */}
        <div className="bg-surface-container-lowest p-6 rounded-xl ghost-border flex flex-col justify-between animate-slide-up stagger-3 hover:shadow-lg hover:shadow-stone-200/40 transition-shadow duration-300">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-secondary-container rounded-lg text-on-secondary-fixed-variant">
              <span className="material-symbols-outlined">history_edu</span>
            </div>
            <span className="text-xs font-bold text-stone-400">
              Monthly Target: 80%
            </span>
          </div>
          <div className="mt-5">
            <p className="text-sm font-semibold text-on-secondary-container">
              Notes Uploaded
            </p>
            <p className="text-2xl font-extrabold font-headline text-on-surface">
              342
            </p>
          </div>
        </div>

        {/* Platform Efficiency Card */}
        <div className="bg-signature-gradient p-6 rounded-xl shadow-lg shadow-primary/20 flex flex-col justify-between text-white animate-slide-up stagger-4 relative overflow-hidden">
          <div className="flex justify-between items-start relative z-10">
            <div className="p-3 bg-white/20 rounded-lg">
              <span className="material-symbols-outlined">bolt</span>
            </div>
          </div>
          <div className="mt-5 relative z-10">
            <p className="text-sm font-medium opacity-80">
              Platform Efficiency
            </p>
            <p className="text-2xl font-extrabold font-headline">98.4%</p>
          </div>
          <span className="material-symbols-outlined text-[96px] opacity-[0.08] absolute -right-3 -bottom-3 rotate-12">
            bolt
          </span>
        </div>
      </div>

      {/* Main Content Grid: 2/3 + 1/3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Revenue Chart Placeholder */}
        <section className="lg:col-span-2 animate-slide-up stagger-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-extrabold font-headline tracking-tight">
              Revenue Overview
            </h3>
            <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-lg">
              <button className="px-4 py-1.5 bg-surface-container-lowest text-primary font-semibold rounded-md text-xs shadow-sm">
                Monthly
              </button>
              <button className="px-4 py-1.5 text-on-secondary-container font-medium text-xs hover:bg-surface-container-high rounded-md transition-all">
                Weekly
              </button>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl p-8 ghost-border min-h-[280px] flex flex-col">
            {/* Simulated Bar Chart */}
            <div className="flex-1 flex items-end gap-3 pb-4">
              {[65, 45, 80, 55, 90, 70, 85, 60, 95, 50, 75, 88].map(
                (h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-md transition-all duration-500 hover:opacity-80"
                      style={{
                        height: `${h * 2}px`,
                        background:
                          i === 8
                            ? "linear-gradient(135deg, #006c05, #008809)"
                            : i % 3 === 0
                            ? "#e9e8e7"
                            : "#f5f3f3",
                      }}
                    ></div>
                    <span className="text-[10px] text-stone-400 font-medium">
                      {
                        [
                          "Jan",
                          "Feb",
                          "Mar",
                          "Apr",
                          "May",
                          "Jun",
                          "Jul",
                          "Aug",
                          "Sep",
                          "Oct",
                          "Nov",
                          "Dec",
                        ][i]
                      }
                    </span>
                  </div>
                )
              )}
            </div>
            {/* Chart Legend */}
            <div className="flex items-center gap-6 pt-4 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-signature-gradient"></div>
                <span className="text-xs text-on-surface-variant font-medium">
                  Peak Month
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-surface-container-high"></div>
                <span className="text-xs text-on-surface-variant font-medium">
                  Monthly Revenue
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="animate-slide-up stagger-5">
          <h3 className="text-xl font-extrabold font-headline tracking-tight mb-6">
            Recent Activity
          </h3>
          <div className="bg-surface-container-low rounded-2xl p-6 space-y-5">
            {[
              {
                initials: "RK",
                name: "Rajesh Kumar",
                action: "Structural Systems",
                time: "2 Mins Ago",
                amount: "₹1,499",
                bg: "bg-secondary-fixed",
                textColor: "text-on-secondary-fixed",
              },
              {
                initials: "AS",
                name: "Ananya Singh",
                action: "Landscape Ecology",
                time: "18 Mins Ago",
                amount: "₹899",
                bg: "bg-primary-fixed-dim",
                textColor: "text-on-primary-fixed",
              },
              {
                initials: "PV",
                name: "Priya Varma",
                action: "Modernism in Concrete",
                time: "1 Hour Ago",
                amount: "₹2,199",
                bg: "bg-tertiary-fixed-dim",
                textColor: "text-on-tertiary-fixed",
              },
              {
                initials: "MK",
                name: "Manish Kapoor",
                action: "Structural Systems",
                time: "2 Hours Ago",
                amount: "₹1,499",
                bg: "bg-stone-200",
                textColor: "text-on-surface",
              },
            ].map((purchase, i) => (
              <div key={i} className="flex gap-4 items-start group">
                <div
                  className={`h-10 w-10 rounded-full ${purchase.bg} flex-shrink-0 flex items-center justify-center font-bold ${purchase.textColor} text-sm`}
                >
                  {purchase.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">{purchase.name}</p>
                  <p className="text-xs text-on-secondary-container truncate">
                    Purchased{" "}
                    <span className="text-primary font-bold">
                      {purchase.action}
                    </span>
                  </p>
                  <p className="text-[10px] font-medium text-stone-400 mt-0.5 uppercase">
                    {purchase.time}
                  </p>
                </div>
                <div className="text-sm font-bold text-on-surface">
                  {purchase.amount}
                </div>
              </div>
            ))}

            <button className="w-full py-3 bg-white rounded-xl text-sm font-bold text-on-surface-variant hover:bg-stone-50 transition-colors ghost-border">
              View All Activity
            </button>
          </div>
        </section>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Top Subject */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 ghost-border animate-slide-up stagger-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-primary/10 rounded-lg">
              <span className="material-symbols-outlined text-primary text-lg">
                school
              </span>
            </div>
            <h4 className="font-bold font-headline text-on-surface">
              Top Subject
            </h4>
          </div>
          <p className="text-2xl font-extrabold font-headline text-primary mb-1">
            Architecture
          </p>
          <p className="text-sm text-on-surface-variant">
            142 notes · 68% of total sales
          </p>
          <div className="mt-4 w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
            <div
              className="h-full rounded-full bg-signature-gradient transition-all duration-1000"
              style={{ width: "68%" }}
            ></div>
          </div>
        </div>

        {/* Avg. Purchase Value */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 ghost-border animate-slide-up stagger-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-tertiary/10 rounded-lg">
              <span className="material-symbols-outlined text-tertiary text-lg">
                payments
              </span>
            </div>
            <h4 className="font-bold font-headline text-on-surface">
              Avg. Purchase
            </h4>
          </div>
          <p className="text-2xl font-extrabold font-headline text-on-surface mb-1">
            ₹ 1,412
          </p>
          <p className="text-sm text-on-surface-variant">
            Per customer · <span className="text-tertiary font-semibold">+5.3%</span> vs last month
          </p>
          <div className="mt-4 flex gap-1">
            {[40, 55, 35, 65, 50, 80, 45, 70, 60, 85, 55, 75].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-tertiary/15 hover:bg-tertiary/30 transition-colors"
                style={{ height: `${h * 0.5}px` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 ghost-border animate-slide-up stagger-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-secondary-container rounded-lg">
              <span className="material-symbols-outlined text-on-secondary-fixed-variant text-lg">
                conversion_path
              </span>
            </div>
            <h4 className="font-bold font-headline text-on-surface">
              Conversion Rate
            </h4>
          </div>
          <p className="text-2xl font-extrabold font-headline text-on-surface mb-1">
            24.8%
          </p>
          <p className="text-sm text-on-surface-variant">
            Visitor to customer · Healthy range
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#e9e8e7"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#006c05"
                  strokeWidth="3"
                  strokeDasharray="87.96"
                  strokeDashoffset="66"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-primary">Good</span>
              <span className="text-[10px] text-stone-400">
                Industry avg: 18%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-surface-container-low rounded-3xl p-10 relative overflow-hidden animate-slide-up stagger-6">
        <div className="relative z-10">
          <div className="inline-block px-3 py-1 bg-tertiary/10 text-tertiary text-[10px] font-extrabold uppercase tracking-widest rounded-full mb-4">
            Quick Actions
          </div>
          <h4 className="text-3xl font-extrabold font-headline text-green-900 mb-4 leading-tight max-w-lg">
            Manage your scholarly platform with ease
          </h4>
          <p className="text-on-surface-variant leading-relaxed mb-8 max-w-xl">
            Upload new academic notes, manage customer access, and track your
            platform performance — all from one centralized dashboard.
          </p>
          <div className="flex gap-4">
            <a
              href="/upload"
              className="bg-signature-gradient text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">
                upload_file
              </span>
              Upload Notes
            </a>
            <a
              href="/customers"
              className="bg-surface-container-lowest text-on-surface px-8 py-3 rounded-xl font-bold text-sm ghost-border hover:shadow-md transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">group</span>
              View Customers
            </a>
          </div>
        </div>
        <span className="material-symbols-outlined text-[180px] opacity-[0.04] absolute -right-8 -bottom-8 rotate-12">
          auto_stories
        </span>
      </div>
    </>
  );
}
