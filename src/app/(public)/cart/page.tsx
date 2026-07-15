import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Keranjang",
  description: "Periksa produk Midtrans yang disimpan di keranjang NusaMart.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  redirect("/products");
}
