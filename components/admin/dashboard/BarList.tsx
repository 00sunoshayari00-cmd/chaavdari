// components/admin/dashboard/BarList.tsx
// Horizontal bar chart in plain HTML: one series, every bar labelled with its value,
// so it reads as a table too and needs no legend.
import Link from "next/link";

export interface BarItem {
  id: string;
  label: string;
  value: number;
  note?: string; // small grey text after the value, e.g. "2 hidden"
  href?: string;
}

export default function BarList({
  items,
  unit,
  empty,
}: {
  items: BarItem[];
  unit: string; // "products", "orders"
  empty: string;
}) {
  if (items.length === 0 || items.every((i) => i.value === 0)) {
    return <p className="py-8 text-center text-sm text-neutral-500">{empty}</p>;
  }

  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <ul className="space-y-3.5">
      {items.map((item) => {
        const pct = (item.value / max) * 100;
        const tooltip = `${item.label}: ${item.value.toLocaleString("en-IN")} ${unit}${item.note ? ` (${item.note})` : ""}`;
        const label = item.href ? (
          <Link href={item.href} className="truncate hover:text-[#E0700F] hover:underline">
            {item.label}
          </Link>
        ) : (
          <span className="truncate">{item.label}</span>
        );

        return (
          <li key={item.id} title={tooltip} className="group">
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
              <span className="flex min-w-0 text-neutral-700">{label}</span>
              <span className="shrink-0 tabular-nums">
                <span className="font-semibold text-neutral-900">
                  {item.value.toLocaleString("en-IN")}
                </span>
                {item.note && (
                  <span className="ml-1.5 text-xs text-neutral-500">{item.note}</span>
                )}
              </span>
            </div>
            <div className="h-2 rounded-full bg-neutral-100">
              <div
                className="h-2 rounded-full bg-[#E0700F] transition-opacity group-hover:opacity-80"
                style={{ width: `${Math.max(pct, item.value > 0 ? 2 : 0)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
