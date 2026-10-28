"use client";
import { useState } from "react";
import { useT } from "next-i18next/client";

export default function Counter() {
  const { t } = useT();
  const [clicks, setClicks] = useState(0);

  return (
    <button
      onClick={() => setClicks((c) => c + 1)}
      className="rounded bg-blue-600 px-4 py-2 text-white"
    >
      {t("counter.button", { value: clicks })}
    </button>
  );
}
