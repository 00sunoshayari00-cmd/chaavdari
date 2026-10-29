// app/manifest.ts -> /manifest.webmanifest
import type { MetadataRoute } from "next";
import { LOGO_URL, SITE_NAME, THEME_COLOR } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME}: Homemade Konkan Snacks & Sweets`,
    short_name: SITE_NAME,
    description:
      "Authentic homemade Konkan namkeen, sweets and baked treats from Pali, Ratnagiri.",
    start_url: "/",
    display: "standalone",
    background_color: "#FBF6EA",
    theme_color: THEME_COLOR,
    lang: "en",
    categories: ["food", "shopping"],
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { src: LOGO_URL, sizes: "any", type: "image/png" },
    ],
  };
}
