"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";

import {
  clampCartQuantity,
  sanitizeStoredCart,
  type CartItem,
  type CartProduct,
} from "@/lib/cart";

export type { CartItem, CartProduct } from "@/lib/cart";

type CartState = { items: CartItem[]; hydrated: boolean };

type CartContextValue = CartState & {
  itemCount: number;
  subtotal: number;
  addItem: (product: CartProduct, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "nusamart-cart-v1";
const SERVER_STATE: CartState = { items: [], hydrated: false };
let state = SERVER_STATE;
let hasHydrated = false;
const listeners = new Set<() => void>();

function emit(nextState: CartState) {
  state = nextState;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function persist(items: CartItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // The cart still works for this page when browser storage is unavailable.
  }
}

function hydrateCart() {
  if (hasHydrated) return;
  hasHydrated = true;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    emit({ items: sanitizeStoredCart(parsed), hydrated: true });
  } catch {
    emit({ items: [], hydrated: true });
  }
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);

  useEffect(() => {
    hydrateCart();
  }, []);

  const value = useMemo<CartContextValue>(() => {
    function save(items: CartItem[]) {
      persist(items);
      emit({ items, hydrated: true });
    }

    return {
      ...snapshot,
      itemCount: snapshot.items.reduce((total, item) => total + item.quantity, 0),
      subtotal: snapshot.items.reduce((total, item) => total + item.price * item.quantity, 0),
      addItem(product, quantity = 1) {
        if (product.ctaType !== "midtrans" || product.availableStock < 1) return;
        const existing = state.items.find((item) => item.id === product.id);
        const nextQuantity = Math.min(
          product.availableStock,
          (existing?.quantity ?? 0) + Math.max(1, Math.floor(quantity)),
        );
        const next = existing
          ? state.items.map((item) =>
              item.id === product.id ? { ...item, ...product, quantity: nextQuantity } : item,
            )
          : [...state.items, { ...product, quantity: nextQuantity }];
        save(next);
      },
      updateQuantity(productId, quantity) {
        const next = state.items.map((item) =>
          item.id === productId
            ? { ...item, quantity: clampCartQuantity(quantity, item.availableStock) }
            : item,
        );
        save(next);
      },
      removeItem(productId) {
        save(state.items.filter((item) => item.id !== productId));
      },
      clearCart() {
        save([]);
      },
    };
  }, [snapshot]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart harus digunakan di dalam CartProvider.");
  return value;
}
