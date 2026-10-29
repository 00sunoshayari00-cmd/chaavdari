// components/frontend/components/Products/ProductCard.tsx
import Image from "next/image";
import Link from "next/link";
import { fill, formatPrice } from "@/lib/format";
import { pick } from "@/lib/localized";
import { bannerOf } from "@/lib/productImages";
import CardAddButton from "../Cart/CardAddButton";

export interface CardProduct {
  slug: string;
  nameEn: string;
  nameMr: string | null;
  summaryEn: string;
  summaryMr: string | null;
  price: number;
  weight: string;
  inStock: boolean;
  images: {
    url: string;
    altEn: string;
    altMr: string | null;
    isBanner: boolean;
  }[];
}

interface ProductCardProps {
  lng: string;
  orderLabel: string;
  product: CardProduct;
  // When left out, the card has no cart button and no stock badge
  cart?: { addTemplate: string; fullLabel: string; outOfStockLabel: string };
}

export default function ProductCard({
  lng,
  orderLabel,
  product,
  cart,
}: ProductCardProps) {
  const banner = bannerOf(product.images);
  const name = pick(lng, product.nameEn, product.nameMr);
  const summary = pick(lng, product.summaryEn, product.summaryMr);

  return (
    <article className="group relative flex h-full flex-col rounded-[20px] border border-[#FBE9D0] bg-white p-3 transition focus-within:ring-2 focus-within:ring-[#F26A0F]/40 hover:shadow-md">
      <div className="relative aspect-16/10 overflow-hidden rounded-xl border border-[#FBE9D0] bg-[#FDF1DE]">
        {banner && (
          <Image
            src={banner.url}
            alt={pick(lng, banner.altEn, banner.altMr) || name}
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 100vw"
            className={`object-contain transition group-hover:scale-[1.03] ${
              product.inStock ? "" : "opacity-60"
            }`}
          />
        )}
        {cart && !product.inStock && (
          <span className="absolute left-2 top-2 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
            {cart.outOfStockLabel}
          </span>
        )}
      </div>

      <h3 className="mt-4 text-xl font-semibold text-black">
        {/* after:inset-0 stretches this link over the whole card */}
        <Link
          href={`/${lng}/products/${product.slug}`}
          className="after:absolute after:inset-0"
        >
          {name}
        </Link>
      </h3>
      <p className="mt-1 line-clamp-2 text-sm text-[#555]">{summary}</p>
      <p className="mt-2 text-sm font-bold text-red-600">
        {formatPrice(product.price)} ({product.weight})
      </p>

      <div className="mt-auto flex items-center gap-2 pt-4">
        <span className="block flex-1 rounded-full bg-linear-to-b from-[#F5841F] to-[#E8700A] py-2.5 text-center text-sm font-semibold text-white">
          {orderLabel}
        </span>
        {cart && product.inStock && (
          <CardAddButton
            slug={product.slug}
            label={fill(cart.addTemplate, { name })}
            fullLabel={cart.fullLabel}
          />
        )}
      </div>
    </article>
  );
}
