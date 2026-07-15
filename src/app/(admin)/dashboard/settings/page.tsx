import type { Metadata } from "next";

import { PageHeader } from "@/components/common/page-header";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getStoreSettings } from "@/lib/repositories/operations.repository";

import { OperationalSettingsForm } from "./operational-settings-form";

export const metadata: Metadata = { title: "Pengaturan", robots: { index: false } };

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getStoreSettings();

  return (
    <div className="space-y-6">
      <PageHeader
        description="Atur stok, wilayah operasional, dan konfigurasi toko yang tidak mengubah konten website."
        eyebrow="Administrasi"
        title="Pengaturan"
      />
      <OperationalSettingsForm settings={settings} />
    </div>
  );
}
