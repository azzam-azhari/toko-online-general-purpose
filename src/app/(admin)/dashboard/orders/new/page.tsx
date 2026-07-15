import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getExternalOrderProducts } from "@/lib/repositories/operations.repository";

import { ExternalOrderForm } from "./external-order-form";

export const metadata: Metadata = { title: "Catat Pesanan", robots: { index: false } };

export default async function NewOrderPage() {
  await requireAdmin();
  const products = await getExternalOrderProducts();

  return (
    <div className="space-y-6">
      <Button asChild size="sm" variant="ghost">
        <Link href="/dashboard/orders"><ArrowLeft aria-hidden="true" />Kembali ke Pesanan</Link>
      </Button>
      <PageHeader
        description="Gunakan setelah pelanggan benar-benar memesan melalui WhatsApp atau tautan eksternal. Klik CTA publik tidak membuat pesanan otomatis."
        eyebrow="Operasional"
        title="Catat Pesanan Eksternal"
      />
      <Card>
        <CardHeader>
          <CardTitle className="font-sans text-xl">Data Pesanan</CardTitle>
          <CardDescription>Harga dan stok diperiksa ulang dari database saat disimpan.</CardDescription>
        </CardHeader>
        <CardContent>
          <ExternalOrderForm products={products} />
        </CardContent>
      </Card>
    </div>
  );
}
