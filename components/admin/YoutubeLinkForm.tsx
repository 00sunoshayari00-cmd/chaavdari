// components/admin/YoutubeLinkForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi, getErrorMessage } from "@/lib/adminApi";
import { inputClass, labelClass, primaryBtn } from "./styles";

export default function YoutubeLinkForm({ initial }: { initial: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await adminApi.put("/settings/youtube", { youtubeUrl: value });
      setMessage({ ok: true, text: "Saved." });
      router.refresh();
    } catch (err) {
      setMessage({ ok: false, text: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mt-6 max-w-2xl space-y-3 rounded-xl bg-white p-5 shadow-sm"
    >
      <label className={labelClass}>
        YouTube channel link
        <input
          className={inputClass}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://www.youtube.com/@yourchannel"
        />
        <span className="mt-1 block text-xs font-normal text-neutral-500">
          The &ldquo;View all reviews&rdquo; button on the home page opens this link. Leave
          it empty to hide the button.
        </span>
      </label>
      {message && (
        <p
          role="alert"
          className={
            message.ok ? "text-sm text-green-700" : "text-sm text-red-600"
          }
        >
          {message.text}
        </p>
      )}
      <button type="submit" disabled={saving} className={primaryBtn}>
        {saving ? "Saving..." : "Save link"}
      </button>
    </form>
  );
}
