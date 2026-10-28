// components/admin/DeleteProductButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { adminApi, getErrorMessage } from "@/lib/adminApi";

export default function DeleteProductButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();

  async function remove() {
    if (!confirm(`Delete "${name}"? Its images will be removed too.`)) return;
    try {
      await adminApi.delete(`/products/${id}`);
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
