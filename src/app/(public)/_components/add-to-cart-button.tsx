"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { type CartProduct, useCart } from "./cart-provider";

export function AddToCartButton({ product }: { product: CartProduct }) {
  const { addItem } = useCart();

  return (
    <Button
      className="w-full sm:w-auto"
      disabled={product.availableStock < 1}
      onClick={() => {
        addItem(product);
        toast.success(`${product.name} ditambahkan ke keranjang.`);
      }}
      size="lg"
      type="button"
      variant="outline"
    >
      <Plus aria-hidden="true" /> Tambah ke Keranjang
    </Button>
  );
}
