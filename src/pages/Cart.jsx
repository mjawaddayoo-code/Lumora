import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Empty, ProductImage } from '../components/ui';
import { money } from '../utils/format';

export function OrderSummary({ cart, cta }) {
  const { config } = useStore();
  return (
    <aside className="card h-fit p-6 lg:sticky lg:top-32">
      <h2 className="mb-4 text-xl font-bold">Order summary</h2>
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between"><dt className="text-ink/60">Subtotal ({cart.count} items)</dt><dd className="font-medium">{money(cart.itemsPrice)}</dd></div>
        <div className="flex justify-between"><dt className="text-ink/60">Delivery</dt><dd className="font-medium">{cart.shippingPrice ? money(cart.shippingPrice) : 'Free'}</dd></div>
        {config.freeShippingThreshold > 0 && cart.shippingPrice > 0 && <p className="rounded-lg bg-brand-50 p-2 text-xs text-brand-800">Add {money(config.freeShippingThreshold - cart.itemsPrice)} more for free delivery.</p>}
        <div className="flex justify-between border-t border-ink/10 pt-3 text-base font-bold"><dt>Total</dt><dd>{money(cart.totalPrice)}</dd></div>
      </dl>
      {cta}
    </aside>
  );
}

export default function Cart() {
  const { cart, setQty, removeFromCart } = useStore();
  return (
    <div className="container-x py-10">
      <h1 className="mb-6 text-3xl font-bold">Your cart</h1>
      {cart.items.length === 0 ? <Empty icon={ShoppingBag} title="Your cart is empty" text="Discover something you'll love." to="/shop" cta="Start shopping" /> : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {cart.items.map(({ product: p, qty }) => (
              <div key={p._id} className="card flex gap-4 p-4">
                <Link to={`/product/${p.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-28"><ProductImage product={p} /></Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link to={`/product/${p.slug}`} className="line-clamp-2 font-semibold hover:text-brand-700">{p.name}</Link>
                  <div className="text-sm text-ink/55">{money(p.price)} each</div>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center rounded-lg border border-ink/15">
                      <button className="p-2" onClick={() => setQty(p._id, qty - 1)} aria-label="Decrease"><Minus size={14} /></button>
                      <span className="w-8 text-center text-sm font-semibold">{qty}</span>
                      <button className="p-2" disabled={qty >= p.stock} onClick={() => setQty(p._id, qty + 1)} aria-label="Increase"><Plus size={14} /></button>
                    </div>
                    <div className="flex items-center gap-3"><span className="font-bold">{money(p.price * qty)}</span>
                      <button onClick={() => removeFromCart(p._id)} className="text-ink/40 hover:text-red-600" aria-label="Remove"><Trash2 size={18} /></button></div>
                  </div>
                </div>
              </div>))}
          </div>
          <OrderSummary cart={cart} cta={<Link to="/checkout" className="btn-primary mt-5 w-full !py-3">Proceed to checkout</Link>} />
        </div>)}
    </div>
  );
}
