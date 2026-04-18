export const metadata = {
  title: "Notes List — The Academy CMS",
  description: "Browse, manage, and analyze your published academic notes catalog.",
};

const topNotes = [
  {
    title: "Structural Systems Vol. 4",
    author: "Professor Julian Vance",
    pages: 128,
    tags: ["Architecture", "Engineering"],
    price: "₹ 1,499",
    sales: 84,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuADWsSEeLDt4Ytj8v0sTIQbi2A8ckvnllStZQcXPqnsKbwQkzDJOnH_eUQIkR0umnaXU17xsF10GNeU4z1syPMsbhz3GaHrtobBqCF-g8J0S7fh-tUWgdhSGD7QqiLdk67nb7_n6oAoFTufxCjdARZAiK5cGG9tdEnXV0YLFH42uMQFRC6Lhm-Cs7M9LD0l6CtTTv2EgUQNY71M2KrExe1WRziqpE-LPrY-mCcPvX1JNmFSvHtpCYcxdp7RYBjwbKCk3Iq18dqr6YzQ",
  },
  {
    title: "Landscape Ecology & Design",
    author: "Dr. Elena Moretti",
    pages: 86,
    tags: ["Landscape", "Sustainability"],
    price: "₹ 899",
    sales: 72,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBMycX9AedmQ4nFypcbh5efJrZtgAcqrw7gJ7dADQy2NZyVY_51mX5TLiZqR1iLQQKwtqXqg-UwZ3jDF4yfUlAxrjlJO3NhkQO7SZ5RlwGVy4ozGL96aJEDZ75BHHJvcb7ZheefK8Pm5gPdkwONBa6Lvy6JT1Bl98uLYLJcnMOhGWuG5baz_2XmLsB8tHVHSrBVspKnyBId60tVoQwYk1mwZqunhI5zY0h0QeAqtOAXy6vSs8DRqw5tB1vJ56bxwNBYqJvmp9OXaE6t",
  },
  {
    title: "Modernism in Concrete",
    author: "Ar. Kenji Sato",
    pages: 210,
    tags: ["Modernism", "History"],
    price: "₹ 2,199",
    sales: 56,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwhcb9WOgMohzOa-lnVq7pSfIcOlIVASNd5qywqrP9aqOF2kq61XuH4vY01dshTBL848h-urWP1zu_UzB-ze4edE9lNxAXQTO1GTdTyXfr4XoJqFvbQOEu5uyCXlan9HEziL0_PrPFeWzmyg9uZ--xaYAsDlaHnQXhFUvUYTYBKcjnGPknTYEr9oIdzc3R-NX9-Dc6oy2U3ClTVZlL-C4Bk0N9gjCBbvniLsMvlsR6aO9dsF_awcsrb8xXPUkZw21D8dK-Yymy40Vx",
  },
  {
    title: "Urban Planning Fundamentals",
    author: "Prof. Maya Chen",
    pages: 156,
    tags: ["Urban", "Planning"],
    price: "₹ 1,299",
    sales: 48,
    img: null,
  },
  {
    title: "Sustainable Materials Guide",
    author: "Dr. Anika Rao",
    pages: 94,
    tags: ["Materials", "Green Design"],
    price: "₹ 749",
    sales: 39,
    img: null,
  },
];

const recentPurchases = [
  {
    initials: "RK",
    name: "Rajesh Kumar",
    note: "Structural Systems",
    time: "2 Mins Ago",
    amount: "₹1,499",
    bg: "bg-secondary-fixed",
    textColor: "text-on-secondary-fixed",
  },
  {
    initials: "AS",
    name: "Ananya Singh",
    note: "Landscape Ecology",
    time: "18 Mins Ago",
    amount: "₹899",
    bg: "bg-primary-fixed-dim",
    textColor: "text-on-primary-fixed",
  },
  {
    initials: "PV",
    name: "Priya Varma",
    note: "Modernism in Concrete",
    time: "1 Hour Ago",
    amount: "₹2,199",
    bg: "bg-tertiary-fixed-dim",
    textColor: "text-on-tertiary-fixed",
  },
  {
    initials: "MK",
    name: "Manish Kapoor",
    note: "Structural Systems",
    time: "2 Hours Ago",
    amount: "₹1,499",
    bg: "bg-stone-200",
    textColor: "text-on-surface",
  },
];

