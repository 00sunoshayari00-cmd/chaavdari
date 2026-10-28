"use client";
// components/admin/Sidebar/Sidebar.tsx
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type SyntheticEvent,
} from "react";
import {
  ChevronRight,
  ChevronsUpDown,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import type {
  SidebarBrand,
  SidebarItem,
  SidebarLink,
  SidebarSection,
  SidebarSubItem,
  SidebarUser,
} from "./sidebarLinks";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface SidebarProps {
  sections: SidebarSection[];
  brand: SidebarBrand;
  user?: SidebarUser;
  /** Any hex color. Drives active states, focus rings and the logo. */
  accentColor?: string;

  /** Controlled collapsed state (desktop). Omit to let the sidebar handle it. */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;

  /** Mobile drawer */
  mobileOpen?: boolean;
  onMobileClose?: () => void;

  /** Controlled active link id. Omit to let the sidebar handle it. */
  activeId?: string;
  defaultActiveId?: string;
  /** Fires on every link click. Plug your router in here. */
  onNavigate?: (
    link: SidebarLink,
    event: ReactMouseEvent<HTMLAnchorElement>,
  ) => void;

  /** Search button + Ctrl/⌘K shortcut */
  onSearch?: () => void;
  onProfile?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const isDesktop = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(min-width: 768px)").matches;
const isMac = () =>
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.userAgent);

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function findParentId(sections: SidebarSection[], id?: string) {
  if (!id) return undefined;
  for (const s of sections)
    for (const item of s.items)
      if (item.children?.some((c) => c.id === id)) return item.id;
  return undefined;
}

const firstLinkId = (sections: SidebarSection[]) => {
  const first = sections[0]?.items[0];
  return first?.children?.[0]?.id ?? first?.id;
};

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sb-accent)] focus-visible:ring-offset-0";

type RowState = {
  active?: boolean;
  parentActive?: boolean;
  disabled?: boolean;
  pressed?: boolean;
};

/** Classes for a top-level row, in every state */
function rowClass(
  { active, parentActive, disabled, pressed }: RowState,
  collapsed: boolean,
) {
  return cx(
    "group relative flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-[13.5px] font-medium",
    "transition-colors duration-150 motion-reduce:transition-none",
    focusRing,
    active && "bg-white/[0.07] text-white",
    !active && parentActive && "text-zinc-100",
    !active && parentActive && collapsed && "md:bg-white/[0.07]",
    !active &&
      !parentActive &&
      !disabled &&
      "cursor-pointer text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100",
    pressed && "bg-white/[0.06] text-zinc-100",
    disabled && "cursor-not-allowed text-zinc-600",
    collapsed && "md:mx-auto md:h-10 md:w-10 md:justify-center md:px-0",
  );
}

function iconClass({ active, parentActive, disabled }: RowState) {
  return cx(
    "h-[18px] w-[18px] shrink-0 transition-colors",
    (active || parentActive) && "text-[color:var(--sb-accent)]",
    !active &&
      !parentActive &&
      !disabled &&
      "text-zinc-500 group-hover:text-zinc-300",
    disabled && "text-zinc-700",
  );
}

