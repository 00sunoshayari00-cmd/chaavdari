// lib/sanitizeDescription.ts
// Server only. Keeps just the formatting the product editor offers, so the
// stored HTML is safe to render on the public page.
import sanitizeHtml from "sanitize-html";

export function sanitizeDescription(html: string | null) {
  if (!html) return null;
  return sanitizeHtml(html, {
    allowedTags: ["p", "h2", "h3", "ul", "ol", "li", "strong", "em", "a", "br"],
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      b: "strong",
      i: "em",
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        const external = /^https?:\/\//i.test(href);
        const out: sanitizeHtml.Attributes = external
          ? { href, target: "_blank", rel: "noopener noreferrer" }
          : { href };
        return { tagName, attribs: out };
      },
    },
  }).trim();
}
