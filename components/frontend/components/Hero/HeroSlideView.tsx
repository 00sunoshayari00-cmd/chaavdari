// components/frontend/components/Hero/HeroSlideView.tsx
// One hero slide. Used by the home page slideshow and the admin preview.
// Layout uses container queries (@3xl = 768px wide), so the admin preview
// shows the phone layout inside a narrow box.
import Image, { getImageProps } from "next/image";
import { ArrowRight, CirclePlay } from "lucide-react";
import { LOGO_URL } from "@/lib/seo";
import { cloudinaryLoader } from "@/lib/cloudinaryImage";
import {
  hasHeroText,
  isExternal,
  type HeroSlideData,
} from "@/lib/heroRules";

interface HeroSlideViewProps {
  slide: HeroSlideData;
  /** First slide: loads first, and its title is the page's h1 */
  first?: boolean;
  /**
   * "tall" (4:5) on phones when any slide has text or a mobile image,
   * otherwise "wide" (12:5) so image-only slides are not letterboxed
   */
  mobileFrame?: "tall" | "wide";
  /** Admin preview: show this image instead of letting the screen width pick */
  previewDevice?: "desktop" | "mobile";
}

const TONES = {
  dark: {
    overlay:
      "bg-linear-to-b from-white/85 via-white/45 to-transparent @3xl:bg-linear-to-r @3xl:from-white/80 @3xl:via-white/35",
    title: "text-[#1E4D2B]",
    text: "text-neutral-700",
    secondary: "border-[#1E4D2B] text-[#1E4D2B] bg-white/50 hover:bg-white/80",
  },
  light: {
    overlay:
      "bg-linear-to-b from-black/65 via-black/30 to-transparent @3xl:bg-linear-to-r @3xl:from-black/60 @3xl:via-black/25",
    title: "text-white",
    text: "text-white/90",
    secondary: "border-white text-white bg-black/20 hover:bg-black/35",
  },
};

function SlideImage({
  slide,
  first,
  fit,
  previewDevice,
}: Pick<HeroSlideViewProps, "slide" | "first" | "previewDevice"> & {
  fit: string;
}) {
  const className = `object-cover ${fit}`;

  if (previewDevice) {
    const src =
      previewDevice === "mobile" && slide.mobileImage
        ? slide.mobileImage
        : slide.image;
    return (
      <Image
        src={src}
        alt={slide.alt}
        fill
        sizes="100vw"
        loader={cloudinaryLoader}
        className={className}
      />
    );
  }

  // Art direction: the browser downloads only the image for its screen size
  const common = {
    alt: slide.alt,
    fill: true,
    sizes: "100vw",
    loader: cloudinaryLoader,
    loading: "eager" as const, // off-screen slides would otherwise pop in late
    fetchPriority: first ? ("high" as const) : undefined,
  };
  const desktop = getImageProps({ ...common, src: slide.image }).props;
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- alt is in the props
  if (!slide.mobileImage) return <img {...desktop} className={className} />;

  const { srcSet: mobileSrcSet, ...mobile } = getImageProps({
    ...common,
    src: slide.mobileImage,
  }).props;
  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={desktop.srcSet} sizes="100vw" />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt is in the props */}
      <img {...mobile} srcSet={mobileSrcSet} className={className} />
    </picture>
  );
}

export default function HeroSlideView({
  slide,
  first = false,
  mobileFrame = "tall",
  previewDevice,
}: HeroSlideViewProps) {
  const withText = hasHeroText(slide);
  const tone = TONES[slide.tone];
  const Title = first ? "h1" : "h2";

  // Image-only slide without a phone image in a tall frame: show it whole
  const fit =
    mobileFrame === "tall" && !withText && !slide.mobileImage
      ? "object-contain @3xl:object-cover"
      : "";

  return (
    <div className="@container relative w-full">
      <div
        className={`relative w-full overflow-hidden bg-[#FFF7EE] ${
          mobileFrame === "tall" ? "aspect-4/5" : "aspect-12/5"
        } @3xl:aspect-12/5`}
      >
        <SlideImage
          slide={slide}
          first={first}
          fit={fit}
          previewDevice={previewDevice}
        />

        {withText && (
          <>
            <div aria-hidden="true" className={`absolute inset-0 ${tone.overlay}`} />

            <div className="absolute inset-0 mx-auto flex w-full max-w-[1360px] flex-col px-5 pt-8 @3xl:justify-center @3xl:px-10 @3xl:pt-0">
              <div className="max-w-xl @3xl:max-w-[48%]">
                {slide.showLogo && (
                  <Image
                    src={LOGO_URL}
                    alt={slide.title ? "" : "Chaavdari"}
                    width={1000}
                    height={293}
                    className="h-12 w-auto @3xl:h-14 @5xl:h-20 @7xl:h-24"
                  />
                )}

                {slide.title && (
                  <Title
                    className={`mt-3 text-[28px] font-bold leading-tight @3xl:text-3xl @5xl:mt-4 @5xl:text-[42px] @7xl:text-5xl ${tone.title}`}
                  >
                    {slide.title}
                  </Title>
                )}

                {slide.description && (
                  <p
                    className={`mt-3 text-sm leading-relaxed @5xl:mt-4 @5xl:text-base @7xl:text-lg ${tone.text}`}
                  >
                    {slide.description}
                  </p>
                )}

                {slide.buttons.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-3 @5xl:mt-8 @5xl:gap-4">
                    {slide.buttons.map((b) => (
                      <a
                        key={b.variant}
                        href={b.href}
                        {...(isExternal(b.href)
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className={
                          b.variant === "primary"
                            ? "inline-flex items-center gap-2 rounded-full bg-linear-to-b from-[#ed8926] to-[#ed6d11] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 @5xl:px-8 @5xl:py-3.5 @5xl:text-base"
                            : `inline-flex items-center gap-2 rounded-full border-[1.5px] px-6 py-3 text-sm font-semibold backdrop-blur-sm transition @5xl:px-8 @5xl:py-3.5 @5xl:text-base ${tone.secondary}`
                        }
                      >
                        {b.label}
                        {b.variant === "primary" ? (
                          <ArrowRight aria-hidden="true" className="size-4" />
                        ) : (
                          <CirclePlay aria-hidden="true" className="size-4" />
                        )}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {slide.href && (
          <a
            href={slide.href}
            aria-label={slide.alt}
            {...(isExternal(slide.href)
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="absolute inset-0"
          />
        )}
      </div>
    </div>
  );
}
