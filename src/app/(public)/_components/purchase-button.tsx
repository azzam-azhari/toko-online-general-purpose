"use client";

import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { type CartProduct, useCart } from "./cart-provider";

type PurchaseButtonProps = {
  product: Omit<CartProduct, "ctaType"> & { ctaType: "midtrans" | "custom_url" | "whatsapp" };
  label: string;
  href?: string | null;
  openInNewTab?: boolean;
  className?: string;
  compact?: boolean;
};

export function PurchaseButton({
  product,
  label,
  href,
  openInNewTab = false,
  className,
  compact = false,
}: PurchaseButtonProps) {
  const cart = useCart();
  const router = useRouter();
  const isUnavailable = product.availableStock < 1 || (product.ctaType !== "midtrans" && !href);

  function handlePurchase(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (isUnavailable) return;

    if (product.ctaType === "midtrans") {
      cart.addItem({ ...product, ctaType: "midtrans" });
      toast.success(`${product.name} ditambahkan ke keranjang.`);
      router.push("/cart");
      return;
    }

    if (href) {
      if (openInNewTab || product.ctaType === "whatsapp") {
        window.open(href, "_blank", "noopener,noreferrer");
      } else {
        window.location.assign(href);
      }
    }
  }

  return (
    <Button
      aria-label={`${label}: ${product.name}`}
      className={cn("relative z-20", className)}
      disabled={isUnavailable}
      onClick={handlePurchase}
      size={compact ? "sm" : "lg"}
      type="button"
    >
      <ShoppingBag aria-hidden="true" />
      {isUnavailable ? "Stok Habis" : label}
    </Button>
  );
}
