import type { Metadata } from "next";
import Link from "next/link";

import { InformationPage } from "../_components/information-page";

export const metadata: Metadata = { title: "Kebijakan Privasi", description: "Kebijakan privasi dasar penggunaan storefront NusaMart.", alternates: { canonical: "/privacy" } };

const sections = [
  ["Informasi yang diproses", "Saat Anda hanya menjelajah katalog, Anda tidak perlu membuat akun pelanggan. Informasi kontak, identitas, dan alamat baru diproses ketika Anda memilih jalur pembelian yang memerlukannya atau menghubungi toko."],
  ["Layanan pihak ketiga", "Produk dapat mengarahkan Anda ke WhatsApp atau tautan eksternal. Setelah berpindah ke layanan tersebut, pemrosesan data juga mengikuti kebijakan privasi penyedia terkait."],
  ["Keamanan dan retensi", "Toko menerapkan pembatasan akses pada area internal dan berupaya menyimpan data hanya selama diperlukan untuk transaksi, operasional, kewajiban hukum, dan penyelesaian sengketa."],
  ["Hak dan pertanyaan Anda", "Anda dapat menghubungi toko untuk menanyakan data yang berkaitan dengan transaksi atau meminta koreksi sesuai ketentuan yang berlaku. Verifikasi identitas dapat diminta sebelum permintaan diproses."],
] as const;

export default function PrivacyPage() {
  return <InformationPage description="Ringkasan ini menjelaskan bagaimana informasi diproses ketika Anda menggunakan storefront." eyebrow="Informasi" title="Kebijakan Privasi"><p className="mb-8 text-xs text-muted-foreground">Terakhir diperbarui: 15 Juli 2026</p><div className="grid gap-8">{sections.map(([title, copy], index) => <section className="grid gap-3 sm:grid-cols-[48px_1fr]" key={title}><span className="font-serif text-2xl text-primary">{String(index + 1).padStart(2, "0")}</span><div><h2 className="text-lg font-bold">{title}</h2><p className="mt-2 text-sm leading-8 text-muted-foreground">{copy}</p></div></section>)}</div><p className="mt-12 rounded-xl bg-secondary p-5 text-sm leading-7 text-muted-foreground">Untuk pertanyaan privasi, gunakan informasi resmi pada halaman <Link className="font-bold text-primary underline underline-offset-4" href="/contact">Kontak</Link>.</p></InformationPage>;
}
