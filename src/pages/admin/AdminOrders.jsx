import { useCallback, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import api, { errMsg } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { PageLoader, Pagination, StatusBadge } from '../../components/ui';
import { dateTimeFmt, money } from '../../utils/format';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);

  const load = useCallback(() => api.get('/orders/admin/all', { params: { status: status || undefined, search: search || undefined, page } }).then((r) => setData(r.data)), [status, search, page]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  const update = async (o, next) => {
    if (next === 'cancelled' && !window.confirm('Cancel this order? Stock will be returned.')) return;
    try { await api.put(`/orders/admin/${o._id}/status`, { status: next }); toast.success(`Order marked ${next}`); load(); } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Orders</h1>
      <div className="flex flex-wrap gap-3">
        <input className="input max-w-xs" placeholder="Search order number..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <select className="input !w-auto" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}</select>
      </div>
      {!data ? <PageLoader /> : (
        <div className="space-y-3">{data.orders.map((o) => {
          const final = ['delivered', 'cancelled'].includes(o.status);
          return (
            <div key={o._id} className="card">
              <div className="flex flex-wrap items-center gap-4 p-4">
                <button onClick={() => setOpen(open === o._id ? null : o._id)} className="flex items-center gap-2 font-semibold">{open === o._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}{o.orderNumber}</button>
                <div className="text-sm text-ink/60">{o.user?.name || 'Deleted user'} · {dateTimeFmt(o.createdAt)}</div>
                <div className="ml-auto flex flex-wrap items-center gap-3"><span className="font-bold">{money(o.totalPrice)}</span><StatusBadge status={o.status} />
                  <select disabled={final} value={o.status} onChange={(e) => update(o, e.target.value)} className="rounded-lg border border-ink/15 bg-white px-2 py-1.5 text-sm disabled:opacity-50" aria-label="Update status">{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
              </div>
              {open === o._id && (
                <div className="grid gap-6 border-t border-ink/10 p-4 text-sm md:grid-cols-2">
                  <div><h4 className="mb-2 font-sans font-semibold">Items</h4><ul className="space-y-1.5">{o.items.map((i) => <li key={i.name} className="flex justify-between gap-3"><span>{i.name} × {i.qty}</span><span>{money(i.price * i.qty)}</span></li>)}</ul>
                    <div className="mt-3 border-t border-ink/10 pt-2 text-ink/60">Delivery {money(o.shippingPrice)} · {o.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card'} ({o.paymentStatus})</div></div>
                  <div><h4 className="mb-2 font-sans font-semibold">Ship to</h4><p className="text-ink/70">{o.shippingAddress.fullName}<br />{o.shippingAddress.street}, {o.shippingAddress.city} {o.shippingAddress.province}<br />{o.shippingAddress.phone}<br />{o.user?.email}</p>{o.notes && <p className="mt-2 rounded-lg bg-amber-50 p-2 text-amber-900">Note: {o.notes}</p>}</div>
                </div>)}
            </div>);
        })}
          {data.orders.length === 0 && <p className="card p-8 text-center text-ink/55">No orders match.</p>}</div>)}
      {data && <Pagination page={data.page} pages={data.pages} onChange={setPage} />}
    </div>
  );
}
