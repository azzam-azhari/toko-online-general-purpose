"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function StorefrontError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center px-4 py-16"><Card className="w-full border-destructive/20"><CardContent className="p-8 text-center"><AlertTriangle aria-hidden="true" className="mx-auto size-10 text-destructive" /><h1 className="mt-4 font-serif text-3xl">Halaman belum dapat dimuat</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Ada kendala saat mengambil data toko. Silakan coba lagi.</p><Button className="mt-6" onClick={reset}><RotateCcw aria-hidden="true" /> Coba Lagi</Button></CardContent></Card></main>;
}
