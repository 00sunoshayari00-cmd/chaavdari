// components/frontend/components/Products/ProductCard.tsx
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { pick } from "@/lib/localized";
import { bannerOf } from "@/lib/productImages";

export interface CardProduct {
  slug: string;
  nameEn: string;
  nameMr: string | null;
  summaryEn: string;
  summaryMr: string | null;
  price: number;
  weight: string;
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
}

export default function ProductCard({
  lng,
  orderLabel,
  product,
}: ProductCardProps) {
  const banner = bannerOf(product.images);
  const name = pick(lng, product.nameEn, product.nameMr);
  const summary = pick(lng, product.summaryEn, product.summaryMr);

  return (
    <article className="group relative flex flex-col rounded-[20px] border border-[#FBE9D0] bg-white p-3 transition hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[#FBE9D0] bg-[#FDF1DE]">
        {banner && (
          <Image
            src={banner.url}
            alt={pick(lng, banner.altEn, banner.altMr) || name}
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 100vw"
            className="object-contain transition group-hover:scale-[1.03]"
          />
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

      <span className="mt-4 block rounded-full bg-gradient-to-b from-[#F5841F] to-[#E8700A] py-2.5 text-center text-sm font-semibold text-white">
        {orderLabel}
      </span>
    </article>
  );
}
