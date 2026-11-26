import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { CartItem, Product } from '../types';
import { useToast } from './ToastContext';

const CART_STORAGE_KEY = 'by_sawadhee_cart_v1';

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, nextQuantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  syncCartWithProducts: (latestProducts: Product[]) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function loadInitialCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadInitialCart);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage quota errors
    }
  }, [items]);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  const addToCart = useCallback(
    (product: Product, quantity = 1) => {
      if (!product.is_active || product.stock <= 0) {
        showToast('Maaf, stok produk ini sedang habis.', 'error');
        return;
      }

      setItems((prev) => {
        const existingIndex = prev.findIndex((i) => i.product.id === product.id);
        if (existingIndex === -1) {
          const safeQty = Math.min(quantity, product.stock);
          showToast(`${product.name} ditambahkan ke keranjang.`);
          return [...prev, { product, quantity: safeQty }];
        }

        const existing = prev[existingIndex];
        const nextQty = existing.quantity + quantity;
        if (nextQty > product.stock) {
          showToast(`Maksimal pembelian sesuai stok tersisa (${product.stock}).`, 'info');
          return prev;
        }

        const updated = [...prev];
        updated[existingIndex] = { product, quantity: nextQty };
        showToast(`Jumlah ${product.name} diperbarui (${nextQty}).`);
        return updated;
      });
    },
    [showToast]
  );

  const updateQuantity = useCallback(
    (productId: string, nextQuantity: number) => {
      setItems((prev) => {
        const target = prev.find((i) => i.product.id === productId);
        if (!target) return prev;

        if (nextQuantity <= 0) {
          return prev.filter((i) => i.product.id !== productId);
        }

        if (nextQuantity > target.product.stock) {
          showToast(
            `Stok ${target.product.name} hanya tersisa ${target.product.stock}.`,
            'info'
          );
          return prev.map((i) =>
            i.product.id === productId
              ? { ...i, quantity: target.product.stock }
              : i
          );
        }

        return prev.map((i) =>
          i.product.id === productId ? { ...i, quantity: nextQuantity } : i
        );
      });
    },
    [showToast]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
      showToast('Produk dihapus dari keranjang.', 'info');
    },
    [showToast]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const syncCartWithProducts = useCallback((latestProducts: Product[]) => {
    setItems((prev) => {
      if (prev.length === 0) return prev;
      const productMap = new Map(latestProducts.map((p) => [p.id, p]));
      return prev
        .map((item) => {
          const fresh = productMap.get(item.product.id);
          if (!fresh || !fresh.is_active || fresh.stock <= 0) return null;
          return {
            product: fresh,
            quantity: Math.min(item.quantity, fresh.stock),
          };
        })
        .filter((item): item is CartItem => item !== null);
    });
  }, []);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      totalItems,
      totalAmount,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      syncCartWithProducts,
    }),
    [
      items,
      totalItems,
      totalAmount,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      syncCartWithProducts,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart harus digunakan di dalam CartProvider');
  }
  return ctx;
}
