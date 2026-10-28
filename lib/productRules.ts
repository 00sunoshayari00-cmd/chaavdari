// lib/productRules.ts
// Limits shared by the admin form (counters, hints) and the API (zod).
// Safe to import on the client.

export const SITE_NAME = "Chaavdari";

export const LIMITS = {
  name: { min: 3, max: 80 },
  slug: { min: 3, max: 60 },
  sku: { min: 2, max: 40 },
  weight: { max: 30 },
  price: { min: 1, max: 100000 },
  summary: { min: 10, max: 140 },
  description: { min: 50, max: 5000, suggestedWords: 150 },
  ingredients: { max: 500 },
  shelfLife: { max: 60 },
  images: { min: 1, max: 8, maxBytes: 4 * 1024 * 1024, minSide: 600 },
  alt: { min: 5, max: 125 },
  metaTitle: { min: 10, max: 60 },
  metaDescription: { min: 70, max: 160 },
  keywords: { max: 10, min: 2, maxLength: 40 },
} as const;

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SKU_PATTERN = /^[A-Za-z0-9_-]+$/;

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

/** Plain text of the editor HTML, used for length rules and meta fallbacks. */
export function htmlToText(html: string) {
  return html
    .replace(/<\/(p|h2|h3|li)>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&[a-z#0-9]+;/gi, (m) => ENTITIES[m] ?? " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function wordCount(text: string) {
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

/** Lowercase, trim, drop empties and duplicates, keep order. */
export function normalizeKeywords(list: string[]) {
  const seen = new Set<string>();
  for (const raw of list) {
    const k = raw.trim().toLowerCase().replace(/\s+/g, " ");
    if (k) seen.add(k);
  }
  return [...seen];
}

export function defaultMetaTitle(name: string) {
  return `${name.trim()} | ${SITE_NAME}`;
}

/** First ~160 characters of the description, cut at a word boundary. */
export function defaultMetaDescription(descriptionHtml: string) {
  const text = htmlToText(descriptionHtml);
  const max = LIMITS.metaDescription.max;
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).trimEnd()}…`;
}

/** Counter colour: amber when too short, red when too long. */
export function lengthState(
  length: number,
  min: number,
  max: number,
): "empty" | "short" | "ok" | "long" {
  if (length === 0) return "empty";
  if (length < min) return "short";
  if (length > max) return "long";
  return "ok";
}
