// CartProvider.tsx
"use client";

import { useEffect } from "react";
import { CART_STORAGE_KEY, useCartStore } from "@/store/cart";

// Renders nothing. Loads the saved cart once and keeps tabs in sync.
export default function CartProvider() {
  useEffect(() => {
    Promise.resolve(useCartStore.persist.rehydrate()).then(() =>
      useCartStore.setState({ hydrated: true }),
    );

    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY) void useCartStore.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return null;
}
