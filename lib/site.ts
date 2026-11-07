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

// Official profiles: footer icons and the "sameAs" links Google reads
export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/chaavdari/",
  facebook: "https://www.facebook.com/profile.php?id=61594324092485",
  youtube: "https://www.youtube.com/@Chaavdari",
  pinterest: "https://www.pinterest.com/chaavdari/",
} as const;
