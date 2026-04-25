"use client";

import { useState } from "react";
import { useRouter as useNextRouter } from "next/navigation";
import { useCartStore } from "@/app/store/cartStore";

export default function PurchaseActions({ note }) {
  const router = useNextRouter();
  const { addItem, isInCart, setIsOpen } = useCartStore();
  const [buyStatus, setBuyStatus] = useState("idle"); // idle | loading | error
  const [errorMsg, setErrorMsg] = useState("");

  const inCart = isInCart(note.id);

  const handleAddToCart = () => {
    addItem(note); // store reads its own isAuthenticated flag
  };


  const handleBuyNow = async () => {
    setBuyStatus("loading");
    setErrorMsg("");

    try {
      // Check login status
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();

      if (!meData.user) {
        router.push(`/login?redirect=/browse/${note.id}`);
        return;
      }

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: note.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Could not create order");
      }

      // Launch Razorpay
      const razorpay = new window.Razorpay({
        key: data.razorpayKeyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.razorpayOrderId,
        name: "Architectural Academy",
        description: note.title,
        handler: async (response) => {
          const verifyRes = await fetch("/api/orders/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: data.orderId,
            }),
          });

          if (verifyRes.ok) {
            router.push("/profile?purchase=success");
          } else {
            setErrorMsg("Payment verification failed. Contact support.");
            setBuyStatus("error");
          }
        },
        modal: {
          ondismiss: () => setBuyStatus("idle"),
        },
        prefill: {},
        theme: { color: "#3d8b37" },
      });

      razorpay.open();
      setBuyStatus("idle");
    } catch (err) {
      setErrorMsg(err.message);
      setBuyStatus("error");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          {errorMsg}
        </div>
      )}

      <button
        onClick={handleBuyNow}
        disabled={buyStatus === "loading"}
        className="bg-signature-gradient text-white py-4 rounded-xl font-bold text-lg active:scale-95 transition-all shadow-lg shadow-primary/20 hover:shadow-xl disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
      >
        {buyStatus === "loading" ? (
          <>
            <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
            Processing...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined">bolt</span>
            Buy Now
          </>
        )}
      </button>

      <button
        onClick={inCart ? () => setIsOpen(true) : handleAddToCart}
        className={`py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
          inCart
            ? "bg-primary/10 text-primary border-2 border-primary"
            : "ghost-border text-on-surface hover:bg-surface-container-low"
        }`}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: inCart ? "'FILL' 1" : "'FILL' 0" }}>
          {inCart ? "shopping_cart_checkout" : "add_shopping_cart"}
        </span>
        {inCart ? "View Cart" : "Add to Cart"}
      </button>

      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </div>
  );
}
