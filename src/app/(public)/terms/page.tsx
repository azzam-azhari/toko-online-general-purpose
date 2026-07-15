import type { Metadata } from "next";
import Link from "next/link";

import { InformationPage } from "../_components/information-page";

export const metadata: Metadata = { title: "Syarat dan Ketentuan", description: "Syarat dasar penggunaan katalog dan jalur pembelian NusaMart.", alternates: { canonical: "/terms" } };

const sections = [
  ["Penggunaan storefront", "Anda dapat menjelajah katalog tanpa akun pelanggan. Gunakan storefront secara wajar dan jangan mencoba mengganggu layanan, mengakses area internal, atau menyalahgunakan informasi produk."],
  ["Informasi produk", "Harga, stok, deskripsi, dan tujuan tombol beli mengikuti data aktif yang dikelola toko. Ketersediaan dapat berubah dan akan diperiksa kembali pada tahap transaksi yang relevan."],
  ["Jalur pembelian", "Tombol beli dapat membuka WhatsApp, tautan eksternal, atau keranjang untuk pembayaran. Ketentuan tambahan dari penyedia pihak ketiga dapat berlaku ketika Anda melanjutkan ke layanan mereka."],
  ["Keranjang", "Keranjang hanya menerima produk aktif yang dikonfigurasi untuk pembayaran Midtrans. Menambahkan produk ke keranjang belum membentuk pesanan dan belum menjamin reservasi stok."],
  ["Perubahan layanan", "Fitur, isi katalog, dan dokumen ini dapat diperbarui agar tetap selaras dengan operasional toko dan ketentuan yang berlaku."],
] as const;

export default function TermsPage() {
  return <InformationPage description="Dengan menggunakan storefront, Anda menyetujui ketentuan penggunaan berikut." eyebrow="Informasi" title="Syarat dan Ketentuan"><p className="mb-8 text-xs text-muted-foreground">Terakhir diperbarui: 15 Juli 2026</p><div className="grid gap-8">{sections.map(([title, copy], index) => <section className="grid gap-3 sm:grid-cols-[48px_1fr]" key={title}><span className="font-serif text-2xl text-primary">{String(index + 1).padStart(2, "0")}</span><div><h2 className="text-lg font-bold">{title}</h2><p className="mt-2 text-sm leading-8 text-muted-foreground">{copy}</p></div></section>)}</div><p className="mt-12 rounded-xl bg-secondary p-5 text-sm leading-7 text-muted-foreground">Jika Anda memerlukan penjelasan sebelum membeli, hubungi toko melalui halaman <Link className="font-bold text-primary underline underline-offset-4" href="/contact">Kontak</Link>.</p></InformationPage>;
}
