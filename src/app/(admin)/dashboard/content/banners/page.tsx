import type { Metadata } from "next";

import { PageHeader } from "@/components/common/page-header";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getContentManagementData } from "@/lib/repositories/operations.repository";

import { ContentManager } from "../content-manager";

export const metadata: Metadata = { title: "Banner", robots: { index: false } };
export default async function BannersPage() { await requireAdmin(); const { banners } = await getContentManagementData(); return <div className="space-y-6"><PageHeader description="Atur banner promo beserta jadwal tampilnya." eyebrow="Konten Website" title="Banner" /><ContentManager items={banners} kind="banner" /></div>; }