function Badge({
  value,
  active,
  disabled,
  className,
}: {
  value: string | number;
  active?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const isCount = typeof value === "number";
  return (
    <span
      className={cx(
        "ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-md px-1.5 text-[11px] font-semibold tabular-nums leading-none",
        disabled
          ? "bg-white/[0.03] text-zinc-600"
          : isCount
            ? active
              ? "bg-white/10 text-white"
              : "bg-white/[0.06] text-zinc-400"
            : "bg-[color:var(--sb-accent-soft)] text-[color:var(--sb-accent)]",
        className,
      )}
    >
      {value}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar                                                            */
/* ------------------------------------------------------------------ */

type Floating = { top: number; left: number };

export default function Sidebar({
  sections,
  brand,
  user,
  accentColor = "#4F8CFF",
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  mobileOpen = false,
  onMobileClose,
  activeId,
  defaultActiveId,
  onNavigate,
  onSearch,
  onProfile,
  onSettings,
  onLogout,
}: SidebarProps) {
  /* ---- collapsed (controlled or not) ---- */
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const collapsed = collapsedProp ?? internalCollapsed;
  const setCollapsed = (value: boolean) => {
    if (collapsedProp === undefined) setInternalCollapsed(value);
    onCollapsedChange?.(value);
  };

  /* ---- active link (controlled or not) ---- */
  const [internalActive, setInternalActive] = useState(
    defaultActiveId ?? firstLinkId(sections),
  );
  const active = activeId ?? internalActive;

  /* ---- open dropdown groups ---- */
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const parent = findParentId(sections, active);
    return new Set(parent ? [parent] : []);
  });

  // If the active link lives inside a group, make sure that group is open
  useEffect(() => {
    const parent = findParentId(sections, active);
    if (parent)
      setOpenGroups((prev) =>
        prev.has(parent) ? prev : new Set(prev).add(parent),
      );
  }, [active, sections]);

  const toggleGroup = (id: string) =>
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  /* ---- floating UI for the collapsed rail ---- */
  const [tooltip, setTooltip] = useState<(Floating & { label: string }) | null>(
    null,
  );
  const [flyout, setFlyout] = useState<
    (Floating & { item: SidebarItem }) | null
  >(null);
  const flyoutRef = useRef<HTMLDivElement>(null);

  const rail = collapsed ? "md:hidden" : ""; // hide text in the desktop rail

  /* ---- effects ---- */
  useEffect(() => {
    if (!collapsed) {
      setTooltip(null);
      setFlyout(null);
    }
  }, [collapsed]);

  // Mobile drawer: Escape to close + lock page scroll
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onMobileClose?.();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen, onMobileClose]);

  // Ctrl/⌘ + K
  useEffect(() => {
    if (!onSearch) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onSearch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSearch]);

  // Close the rail flyout on outside click / Escape
  useEffect(() => {
    if (!flyout) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        flyoutRef.current?.contains(target) ||
        target.closest("[data-sb-group]")
      )
        return;
      setFlyout(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFlyout(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [flyout]);

  /* ---- handlers ---- */
  const navigate = (
    link: SidebarLink,
    event: ReactMouseEvent<HTMLAnchorElement>,
  ) => {
    if (link.disabled) {
      event.preventDefault();
      return;
    }
    if (activeId === undefined) setInternalActive(link.id);
    onNavigate?.(link, event);
    setFlyout(null);
    onMobileClose?.();
  };

  const showTooltip = (event: SyntheticEvent<HTMLElement>, label: string) => {
    if (!collapsed || !isDesktop() || flyout) return;
    const r = event.currentTarget.getBoundingClientRect();
    setTooltip({ label, top: r.top + r.height / 2, left: r.right + 12 });
  };
  const hideTooltip = () => setTooltip(null);

  const handleGroupClick = (
    item: SidebarItem,
    event: ReactMouseEvent<HTMLButtonElement>,
  ) => {
    if (collapsed && isDesktop()) {
      hideTooltip();
      const r = event.currentTarget.getBoundingClientRect();
      const estHeight = 48 + (item.children?.length ?? 0) * 34;
      const top = Math.max(
        8,
        Math.min(r.top - 6, window.innerHeight - estHeight - 8),
      );
      setFlyout((f) =>
        f?.item.id === item.id ? null : { item, top, left: r.right + 12 },
      );
      return;
    }
    toggleGroup(item.id);
  };

  const style = {
    "--sb-accent": accentColor,
    "--sb-accent-soft": hexToRgba(accentColor, 0.14),
  } as CSSProperties;

  /* ---- renderers ---- */
  const renderSubLink = (
    sub: SidebarSubItem,
    tabbable: boolean,
    inFlyout = false,
  ) => {
    const isActive = sub.id === active;
    return (
      <li key={sub.id}>
        <a
          href={sub.disabled ? undefined : sub.href}
          role="link"
          onClick={(e) => navigate(sub, e)}
          aria-current={isActive ? "page" : undefined}
          aria-disabled={sub.disabled || undefined}
          tabIndex={tabbable && !sub.disabled ? 0 : -1}
          className={cx(
            "relative flex h-8 items-center gap-2 rounded-md px-2.5 text-[13px] transition-colors duration-150 motion-reduce:transition-none",
            focusRing,
            isActive && "bg-white/[0.05] font-medium text-white",
            !isActive &&
              !sub.disabled &&
              "cursor-pointer text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-100",
            sub.disabled && "cursor-not-allowed text-zinc-600",
          )}
        >
          {/* accent segment on the guide line */}
          {isActive && !inFlyout && (
            <span
              aria-hidden
              className="absolute -left-[10px] top-1.5 bottom-1.5 w-[2px] rounded-full bg-[color:var(--sb-accent)]"
            />
          )}
          {isActive && inFlyout && (
            <span
              aria-hidden
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--sb-accent)]"
            />
          )}
          <span className="truncate">{sub.label}</span>
          {sub.badge !== undefined && (
            <Badge
              value={sub.badge}
              active={isActive}
              disabled={sub.disabled}
            />
          )}
        </a>
      </li>
    );
  };

  const renderLeaf = (item: SidebarItem) => {
    const Icon = item.icon;
    const state: RowState = {
      active: item.id === active,
      disabled: item.disabled,
    };
    return (
      <a
        href={item.disabled ? undefined : item.href}
        role="link"
        onClick={(e) => navigate(item, e)}
        onMouseEnter={(e) => showTooltip(e, item.label)}
        onMouseLeave={hideTooltip}
        onFocus={(e) => showTooltip(e, item.label)}
        onBlur={hideTooltip}
        aria-current={state.active ? "page" : undefined}
        aria-disabled={item.disabled || undefined}
        aria-label={collapsed ? item.label : undefined}
        tabIndex={item.disabled ? -1 : 0}
        className={rowClass(state, collapsed)}
      >
        {state.active && (
          <span
            aria-hidden
            className="absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[color:var(--sb-accent)]"
          />
        )}
        <Icon className={iconClass(state)} strokeWidth={1.75} />
        <span className={cx("flex-1 truncate text-left", rail)}>
          {item.label}
        </span>
        {item.badge !== undefined && (
          <Badge
            value={item.badge}
            active={state.active}
            disabled={item.disabled}
            className={rail}
          />
        )}
        {item.badge !== undefined && !item.disabled && (
          <span
            aria-hidden
            className={cx(
              "absolute right-1.5 top-1.5 hidden h-1.5 w-1.5 rounded-full bg-[color:var(--sb-accent)] ring-2 ring-[#121214]",
              collapsed && "md:block",
            )}
          />
        )}
      </a>
    );
  };

  const renderGroup = (item: SidebarItem) => {
    const Icon = item.icon;
    const children = item.children ?? [];
    const open = openGroups.has(item.id);
    const childActive = children.some((c) => c.id === active);
    const flyoutOpen = flyout?.item.id === item.id;
    const panelId = `sb-group-${item.id}`;
    const state: RowState = {
      parentActive: childActive,
      disabled: item.disabled,
      pressed: flyoutOpen,
    };

    return (
      <>
        <button
          type="button"
          data-sb-group
          onClick={(e) => handleGroupClick(item, e)}
          onMouseEnter={(e) => showTooltip(e, item.label)}
          onMouseLeave={hideTooltip}
          onFocus={(e) => showTooltip(e, item.label)}
          onBlur={hideTooltip}
          aria-expanded={collapsed ? flyoutOpen : open}
          aria-controls={panelId}
          aria-label={collapsed ? item.label : undefined}
          disabled={item.disabled}
          className={rowClass(state, collapsed)}
        >
          {childActive && collapsed && (
            <span
              aria-hidden
              className="absolute -left-3 top-1/2 hidden h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[color:var(--sb-accent)] md:block"
            />
          )}
          <Icon className={iconClass(state)} strokeWidth={1.75} />
          <span className={cx("flex-1 truncate text-left", rail)}>
            {item.label}
          </span>
          {item.badge !== undefined && (
            <Badge
              value={item.badge}
              disabled={item.disabled}
              className={rail}
            />
          )}
          <ChevronRight
            className={cx(
              "h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 motion-reduce:transition-none",
              open && "rotate-90",
              rail,
            )}
          />
        </button>

        {/* Expandable panel (expanded sidebar + mobile) */}
        <div
          id={panelId}
          className={cx(
            "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
            collapsed && "md:hidden",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <ul className="ml-[19px] mt-0.5 space-y-0.5 border-l border-white/[0.08] py-0.5 pl-2">
              {children.map((sub) => renderSubLink(sub, open))}
            </ul>
          </div>
        </div>
      </>
    );
  };

  const BrandIcon = brand.icon;
  const logoMark = (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[color:var(--sb-accent)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_4px_12px_-2px_var(--sb-accent-soft)]">
      <BrandIcon className="h-[18px] w-[18px]" strokeWidth={2.25} />
    </span>
  );

  return (
    <>
      {/* Mobile overlay */}
      <div
        aria-hidden
        onClick={onMobileClose}
        className={cx(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        aria-label="Sidebar"
        style={style}
        className={cx(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-white/[0.07] bg-[#121214] text-zinc-300",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
          "transition-[transform,width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
          "md:sticky md:top-2 md:z-40 md:m-2 md:h-[calc(100vh-1rem)] md:shrink-0 md:translate-x-0 md:rounded-2xl md:border",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "md:w-[68px]" : "md:w-[260px]",
        )}
      >
        {/* Header */}
        <div
          className={cx(
            "flex h-16 shrink-0 items-center gap-2 px-4",
            collapsed && "md:justify-center md:px-0",
          )}
        >
          <a
            href={brand.href}
            className={cx(
              "flex min-w-0 items-center gap-2.5 rounded-lg",
              focusRing,
              collapsed && "md:hidden",
            )}
          >
            {logoMark}
            <span className="truncate text-[15px] font-semibold tracking-tight text-white">
              {brand.name}
              {brand.suffix && (
                <span className="text-zinc-500">{brand.suffix}</span>
              )}
            </span>
          </a>

          {/* Rail: logo turns into an expand button on hover */}
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
            className={cx(
              "group/logo relative h-8 w-8 place-items-center rounded-lg",
              focusRing,
              collapsed ? "hidden md:grid" : "hidden",
            )}
          >
            <span className="transition-opacity duration-150 group-hover/logo:opacity-0 group-focus-visible/logo:opacity-0">
              {logoMark}
            </span>
            <span className="absolute inset-0 grid place-items-center rounded-lg bg-white/[0.06] text-zinc-200 opacity-0 transition-opacity duration-150 group-hover/logo:opacity-100 group-focus-visible/logo:opacity-100">
              <PanelLeftOpen className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
            className={cx(
              "ml-auto h-8 w-8 place-items-center rounded-md text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-200",
              focusRing,
              collapsed ? "hidden" : "hidden md:grid",
            )}
          >
            <PanelLeftClose className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </button>

          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Close sidebar"
            className={cx(
              "ml-auto grid h-8 w-8 place-items-center rounded-md text-zinc-400 hover:bg-white/[0.06] hover:text-white md:hidden",
              focusRing,
            )}
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Search */}
        {/* <div className={cx("shrink-0 px-3 pb-3", collapsed && "md:px-0")}>
          <button
            type="button"
            onClick={onSearch}
            onMouseEnter={(e) => showTooltip(e, "Search")}
            onMouseLeave={hideTooltip}
            onFocus={(e) => showTooltip(e, "Search")}
            onBlur={hideTooltip}
            aria-label="Search"
            className={cx(
              "flex h-9 w-full items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-2.5 text-[13px] text-zinc-500",
              "transition-colors hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-zinc-300",
              focusRing,
              collapsed && "md:mx-auto md:w-10 md:justify-center md:px-0",
            )}
          >
            <Search className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            <span
              className={cx(
                "flex-1 truncate whitespace-nowrap text-left",
                rail,
              )}
            >
              Search…
            </span>
            <kbd
              className={cx(
                "rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-sans text-[10.5px] font-medium text-zinc-500",
                rail,
              )}
            >
              {isMac() ? "⌘K" : "Ctrl K"}
            </kbd>
          </button>
        </div> */}

        {/* Links */}
        <nav
          aria-label="Main"
          onScroll={() => {
            hideTooltip();
            setFlyout(null);
          }}
          className={cx(
            "flex-1 overflow-y-auto overflow-x-hidden px-3 pb-4",
            "[scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.12)_transparent]",
            "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10",
          )}
        >
          {sections.map((section, index) => (
            <div key={section.id} className={index === 0 ? "pt-1" : "mt-5"}>
              <p
                className={cx(
                  "px-2.5 pb-1.5 text-[11.5px] font-medium text-zinc-500",
                  rail,
                )}
              >
                {section.title}
              </p>
              {index > 0 && (
                <div
                  aria-hidden
                  className={cx(
                    "mx-auto mb-3 hidden h-px w-6 bg-white/[0.08]",
                    collapsed && "md:block",
                  )}
                />
              )}

              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.id}>
                    {item.children?.length
                      ? renderGroup(item)
                      : renderLeaf(item)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {user && (
          <UserMenu
            user={user}
            collapsed={collapsed}
            rail={rail}
            onProfile={onProfile}
            onSettings={onSettings}
            onLogout={onLogout}
          />
        )}
      </aside>

      {/* Rail tooltip */}
      {tooltip && (
        <div
          role="tooltip"
          style={{ top: tooltip.top, left: tooltip.left }}
          className="pointer-events-none fixed z-[60] -translate-y-1/2 whitespace-nowrap rounded-md border border-white/10 bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-100 shadow-lg shadow-black/40"
        >
          {tooltip.label}
        </div>
      )}

      {/* Rail flyout for dropdown groups */}
      {flyout && (
        <div
          ref={flyoutRef}
          style={{ ...style, top: flyout.top, left: flyout.left }}
          className="fixed z-[60] w-56 rounded-xl border border-white/10 bg-[#18181b] p-1.5 shadow-2xl shadow-black/60"
        >
          <p className="px-2.5 pb-1.5 pt-1 text-[11.5px] font-medium text-zinc-500">
            {flyout.item.label}
          </p>
          <ul className="space-y-0.5">
            {flyout.item.children?.map((sub) => renderSubLink(sub, true, true))}
          </ul>
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  User menu                                                          */
/* ------------------------------------------------------------------ */

interface UserMenuProps {
  user: SidebarUser;
  collapsed: boolean;
  rail: string;
  onProfile?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
}

function UserMenu({
  user,
  collapsed,
  rail,
  onProfile,
  onSettings,
  onLogout,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const run = (fn?: () => void) => () => {
    setOpen(false);
    fn?.();
  };

  const itemClass = cx(
    "flex h-8 w-full items-center gap-2.5 rounded-md px-2.5 text-[13px] text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white",
    focusRing,
  );

  return (
    <div
      ref={ref}
      className="relative shrink-0 border-t border-white/[0.06] p-2"
    >
      <div
        role="menu"
        aria-hidden={!open}
        className={cx(
          "absolute bottom-full left-2 right-2 mb-2 origin-bottom rounded-xl border border-white/10 bg-[#18181b] p-1.5 shadow-2xl shadow-black/60",
          "transition duration-150 ease-out motion-reduce:transition-none",
          collapsed &&
            "md:bottom-2 md:left-full md:right-auto md:mb-0 md:ml-3 md:w-60 md:origin-bottom-left",
          open
            ? "visible translate-y-0 scale-100 opacity-100"
            : "invisible translate-y-1 scale-[0.98] opacity-0",
        )}
      >
        <div className="flex items-center gap-2.5 px-2.5 pb-2.5 pt-1.5">
          <Avatar user={user} />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-zinc-100">
              {user.name}
            </p>
            <p className="truncate text-xs text-zinc-500">{user.email}</p>
          </div>
        </div>
        {/* <div className="space-y-0.5 border-t border-white/[0.06] py-1">
          <button
            type="button"
            role="menuitem"
            tabIndex={open ? 0 : -1}
            onClick={run(onProfile)}
            className={itemClass}
          >
            <UserRound className="h-4 w-4 text-zinc-500" strokeWidth={1.75} />
            Profile
          </button>
          <button
            type="button"
            role="menuitem"
            tabIndex={open ? 0 : -1}
            onClick={run(onSettings)}
            className={itemClass}
          >
            <Settings className="h-4 w-4 text-zinc-500" strokeWidth={1.75} />
            Settings
          </button>
        </div> */}
        <div className="border-t border-white/[0.06] pt-1">
          <button
            type="button"
            role="menuitem"
            tabIndex={open ? 0 : -1}
            onClick={run(onLogout)}
            className={cx(
              itemClass,
              "text-red-400 hover:bg-red-500/10 hover:text-red-300",
            )}
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
            Log out
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.name}`}
        className={cx(
          "flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left transition-colors hover:bg-white/[0.04]",
          focusRing,
          open && "bg-white/[0.05]",
          collapsed && "md:mx-auto md:w-auto md:justify-center",
        )}
      >
        <Avatar user={user} />
        <div className={cx("min-w-0 flex-1", rail)}>
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[13px] font-semibold text-zinc-100">
              {user.name}
            </span>
            {user.role && (
              <span className="shrink-0 rounded bg-[color:var(--sb-accent-soft)] px-1.5 py-px text-[10px] font-semibold text-[color:var(--sb-accent)]">
                {user.role}
              </span>
            )}
          </div>
          <p className="truncate text-xs text-zinc-500">{user.email}</p>
        </div>
        <ChevronsUpDown
          className={cx("h-4 w-4 shrink-0 text-zinc-500", rail)}
          strokeWidth={1.75}
        />
      </button>
    </div>
  );
}

function Avatar({ user }: { user: SidebarUser }) {
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return user.avatarUrl ? (
    <img
      src={user.avatarUrl}
      alt=""
      className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-white/10"
    />
  ) : (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-zinc-700 text-[11px] font-semibold text-zinc-100 ring-1 ring-white/10">
      {initials}
    </span>
  );
}
// Component Source: https://codekk.dev/
