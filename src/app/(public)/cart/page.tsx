import type { Metadata } from "next";

import { CartView } from "./cart-view";

export const metadata: Metadata = {
  title: "Keranjang",
  description: "Periksa produk Midtrans yang disimpan di keranjang NusaMart.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <main><section className="border-b bg-secondary/70"><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><p className="text-sm font-bold uppercase tracking-[.16em] text-accent">Keranjang</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl">Pilihan Anda, dalam satu tempat.</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">Keranjang menyimpan produk dengan metode pembayaran Midtrans di perangkat ini.</p></div></section><CartView /></main>;
}
