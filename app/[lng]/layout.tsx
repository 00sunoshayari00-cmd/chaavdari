// app/[lng]/layout.tsx
import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import { Berkshire_Swash } from "next/font/google";
import { I18nProvider } from "next-i18next/client";
import { getT, getResources, generateI18nStaticParams } from "@/i18n.server";
import "../globals.css";
import Navbar from "@/components/frontend/common/Navbar/Navbar";
import Footer from "@/components/frontend/common/Footer/Footer";
import CartProvider from "@/components/frontend/components/Cart/CartProvider";
import CartDrawer from "@/components/frontend/components/Cart/CartDrawer";
import { buildCartLabels } from "@/lib/cartLabels";
import { SITE_URL, WHATSAPP_NUMBER } from "@/lib/site";
import { SITE_NAME, THEME_COLOR, LOGO_URL, ogLocale } from "@/lib/seo";

// Site-wide defaults; each page overrides title, description and canonical
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lng: string }>;
}): Promise<Metadata> {
  const { lng } = await params;
  const { t } = await getT();
  const description = t("meta.description");

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("meta.title"), template: `%s | ${SITE_NAME}` },
    description,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "food",
    formatDetection: { telephone: false, email: false, address: false },
    icons: { apple: LOGO_URL }, // app/favicon.ico is picked up automatically
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: ogLocale(lng),
      alternateLocale: lng === "mr" ? "en_IN" : "mr_IN",
      description,
    },
    twitter: { card: "summary_large_image", description },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    // Paste the codes from Google Search Console / Bing Webmaster Tools
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
      other: process.env.BING_SITE_VERIFICATION
        ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
        : undefined,
    },
  };
}

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
};

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  // Optional: Define a CSS variable name for Tailwind CSS
  variable: "--font-instrument-sans",
});

const berkshireSwash = Berkshire_Swash({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-berkshire-swash", // Optional: Use if you want to use Tailwind CSS variables
});

// Pre-renders /en and /mr at build time
export async function generateStaticParams() {
  return generateI18nStaticParams();
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;
  const { i18n, t } = await getT();
  const resources = getResources(i18n);

  return (
    <html
      lang={lng}
      className={`${instrumentSans.variable} ${berkshireSwash.variable}`}
    >
      <body className={instrumentSans.className}>
        <I18nProvider language={lng} resources={resources}>
          <CartProvider />
          <Navbar />
          {children}
          <Footer />
          <CartDrawer
            lng={lng}
            siteUrl={SITE_URL}
            whatsappNumber={WHATSAPP_NUMBER}
            labels={buildCartLabels(t)}
          />
        </I18nProvider>
      </body>
    </html>
  );
}
