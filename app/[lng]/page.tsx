import type { Metadata } from "next";
import { getT } from "@/i18n.server";
import LanguageSwitcher from "@/components/frontend/components/LanguageSwitcher";
import Counter from "@/components/frontend/components/Counter";
import OurOfferings from "@/components/frontend/components/OurOfferings/OurOfferings";
import OurProducts from "@/components/frontend/components/Products/OurProducts";
import Journey from "@/components/frontend/components/Journey/Journey";
import Story from "@/components/frontend/components/Story/Story";
import OrderOnWhatsapp from "@/components/frontend/components/OrderOnWhatsapp/OrderOnWhatsapp";
import OurOrigin from "@/components/frontend/components/OurOrigin/OurOrigin";
import Highlights from "@/components/frontend/components/Highlights/Highlights";
import InstagramFollow from "@/components/frontend/components/InstagramCarousel/InstagramFollow";
import { getCatalog } from "@/lib/products";
import { pick } from "@/lib/localized";
import { SITE_URL } from "@/lib/site";
import {
  SITE_NAME,
  jsonLdString,
  localeAlternates,
  ogLocale,
  organizationJsonLd,
} from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lng: string }>;
}): Promise<Metadata> {
  const { lng } = await params;
  const { t } = await getT();
  const title = t("meta.title");
  const description = t("meta.description");

  return {
    title: { absolute: title },
    description,
    alternates: localeAlternates(lng),
    openGraph: {
      type: "website",
      title,
      description,
      url: `/${lng}`,
      siteName: SITE_NAME,
      locale: ogLocale(lng),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;
  const [{ t }, catalog] = await Promise.all([getT(), getCatalog()]);

  const homeUrl = `${SITE_URL}/${lng}`;
  const products = catalog
    .flatMap((c) => c.products)
    .filter((p) => !p.noindex);

  /* ----- structured data for Google ----- */
  const jsonLd = [
    organizationJsonLd(t("meta.siteDescription")),
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: homeUrl,
      inLanguage: lng,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    ...(products.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: t("productsSection.title"),
            itemListElement: products.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: pick(lng, p.nameEn, p.nameMr),
              url: `${homeUrl}/products/${p.slug}`,
            })),
          },
        ]
      : []),
  ];

  return (
    <main className="mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      {/* <LanguageSwitcher /> */}
      <Highlights />
      <OurOfferings />
      <OurProducts lng={lng} />
      <Journey />
      <Story />
      <OrderOnWhatsapp />
      <OurOrigin />
      <InstagramFollow />
    </main>
  );
}
