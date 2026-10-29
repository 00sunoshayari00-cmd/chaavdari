"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { BagIcon } from "./icons";

interface CardAddButtonProps {
  slug: string;
  label: string;
  fullLabel: string;
}

export default function CardAddButton({
  slug,
  label,
  fullLabel,
}: CardAddButtonProps) {
  const add = useCartStore((s) => s.add);
  const open = useCartStore((s) => s.open);
  const [full, setFull] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={label}
        title={full ? fullLabel : label}
        onClick={() => {
          const ok = add(slug, 1);
          setFull(!ok);
          if (ok) open(); // the sidebar opening is the "added" feedback
        }}
        // relative z-10 keeps this button above the card's full-size link
        className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition ${
          full
            ? "border-red-500 text-red-600"
            : "border-[#F26A0F] text-[#E0700F] hover:bg-[#F26A0F]/10"
        }`}
      >
        <BagIcon size={20} />
      </button>
      {full && (
        <p role="alert" className="sr-only">
          {fullLabel}
        </p>
      )}
    </>
  );
}
