"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Store, Tags, Users } from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/products", label: "View shop", icon: Store },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <div className="adminNav">
      {links.map((link) => {
        const active = link.exact ? pathname === link.href : pathname === link.href || pathname.startsWith(`${link.href}/`);
        const Icon = link.icon;
        return (
          <Link key={link.href} href={link.href} className={active ? "active" : ""}>
            <Icon size={18} />
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
