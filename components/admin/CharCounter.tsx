// components/admin/CharCounter.tsx
import { lengthState } from "@/lib/productRules";

const COLORS = {
  empty: "text-neutral-500",
  short: "text-amber-600",
  ok: "text-green-700",
  long: "text-red-600",
};

/** "42/60" counter: amber when too short, red when too long, plus any field error. */
export default function CharCounter({
  length,
  min = 0,
  max,
  error,
  hint,
}: {
  length: number;
  min?: number;
  max: number;
  error?: string;
  hint?: string;
}) {
  const state = lengthState(length, min, max);
  return (
    <span className="mt-1 flex justify-between gap-3 text-xs font-normal">
      <span className={error ? "text-red-600" : "text-neutral-500"}>
        {error ?? hint}
      </span>
      <span className={`shrink-0 tabular-nums ${COLORS[state]}`}>
        {length}/{max}
        {state === "short" && ` (min ${min})`}
      </span>
    </span>
  );
}
