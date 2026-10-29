// app/[lng]/cart/page.tsx
import type { Metadata } from "next";
import { getT } from "@/i18n.server";
import CartContents from "@/components/frontend/components/Cart/CartContents";
import { buildCartLabels } from "@/lib/cartLabels";
import { SITE_URL } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: t("cart.title"),
    robots: { index: false, follow: false }, // a private page, keep it out of Google
  };
}

export default async function CartPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;
  const { t } = await getT();

  return (
    <main className="bg-[#FBF6EA] px-4 pb-24 pt-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-berkshire text-3xl text-[#E0700F] sm:text-4xl">
          {t("cart.title")}
        </h1>

        <div className="mt-6 rounded-[20px] border border-[#FBE9D0] bg-white p-4 sm:p-6">
          <CartContents
            variant="page"
            labels={buildCartLabels(t)}
            lng={lng}
            siteUrl={SITE_URL}
            whatsappNumber={process.env.WHATSAPP_NUMBER ?? ""}
          />
        </div>
      </div>
    </main>
  );
}
