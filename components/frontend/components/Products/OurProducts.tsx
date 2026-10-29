import SectionHeader from "@/components/frontend/common/SectionHeader";
import { getT } from "@/i18n.server";
import { CART_LIMITS } from "@/lib/cartTypes";
import { fill } from "@/lib/format";
import { pick } from "@/lib/localized";
import { getCatalog } from "@/lib/products";
import ProductCard from "./ProductCard";
import ProductTabs from "./ProductTabs";

async function OurProducts({ lng }: { lng: string }) {
  const [{ t }, catalog] = await Promise.all([getT(), getCatalog()]);

  const cart = {
    addTemplate: t("productsSection.addToCart"),
    fullLabel: fill(t("cart.full"), { max: CART_LIMITS.maxProducts }),
    outOfStockLabel: t("productsSection.outOfStock"),
  };

  const tabs = catalog.map((category) => ({
    id: category.slug,
    label: pick(lng, category.nameEn, category.nameMr),
    content: (
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {category.products.map((product) => (
          <li key={product.id}>
            <ProductCard
              lng={lng}
              orderLabel={t("productPage.orderNow")}
              product={product}
              cart={cart}
            />
          </li>
        ))}
      </ul>
    ),
  }));

  return (
    <section
      id="products"
      className="scroll-mt-20 bg-[#FBF6EA] px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-300">
        <SectionHeader
          title={t("productsSection.title")}
          className="text-center text-[#E0700F]"
        />

        <div className="mt-8">
          {tabs.length > 0 ? (
            <ProductTabs
              tabs={tabs}
              ariaLabel={t("productsSection.tabsLabel")}
            />
          ) : (
            <p className="py-10 text-center text-[#7A6A55]">
              {t("productsSection.empty")}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default OurProducts;
