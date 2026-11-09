// components/admin/formParts.tsx
// Small form helpers shared by the video review and testimonial managers
import BaseCharCounter from "./CharCounter";
import { labelClass } from "./styles";

/** "42/60" counter for a text value */
export function CharCounter({
  value,
  min = 0,
  max,
}: {
  value: string;
  min?: number;
  max: number;
}) {
  return <BaseCharCounter length={value.trim().length} min={min} max={max} />;
}

/** Label wrapping an input, with an optional counter and hint underneath */
export function Field({
  label,
  hint,
  counter,
  children,
}: {
  label: string;
  hint?: string;
  counter?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className={labelClass}>
      {label}
      {children}
      {counter}
      {hint && (
        <span className="mt-1 block text-xs font-normal text-neutral-500">
          {hint}
        </span>
      )}
    </label>
  );
}
