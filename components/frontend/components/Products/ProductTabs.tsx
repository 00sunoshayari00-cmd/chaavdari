"use client";

import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

interface Tab {
  id: string;
  label: string;
  content: ReactNode; // rendered on the server, only shown or hidden here
}

export default function ProductTabs({
  tabs,
  ariaLabel,
}: {
  tabs: Tab[];
  ariaLabel: string;
}) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  const uid = useId();
  const buttons = useRef<Record<string, HTMLButtonElement | null>>({});

  const goTo = (index: number) => {
    const next = tabs[(index + tabs.length) % tabs.length];
    setActive(next.id);
    buttons.current[next.id]?.focus();
  };

  function onKeyDown(e: KeyboardEvent, index: number) {
    const keys: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: tabs.length - 1,
    };
    if (e.key in keys) {
      e.preventDefault();
      goTo(keys[e.key]);
    }
  }

  return (
    <div>
      <div
        id="categories"
        role="tablist"
        aria-label={ariaLabel}
        className="flex scroll-mt-28 flex-wrap justify-center gap-3"
      >
        {tabs.map((tab, i) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                buttons.current[tab.id] = el;
              }}
              type="button"
              role="tab"
              id={`${uid}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${uid}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`h-9 min-w-25 rounded-full px-6 text-xs font-semibold transition ${
                selected
                  ? "bg-linear-to-b from-[#F5841F] to-[#E8700A] text-white"
                  : "border border-[#F26A0F]/70 text-black hover:bg-[#F26A0F]/10"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-10">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`${uid}-panel-${tab.id}`}
            aria-labelledby={`${uid}-tab-${tab.id}`}
            hidden={tab.id !== active}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
