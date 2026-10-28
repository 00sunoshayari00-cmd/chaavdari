// components/admin/SettingsForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi, getErrorMessage } from "@/lib/adminApi";
import { inputClass, labelClass, primaryBtn } from "./styles";

interface SettingsFormProps {
  discountPercent: number;
  discountMinAmount: number;
}

export default function SettingsForm({
  discountPercent,
  discountMinAmount,
}: SettingsFormProps) {
  const router = useRouter();
  const [percent, setPercent] = useState(String(discountPercent));
  const [minAmount, setMinAmount] = useState(String(discountMinAmount));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await adminApi.put("/settings", {
        discountPercent: Number(percent),
        discountMinAmount: Number(minAmount),
      });
      setMessage({ type: "ok", text: "Saved." });
      router.refresh();
    } catch (err) {
      setMessage({ type: "error", text: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  const p = Number(percent);
  const m = Number(minAmount);
  const preview =
    p > 0
      ? `${p}% off ${m > 0 ? `orders of ₹${m} or more` : "every order"}`
      : "No discount";

  return (
    <form
      onSubmit={submit}
      className="mt-6 max-w-md space-y-4 rounded-xl bg-white p-5 shadow-sm"
    >
      <label className={labelClass}>
        Discount (%)
        <input
          type="number"
          min={0}
          max={90}
          step={1}
          className={inputClass}
          value={percent}
          onChange={(e) => setPercent(e.target.value)}
        />
      </label>

      <label className={labelClass}>
        Minimum order amount (₹)
        <input
          type="number"
          min={0}
          step={1}
          className={inputClass}
          value={minAmount}
          onChange={(e) => setMinAmount(e.target.value)}
        />
        <span className="mt-1 block text-xs font-normal text-neutral-500">
          Use 0 to apply the discount to every order.
        </span>
      </label>

      <p className="rounded-md bg-neutral-50 p-3 text-sm">
        Customers will get: <strong>{preview}</strong>
      </p>

      {message && (
        <p
          role="alert"
          className={
            message.type === "ok"
              ? "text-sm text-green-700"
              : "text-sm text-red-600"
          }
        >
          {message.text}
        </p>
      )}

      <button type="submit" disabled={saving} className={primaryBtn}>
        {saving ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
