// lib/localized.ts
// Marathi text when available on the Marathi site, otherwise English
export function pick<T>(lng: string, en: T, mr: T | null | undefined): T {
  return lng === "mr" && mr ? mr : en;
}
