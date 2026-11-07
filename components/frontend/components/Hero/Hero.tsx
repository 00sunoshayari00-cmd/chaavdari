// components/frontend/components/Hero/Hero.tsx
import { getT } from "@/i18n.server";
import { getHeroSlides } from "@/lib/hero";
import { toHeroSlideData } from "@/lib/heroRules";
import HeroSlider from "./HeroSlider";

// Slides are managed in the admin under Hero slides
async function Hero({ lng }: { lng: string }) {
  const [{ t }, rows] = await Promise.all([getT(), getHeroSlides()]);
  const slides = rows.map((row) => toHeroSlideData(row, lng));

  // The first slide's title is the page heading; keep one for image-only slides
  const heading = !slides[0]?.title && (
    <h1 className="sr-only">{t("hero.heading")}</h1>
  );
  if (!slides.length) return heading;

  return (
    <>
      {heading}
      <HeroSlider
        slides={slides}
        labels={{
          region: t("hero.region"),
          prev: t("hero.prev"),
          next: t("hero.next"),
          slide: t("hero.slide"),
          goTo: t("hero.goTo"),
        }}
      />
    </>
  );
}

export default Hero;
