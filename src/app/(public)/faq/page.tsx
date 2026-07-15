import type { Metadata } from "next";
import { HelpCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { getStorefrontFaqs } from "@/lib/repositories/storefront.repository";
import { serializeJsonLd } from "@/lib/storefront";

import { InformationPage } from "../_components/information-page";

export const metadata: Metadata = { title: "FAQ", description: "Jawaban untuk pertanyaan yang sering diajukan tentang NusaMart.", alternates: { canonical: "/faq" } };

export default async function FaqPage() {
  const faqs = await getStorefrontFaqs();
  const jsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) };
  return <InformationPage description="Informasi berikut dikelola oleh toko dan diperbarui sesuai kebutuhan." eyebrow="Bantuan" title="Pertanyaan yang sering diajukan."><script dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} type="application/ld+json" />{faqs.length ? <div className="grid gap-3">{faqs.map((faq) => <details className="group rounded-xl border bg-card p-5 open:border-primary/25" key={faq.id}><summary className="cursor-pointer list-none pr-8 font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring">{faq.question}</summary><p className="mt-4 whitespace-pre-line border-t pt-4 text-sm leading-7 text-muted-foreground">{faq.answer}</p></details>)}</div> : <Card className="border-dashed"><CardContent className="grid min-h-60 place-items-center p-8 text-center"><div><HelpCircle aria-hidden="true" className="mx-auto size-10 text-muted-foreground" /><h2 className="mt-4 font-serif text-2xl">FAQ belum tersedia</h2><p className="mt-2 text-sm text-muted-foreground">Pertanyaan dan jawaban akan tampil setelah diterbitkan oleh admin.</p></div></CardContent></Card>}</InformationPage>;
}
