// AddToCartButton.tsx
"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { BagIcon } from "./icons";

interface AddToCartButtonProps {
  slug: string;
  qty: number;
  label: string;
  fullLabel: string;
}

export default function AddToCartButton({
  slug,
  qty,
  label,
  fullLabel,
}: AddToCartButtonProps) {
  const add = useCartStore((s) => s.add);
  const open = useCartStore((s) => s.open);
  const [full, setFull] = useState(false);

  function handleClick() {
    const ok = add(slug, qty);
    setFull(!ok);
    if (ok) open(); // opening the cart is the "added" feedback
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#F26A0F] py-3 text-base font-semibold text-[#E0700F] transition hover:bg-[#F26A0F]/10"
      >
        <BagIcon size={20} />
        {label}
      </button>
      {full && (
        <p role="alert" className="text-sm text-red-600">
          {fullLabel}
        </p>
      )}
    </>
  );
}
