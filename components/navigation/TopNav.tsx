"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/announcements", label: "Pengumuman" },
  { href: "/profile", label: "Profil" },
];

export function TopNav({ className = "" }: { className?: string }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/announcements") {
      return pathname.startsWith("/announcements");
    }
    return pathname === href;
  };

  return (
    <nav
      className={`flex items-center gap-2 overflow-x-auto ${className}`}
      aria-label="Primary"
    >
      {navItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              active
                ? "bg-pln-primary text-white"
                : "bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
