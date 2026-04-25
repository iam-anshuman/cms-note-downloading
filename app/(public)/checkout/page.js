"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore, selectTotalPaise } from "@/app/store/cartStore";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, removeItem, clearCart } = useCartStore();
  const totalPaise = useCartStore(selectTotalPaise);
  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState(null); // null | "applied" | "invalid"
  const [discount, setDiscount] = useState(0); // in paise
  const [placing, setPlacing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const gstRate = 0.09; // 9% GST
  const subtotal = totalPaise;
  const gst = Math.round(subtotal * gstRate);
  const total = subtotal + gst - discount;

  const handleApplyCoupon = () => {
    // Demo coupon logic – replace with real API call
    if (couponCode.trim().toUpperCase() === "ACADEMY10") {
      const disc = Math.round(subtotal * 0.1);
      setDiscount(disc);
      setCouponStatus("applied");
    } else {
      setDiscount(0);
      setCouponStatus("invalid");
    }
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setPlacing(true);
    setErrorMsg("");

    try {
      // Check login
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (!meData.user) {
        router.push("/login?redirect=/checkout");
        return;
      }

      // Create a combined order for all cart items
      const res = await fetch("/api/orders/create-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteIds: items.map((i) => i.id) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create order");

      // Launch Razorpay
      const razorpay = new window.Razorpay({
        key: data.razorpayKeyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.razorpayOrderId,
        name: "Architectural Academy",
        description: `${items.length} note${items.length > 1 ? "s" : ""}`,
        handler: async (response) => {
          const verifyRes = await fetch("/api/orders/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: data.orderId,
            }),
          });
          if (verifyRes.ok) {
            clearCart();
            router.push(`/checkout/confirmation?orderId=${data.orderId}&amount=${total}`);
          } else {
            setErrorMsg("Payment verification failed. Please contact support.");
            setPlacing(false);
          }
        },
        modal: { ondismiss: () => setPlacing(false) },
        theme: { color: "#006c05" },
      });
      razorpay.open();
    } catch (err) {
      setErrorMsg(err.message);
      setPlacing(false);
    }
  };

  return (
    <>
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Back Link */}
        <div className="mb-8 animate-fade-in">
          <Link
            href="/browse"
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group w-fit"
          >
            <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">
              arrow_back
            </span>
            <span className="font-medium">Continue Shopping</span>
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center gap-6 animate-fade-in">
            <span className="material-symbols-outlined text-8xl text-outline-variant/40">
              shopping_cart
            </span>
            <h1 className="font-headline text-3xl font-bold text-on-surface">Your cart is empty</h1>
            <p className="text-on-surface-variant">Add some notes before checking out.</p>
            <Link
              href="/browse"
              className="mt-4 bg-signature-gradient text-white px-8 py-3 rounded-xl font-bold text-sm inline-flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-base">auto_stories</span>
              Browse Notes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-slide-up">
            {/* ── Left: Order Items ── */}
            <div className="lg:col-span-7 space-y-10">
              <div>
                <h1 className="text-4xl font-headline font-extrabold tracking-tight mb-2">Review Order</h1>
                <p className="text-on-surface-variant">
                  Verify your selection of premium handwritten notes before checkout.
                </p>
              </div>

              <div className="space-y-5">
                {items.map((item) => {
                  let thumb = null;
                  try {
                    const p = JSON.parse(item.thumbnail_url);
                    thumb = Array.isArray(p) ? p[0] : p;
                  } catch {
                    thumb = item.thumbnail_url;
                  }
                  const price = item.price_paise / 100;

                  return (
                    <div
                      key={item.id}
                      className="flex gap-6 bg-surface-container-low p-6 rounded-2xl group transition-all duration-300 hover:bg-surface-container ghost-border"
                    >
                      {/* Thumbnail */}
                      <div className="w-28 h-36 flex-shrink-0 bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-outline-variant/40">
                              auto_stories
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex flex-col justify-between py-1 w-full min-w-0">
                        <div>
                          <div className="flex justify-between items-start gap-4">
                            <h3 className="text-xl font-headline font-bold text-on-surface leading-tight">
                              {item.title}
                            </h3>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="flex-shrink-0 text-on-surface-variant hover:text-error transition-colors p-1"
                              aria-label="Remove item"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                          <p className="text-on-surface-variant mt-1 text-sm">{item.subject}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant text-xs font-semibold rounded-full uppercase tracking-wider">
                              Digital Notes
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-end mt-4">
                          <span className="text-2xl font-headline font-extrabold text-primary">
                            ₹{price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Trust badges */}
              <div className="flex justify-start gap-8 pt-4 opacity-60">
                {[
                  { icon: "verified_user", label: "Secure" },
                  { icon: "speed", label: "Instant" },
                  { icon: "history_edu", label: "Original" },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1">
                    <span className="material-symbols-outlined text-primary text-3xl">{icon}</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Order Summary Sidebar ── */}
            <div className="lg:col-span-5">
              <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm lg:sticky lg:top-28 border border-outline-variant/10">
                <h2 className="text-2xl font-headline font-bold mb-8">Order Details</h2>

                {errorMsg && (
                  <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">error</span>
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Line items */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-on-surface-variant text-sm">
                      <span>Subtotal ({items.length} item{items.length > 1 ? "s" : ""})</span>
                      <span className="font-semibold text-on-surface">
                        ₹{(subtotal / 100).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-on-surface-variant text-sm">
                      <span>Tax (GST 9%)</span>
                      <span className="font-semibold text-on-surface">
                        ₹{(gst / 100).toLocaleString()}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between items-center text-primary font-medium bg-primary/5 px-3 py-2 rounded-lg border border-primary/10 text-sm">
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-base">local_offer</span>
                          Discount Applied
                        </span>
                        <span>-₹{(discount / 100).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-surface-container-high" />

                  {/* Coupon */}
                  <div>
                    <label className="block text-sm font-label font-semibold text-on-surface-variant mb-2">
                      Promotional Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={couponCode}
                        onChange={(e) => { setCouponCode(e.target.value); setCouponStatus(null); }}
                        className="flex-1 bg-surface-container-high border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-sm"
                        placeholder="Enter code (try ACADEMY10)"
                        type="text"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="px-5 py-3 bg-secondary-container text-on-secondary-container font-semibold rounded-xl hover:opacity-80 transition-all text-sm"
                      >
                        Apply
                      </button>
                    </div>
                    {couponStatus === "applied" && (
                      <p className="text-green-700 text-xs mt-1.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        10% discount applied!
                      </p>
                    )}
                    {couponStatus === "invalid" && (
                      <p className="text-error text-xs mt-1.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">cancel</span>
                        Invalid coupon code.
                      </p>
                    )}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-end pt-2">
                    <div>
                      <p className="text-sm text-on-surface-variant font-label">Total Amount</p>
                      <p className="text-4xl font-headline font-extrabold text-primary">
                        ₹{(total / 100).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-on-surface-variant">Digital Delivery</p>
                      <p className="text-xs text-on-surface-variant">Instant Access</p>
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="w-full py-5 bg-signature-gradient text-on-primary font-headline font-bold text-lg rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:pointer-events-none"
                  >
                    {placing ? (
                      <>
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <span>Place Order</span>
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-on-surface-variant px-4 leading-relaxed">
                    By clicking Place Order, you agree to our Terms of Sale and Privacy Policy.
                    Digital files will be delivered to your profile.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
