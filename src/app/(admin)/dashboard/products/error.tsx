"use client";

import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ProductsError({ reset }: { error: Error; reset: () => void }) {
  return <div className="rounded-xl border bg-card p-8 text-center"><AlertCircle aria-hidden="true" className="mx-auto size-9 text-destructive" /><h1 className="mt-4 text-xl font-semibold">Produk belum dapat dimuat</h1><p className="mt-2 text-sm text-muted-foreground">Periksa koneksi lalu coba kembali.</p><Button className="mt-5" onClick={reset} type="button">Coba Lagi</Button></div>;
}
