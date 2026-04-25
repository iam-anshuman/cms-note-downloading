import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="bg-surface-container-low w-full py-12 px-8 font-body text-sm">
      {/* Decorative Spacer */}
      <div className="bg-surface-container-high h-[12px] w-full mb-8 rounded-full opacity-50"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 max-w-7xl mx-auto">
        {/* Brand & Description */}
        <div>
          <div className="text-lg font-bold text-green-800 mb-4 font-headline">
            Architectural Academy
          </div>
          <p className="text-slate-500 max-w-xs leading-relaxed">
            The premium editorial source for handwritten academic excellence.
            Built for the modern learner.
          </p>
        </div>

        {/* Links & Copyright */}
        <div className="flex flex-col md:items-end gap-6">
          <div className="flex flex-wrap gap-6 text-slate-500">
            <Link
              href="#"
              className="hover:text-green-600 underline transition-all duration-300"
            >
              About Us
            </Link>
            <Link
              href="#"
              className="hover:text-green-600 underline transition-all duration-300"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="hover:text-green-600 underline transition-all duration-300"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="hover:text-green-600 underline transition-all duration-300"
            >
              Contact Support
            </Link>
          </div>
          <div className="text-slate-500">
            © 2024 The Architectural Academy. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
