"use client";

import { Menu, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { useCart } from "./cart-provider";

const navigation = [
  { href: "/", label: "Beranda" },
  { href: "/products", label: "Katalog" },
  { href: "/about", label: "Tentang" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Kontak" },
];

function Brand({ name }: { name: string }) {
  return (
    <Link className="inline-flex items-center gap-2.5 rounded-md font-bold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring" href="/">
      <span className="grid size-9 place-items-center rounded-xl bg-primary font-serif text-lg text-primary-foreground shadow-sm">
        N
      </span>
      <span className="text-lg">{name}</span>
    </Link>
  );
}

export function StorefrontHeader({ storeName }: { storeName: string }) {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/92 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Brand name={storeName} />

        <nav aria-label="Navigasi utama" className="ml-6 hidden items-center gap-6 lg:flex">
          {navigation.map((item) => (
            <Link
              className="rounded-md text-sm font-semibold text-muted-foreground outline-none transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form action="/products" className="ml-auto hidden w-full max-w-xs items-center md:flex" role="search">
          <label className="sr-only" htmlFor="header-search">
            Cari produk
          </label>
          <div className="relative w-full">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="rounded-full pl-9" id="header-search" name="q" placeholder="Cari produk..." />
          </div>
        </form>

        <Button aria-label={`Keranjang, ${itemCount} produk`} asChild className="relative" size="icon" variant="ghost">
          <Link href="/cart">
            <ShoppingBag aria-hidden="true" />
            {itemCount > 0 ? (
              <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            ) : null}
          </Link>
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button aria-label="Buka menu" className="lg:hidden" size="icon" variant="outline">
              <Menu aria-hidden="true" />
            </Button>
          </DialogTrigger>
          <DialogContent className="top-0 right-0 left-auto h-dvh max-h-none w-[min(88vw,360px)] max-w-none translate-x-0 translate-y-0 rounded-none rounded-l-3xl p-6">
            <DialogHeader>
              <DialogTitle>Menu {storeName}</DialogTitle>
              <DialogDescription>Temukan produk dan informasi yang Anda perlukan.</DialogDescription>
            </DialogHeader>
            <form action="/products" className="mb-5" role="search">
              <label className="sr-only" htmlFor="mobile-search">
                Cari produk
              </label>
              <div className="relative">
                <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" id="mobile-search" name="q" placeholder="Cari produk..." />
              </div>
            </form>
            <nav aria-label="Navigasi seluler" className="grid gap-2">
              {navigation.map((item) => (
                <DialogClose asChild key={item.href}>
                  <Link className="rounded-xl px-4 py-3 text-base font-semibold transition hover:bg-secondary" href={item.href}>
                    {item.label}
                  </Link>
                </DialogClose>
              ))}
            </nav>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
