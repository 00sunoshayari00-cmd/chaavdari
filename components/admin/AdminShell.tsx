// components/admin/AdminShell.tsx
"use client";

import { useCallback, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar/Sidebar";
import {
  sidebarBrand,
  sidebarSections,
  type SidebarLink,
  type SidebarUser,
} from "./Sidebar/sidebarLinks";

const ACCENT = "#F26A0F";

/** The link whose href is the longest match for the current path. */
function activeIdFor(pathname: string) {
  let best: { id: string; length: number } | undefined;
  for (const section of sidebarSections)
    for (const item of section.items)
      for (const link of [item, ...(item.children ?? [])]) {
        const href = link.href;
        if (!href || !href.startsWith("/admin")) continue;
        const matches = pathname === href || pathname.startsWith(`${href}/`);
        if (matches && (!best || href.length > best.length))
          best = { id: link.id, length: href.length };
      }
  return best?.id;
}

interface AdminShellProps {
  user: SidebarUser;
  logoutAction: () => Promise<void>;
  children: React.ReactNode;
}

export default function AdminShell({
  user,
  logoutAction,
  children,
}: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, startTransition] = useTransition();

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Admin links go through the Next router; the website link loads normally
  const navigate = (
    link: SidebarLink,
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    const href = link.href;
    if (!href?.startsWith("/admin")) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0)
      return; // let the browser open a new tab
    event.preventDefault();
    router.push(href);
  };

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar
        sections={sidebarSections}
        brand={sidebarBrand}
        user={user}
        accentColor={ACCENT}
        activeId={activeIdFor(pathname)}
        onNavigate={navigate}
        mobileOpen={mobileOpen}
        onMobileClose={closeMobile}
        onSettings={() => router.push("/admin/settings")}
        onLogout={() => startTransition(() => logoutAction())}
      />

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-white px-4 py-3 md:hidden">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-1.5 hover:bg-neutral-100"
          >
            <Menu className="size-5" />
          </button>
          <span className="font-semibold">
            {sidebarBrand.name}
            {sidebarBrand.suffix}
          </span>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
