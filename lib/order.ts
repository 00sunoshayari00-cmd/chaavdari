// lib/order.ts  (pure, safe for client components)
import { fill, formatPrice } from "./format";

export interface OrderLine {
  name: string;
  price: number;
  qty: number;
  url: string;
}

export interface OrderLabels {
  greeting: string;
  total: string;
  discount: string; // contains {percent}
  afterDiscount: string;
  links: string;
}

export function calcTotals(
  lines: OrderLine[],
  discountPercent: number,
  discountMinAmount: number,
) {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const eligible = discountPercent > 0 && subtotal >= discountMinAmount;
  const discount = eligible
    ? Math.round((subtotal * discountPercent) / 100)
    : 0;
  return { subtotal, discount, total: subtotal - discount };
}

export function buildOrderMessage(
  lines: OrderLine[],
  totals: ReturnType<typeof calcTotals>,
  labels: OrderLabels,
  discountPercent: number,
) {
  const many = lines.length > 1;

  const items = lines.map(
    (l, i) =>
      `${many ? `${i + 1}. ` : ""}${l.name}${l.qty > 1 ? ` x${l.qty}` : ""} - ${formatPrice(l.price * l.qty)}`,
  );

  const parts = [
    labels.greeting,
    "",
    ...items,
    "",
    `${labels.total}: ${formatPrice(totals.subtotal)}`,
  ];

  if (totals.discount > 0) {
    parts.push(
      `${fill(labels.discount, { percent: discountPercent })}: -${formatPrice(totals.discount)}`,
      `${labels.afterDiscount}: ${formatPrice(totals.total)}`,
    );
  }

  parts.push(
    "",
    `${labels.links}:`,
    ...lines.map((l, i) => (many ? `${i + 1}. ${l.url}` : l.url)),
  );
  return parts.join("\n");
}
