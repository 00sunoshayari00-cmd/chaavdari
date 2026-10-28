import type { Metadata } from "next";
import { getT } from "@/i18n.server";
import LanguageSwitcher from "@/components/frontend/components/LanguageSwitcher";
import Counter from "@/components/frontend/components/Counter";
import OurOfferings from "@/components/frontend/components/OurOfferings/OurOfferings";
import Journey from "@/components/frontend/components/Journey/Journey";
import Story from "@/components/frontend/components/Story/Story";
import OrderOnWhatsapp from "@/components/frontend/components/OrderOnWhatsapp/OrderOnWhatsapp";
import OurOrigin from "@/components/frontend/components/OurOrigin/OurOrigin";
import Highlights from "@/components/frontend/components/Highlights/Highlights";
import InstagramFollow from "@/components/frontend/components/InstagramCarousel/InstagramFollow";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      languages: { en: "/en", mr: "/mr" }, // hreflang tags for SEO
    },
  };
}

export default async function Home() {
  const { t } = await getT();

  return (
    <main className="mx-auto">
      <LanguageSwitcher />
      <Highlights />
      <OurOfferings />
      <Journey />
      <Story />
      <OrderOnWhatsapp />
      <OurOrigin />
      <InstagramFollow />
    </main>
  );
}
