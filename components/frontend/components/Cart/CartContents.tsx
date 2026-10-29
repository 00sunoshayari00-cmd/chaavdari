// CartContents.tsx  (shared by the sidebar and the cart page)
"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa6";
import { api } from "@/lib/api";
import { fill, formatPrice } from "@/lib/format";
import { pick } from "@/lib/localized";
import {
  buildOrderMessage,
  calcTotals,
  type OrderLabels,
  type OrderLine,
} from "@/lib/order";
import type { CartApiResponse } from "@/lib/cartTypes";
import type { CartLabels } from "@/lib/cartLabels";
import { useCartStore } from "@/store/cart";

// Very long wa.me links can fail, so past this size we copy the order instead
const MAX_WA_URL = 1900;

interface CartContentsProps {
  variant: "drawer" | "page";
  labels: CartLabels;
  lng: string;
  siteUrl: string;
  whatsappNumber: string;
  onNavigate?: () => void; // closes the sidebar when a link is clicked
}

export default function CartContents({
  variant,
  labels,
  lng,
  siteUrl,
  whatsappNumber,
  onNavigate,
}: CartContentsProps) {
  const items = useCartStore((s) => s.items);
  const hydrated = useCartStore((s) => s.hydrated);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const keepOnly = useCartStore((s) => s.keepOnly);
  const clear = useCartStore((s) => s.clear);

  const [data, setData] = useState<CartApiResponse | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [notice, setNotice] = useState(false);

  const slugKey = items.map((i) => i.slug).join(",");

  // Always load current prices and stock, never trust what was saved
  useEffect(() => {
    if (!hydrated || !slugKey) return;

    const controller = new AbortController();
    setFailed(false);

    api
      .get<CartApiResponse>("/cart", {
        params: { slugs: slugKey },
        signal: controller.signal,
      })
      .then(({ data: res }) => {
        setData(res);
        const wanted = slugKey.split(",");
        const found = new Set(res.products.map((p) => p.slug));
        const keep = wanted.filter((s) => found.has(s));
        if (keep.length !== wanted.length) {
          keepOnly(keep); // hidden or deleted products
          setNotice(true);
        }
      })
      .catch((err: unknown) => {
        if (!axios.isCancel(err)) setFailed(true);
      });

    return () => controller.abort();
  }, [hydrated, slugKey, attempt, keepOnly]);

  const bySlug = useMemo(
    () => new Map((data?.products ?? []).map((p) => [p.slug, p])),
    [data],
  );
  const rows = items.map((item) => ({ item, product: bySlug.get(item.slug) }));

  const orderLines: OrderLine[] = rows.flatMap(({ item, product }) =>
    product && product.inStock
      ? [
          {
            name: `${pick(lng, product.nameEn, product.nameMr)} (${product.weight})`,
            price: product.price,
            qty: item.qty,
            url: `${siteUrl}/${lng}/products/${item.slug}`,
          },
        ]
      : [],
  );

  const percent = data?.discountPercent ?? 0;
  const minAmount = data?.discountMinAmount ?? 0;
  const totals = calcTotals(orderLines, percent, minAmount);
  const remaining = minAmount - totals.subtotal;
  const showAddMore =
    percent > 0 && minAmount > 0 && totals.subtotal > 0 && remaining > 0;

  const messageLabels: OrderLabels = {
    greeting: labels.msgGreeting,
    total: labels.msgTotal,
    discount: labels.msgDiscount,
    afterDiscount: labels.msgAfterDiscount,
    links: orderLines.length > 1 ? labels.msgLinks : labels.msgLink,
  };
  const message = buildOrderMessage(orderLines, totals, messageLabels, percent);
  const fullHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  const chatOnlyHref = `https://wa.me/${whatsappNumber}`;
  const tooLong = fullHref.length > MAX_WA_URL;

  const isDrawer = variant === "drawer";

  /* ----- not loaded yet ----- */
  if (!hydrated) {
    return (
      <div className="space-y-4 p-5">
        <div className="h-20 animate-pulse rounded-lg bg-[#FDF1DE]" />
        <div className="h-20 animate-pulse rounded-lg bg-[#FDF1DE]" />
      </div>
    );
  }

  /* ----- empty ----- */
  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <span
          className="flex size-16 items-center justify-center rounded-full bg-[#FDF1DE] text-3xl"
          aria-hidden="true"
        >
          🛍️
        </span>
        <p className="mt-4 text-lg font-semibold">{labels.empty}</p>
        <p className="mt-1 max-w-xs text-sm text-[#7A6A55]">
          {labels.emptyHint}
        </p>
        <Link
          href={`/${lng}#products`}
          onClick={onNavigate}
          className="mt-6 rounded-full bg-gradient-to-b from-[#F5841F] to-[#E8700A] px-7 py-3 text-sm font-semibold text-white"
        >
          {labels.continueShopping}
        </Link>
      </div>
    );
  }

  return (
    <div className={isDrawer ? "flex min-h-0 flex-1 flex-col" : ""}>
      <div className={isDrawer ? "min-h-0 flex-1 overflow-y-auto px-5" : ""}>
        {notice && (
          <p
            role="status"
            className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800"
          >
            {labels.removedNotice}
          </p>
        )}

        {failed && (
          <div
            role="alert"
            className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700"
          >
            {labels.loadError}{" "}
            <button
              type="button"
              onClick={() => setAttempt((a) => a + 1)}
              className="font-semibold underline"
            >
              {labels.retry}
            </button>
          </div>
        )}

        <ul>
          {rows.map(({ item, product }) => {
            if (!product) {
              return failed ? null : (
                <li key={item.slug} className="border-b border-[#FBE9D0] py-4">
                  <div className="h-20 animate-pulse rounded-lg bg-[#FDF1DE]" />
                </li>
              );
            }

            const name = pick(lng, product.nameEn, product.nameMr);
            const alt = product.image
              ? pick(lng, product.image.altEn, product.image.altMr) || name
              : name;

            return (
              <li
                key={item.slug}
                className="flex gap-3 border-b border-[#FBE9D0] py-4"
              >
                <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-[#FBE9D0] bg-[#FDF1DE]">
                  {product.image && (
                    <Image
                      src={product.image.url}
                      alt={alt}
                      fill
                      sizes="80px"
                      className="object-contain"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/${lng}/products/${product.slug}`}
                      onClick={onNavigate}
                      className="font-semibold leading-snug hover:text-[#F26A0F]"
                    >
                      {name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(item.slug)}
                      aria-label={fill(labels.remove, { name })}
                      className="shrink-0 px-1 text-[#9A8B76] hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="mt-0.5 text-xs text-[#7A6A55]">
                    {product.weight} · {formatPrice(product.price)}
                  </p>

                  {product.inStock ? (
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-[#F26A0F]/40 bg-white">
                        <button
                          type="button"
                          aria-label={labels.decrease}
                          disabled={item.qty <= 1}
                          onClick={() => setQty(item.slug, item.qty - 1)}
                          className="size-8 disabled:opacity-30"
                        >
                          −
                        </button>
                        <output
                          aria-live="polite"
                          className="w-6 text-center text-sm font-semibold"
                        >
                          {item.qty}
                        </output>
                        <button
                          type="button"
                          aria-label={labels.increase}
                          onClick={() => setQty(item.slug, item.qty + 1)}
                          className="size-8 disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-semibold">
                        {formatPrice(product.price * item.qty)}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      {labels.outOfStock}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={clear}
          className="my-4 text-xs text-[#9A8B76] underline hover:text-red-600"
        >
          {labels.clear}
        </button>
      </div>

      {orderLines.length > 0 && (
        <div
          className={
            isDrawer
              ? "space-y-3 border-t border-[#FBE9D0] bg-white px-5 py-4"
              : "mt-2 space-y-3 border-t border-[#FBE9D0] pt-6"
          }
        >
          {showAddMore && (
            <p className="rounded-md bg-[#FDF1DE] p-2.5 text-sm font-medium text-[#8A4B08]">
              {fill(labels.addMore, {
                amount: formatPrice(remaining),
                percent,
              })}
            </p>
          )}
          {totals.discount > 0 && (
            <p className="text-sm font-medium text-green-700">
              {fill(labels.offerApplied, { percent })}
            </p>
          )}

          <dl className="text-sm">
            <div className="flex justify-between">
              <dt>{labels.subtotal}</dt>
              <dd className="font-semibold">{formatPrice(totals.subtotal)}</dd>
            </div>
            {totals.discount > 0 && (
              <>
                <div className="mt-1 flex justify-between text-green-700">
                  <dt>{fill(labels.discountLine, { percent })}</dt>
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

          {whatsappNumber ? (
            <a
              href={tooLong ? chatOnlyHref : fullHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (tooLong)
                  navigator.clipboard
                    ?.writeText(message)
                    .catch(() => undefined);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#F5841F] to-[#E8700A] py-3.5 text-base font-semibold text-white transition hover:brightness-110"
            >
              <FaWhatsapp className="text-xl" aria-hidden="true" />
              {labels.order}
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed rounded-full bg-neutral-300 py-3.5 font-semibold text-neutral-600"
            >
              {labels.order}
            </button>
          )}

          {tooLong && (
            <p className="text-xs text-[#7A6A55]">{labels.longHint}</p>
          )}

          {isDrawer && (
            <Link
              href={`/${lng}/cart`}
              onClick={onNavigate}
              className="block text-center text-sm font-medium text-[#E0700F] hover:underline"
            >
              {labels.viewCart}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
