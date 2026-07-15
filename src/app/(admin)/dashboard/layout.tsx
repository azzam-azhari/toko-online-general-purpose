import { LogOut, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { logoutAction } from "@/actions/auth.actions";
import { CatalogRealtimeRefresh } from "@/components/common/catalog-realtime-refresh";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/require-admin";

import { DashboardNav } from "./dashboard-nav";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { profile, user } = await requireAdmin();

  return (
    <div className="min-h-screen bg-secondary/60">
      <CatalogRealtimeRefresh scope="admin" />
      <header className="border-b bg-background">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <DashboardNav variant="mobile" />
            <Link className="flex items-center gap-3" href="/dashboard">
              <span className="grid size-9 place-items-center rounded-lg rounded-bl-sm bg-primary font-serif text-xl text-primary-foreground">N</span>
              <div>
                <strong className="block leading-none">NusaMart</strong>
                <span className="text-xs text-muted-foreground">Dashboard</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="hidden gap-1 sm:inline-flex" variant="secondary">
              <ShieldCheck aria-hidden="true" className="size-3.5" /> Admin aktif
            </Badge>
            <form action={logoutAction}>
              <Button size="sm" type="submit" variant="outline">
                <LogOut aria-hidden="true" /> Keluar
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <DashboardNav variant="desktop" />
          <div className="mt-4 border-t px-3 pt-4">
            <p className="truncate text-sm font-semibold">{profile.full_name ?? "Admin NusaMart"}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
