// CartButton.tsx
"use client";

import { useCartStore } from "@/store/cart";
import { BagIcon } from "./icons";

export default function CartButton({ label }: { label: string }) {
  const count = useCartStore((s) =>
    s.hydrated ? s.items.reduce((sum, i) => sum + i.qty, 0) : 0,
  );
  const open = useCartStore((s) => s.open);

  return (
    <button
      type="button"
      onClick={open}
      aria-label={count > 0 ? `${label} (${count})` : label}
      className="relative flex size-10 items-center justify-center rounded-full text-[#3B2F1E] transition hover:bg-[#F26A0F]/10"
    >
      <BagIcon />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F26A0F] px-1 text-[11px] font-semibold text-white"
        >
          {count}
        </span>
      )}
    </button>
  );
}
