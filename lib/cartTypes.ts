// lib/cartTypes.ts
export const CART_LIMITS = { maxQty: 10, maxProducts: 10 } as const;

export interface CartProduct {
  slug: string;
  nameEn: string;
  nameMr: string | null;
  price: number;
  mrp: number | null;
  weight: string;
  inStock: boolean;
  image: { url: string; altEn: string; altMr: string | null } | null;
}

export interface CartApiResponse {
  products: CartProduct[];
  discountPercent: number;
  discountMinAmount: number;
}
