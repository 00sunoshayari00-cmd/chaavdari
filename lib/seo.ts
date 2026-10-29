// lib/seo.ts
import { htmlToText } from "./text";
import { SITE_URL } from "./site";

export const SITE_NAME = "Chaavdari";
export const LOCALES = ["en", "mr"] as const;
export const DEFAULT_LOCALE = "en";
export const THEME_COLOR = "#F26A0F";
export const LOGO_URL =
  "https://res.cloudinary.com/mer50qza/image/upload/v1792846461/chaavdari-logo.png";

export function defaultMetaTitle(name: string) {
  if (!name) return "";
  const full = `${name} | ${SITE_NAME}`;
  return full.length <= 60 ? full : name.slice(0, 60);
}

export function defaultMetaDescription(descriptionHtml: string) {
  const text = htmlToText(descriptionHtml);
  return text.length <= 160 ? text : `${text.slice(0, 157).trimEnd()}…`;
}

export function ogLocale(lng: string) {
  return lng === "mr" ? "mr_IN" : "en_IN";
}

// canonical + hreflang links for a path that exists in every language.
// `path` is everything after the language, e.g. "" or "/products/chakli"
export function localeAlternates(lng: string, path = "") {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[l] = `/${l}${path}`;
  languages["x-default"] = `/${DEFAULT_LOCALE}${path}`;
  return { canonical: `/${lng}${path}`, languages };
}

// Business details Google shows in search results and the knowledge panel
export function organizationJsonLd(description: string) {
  const phone = process.env.CONTACT_PHONE_1;
  const email = process.env.CONTACT_EMAIL;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: LOGO_URL,
    description,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kapadgaon, Pali, Ratnagiri",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
    ...(phone || email
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            areaServed: "IN",
            availableLanguage: ["English", "Marathi"],
            ...(phone ? { telephone: `+91${phone}` } : {}),
            ...(email ? { email } : {}),
          },
        }
      : {}),
  };
}

// Safe to drop into <script type="application/ld+json">:
// "<" is escaped so the text can never close the script tag
export function jsonLdString(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
