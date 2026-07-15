"use client";

import { Activity, Boxes, FolderTree, LayoutDashboard, Menu, Package, ReceiptText, Settings, PanelsTopLeft } from "lucide-react";
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
  { href: "/dashboard/orders", label: "Pesanan", icon: ReceiptText },
  { href: "/dashboard/inventory", label: "Stok Rendah", icon: Boxes },
  { href: "/dashboard/content", label: "Konten Website", icon: PanelsTopLeft },
  { href: "/dashboard/settings", label: "Pengaturan", icon: Settings },
  { href: "/dashboard/activity", label: "Aktivitas", icon: Activity },
];

function NavigationLinks({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigasi dashboard" className={cn("space-y-1", mobile && "space-y-1.5")}>
      {navigation.map(({ href, label, icon: Icon }) => {
        const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
        const link = (
          <Link
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
              mobile && "min-h-11 py-3",
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

export function DashboardNav({ variant, storeName }: { variant: "desktop" | "mobile"; storeName: string }) {
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
        <Button className="md:landscape:hidden lg:hidden" size="icon" type="button" variant="outline">
          <Menu aria-hidden="true" />
          <span className="sr-only">Buka navigasi dashboard</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="bottom-0 left-0 top-0 flex h-dvh max-h-dvh w-[min(88vw,360px)] max-w-none translate-x-0 translate-y-0 flex-col overflow-hidden rounded-none rounded-r-2xl p-0"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className="shrink-0 border-b px-5 pb-4 pr-14 pt-[max(1.25rem,env(safe-area-inset-top))]">
          <DialogTitle className="font-serif text-2xl">{storeName}</DialogTitle>
          <DialogDescription className="mt-1">Navigasi dashboard operasional</DialogDescription>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
          <NavigationLinks mobile />
        </div>
        <div className="shrink-0 border-t px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 text-xs text-muted-foreground">
          Menu admin
        </div>
      </DialogContent>
    </Dialog>
  );
}