export default function NotesListPage() {
  return (
    <>
      {/* Page Header */}
      <header className="mb-10 animate-fade-in">
        <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
          Academy Insights
        </h2>
        <p className="text-on-surface-variant font-medium mt-1">
          Real-time performance metrics for Veridian Scholar Panel
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
          <div className="mt-4">
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
          <div className="mt-4">
            <p className="text-sm font-semibold text-on-secondary-container">
              Total Customers
            </p>
            <p className="text-2xl font-extrabold font-headline text-on-surface">
              1,284
            </p>
          </div>
        </div>

        {/* Total Notes Card */}
        <div className="bg-surface-container-lowest p-6 rounded-xl ghost-border flex flex-col justify-between animate-slide-up stagger-3 hover:shadow-lg hover:shadow-stone-200/40 transition-shadow duration-300">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-secondary-container rounded-lg text-on-secondary-fixed-variant">
              <span className="material-symbols-outlined">history_edu</span>
            </div>
            <span className="text-xs font-bold text-stone-400">
              Monthly Target: 80%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-semibold text-on-secondary-container">
              Notes Uploaded
            </p>
            <p className="text-2xl font-extrabold font-headline text-on-surface">
              342
            </p>
          </div>
        </div>

        {/* Platform Efficiency */}
        <div className="bg-signature-gradient p-6 rounded-xl shadow-lg shadow-primary/20 flex flex-col justify-between text-white animate-slide-up stagger-4 relative overflow-hidden">
          <div className="flex justify-between items-start relative z-10">
            <div className="p-3 bg-white/20 rounded-lg">
              <span className="material-symbols-outlined">bolt</span>
            </div>
          </div>
          <div className="mt-4 relative z-10">
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

      {/* Main Content: 2/3 + 1/3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Selling Notes (2/3 Width) */}
        <section className="lg:col-span-2 space-y-6 animate-slide-up stagger-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold font-headline tracking-tight">
              Top Selling Notes
            </h3>
            <button className="text-primary font-bold text-sm hover:underline">
              View Analytics
            </button>
          </div>
          <div className="space-y-4">
            {topNotes.map((note, index) => (
              <div
                key={index}
                className="bg-surface-container-lowest p-4 rounded-xl flex items-center gap-6 hover:shadow-md transition-shadow group ghost-border"
              >
                <div className="h-24 w-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-high">
                  {note.img ? (
                    <img
                      alt={`${note.title} Thumbnail`}
                      className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      src={note.img}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-outline-variant">
                        auto_stories
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-lg font-headline">
                    {note.title}
                  </h4>
                  <p className="text-sm text-on-secondary-container">
                    By {note.author} • {note.pages} Pages
                  </p>
                  <div className="mt-3 flex gap-2">
                    {note.tags.map((tag, tagIdx) => (
                      <span
                        key={tagIdx}
                        className="px-3 py-1 bg-surface-container-high rounded-full text-[10px] font-bold uppercase tracking-wider text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-extrabold text-on-surface">
                    {note.price}
                  </p>
                  <p className="text-xs font-semibold text-tertiary">
                    {note.sales} Sales
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Purchases (1/3 Width) */}
        <section className="space-y-6 animate-slide-up stagger-5">
          <h3 className="text-xl font-extrabold font-headline tracking-tight">
            Recent Purchases
          </h3>
          <div className="bg-surface-container-low rounded-2xl p-6 space-y-6">
            {recentPurchases.map((purchase, index) => (
              <div key={index} className="flex gap-4 items-start">
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
                      {purchase.note}
                    </span>
                  </p>
                  <p className="text-[10px] font-medium text-stone-400 mt-1 uppercase">
                    {purchase.time}
                  </p>
                </div>
                <div className="text-sm font-bold text-on-surface flex-shrink-0">
                  {purchase.amount}
                </div>
              </div>
            ))}

            <button className="w-full py-3 bg-white rounded-xl text-sm font-bold text-on-surface-variant hover:bg-stone-50 transition-colors ghost-border">
              Download Full Ledger
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
