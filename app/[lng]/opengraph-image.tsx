// app/[lng]/opengraph-image.tsx
// Share image for WhatsApp, Facebook, X etc. Product pages use their own banner
// photo instead when they have one.
import { ImageResponse } from "next/og";
import { LOGO_URL, SITE_NAME } from "@/lib/seo";

export const alt = `${SITE_NAME}: homemade Konkan snacks and sweets`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// English text only: the built-in font has no Devanagari glyphs
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#FBF6EA",
          border: "16px solid #F26A0F",
          gap: 28,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_URL} alt="" height={190} style={{ objectFit: "contain" }} />
        <div style={{ fontSize: 64, fontWeight: 700, color: "#E0700F" }}>
          Homemade Konkan Snacks & Sweets
        </div>
        <div style={{ fontSize: 34, color: "#3B2F1E" }}>
          Traditional recipes from Pali, Ratnagiri · Order on WhatsApp
        </div>
      </div>
    ),
    size,
  );
}
