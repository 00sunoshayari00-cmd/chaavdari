// store/cart.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { CART_LIMITS } from "@/lib/cartTypes";

export const CART_STORAGE_KEY = "chaavdari-cart";

export interface CartItem {
  slug: string;
  qty: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  hydrated: boolean; // true once the saved cart was read from the browser
  add: (slug: string, qty?: number) => boolean; // false when the cart is full
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  keepOnly: (slugs: string[]) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
}

const clampQty = (n: number) =>
  Math.min(CART_LIMITS.maxQty, Math.max(1, Math.floor(n)));

// The saved cart is plain text in the browser, so never trust it blindly
function cleanItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: CartItem[] = [];

  for (const item of raw) {
    const slug = typeof item?.slug === "string" ? item.slug : "";
    const qty = Number(item?.qty);
    const validSlug =
      slug.length > 0 &&
      slug.length <= 60 &&
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
    if (!validSlug || !Number.isFinite(qty) || seen.has(slug)) continue;

    seen.add(slug);
    out.push({ slug, qty: clampQty(qty) });
    if (out.length >= CART_LIMITS.maxProducts) break;
  }
  return out;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      hydrated: false,

      add: (slug, qty = 1) => {
        const { items } = get();
        const existing = items.find((i) => i.slug === slug);
        if (!existing && items.length >= CART_LIMITS.maxProducts) return false;

        set({
          items: existing
            ? items.map((i) =>
                i.slug === slug ? { ...i, qty: clampQty(i.qty + qty) } : i,
              )
            : [...items, { slug, qty: clampQty(qty) }],
        });
        return true;
      },

      setQty: (slug, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.slug === slug ? { ...i, qty: clampQty(qty) } : i,
          ),
        })),

      remove: (slug) =>
        set((s) => ({ items: s.items.filter((i) => i.slug !== slug) })),

      keepOnly: (slugs) =>
        set((s) => ({ items: s.items.filter((i) => slugs.includes(i.slug)) })),

      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
      // Read the saved cart after the page has loaded, so the server HTML and the browser HTML match
      skipHydration: true,
      merge: (persisted, current) => ({
        ...current,
        items: cleanItems((persisted as Partial<CartState> | undefined)?.items),
      }),
    },
  ),
);
