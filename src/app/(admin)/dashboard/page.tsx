import type { Metadata } from "next";
import { CheckCircle2, Database, LockKeyhole, UserRoundCheck } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const { profile } = await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-primary">Fase 2 siap</p>
        <h1 className="mt-1 font-serif text-4xl">Halo, {profile.full_name ?? "Admin"}.</h1>
        <p className="mt-2 text-muted-foreground">Fondasi database dan akses admin NusaMart telah aktif.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          [Database, "Schema terstruktur", "Migration Supabase tersusun berdasarkan domain."],
          [LockKeyhole, "RLS berlapis", "Akses data dibatasi untuk publik dan admin aktif."],
          [UserRoundCheck, "Role tunggal admin", "Tidak ada pemilih role atau akses dashboard publik."],
        ].map(([Icon, title, description]) => (
          <Card key={title as string}>
            <CardHeader>
              <div className="mb-3 grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon aria-hidden="true" className="size-5" />
              </div>
              <CardTitle className="font-sans text-lg">{title as string}</CardTitle>
              <CardDescription>{description as string}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-sans text-xl">Pemeriksaan akses</CardTitle>
          <CardDescription>Halaman ini hanya dirender setelah session dan profil admin aktif tervalidasi di server.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3 text-sm text-primary">
          <CheckCircle2 aria-hidden="true" className="size-5" /> Session admin valid
        </CardContent>
      </Card>
    </div>
  );
}

