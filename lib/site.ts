// lib/site.ts
export const SITE_URL = (
  process.env.SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

// wa.me needs the full international number with no "+", spaces or dashes.
// A plain 10-digit Indian number gets "91" added in front.
export const WHATSAPP_NUMBER = (() => {
  const digits = (process.env.WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
})();
