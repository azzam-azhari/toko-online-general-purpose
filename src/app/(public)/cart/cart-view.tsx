"use client";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/lib/storefront";

import { type CartItem, useCart } from "../_components/cart-provider";
import { ProductImage } from "../_components/product-image";

type UpdateQuantity = (productId: string, quantity: number) => void;

export function CartView() {
  const { items, hydrated, subtotal, updateQuantity, removeItem, clearCart } = useCart();

  if (!hydrated) return <CartLoadingState />;
  if (!items.length) return <EmptyCartState />;

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
      <section aria-labelledby="cart-items">
        <CartItemsHeader itemTypeCount={items.length} onClear={clearCart} />
        <div className="grid gap-4">
          {items.map((item) => (
            <CartItemCard
              item={item}
              key={item.id}
              onRemove={removeItem}
              onUpdateQuantity={updateQuantity}
            />
          ))}
        </div>
      </section>

      <CartSummary subtotal={subtotal} />
    </div>
  );
}

function CartLoadingState() {
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
      <div className="grid gap-4">
        {Array.from({ length: 2 }, (_, index) => (
          <Skeleton className="h-40 rounded-2xl" key={index} />
        ))}
      </div>
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  );
}

function EmptyCartState() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Card className="border-dashed">
        <CardContent className="grid min-h-80 place-items-center p-8 text-center">
          <div>
            <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-secondary text-primary">
              <ShoppingBag aria-hidden="true" className="size-7" />
            </span>
            <h2 className="mt-5 font-serif text-3xl">Keranjang masih kosong</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              Tambahkan produk dengan metode pembayaran Midtrans dari katalog atau halaman detail.
            </p>
            <Button asChild className="mt-6" size="lg">
              <Link href="/products">Jelajahi Katalog</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CartItemsHeader({ itemTypeCount, onClear }: { itemTypeCount: number; onClear: () => void }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <div>
        <h2 className="font-bold" id="cart-items">
          Produk di Keranjang
        </h2>
        <p className="text-sm text-muted-foreground">{itemTypeCount} jenis produk</p>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="ghost">
            Kosongkan
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kosongkan keranjang?</AlertDialogTitle>
            <AlertDialogDescription>
              Semua produk akan dihapus dari keranjang di perangkat ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={onClear}>Kosongkan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CartItemCard({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: CartItem;
  onRemove: (productId: string) => void;
  onUpdateQuantity: UpdateQuantity;
}) {
  const productHref = `/products/${item.slug}`;

  return (
    <Card>
      <CardContent className="grid grid-cols-[92px_1fr] gap-4 p-4 sm:grid-cols-[124px_1fr_auto] sm:items-center">
        <Link href={productHref}>
          <ProductImage
            alt={item.name}
            className="aspect-square rounded-xl"
            sizes="124px"
            src={item.imageUrl}
          />
        </Link>
        <div className="min-w-0">
          <Link className="line-clamp-2 font-bold hover:text-primary" href={productHref}>
            {item.name}
          </Link>
          <p className="mt-1 text-sm font-semibold text-primary">{formatRupiah(item.price)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Maks. {item.availableStock} produk
          </p>
          <div className="mt-4 flex items-center gap-2 sm:hidden">
            <QuantityControl
              itemId={item.id}
              quantity={item.quantity}
              stock={item.availableStock}
              update={onUpdateQuantity}
            />
            <RemoveItemButton item={item} onRemove={onRemove} />
          </div>
        </div>
        <div className="col-span-2 hidden items-end gap-3 sm:col-span-1 sm:flex sm:flex-col">
          <strong>{formatRupiah(item.price * item.quantity)}</strong>
          <div className="flex items-center gap-2">
            <QuantityControl
              itemId={item.id}
              quantity={item.quantity}
              stock={item.availableStock}
              update={onUpdateQuantity}
            />
            <RemoveItemButton item={item} onRemove={onRemove} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RemoveItemButton({
  item,
  onRemove,
}: {
  item: CartItem;
  onRemove: (productId: string) => void;
}) {
  return (
    <Button
      aria-label={`Hapus ${item.name}`}
      onClick={() => onRemove(item.id)}
      size="icon"
      variant="ghost"
    >
      <Trash2 aria-hidden="true" />
    </Button>
  );
}

function CartSummary({ subtotal }: { subtotal: number }) {
  return (
    <aside>
      <Card className="sticky top-24">
        <CardContent className="p-6">
          <h2 className="font-serif text-2xl">Ringkasan</h2>
          <div className="mt-6 grid gap-3 text-sm">
            <div className="flex justify-between gap-4 text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between gap-4 text-muted-foreground">
              <span>Ongkir</span>
              <span>Dihitung saat checkout</span>
            </div>
            <div className="mt-2 flex justify-between gap-4 border-t pt-4 text-base font-bold">
              <span>Total sementara</span>
              <span className="text-primary">{formatRupiah(subtotal)}</span>
            </div>
          </div>
          <Button className="mt-6 w-full" disabled size="lg">
            Lanjut ke Checkout
          </Button>
          <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
            Checkout dan pembayaran akan diaktifkan pada Fase 5. Isi keranjang tetap tersimpan di
            perangkat ini.
          </p>
          <Button asChild className="mt-3 w-full" variant="outline">
            <Link href="/products">Lanjut Belanja</Link>
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
}

function QuantityControl({
  itemId,
  quantity,
  stock,
  update,
}: {
  itemId: string;
  quantity: number;
  stock: number;
  update: UpdateQuantity;
}) {
  return (
    <div className="flex items-center rounded-lg border">
      <Button
        aria-label="Kurangi jumlah"
        disabled={quantity <= 1}
        onClick={() => update(itemId, quantity - 1)}
        size="icon"
        variant="ghost"
      >
        <Minus aria-hidden="true" />
      </Button>
      <span aria-live="polite" className="w-9 text-center text-sm font-bold">
        {quantity}
      </span>
      <Button
        aria-label="Tambah jumlah"
        disabled={quantity >= stock}
        onClick={() => update(itemId, quantity + 1)}
        size="icon"
        variant="ghost"
      >
        <Plus aria-hidden="true" />
      </Button>
    </div>
  );
}
