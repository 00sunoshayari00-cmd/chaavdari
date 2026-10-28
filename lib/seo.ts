// lib/seo.ts
import { htmlToText } from "./text";

export const SITE_NAME = "Chaavdari";

export function defaultMetaTitle(name: string) {
  if (!name) return "";
  const full = `${name} | ${SITE_NAME}`;
  return full.length <= 60 ? full : name.slice(0, 60);
}

export function defaultMetaDescription(descriptionHtml: string) {
  const text = htmlToText(descriptionHtml);
  return text.length <= 160 ? text : `${text.slice(0, 157).trimEnd()}…`;
}
