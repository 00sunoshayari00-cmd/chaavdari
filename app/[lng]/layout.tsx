// app/[lng]/layout.tsx
import type { Metadata } from "next";
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
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
            whatsappNumber={process.env.WHATSAPP_NUMBER ?? ""}
            labels={buildCartLabels(t)}
          />
        </I18nProvider>
      </body>
    </html>
  );
}
