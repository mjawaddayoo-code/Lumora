import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { CheckCircle2, Package } from 'lucide-react';
import api, { errMsg } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Empty, PageLoader, StatusBadge } from '../components/ui';
import { dateFmt, dateTimeFmt, money } from '../utils/format';

export function Orders() {
  const [orders, setOrders] = useState(null);
  useEffect(() => { api.get('/orders/my').then((r) => setOrders(r.data.orders)).catch(() => setOrders([])); }, []);
  if (!orders) return <PageLoader />;
  return (
    <div className="container-x py-10">
      <h1 className="mb-6 text-3xl font-bold">My orders</h1>
      {orders.length === 0 ? <Empty icon={Package} title="No orders yet" text="When you place an order it will show up here." to="/shop" cta="Start shopping" /> : (
        <div className="space-y-4">{orders.map((o) => (
          <Link key={o._id} to={`/orders/${o._id}`} className="card block p-5 transition hover:shadow-lift">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><div className="font-semibold">{o.orderNumber}</div><div className="text-sm text-ink/55">{dateFmt(o.createdAt)} · {o.items.reduce((s, i) => s + i.qty, 0)} items</div></div>
              <div className="flex items-center gap-4"><StatusBadge status={o.status} /><span className="font-bold">{money(o.totalPrice)}</span></div>
            </div>
          </Link>))}</div>)}
    </div>
  );
}

const STEPS = ['pending', 'processing', 'shipped', 'delivered'];

export function OrderDetail() {
  const { id } = useParams();
  const { state } = useLocation();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { api.get(`/orders/${id}`).then((r) => setOrder(r.data.order)).catch(() => setOrder(false)); }, [id]);
  if (order === null) return <PageLoader />;
  if (order === false) return <div className="container-x py-16"><Empty title="Order not found" to="/orders" cta="My orders" /></div>;

  const cancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setBusy(true);
    try { setOrder((await api.put(`/orders/${id}/cancel`)).data.order); toast.success('Order cancelled'); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  const a = order.shippingAddress;
  const step = STEPS.indexOf(order.status);

  return (
    <div className="container-x max-w-4xl py-10">
      {state?.placed && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-emerald-50 p-5 text-emerald-900"><CheckCircle2 className="mt-0.5 shrink-0" />
          <div><div className="font-semibold">Thank you! Your order is placed.</div><div className="text-sm">We'll confirm it shortly. {order.paymentMethod === 'cod' && `Please keep ${money(order.totalPrice)} ready for delivery.`}</div></div></div>)}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><Link to="/orders" className="text-sm text-brand-700 hover:underline">← All orders</Link><h1 className="mt-1 text-3xl font-bold">{order.orderNumber}</h1><p className="text-sm text-ink/55">Placed {dateTimeFmt(order.createdAt)}</p></div>
        <StatusBadge status={order.status} />
      </div>
      {order.status !== 'cancelled' && (
        <div className="card mb-6 p-6"><div className="flex items-center">{STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center last:flex-none"><div className="flex flex-col items-center gap-1.5">
            <span className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${i <= step ? 'bg-brand-600 text-white' : 'bg-ink/10 text-ink/40'}`}>{i + 1}</span>
            <span className="text-xs capitalize text-ink/60">{s}</span></div>
            {i < STEPS.length - 1 && <div className={`mx-2 mb-5 h-0.5 flex-1 ${i < step ? 'bg-brand-600' : 'bg-ink/10'}`} />}</div>))}</div></div>)}
      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="card divide-y divide-ink/10">{order.items.map((it) => (
          <div key={it.product + it.name} className="flex items-center gap-4 p-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-50">{it.image ? <img src={it.image} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-brand-400"><Package size={22} /></div>}</div>
            <div className="min-w-0 flex-1"><div className="line-clamp-2 font-medium">{it.name}</div><div className="text-sm text-ink/55">{money(it.price)} × {it.qty}</div></div>
            <div className="font-semibold">{money(it.price * it.qty)}</div></div>))}</div>
        <div className="space-y-4">
          <div className="card p-5 text-sm"><h3 className="mb-2 font-sans font-semibold">Ship to</h3><p className="text-ink/70">{a.fullName}<br />{a.street}<br />{a.city}{a.province && `, ${a.province}`} {a.postalCode}<br />{a.phone}</p></div>
          <div className="card space-y-2 p-5 text-sm">
            <div className="flex justify-between"><span className="text-ink/60">Subtotal</span><span>{money(order.itemsPrice)}</span></div>
            <div className="flex justify-between"><span className="text-ink/60">Delivery</span><span>{order.shippingPrice ? money(order.shippingPrice) : 'Free'}</span></div>
            <div className="flex justify-between border-t border-ink/10 pt-2 text-base font-bold"><span>Total</span><span>{money(order.totalPrice)}</span></div>
            <div className="pt-1 text-xs text-ink/55">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card'} · Payment {order.paymentStatus}</div>
          </div>
          {order.status === 'pending' && <button onClick={cancel} disabled={busy} className="btn-ghost w-full !text-red-600">Cancel order</button>}
        </div>
      </div>
    </div>
  );
}
