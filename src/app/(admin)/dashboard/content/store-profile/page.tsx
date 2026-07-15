import type { Metadata } from "next";

import { PageHeader } from "@/components/common/page-header";
import { serverEnv } from "@/configs/env/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getStoreSettings } from "@/lib/repositories/operations.repository";

import { StoreSettingsForm } from "./store-settings-form";

export const metadata: Metadata = { title: "Profil Toko", robots: { index: false } };
export default async function StoreProfilePage() { await requireAdmin(); const settings = await getStoreSettings(); return <div className="space-y-6"><PageHeader description="Ubah identitas, kontak, alamat, jam buka, media sosial, dan SEO dasar yang tampil di website." eyebrow="Konten Website" title="Profil Toko" /><StoreSettingsForm assetBaseUrl={serverEnv.supabaseUrl} settings={settings} /></div>; }
