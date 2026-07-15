export type CartProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string | null;
  availableStock: number;
  ctaType: "midtrans";
};

export type CartItem = CartProduct & { quantity: number };

export function clampCartQuantity(quantity: number, availableStock: number) {
  return Math.max(1, Math.min(Math.floor(quantity), availableStock));
}

export function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<CartItem>;
  return (
    typeof item.id === "string" &&
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    typeof item.quantity === "number" &&
    typeof item.availableStock === "number" &&
    item.ctaType === "midtrans"
  );
}

export function sanitizeStoredCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];

  return value.filter(isCartItem).map((item) => ({
    ...item,
    quantity: clampCartQuantity(item.quantity, item.availableStock),
  }));
}
