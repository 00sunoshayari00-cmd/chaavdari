// lib/heroRules.ts
// Home page hero slides: limits shared by the admin form and the API, and the
// row → display shape used by both the website and the admin preview.
// Safe to import on the client.
import { pick } from "./localized";

export const HERO_LIMITS = {
  title: { max: 80 },
  description: { max: 220 },
  buttonLabel: { max: 30 },
  href: { max: 300 },
} as const;

// Upload kinds accepted by /api/admin/upload besides product images
export const HERO_IMAGES = {
  hero: {
    folder: "chaavdari/hero",
    minWidth: 1600,
    minHeight: 600,
    recommended: "2400 × 1000 px (12:5)",
  },
  "hero-mobile": {
    folder: "chaavdari/hero",
    minWidth: 720,
    minHeight: 900,
    recommended: "1080 × 1350 px (4:5)",
  },
} as const;

export type HeroImageKind = keyof typeof HERO_IMAGES;

// "/products/chakli", "#products", "https://...", "tel:...", "mailto:..."
export const HREF_PATTERN = /^(\/(?!\/)|#|https?:\/\/|tel:|mailto:)/;

/** Site paths get the current language in front: "/products/x" → "/mr/products/x". */
export function localizeHref(href: string, lng: string) {
  if (!href.startsWith("/") || /^\/(en|mr)(?=[/?#]|$)/.test(href)) return href;
  return href === "/" ? `/${lng}` : `/${lng}${href}`;
}

export const isExternal = (href: string) => /^https?:\/\//.test(href);

export type HeroTone = "dark" | "light";

/** The fields of a HeroSlide row the website needs. */
export interface HeroSlideFields {
  id: string;
  imageUrl: string;
  mobileImageUrl: string | null;
  altEn: string;
  altMr: string | null;
  showLogo: boolean;
  titleEn: string | null;
  titleMr: string | null;
  descriptionEn: string | null;
  descriptionMr: string | null;
  primaryLabelEn: string | null;
  primaryLabelMr: string | null;
  primaryHref: string | null;
  secondaryLabelEn: string | null;
  secondaryLabelMr: string | null;
  secondaryHref: string | null;
  linkHref: string | null;
  textTone: string;
}

export interface HeroButton {
  label: string;
  href: string;
  variant: "primary" | "secondary";
}

/** One slide in the visitor's language, ready to render. */
export interface HeroSlideData {
  id: string;
  image: string;
  mobileImage: string | null;
  alt: string;
  showLogo: boolean;
  title: string | null;
  description: string | null;
  buttons: HeroButton[];
  /** Whole-slide link, only when there are no buttons */
  href: string | null;
  tone: HeroTone;
}

export function toHeroSlideData(s: HeroSlideFields, lng: string): HeroSlideData {
  const buttons: HeroButton[] = [];
  const primary = s.primaryLabelEn && pick(lng, s.primaryLabelEn, s.primaryLabelMr);
  if (primary && s.primaryHref)
    buttons.push({ label: primary, href: localizeHref(s.primaryHref, lng), variant: "primary" });
  const secondary = s.secondaryLabelEn && pick(lng, s.secondaryLabelEn, s.secondaryLabelMr);
  if (secondary && s.secondaryHref)
    buttons.push({ label: secondary, href: localizeHref(s.secondaryHref, lng), variant: "secondary" });

  return {
    id: s.id,
    image: s.imageUrl,
    mobileImage: s.mobileImageUrl,
    alt: pick(lng, s.altEn, s.altMr),
    showLogo: s.showLogo,
    title: s.titleEn ? pick(lng, s.titleEn, s.titleMr) : null,
    description: s.descriptionEn ? pick(lng, s.descriptionEn, s.descriptionMr) : null,
    buttons,
    href: !buttons.length && s.linkHref ? localizeHref(s.linkHref, lng) : null,
    tone: s.textTone === "light" ? "light" : "dark",
  };
}

export const hasHeroText = (s: HeroSlideData) =>
  Boolean(s.showLogo || s.title || s.description || s.buttons.length);
