import { HelpCircle, Image, MessageSquareQuote, Store } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getContentManagementData, getStoreSettings } from "@/lib/repositories/operations.repository";

export const metadata: Metadata = { title: "Konten Website", robots: { index: false } };

export default async function ContentPage() {
  await requireAdmin();
  const [content, settings] = await Promise.all([getContentManagementData(), getStoreSettings()]);
  const links = [
    { href: "/dashboard/content/store-profile", title: "Profil Toko", description: settings.store_name, icon: Store },
    { href: "/dashboard/content/banners", title: "Banner", description: `${content.banners.length} banner`, icon: Image },
    { href: "/dashboard/content/testimonials", title: "Testimoni", description: `${content.testimonials.length} testimoni`, icon: MessageSquareQuote },
    { href: "/dashboard/content/faqs", title: "FAQ", description: `${content.faqs.length} pertanyaan`, icon: HelpCircle },
  ];
  return <div className="space-y-6"><PageHeader description="Kelola informasi dan materi yang tampil di halaman publik." eyebrow="Operasional" title="Konten Website" /><div className="grid gap-4 sm:grid-cols-2">{links.map(({ href, title, description, icon: Icon }) => <Link className="group" href={href} key={href}><Card className="h-full transition group-hover:border-primary/30 group-hover:shadow-md"><CardContent className="flex items-center gap-4 p-5"><span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary"><Icon aria-hidden="true" /></span><div><h2 className="font-semibold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div></CardContent></Card></Link>)}</div></div>;
}
