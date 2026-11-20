import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Banknote, CreditCard } from 'lucide-react';
import api, { errMsg } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { Empty, Field, ProductImage } from '../components/ui';
import { OrderSummary } from './Cart';
import { money } from '../utils/format';

const PROVINCES = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad Capital Territory', 'Azad Kashmir', 'Gilgit-Baltistan'];

export default function Checkout() {
  const { user } = useAuth();
  const { cart, paymentMethods, resetCart } = useStore();
  const toast = useToast();
  const nav = useNavigate();
  const [f, setF] = useState({ fullName: '', phone: '', street: '', city: '', province: '', postalCode: '', notes: '' });
  const [method, setMethod] = useState('cod');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setF((p) => ({ ...p, fullName: user.name, phone: user.phone || '', street: user.address?.street || '', city: user.address?.city || '', province: user.address?.province || '', postalCode: user.address?.postalCode || '' }));
  }, [user]);

  if (cart.items.length === 0) return <div className="container-x py-16"><Empty title="Nothing to check out" text="Your cart is empty." to="/shop" cta="Go shopping" /></div>;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!f.fullName.trim()) errs.fullName = 'Required';
    if (!/^[0-9+\-\s()]{7,20}$/.test(f.phone)) errs.phone = 'Enter a valid phone number';
    if (!f.street.trim()) errs.street = 'Required';
    if (!f.city.trim()) errs.city = 'Required';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const { notes, ...shippingAddress } = f;
      const r = await api.post('/orders', { shippingAddress, notes, paymentMethod: method });
      resetCart();
      toast.success('Order placed!');
      nav(`/orders/${r.data.order._id}`, { replace: true, state: { placed: true } });
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <div className="container-x py-10">
      <h1 className="mb-6 text-3xl font-bold">Checkout</h1>
      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="mb-4 text-xl font-bold">Shipping information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.fullName}><input className="input" value={f.fullName} onChange={set('fullName')} /></Field>
              <Field label="Phone" error={errors.phone}><input className="input" placeholder="03XX-XXXXXXX" value={f.phone} onChange={set('phone')} /></Field>
              <div className="sm:col-span-2"><Field label="Street address" error={errors.street}><input className="input" value={f.street} onChange={set('street')} /></Field></div>
              <Field label="City" error={errors.city}><input className="input" value={f.city} onChange={set('city')} /></Field>
              <Field label="Province"><select className="input" value={f.province} onChange={set('province')}><option value="">Select...</option>{PROVINCES.map((p) => <option key={p}>{p}</option>)}</select></Field>
              <Field label="Postal code"><input className="input" value={f.postalCode} onChange={set('postalCode')} /></Field>
              <div className="sm:col-span-2"><Field label="Order notes (optional)"><textarea maxLength={500} className="input min-h-20" value={f.notes} onChange={set('notes')} /></Field></div>
            </div>
          </section>
          <section className="card p-6">
            <h2 className="mb-4 text-xl font-bold">Payment method</h2>
            <div className="space-y-3">
              {(paymentMethods.length ? paymentMethods : [{ id: 'cod', label: 'Cash on Delivery', enabled: true }]).map((m) => (
                <label key={m.id} className={`flex items-start gap-3 rounded-xl border p-4 ${!m.enabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${method === m.id ? 'border-brand-600 bg-brand-50' : 'border-ink/15'}`}>
                  <input type="radio" name="pay" disabled={!m.enabled} checked={method === m.id} onChange={() => setMethod(m.id)} className="mt-1 accent-brand-600" />
                  {m.id === 'cod' ? <Banknote className="text-brand-600" /> : <CreditCard className="text-brand-600" />}
                  <div><div className="font-semibold">{m.label}</div>
                    <div className="text-sm text-ink/55">{m.enabled ? (m.id === 'cod' ? 'Pay in cash when your order arrives.' : 'Pay securely online.') : m.reason || 'Unavailable'}</div></div>
                </label>))}
            </div>
          </section>
        </div>
        <div>
          <OrderSummary cart={cart} cta={<>
            <ul className="mt-4 max-h-52 space-y-3 overflow-y-auto border-t border-ink/10 pt-4">
              {cart.items.map(({ product: p, qty }) => (<li key={p._id} className="flex items-center gap-3 text-sm"><div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg"><ProductImage product={p} /></div>
                <span className="line-clamp-2 flex-1">{p.name} <span className="text-ink/50">× {qty}</span></span><span className="font-medium">{money(p.price * qty)}</span></li>))}
            </ul>
            <button className="btn-primary mt-5 w-full !py-3" disabled={busy}>{busy ? 'Placing order...' : `Place order · ${money(cart.totalPrice)}`}</button>
            <Link to="/cart" className="mt-3 block text-center text-sm text-ink/60 hover:text-brand-700">Back to cart</Link></>} />
        </div>
      </form>
    </div>
  );
}
