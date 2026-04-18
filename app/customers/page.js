export const metadata = {
  title: "Customers — The Academy CMS",
  description: "Manage your academic community, track note purchases, and analyze scholar engagement.",
};

const customers = [
  {
    initials: "AP",
    name: "Arjun Patel",
    email: "arjun.patel@designlab.in",
    joined: "Jan 2024",
    purchases: 12,
    spent: "₹14,200",
    status: "Active",
    bgColor: "bg-primary/10",
    textColor: "text-primary",
  },
  {
    initials: "SM",
    name: "Sara Mehta",
    email: "sara.m@architutors.com",
    joined: "Nov 2023",
    purchases: 4,
    spent: "₹5,400",
    status: "Inactive",
    bgColor: "bg-secondary/10",
    textColor: "text-secondary",
  },
  {
    initials: "VK",
    name: "Vikram Khanna",
    email: "v.khanna@outlook.com",
    joined: "Feb 2024",
    purchases: 28,
    spent: "₹32,950",
    status: "Active",
    bgColor: "bg-tertiary/10",
    textColor: "text-tertiary",
  },
  {
    initials: "IS",
    name: "Isha Sharma",
    email: "isharma.edu@gmail.com",
    joined: "Oct 2023",
    purchases: 15,
    spent: "₹18,600",
    status: "Active",
    bgColor: "bg-primary/10",
    textColor: "text-primary",
  },
  {
    initials: "RK",
    name: "Rohan Kapoor",
    email: "rkapoor.arch@veridian.ac",
    joined: "Jan 2024",
    purchases: 1,
    spent: "₹850",
    status: "Inactive",
    bgColor: "bg-secondary/10",
    textColor: "text-secondary",
  },
  {
    initials: "NR",
    name: "Neha Reddy",
    email: "neha.r@artschool.edu",
    joined: "Mar 2024",
    purchases: 9,
    spent: "₹11,250",
    status: "Active",
    bgColor: "bg-tertiary/10",
    textColor: "text-tertiary",
  },
  {
    initials: "DM",
    name: "Dev Malhotra",
    email: "dev.arch@proton.me",
    joined: "Dec 2023",
    purchases: 21,
    spent: "₹26,400",
    status: "Active",
    bgColor: "bg-primary/10",
    textColor: "text-primary",
  },
];

