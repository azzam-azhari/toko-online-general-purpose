import type { Metadata } from "next";

import { PageHeader } from "@/components/common/page-header";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getContentManagementData } from "@/lib/repositories/operations.repository";

import { ContentManager } from "../content-manager";

export const metadata: Metadata = { title: "FAQ", robots: { index: false } };
export default async function FaqsPage() { await requireAdmin(); const { faqs } = await getContentManagementData(); return <div className="space-y-6"><PageHeader description="Jawab pertanyaan umum agar pelanggan mudah menemukan informasi." eyebrow="Konten Website" title="FAQ" /><ContentManager items={faqs} kind="faq" /></div>; }
