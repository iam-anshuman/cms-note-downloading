import Link from "next/link";
import PublicNav from "./components/PublicNav";
import PublicFooter from "./components/PublicFooter";

export const metadata = {
  title: "Architectural Academy | Premier Handwritten Notes",
  description:
    "Access meticulously crafted handwritten notes and comprehensive NCERT solutions designed by academic experts to transform your learning journey.",
};

export default function HomePage() {
  return (
    <>
      <PublicNav />
      <main className="pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-surface py-20 lg:py-32 px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="z-10">
            <span className="inline-block py-1 px-3 rounded-full bg-tertiary-container text-on-tertiary-container text-xs font-bold uppercase tracking-widest mb-6">
              Premium Learning Resource
            </span>
            <h1 className="font-headline text-5xl lg:text-7xl font-extrabold text-on-surface leading-[1.1] tracking-tight mb-8">
              Score 90+ with{" "}
              <span className="text-primary italic">Topper&apos;s Notes</span>
            </h1>
            <p className="text-lg text-secondary mb-10 max-w-lg leading-relaxed">
              Access meticulously crafted handwritten notes and comprehensive
              NCERT solutions designed by academic experts to transform your
              learning journey.
            </p>
            <div className="relative group max-w-xl">
              <div className="absolute inset-0 bg-primary/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-full"></div>
              <div className="relative flex items-center bg-surface-container-lowest rounded-full p-2 shadow-sm ghost-border focus-within:shadow-md transition-all">
                <span className="material-symbols-outlined ml-4 text-secondary">
                  search
                </span>
                <input
                  className="w-full bg-transparent border-none focus:ring-0 px-4 py-3 font-body text-on-surface placeholder:text-outline outline-none"
                  placeholder="Search notes and NCERT solutions..."
                  type="text"
                />
                <Link
                  href="/browse"
                  className="bg-signature-gradient text-on-primary px-8 py-3 rounded-full font-bold hidden sm:block whitespace-nowrap"
                >
                  Search
                </Link>
              </div>
            </div>
          </div>

          {/* Hero Image Grid */}
          <div className="relative">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="relative z-10 grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                  <img
                    alt="Study Notes"
                    className="rounded-lg w-full h-40 object-cover grayscale-[0.2] hover:grayscale-0 transition-all"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmE0xvEj_D5Mr3wuCtSPnWRERftEFKJmfT5v4ILhqUPgcCoZwQ8tSTg1aETUvNalVkITxVX86fAH90yd8knMSC0lyOsnYgUVSa8-NEbdXzeQL6deS_VQPqONExiteOHzwERybZcxh4xl644BwV8HdnTsrwRJQOlR7xPNIYNpqrt5sdgOXE27ppgJNoSkQJXA3Dv-c3xIgmtsR7huOougSeELPUGN7DQXX6R2AlrhR--AJQIX3_mELOMzXrUq57qbRSk4rnNEf4HDFB"
                  />
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm rotate-[1deg] hover:rotate-0 transition-transform duration-500">
                  <img
                    alt="Academic Archive"
                    className="rounded-lg w-full h-48 object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvxlvDC2zegN61P4NdmCoj08pcZR3JVzv8klWir1q-0ZGPTXRcj1UyfuFji6dTwdZ7fYV0wKLLB1qe1WnCKmiwbXOg-v6gVwKMtulCMJld1QIrpE9ZvHrWXk7RX7DfzYtfnCzSdHK5uCjA9_hDoVlq3CjHWtmFvb4BS8rPhBml9yYuV5yypvHafFN_8iqjhQbPTJQthNFAbheme3SQFjY-8AC-kgesl1SA3exuZssDoVkMNdVKYUBmvPdvvqS7zEpG7TkNjBC3x9Px"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm rotate-[3deg] hover:rotate-0 transition-transform duration-500">
                  <img
                    alt="Student Learning"
                    className="rounded-lg w-full h-56 object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAW0BcjG6cOePHv10LWB-WgRqjNiN5tlM7fL5jC_gfdr7udAOWXwUseTpSFwnPRSFhEwIwrAwISDD8FLbZ0fNdTLsjfqaj3FqUBBb933aEwBQ6CuINC-2ahLx6q9W_RgzFKMAj-Csc0Y71xADnlUykghROFqZmRnvEClfeDySn2t1yFDAX9tiWJqGDZspxEWIvBLl6o7cZ1loRAVtCzNhP25HI3EwroXC6Uh92VbUwMt2TDzvQLNA37UTtrnoZIl107XOJFPyXOaUFd"
                  />
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm rotate-[-1deg] hover:rotate-0 transition-transform duration-500">
                  <img
                    alt="Tools for Success"
                    className="rounded-lg w-full h-36 object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfhynEIiNHclwatWIODqb8MSivjZQHW9xD1yQ1VY05GaOgcguBiPvJKJcmc3t8TnZ1RIAx7LRgxO0koV77qHEviftiqXbg2LfcVKM8tt8N4_BStm2wTkHSizKLpbnSXalCcVf3kKDkWB3Qr4Ru1ST-K2bihqLR2HnaCRSYSEKRDCH9qPZaiB6FtHPla6EdBXDtEP6O-uiV8E25etsGDoXgK2E4N1SJs3s7znJXxvq1Cej8V3aYzGELiZZJNCRxv49OpisTMzEE_2p-"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section: Bento Grid */}
      <section className="bg-surface-container-low py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="font-headline text-3xl lg:text-4xl font-bold text-on-surface mb-4">
                Curated Note Archives
              </h2>
              <p className="text-secondary font-medium">
                Explore by subject or academic level
              </p>
            </div>
            <Link
              href="/browse"
              className="hidden md:flex items-center gap-2 text-primary font-bold group"
            >
              Explore Archives
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Mathematics (Large) */}
            <div className="md:col-span-2 lg:row-span-2 bg-surface-container-lowest p-8 rounded-xl ghost-border hover:shadow-md transition-shadow group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <span className="material-symbols-outlined">functions</span>
                </div>
                <h3 className="font-headline text-2xl font-bold mb-4">
                  Mathematics
                </h3>
                <p className="text-secondary leading-relaxed mb-8">
                  From Calculus to Linear Algebra, get step-by-step solutions and
                  simplified theory for complex problems.
                </p>
              </div>
              <img
                alt="Math"
                className="rounded-lg h-48 w-full object-cover grayscale group-hover:grayscale-0 transition-all mb-4"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgTuvUbFpF_Gfb7SuNlOxIGVnhoOGsoYTz_jm18MxPq0emYhXyp2eMggPXuCD8HFJL1wwXK1AyO_ZLAySfqh1dCd2hb7qBuiyyStq-6l6XH1mMcOzc3zxvYiy6dARLTUC2Zk-yk5S40JITUuHg-lkTkrJ1sKt39ILOQH7FbimhDJGvxCgjr4kDDahtlAk2PZ2dKGyqnkjxBIzf_-CVWPsV7Hmb1Pui2f_LtgKUD6qXKCJ_dkozZMHXYNIyNWKYdQwyyTzynuC75ROf"
              />
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-primary">
                  120+ Sets Available
                </span>
                <span className="material-symbols-outlined text-primary">
                  north_east
                </span>
              </div>
            </div>

            {/* Science */}
            <Link
              href="/browse?category=science"
              className="bg-surface-container-lowest p-6 rounded-xl ghost-border hover:shadow-md transition-shadow group"
            >
              <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary mb-4">
                <span className="material-symbols-outlined">science</span>
              </div>
              <h3 className="font-headline text-xl font-bold mb-2">Science</h3>
              <p className="text-on-surface-variant text-sm mb-6">
                Detailed Physics, Chemistry, and Biology diagrams.
              </p>
              <div className="h-1 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-tertiary w-[85%]"></div>
              </div>
            </Link>

            {/* History */}
            <Link
              href="/browse?category=history"
              className="bg-surface-container-lowest p-6 rounded-xl ghost-border hover:shadow-md transition-shadow group"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary mb-4">
                <span className="material-symbols-outlined">history_edu</span>
              </div>
              <h3 className="font-headline text-xl font-bold mb-2">History</h3>
              <p className="text-on-surface-variant text-sm mb-6">
                Chronological timelines and essay structures.
              </p>
              <div className="h-1 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-[70%]"></div>
              </div>
            </Link>

            {/* Programming (Wide) */}
            <div className="lg:col-span-2 bg-primary text-on-primary p-8 rounded-xl shadow-sm flex items-center justify-between overflow-hidden relative group">
              <div className="relative z-10">
                <h3 className="font-headline text-2xl font-bold mb-2">
                  Programming
                </h3>
                <p className="text-on-primary/80 max-w-xs mb-6">
                  Master Java, Python, and C++ with clean code snippets and
                  logic notes.
                </p>
                <Link
                  href="/browse?category=programming"
                  className="bg-surface-container-lowest text-primary px-6 py-2 rounded-full font-bold text-sm inline-block"
                >
                  Start Coding
                </Link>
              </div>
              <div className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                <span className="material-symbols-outlined text-[160px]">
                  terminal
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-8 bg-surface">
        <div className="max-w-5xl mx-auto bg-signature-gradient rounded-[2rem] p-12 lg:p-20 text-center text-on-primary relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="font-headline text-4xl lg:text-5xl font-extrabold mb-6">
              Ready to elevate your grades?
            </h2>
            <p className="text-lg text-on-primary/90 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join over 50,000 students who trust our handwritten archives to
              simplify their complex studies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-surface-container-lowest text-primary px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-all">
                Join Now
              </button>
              <Link
                href="/browse"
                className="bg-primary-container/20 border border-on-primary/20 backdrop-blur-md text-on-primary px-10 py-4 rounded-full font-bold text-lg hover:bg-primary-container/30 transition-all text-center"
              >
                View Samples
              </Link>
            </div>
          </div>
        </div>
      </section>
      </main>
      <PublicFooter />
    </>
  );
}
