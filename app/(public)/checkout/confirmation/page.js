"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

function ConfirmationContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const amount = params.get("amount"); // in paise

  const [show, setShow] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const t = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(t);
  }, []);

  const formattedAmount = amount ? `₹${(parseInt(amount) / 100).toLocaleString()}` : "";
  const shortOrderId = orderId ? orderId.split("-")[0].toUpperCase() : "";

  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center">
      {/* Success Icon */}
      <div
        className={`transition-all duration-700 ${show ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
      >
        <div className="relative inline-flex items-center justify-center w-32 h-32 mb-8">
          {/* Pulsing ring */}
          <span className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-60" />
          <div className="relative w-32 h-32 rounded-full bg-signature-gradient flex items-center justify-center shadow-2xl shadow-primary/30">
            <span
              className="material-symbols-outlined text-white text-6xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
        </div>
      </div>

      {/* Headline */}
      <div className={`transition-all duration-700 delay-200 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-4">
          Order Confirmed!
        </h1>
        <p className="text-on-surface-variant text-lg leading-relaxed mb-2">
          Your notes are now available in your profile. Happy studying!
        </p>
        {formattedAmount && (
          <p className="text-primary font-bold text-lg">{formattedAmount} paid successfully</p>
        )}
      </div>

      {/* Order Details Card */}
      <div
        className={`mt-10 bg-surface-container-lowest rounded-2xl p-8 ghost-border text-left space-y-5 transition-all duration-700 delay-300 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <h2 className="font-headline font-bold text-xl text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">receipt_long</span>
          Order Summary
        </h2>

        <div className="space-y-4">
          {[
            { label: "Order ID", value: shortOrderId || "—", mono: true },
            { label: "Status", value: "Payment Successful", green: true },
            { label: "Delivery", value: "Instant — available in My Notes" },
            { label: "Access", value: "Valid as per subscription period" },
          ].map(({ label, value, mono, green }) => (
            <div key={label} className="flex justify-between items-center py-3 border-b border-outline-variant/10 last:border-0">
              <span className="text-sm text-on-surface-variant font-medium">{label}</span>
              <span
                className={`text-sm font-semibold ${mono ? "font-mono tracking-wider text-on-surface" : green ? "text-green-700" : "text-on-surface"}`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* What's Next */}
      <div
        className={`mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 transition-all duration-700 delay-400 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        {[
          { icon: "auto_stories", title: "Read Now", desc: "Access your notes instantly from your profile" },
          { icon: "download", title: "Download", desc: "Save PDF files for offline studying" },
          { icon: "share", title: "Share", desc: "Recommend to friends and earn rewards" },
        ].map(({ icon, title, desc }) => (
          <div
            key={title}
            className="bg-surface-container-low rounded-xl p-5 flex flex-col items-center text-center gap-2"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-primary">{icon}</span>
            </div>
            <p className="font-headline font-bold text-sm text-on-surface">{title}</p>
            <p className="text-xs text-on-surface-variant leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div
        className={`mt-10 flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-500 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <Link
          href="/profile"
          className="bg-signature-gradient text-on-primary px-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            menu_book
          </span>
          Go to My Notes
        </Link>
        <Link
          href="/browse"
          className="ghost-border text-on-surface px-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors"
        >
          <span className="material-symbols-outlined">explore</span>
          Browse More Notes
        </Link>
      </div>

      {/* Decorative bottom text */}
      <p className="mt-12 text-xs text-on-surface-variant/50">
        A confirmation has been recorded in your account. For support, visit our help centre.
      </p>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  );
}
