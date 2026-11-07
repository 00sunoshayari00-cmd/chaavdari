// components/admin/DeleteHeroSlideButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { adminApi, getErrorMessage } from "@/lib/adminApi";

export default function DeleteHeroSlideButton({ id }: { id: string }) {
  const router = useRouter();

  async function remove() {
    if (!confirm("Delete this slide? Its images will be removed too.")) return;
    try {
      await adminApi.delete(`/hero/${id}`);
      router.refresh();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  return (
    <button
      type="button"
      onClick={remove}
      className="text-red-600 hover:underline"
    >
      Delete
    </button>
  );
}
