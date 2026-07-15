import type { Metadata } from "next";

import { ActivityList } from "@/components/common/activity-list";
import { PageHeader } from "@/components/common/page-header";
import { Card } from "@/components/ui/card";
import { getActivityLogs } from "@/lib/repositories/catalog.repository";

export const metadata: Metadata = { title: "Activity Log", robots: { index: false, follow: false } };

export default async function ActivityPage() {
  const logs = await getActivityLogs(100);
  return <div className="space-y-6"><PageHeader description="Jejak perubahan produk dan kategori oleh admin aktif. Log hanya dapat dibaca dan tidak dapat diedit dari dashboard." eyebrow="Audit" title="Activity Log" /><Card className="overflow-hidden"><ActivityList logs={logs} /></Card></div>;
}
