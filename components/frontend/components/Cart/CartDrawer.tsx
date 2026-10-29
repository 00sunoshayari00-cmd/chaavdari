// CartDrawer.tsx  (the sidebar)
"use client";

import { useEffect, useRef } from "react";
import { useCartStore } from "@/store/cart";
import type { CartLabels } from "@/lib/cartLabels";
import CartContents from "./CartContents";

interface CartDrawerProps {
  labels: CartLabels;
  lng: string;
  siteUrl: string;
  whatsappNumber: string;
}

export default function CartDrawer({
  labels,
  lng,
  siteUrl,
  whatsappNumber,
}: CartDrawerProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.close);
  const count = useCartStore((s) =>
    s.hydrated ? s.items.reduce((sum, i) => sum + i.qty, 0) : 0,
  );

  // A native <dialog> gives us focus trapping and the Escape key for free
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();

    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <dialog
      ref={ref}
      aria-label={labels.title}
      onClose={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close(); // click on the dark backdrop
      }}
      className="m-0 ml-auto h-dvh max-h-none w-full max-w-md border-0 bg-[#FBF6EA] p-0 text-[#3B2F1E] shadow-2xl backdrop:bg-black/50 open:flex open:flex-col"
    >
      <div className="flex items-center justify-between border-b border-[#FBE9D0] px-5 py-4">
        <h2 className="font-berkshire text-2xl text-[#E0700F]">
          {labels.title}
          {count > 0 && (
            <span className="ml-2 font-sans text-base text-[#7A6A55]">
              ({count})
            </span>
          )}
        </h2>
        <button
          type="button"
          onClick={close}
          aria-label={labels.close}
          className="flex size-9 items-center justify-center rounded-full hover:bg-black/5"
        >
          ✕
        </button>
      </div>

      {/* Only mounted while open, so prices are fetched fresh every time */}
      {isOpen && (
        <CartContents
          variant="drawer"
          labels={labels}
          lng={lng}
          siteUrl={siteUrl}
          whatsappNumber={whatsappNumber}
          onNavigate={close}
        />
      )}
    </dialog>
  );
}
