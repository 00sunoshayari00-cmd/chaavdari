import type { LucideIcon } from "lucide-react";
import {
  ExternalLink,
  LayoutDashboard,
  Package,
  Percent,
  Store,
  Tags,
} from "lucide-react";

export interface SidebarSubItem {
  id: string;
  label: string;
  href: string;
  badge?: string | number;
  disabled?: boolean;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  badge?: string | number;
  disabled?: boolean;
  children?: SidebarSubItem[];
}

export type SidebarLink = SidebarItem | SidebarSubItem;

export interface SidebarSection {
  id: string;
  title: string;
  items: SidebarItem[];
}

export interface SidebarUser {
  name: string;
  email: string;
  role?: string;
  avatarUrl?: string;
}

export interface SidebarBrand {
  name: string;
  suffix?: string;
  href: string;
  icon: LucideIcon;
}

export const sidebarBrand: SidebarBrand = {
  name: "Chaavdari",
  suffix: " admin",
  href: "/admin",
  icon: Store,
};

export const sidebarSections: SidebarSection[] = [
  {
    id: "manage",
    title: "Manage",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
      {
        id: "products",
        label: "Products",
        icon: Package,
        children: [
          {
            id: "products-all",
            label: "All products",
            href: "/admin/products",
          },
          {
            id: "products-new",
            label: "Add product",
            href: "/admin/products/new",
          },
        ],
      },
      {
        id: "categories",
        label: "Categories",
        href: "/admin/categories",
        icon: Tags,
      },
      {
        id: "discount",
        label: "Discount",
        href: "/admin/settings",
        icon: Percent,
      },
    ],
  },
  {
    id: "site",
    title: "Site",
    items: [
      { id: "website", label: "View website", href: "/", icon: ExternalLink },
    ],
  },
];

export function findSidebarLink(
  sections: SidebarSection[],
  id: string,
):
  | { link: SidebarLink; parent?: SidebarItem; section: SidebarSection }
  | undefined {
  for (const section of sections) {
    for (const item of section.items) {
      if (item.id === id) return { link: item, section };
      const child = item.children?.find((c) => c.id === id);
      if (child) return { link: child, parent: item, section };
    }
  }
  return undefined;
}
