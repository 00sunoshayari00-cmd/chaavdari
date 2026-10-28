// components/frontend/components/ProductPage/ProductActions.tsx
"use client";

import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa6";
import { fill, formatPrice } from "@/lib/format";
import { buildOrderMessage, calcTotals, type OrderLabels } from "@/lib/order";

const MAX_QTY = 10;

interface ProductActionsProps {
  name: string;
  weight: string;
  price: number;
  url: string; // absolute product link, goes into the WhatsApp message
  inStock: boolean;
  whatsappNumber: string;
  discountPercent: number;
  discountMinAmount: number;
  offer: string | null;
  messageLabels: OrderLabels;
  labels: {
    quantity: string;
    decrease: string;
    increase: string;
    order: string;
    outOfStock: string;
    total: string;
    discountLine: string; // contains {percent}
    afterDiscount: string;
  };
}

export default function ProductActions({
  name,
  weight,
  price,
  url,
  inStock,
  whatsappNumber,
  discountPercent,
  discountMinAmount,
  offer,
  messageLabels,
  labels,
}: ProductActionsProps) {
  const [qty, setQty] = useState(1);

  const lines = [{ name: `${name} (${weight})`, price, qty, url }];
  const totals = calcTotals(lines, discountPercent, discountMinAmount);
  const message = buildOrderMessage(
    lines,
    totals,
    messageLabels,
    discountPercent,
  );
  const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  const canOrder = inStock && Boolean(whatsappNumber);

  return (
    <div className="space-y-4">
      {inStock && (
        <div className="flex items-center gap-4">
          <span id="qty-label" className="text-sm font-medium text-[#3B2F1E]">
            {labels.quantity}
          </span>
          <div
            role="group"
            aria-labelledby="qty-label"
            className="flex items-center rounded-full border border-[#F26A0F]/40 bg-white"
          >
            <button
              type="button"
              aria-label={labels.decrease}
              disabled={qty <= 1}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="size-10 text-lg disabled:opacity-30"
            >
              −
            </button>
            <output
              aria-live="polite"
              className="w-8 text-center font-semibold"
            >
              {qty}
            </output>
            <button
              type="button"
              aria-label={labels.increase}
              disabled={qty >= MAX_QTY}
              onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
              className="size-10 text-lg disabled:opacity-30"
            >
              +
            </button>
          </div>
        </div>
      )}

      {inStock && (
        <dl className="rounded-xl border border-[#FBE9D0] bg-white p-4 text-sm">
          <div className="flex justify-between">
            <dt>{labels.total}</dt>
            <dd className="font-semibold">{formatPrice(totals.subtotal)}</dd>
          </div>
          {totals.discount > 0 && (
            <>
              <div className="mt-1 flex justify-between text-green-700">
                <dt>
                  {fill(labels.discountLine, { percent: discountPercent })}
                </dt>
                <dd>-{formatPrice(totals.discount)}</dd>
              </div>
              <div className="mt-2 flex justify-between border-t border-[#FBE9D0] pt-2 text-base">
                <dt className="font-semibold">{labels.afterDiscount}</dt>
                <dd className="font-bold text-red-600">
                  {formatPrice(totals.total)}
                </dd>
              </div>
            </>
          )}
        </dl>
      )}

      {offer && inStock && (
        <p className="text-sm font-medium text-[#0A6B1C]">{offer}</p>
      )}

      {canOrder ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#F5841F] to-[#E8700A] py-3.5 text-base font-semibold text-white transition hover:brightness-110"
        >
          <FaWhatsapp className="text-xl" aria-hidden="true" />
          {labels.order}
        </a>
      ) : (
        <button
          type="button"
          disabled
          className="w-full cursor-not-allowed rounded-full bg-neutral-300 py-3.5 text-base font-semibold text-neutral-600"
        >
          {inStock ? labels.order : labels.outOfStock}
        </button>
      )}

      {/* "Add to cart" goes here when we build the cart */}
    </div>
  );
}
