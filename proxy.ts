import { createProxy } from "next-i18next/proxy";
import i18nConfig from "./i18n.config";

export const proxy = createProxy(i18nConfig);

export const config = {
  // SEO files (sitemap, robots, manifest) must not get a language prefix
  matcher: [
    "/((?!api|admin|_next/static|_next/image|assets|favicon.ico|sw.js|site.webmanifest|manifest.webmanifest|sitemap.xml|robots.txt).*)",
  ],
};
