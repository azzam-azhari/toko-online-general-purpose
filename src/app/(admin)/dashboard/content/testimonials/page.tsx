import type { Metadata } from "next";

import { PageHeader } from "@/components/common/page-header";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getContentManagementData } from "@/lib/repositories/operations.repository";

import { ContentManager } from "../content-manager";

export const metadata: Metadata = { title: "Testimoni", robots: { index: false } };
export default async function TestimonialsPage() { await requireAdmin(); const { testimonials } = await getContentManagementData(); return <div className="space-y-6"><PageHeader description="Hanya terbitkan testimoni yang sudah mendapat persetujuan pemilik." eyebrow="Konten Website" title="Testimoni" /><ContentManager items={testimonials} kind="testimonial" /></div>; }
