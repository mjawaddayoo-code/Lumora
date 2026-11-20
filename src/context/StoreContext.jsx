import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { errMsg } from '../api/client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { setCurrency } from '../utils/format';

const StoreCtx = createContext(null);
export const useStore = () => useContext(StoreCtx);
const EMPTY_CART = { items: [], itemsPrice: 0, shippingPrice: 0, totalPrice: 0, count: 0 };

export function StoreProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const [cart, setCart] = useState(EMPTY_CART);
  const [wishlist, setWishlist] = useState([]);
  const [config, setConfig] = useState({ config: { currency: 'PKR', deliveryFee: 250, freeShippingThreshold: 0 }, paymentMethods: [] });

  useEffect(() => {
    api.get('/config').then((r) => { setConfig(r.data); setCurrency(r.data.config.currency); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) { setCart(EMPTY_CART); setWishlist([]); return; }
    api.get('/cart').then((r) => setCart(r.data.cart)).catch(() => {});
    api.get('/wishlist').then((r) => setWishlist(r.data.products)).catch(() => {});
  }, [user?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const guard = useCallback(async (fn, okMsg) => {
    try {
      const r = await fn();
      if (okMsg) toast.success(okMsg);
      return r;
    } catch (e) {
      toast.error(errMsg(e));
      return null;
    }
  }, [toast]);

  const addToCart = (productId, qty = 1) =>
    guard(async () => setCart((await api.post('/cart/items', { productId, qty })).data.cart), 'Added to cart');
  const setQty = (productId, qty) => guard(async () => setCart((await api.put(`/cart/items/${productId}`, { qty })).data.cart));
  const removeFromCart = (productId) => guard(async () => setCart((await api.delete(`/cart/items/${productId}`)).data.cart), 'Removed from cart');
  const resetCart = () => setCart(EMPTY_CART);

  const wishIds = useMemo(() => new Set(wishlist.map((p) => p._id)), [wishlist]);
  const toggleWishlist = (productId) => {
    const has = wishIds.has(productId);
    return guard(async () => setWishlist((await (has ? api.delete(`/wishlist/${productId}`) : api.post(`/wishlist/${productId}`))).data.products),
      has ? 'Removed from wishlist' : 'Saved to wishlist');
  };

  return (
    <StoreCtx.Provider value={{ cart, wishlist, wishIds, config: config.config, paymentMethods: config.paymentMethods, addToCart, setQty, removeFromCart, resetCart, toggleWishlist }}>
      {children}
    </StoreCtx.Provider>
  );
}
