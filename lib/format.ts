// lib/format.ts
export const formatPrice = (n: number) => `₹ ${n.toLocaleString("en-IN")}`;

// fill("Save {percent}%", { percent: 10 }) -> "Save 10%"
export function fill(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(vars[key] ?? ""),
  );
}
