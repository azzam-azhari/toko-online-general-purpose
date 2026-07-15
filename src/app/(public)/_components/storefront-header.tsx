"use client";

import { Menu, Search } from "lucide-react";
import Image from "next/image";
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

const navigation = [
  { href: "/", label: "Beranda" },
  { href: "/products", label: "Katalog" },
  { href: "/about", label: "Tentang" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Kontak" },
];

function Brand({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  return (
    <Link className="inline-flex min-w-0 items-center gap-2.5 rounded-md font-bold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring" href="/">
      {logoUrl ? <span className="relative size-9 shrink-0 overflow-hidden rounded-xl bg-white"><Image alt={`Logo ${name}`} className="object-contain" fill sizes="36px" src={logoUrl} /></span> : <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary font-serif text-lg text-primary-foreground shadow-sm">{name.slice(0, 1).toUpperCase()}</span>}
      <span className="max-w-32 truncate text-base sm:max-w-56 sm:text-lg lg:max-w-none">{name}</span>
    </Link>
  );
}

export function StorefrontHeader({ storeName, logoUrl }: { storeName: string; logoUrl?: string | null }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/92 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:h-18 sm:px-6 lg:px-8">
        <Brand logoUrl={logoUrl} name={storeName} />

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

        <form action="/products" className="ml-auto hidden w-full max-w-xs items-center xl:flex" role="search">
          <label className="sr-only" htmlFor="header-search">
            Cari produk
          </label>
          <div className="relative w-full">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="rounded-full pl-9" id="header-search" name="q" placeholder="Cari produk..." type="search" />
          </div>
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-2 xl:hidden">
          <Dialog>
            <DialogTrigger asChild>
              <Button aria-label="Buka pencarian" size="icon" variant="outline">
                <Search aria-hidden="true" />
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-1.5rem)] max-w-md p-5 sm:p-6">
              <DialogHeader>
                <DialogTitle>Cari produk</DialogTitle>
                <DialogDescription>Masukkan nama atau kata kunci produk.</DialogDescription>
              </DialogHeader>
              <form action="/products" role="search">
                <label className="sr-only" htmlFor="compact-header-search">
                  Cari produk
                </label>
                <div className="flex gap-2">
                  <div className="relative min-w-0 flex-1">
                    <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input autoComplete="off" className="pl-9" id="compact-header-search" name="q" placeholder="Cari produk..." type="search" />
                  </div>
                  <Button type="submit">Cari</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button aria-label="Buka menu" className="lg:hidden" size="icon" variant="outline">
                <Menu aria-hidden="true" />
              </Button>
            </DialogTrigger>
            <DialogContent
              className="bottom-0 left-auto right-0 top-0 h-dvh max-h-none w-[min(88vw,360px)] max-w-none translate-x-0 translate-y-0 rounded-none rounded-l-3xl p-5 sm:p-6"
              onOpenAutoFocus={(event) => event.preventDefault()}
            >
              <DialogHeader>
                <DialogTitle>Menu {storeName}</DialogTitle>
                <DialogDescription>Pilih halaman yang ingin Anda buka.</DialogDescription>
              </DialogHeader>
              <nav aria-label="Navigasi seluler" className="grid gap-2">
                {navigation.map((item) => (
                  <DialogClose asChild key={item.href}>
                    <Link className="rounded-xl px-4 py-3 text-base font-semibold transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={item.href}>
                      {item.label}
                    </Link>
                  </DialogClose>
                ))}
              </nav>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
