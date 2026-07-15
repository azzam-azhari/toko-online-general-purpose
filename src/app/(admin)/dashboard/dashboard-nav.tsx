"use client";

import { Activity, FolderTree, LayoutDashboard, Menu, Package } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Produk", icon: Package },
  { href: "/dashboard/categories", label: "Kategori", icon: FolderTree },
  { href: "/dashboard/activity", label: "Aktivitas", icon: Activity },
];

function NavigationLinks({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigasi dashboard" className="space-y-1">
      {navigation.map(({ href, label, icon: Icon }) => {
        const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
        const link = (
          <Link
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
            href={href}
          >
            <Icon aria-hidden="true" className="size-4" /> {label}
          </Link>
        );
        return mobile ? <DialogClose asChild key={href}>{link}</DialogClose> : <div key={href}>{link}</div>;
      })}
    </nav>
  );
}

export function DashboardNav({ variant }: { variant: "desktop" | "mobile" }) {
  if (variant === "desktop") {
    return (
      <aside className="h-fit rounded-xl border bg-background p-3 shadow-sm">
        <NavigationLinks />
      </aside>
    );
  }

  return (
    <Dialog>
        <DialogTrigger asChild>
          <Button className="lg:hidden" size="icon" type="button" variant="outline">
            <Menu aria-hidden="true" />
            <span className="sr-only">Buka navigasi dashboard</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="left-0 top-0 h-dvh w-[min(86vw,340px)] max-w-none translate-x-0 translate-y-0 rounded-none rounded-r-2xl p-5">
          <DialogTitle className="font-serif text-2xl">NusaMart</DialogTitle>
          <DialogDescription>Navigasi dashboard katalog</DialogDescription>
          <div className="mt-6">
            <NavigationLinks mobile />
          </div>
        </DialogContent>
    </Dialog>
  );
}
