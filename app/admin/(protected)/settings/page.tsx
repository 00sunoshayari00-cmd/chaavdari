// app/admin/(protected)/settings/page.tsx
import { db } from "@/lib/db";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function SettingsPage() {
  const settings = await db.settings.findUnique({ where: { id: 1 } });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Discount</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Applied automatically in the cart and in the WhatsApp order message.
      </p>
      <SettingsForm
        discountPercent={settings?.discountPercent ?? 0}
        discountMinAmount={settings?.discountMinAmount ?? 0}
      />
    </div>
  );
}
