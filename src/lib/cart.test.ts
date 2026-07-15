import { describe, expect, it } from "vitest";

import { clampCartQuantity, isCartItem, sanitizeStoredCart } from "./cart";

const cartItem = {
  id: "product-1",
  slug: "produk-satu",
  name: "Produk Satu",
  price: 25_000,
  imageUrl: null,
  availableStock: 5,
  ctaType: "midtrans" as const,
  quantity: 2,
};

describe("cart domain", () => {
  it("membatasi jumlah sesuai aturan keranjang", () => {
    expect(clampCartQuantity(0, 5)).toBe(1);
    expect(clampCartQuantity(2.9, 5)).toBe(2);
    expect(clampCartQuantity(8, 5)).toBe(5);
  });

  it("mengenali item keranjang yang tersimpan", () => {
    expect(isCartItem(cartItem)).toBe(true);
    expect(isCartItem({ ...cartItem, ctaType: "whatsapp" })).toBe(false);
    expect(isCartItem({ ...cartItem, price: "25000" })).toBe(false);
  });

  it("membuang data rusak dan menormalkan jumlah item tersimpan", () => {
    expect(
      sanitizeStoredCart([
        { ...cartItem, quantity: 12 },
        { ...cartItem, id: "product-2", quantity: 3.8 },
        { id: "invalid" },
      ]),
    ).toEqual([
      { ...cartItem, quantity: 5 },
      { ...cartItem, id: "product-2", quantity: 3 },
    ]);
  });
});
