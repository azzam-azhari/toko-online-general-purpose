import type { Metadata } from "next";

import { OrderStatusLookup } from "./status-lookup";

export const metadata: Metadata = {
  title: "Status Pesanan",
  description: "Periksa status pesanan NusaMart menggunakan nomor pesanan dan kontak yang sesuai.",
  robots: { index: false, follow: false },
};

export default function OrderStatusPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-sm font-bold uppercase tracking-[.16em] text-accent">Bantuan Pesanan</p>
        <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Periksa Status Pesanan</h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          Masukkan nomor pesanan serta email atau nomor telepon yang digunakan saat pesanan dicatat.
        </p>
      </div>
      <OrderStatusLookup />
    </main>
  );
}
