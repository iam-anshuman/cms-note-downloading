"use client";

import { useEffect } from "react";
import { useCartStore } from "@/app/store/cartStore";

/**
 * Invisible component mounted once in the public layout.
 * On mount it checks auth status and fetches the server cart if logged in.
 * This is the single place that boots the cart — no providers needed.
 */
export default function CartSync() {
  const fetchCart = useCartStore((s) => s.fetchCart);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return null;
}