export default function CustomersPage() {
  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 animate-fade-in">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">
            Customer Registry
          </h2>
          <p className="text-on-surface-variant max-w-xl leading-relaxed">
            Oversee your academic community. Track note purchases, manage
            account statuses, and analyze scholar engagement.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-surface-container-low p-1.5 rounded-xl">
          <button className="px-6 py-2 bg-surface-container-lowest text-primary font-semibold rounded-lg shadow-sm text-sm">
            All Scholars
          </button>
          <button className="px-6 py-2 text-on-secondary-container font-medium hover:bg-surface-container-high rounded-lg transition-all text-sm">
            Active
          </button>
          <button className="px-6 py-2 text-on-secondary-container font-medium hover:bg-surface-container-high rounded-lg transition-all text-sm">
            Inactive
          </button>
        </div>
      </div>

      {/* Bento Statistics Layer */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="col-span-1 bg-surface-container-low p-6 rounded-xl relative overflow-hidden animate-slide-up stagger-1">
          <p className="text-on-surface-variant text-sm font-medium mb-1">
            Total Customers
          </p>
          <h3 className="text-3xl font-bold font-headline text-green-800">
            1,284
          </h3>
          <div className="mt-4 flex items-center text-xs text-green-600 font-semibold gap-1">
            <span className="material-symbols-outlined text-sm">
              trending_up
            </span>
            <span>12% from last month</span>
          </div>
        </div>
        <div className="col-span-1 bg-surface-container-low p-6 rounded-xl animate-slide-up stagger-2">
          <p className="text-on-surface-variant text-sm font-medium mb-1">
            Active Scholars
          </p>
          <h3 className="text-3xl font-bold font-headline text-green-800">
            1,102
          </h3>
          <div className="mt-4 flex items-center text-xs text-green-600 font-semibold gap-1">
            <span className="material-symbols-outlined text-sm">
              check_circle
            </span>
            <span>85.8% retention rate</span>
          </div>
        </div>
        <div className="col-span-1 md:col-span-2 bg-signature-gradient p-6 rounded-xl text-white flex justify-between items-center relative overflow-hidden animate-slide-up stagger-3">
          <div className="relative z-10">
            <p className="text-white/70 text-sm font-medium mb-1">
              Total Revenue (Notes)
            </p>
            <h3 className="text-4xl font-bold font-headline">₹4,82,900</h3>
            <p className="mt-2 text-white/50 text-xs">
              Averaging ₹376 per customer
            </p>
          </div>
          <span className="material-symbols-outlined text-8xl opacity-10 absolute -right-4 -bottom-4 rotate-12">
            account_balance_wallet
          </span>
        </div>
      </div>

      {/* Management Table Container */}
      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-xl shadow-stone-200/30 ghost-border animate-slide-up stagger-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  Name
                </th>
                <th className="px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  Email Address
                </th>
                <th className="px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  Purchases
                </th>
                <th className="px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right">
                  Total Spent
                </th>
                <th className="px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest text-center">
                  Status
                </th>
                <th className="px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer, index) => (
                <tr
                  key={index}
                  className="hover:bg-surface-container-low/30 transition-colors group"
                  style={{
                    borderBottom: index < customers.length - 1 ? '1px solid var(--surface-container-low)' : 'none'
                  }}
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full ${customer.bgColor} flex items-center justify-center ${customer.textColor} font-bold text-sm`}
                      >
                        {customer.initials}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">
                          {customer.name}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          Joined {customer.joined}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-on-surface-variant font-medium">
                    {customer.email}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-xs font-bold">
                        {customer.purchases}
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        Note set{customer.purchases !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right font-bold text-on-surface">
                    {customer.spent}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span
                      className={`px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full ${
                        customer.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-surface-container-high rounded-full text-on-surface-variant transition-all">
                      <span className="material-symbols-outlined text-lg">
                        more_vert
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer/Pagination */}
        <div className="px-8 py-5 bg-surface-container-low/20 flex items-center justify-between" style={{ borderTop: '1px solid var(--surface-container-low)' }}>
          <p className="text-xs text-on-surface-variant">
            Showing 1 to 7 of 1,284 entries
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded-lg bg-primary text-white text-xs font-bold shadow-sm">
              1
            </button>
            <button className="w-8 h-8 rounded-lg hover:bg-surface-container-high text-xs font-bold text-on-surface-variant transition-colors">
              2
            </button>
            <button className="w-8 h-8 rounded-lg hover:bg-surface-container-high text-xs font-bold text-on-surface-variant transition-colors">
              3
            </button>
            <span className="px-1 text-on-surface-variant">...</span>
            <button className="w-8 h-8 rounded-lg hover:bg-surface-container-high text-xs font-bold text-on-surface-variant transition-colors">
              184
            </button>
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Insight Section */}
      <div className="mt-16 flex flex-col lg:flex-row gap-8 items-center bg-surface-container-low rounded-3xl p-10 overflow-hidden relative animate-slide-up stagger-6">
        <div className="lg:w-1/2 relative z-10">
          <div className="inline-block px-3 py-1 bg-tertiary/10 text-tertiary text-[10px] font-extrabold uppercase tracking-widest rounded-full mb-4">
            Admin Insights
          </div>
          <h4 className="text-3xl font-extrabold font-headline text-green-900 mb-4 leading-tight">
            Identify your Power Scholars
          </h4>
          <p className="text-on-surface-variant leading-relaxed mb-6">
            Our automated algorithms have identified 42 users who consistently
            purchase high-tier architectural note sets. Consider launching a
            tailored loyalty discount for this cohort to drive Q3 revenue.
          </p>
          <button className="text-primary font-bold flex items-center gap-2 group">
            View analytics report
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
        </div>
        <div className="lg:w-1/2 grid grid-cols-2 gap-4">
          <div className="aspect-square rounded-2xl bg-white shadow-lg overflow-hidden rotate-3 transform translate-y-4 ghost-border">
            <div className="w-full h-full bg-gradient-to-br from-surface-container-low to-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-6xl text-primary/20">
                architecture
              </span>
            </div>
          </div>
          <div className="aspect-square rounded-2xl bg-white shadow-lg overflow-hidden -rotate-6 transform -translate-y-4 ghost-border">
            <div className="w-full h-full bg-gradient-to-br from-surface-container-high to-surface-container-low flex items-center justify-center">
              <span className="material-symbols-outlined text-6xl text-tertiary/20">
                auto_stories
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
