import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Coupon } from "../types";
import { getSharedActor } from "../utils/backendActor";

interface CartStore {
  items: CartItem[];
  appliedCoupon: Coupon | null;
  pointsToRedeem: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  setPointsToRedeem: (n: number) => void;
  /** Load the user's saved cart from the backend, replacing local state. */
  loadCartFromBackend: (token: string) => Promise<void>;
  /** Sync current cart items to the backend. Silently swallows errors. */
  syncCartToBackend: (token: string) => Promise<void>;
}

// Debounce helper — only executes fn after `delay` ms have passed since the
// last invocation. Used so rapid addItem/removeItem calls don't hammer the
// backend on every keystroke.
let syncTimer: ReturnType<typeof setTimeout> | null = null;
function debouncedSync(fn: () => void, delay = 800) {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(fn, delay);
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,
      pointsToRedeem: 0,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, item] };
        });
        // Sync to backend if logged in (debounced)
        const token = localStorage.getItem("pretty-baked-auth-token");
        if (token) {
          debouncedSync(() => get().syncCartToBackend(token));
        }
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
        const token = localStorage.getItem("pretty-baked-auth-token");
        if (token) {
          debouncedSync(() => get().syncCartToBackend(token));
        }
      },

      updateQuantity: (productId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((i) => i.productId !== productId),
            };
          }
          return {
            items: state.items.map((i) =>
              i.productId === productId ? { ...i, quantity } : i,
            ),
          };
        });
        const token = localStorage.getItem("pretty-baked-auth-token");
        if (token) {
          debouncedSync(() => get().syncCartToBackend(token));
        }
      },

      clearCart: () =>
        set({ items: [], appliedCoupon: null, pointsToRedeem: 0 }),

      total: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      itemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),

      removeCoupon: () => set({ appliedCoupon: null }),

      setPointsToRedeem: (n) => set({ pointsToRedeem: n }),

      loadCartFromBackend: async (token) => {
        try {
          const actor = await getSharedActor();
          const backendItems = await actor.getMyCart(token);
          // Convert bigint productId/quantity to numbers and store directly.
          // Price/name fields will be populated reactively when the product
          // catalog loads — the cart store only strictly needs productId + quantity
          // for syncing. We preserve any existing CartItem fields (price, name,
          // image) from the current store items if a match exists, so nothing is
          // lost for items that were already in memory.
          const existingItems = useCartStore.getState().items;
          const cartItems: CartItem[] = backendItems.map((bi) => {
            const productId = String(Number(bi.productId));
            const quantity = Number(bi.quantity);
            const existing = existingItems.find(
              (i) => i.productId === productId,
            );
            if (existing) return { ...existing, quantity };
            // Minimal stub — price/name/imageUrl will be filled once the product list loads
            return { productId, quantity, name: "", price: 0, imageUrl: "" };
          });
          set({ items: cartItems });
        } catch {
          // silently ignore — local persisted cart remains in place
        }
      },

      syncCartToBackend: async (token) => {
        try {
          const actor = await getSharedActor();
          const items = get().items.map((i) => ({
            productId: BigInt(i.productId),
            quantity: BigInt(i.quantity),
          }));
          await actor.saveMyCart(token, items);
        } catch {
          // silently ignore
        }
      },
    }),
    { name: "bakecraft-cart" },
  ),
);
