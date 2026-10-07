"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Stack } from "@/components/layout";
import type { StaffRole } from "@/lib/auth/roles";
import { cn } from "@/utils/classMerge";

const managerLinks = [
  { href: "/admin", label: "داشبورد" },
  { href: "/admin/sales", label: "فروش" },
  { href: "/admin/prefactors", label: "پیش‌فاکتورها" },
  { href: "/admin/tables", label: "میزها" },
  { href: "/admin/ledger", label: "دخل و خرج" },
  { href: "/admin/categories", label: "دسته‌ها" },
  { href: "/admin/items", label: "آیتم‌ها" },
  { href: "/admin/settings", label: "تنظیمات" },
];

const waiterLinks = [
  { href: "/admin/prefactors", label: "پیش‌فاکتورهای امروز" },
  { href: "/admin/tables", label: "میزها" },
];

export function AdminNav({ role }: { role: StaffRole }) {
  const pathname = usePathname();
  const links = role === "manager" ? managerLinks : waiterLinks;

  return (
    <Stack gap={1} className="md:min-w-44">
      {links.map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-(--radius) px-3 py-2 text-sm",
              active ? "bg-foreground text-ink" : "text-text/75",
            )}
          >
            {link.label}
          </Link>
        );
      })}
      <Link
        href="/"
        className="rounded-(--radius) px-3 py-2 text-sm text-text/75"
      >
        ساخت سفارش در منو
      </Link>
    </Stack>
  );
}
