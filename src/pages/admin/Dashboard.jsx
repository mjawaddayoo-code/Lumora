import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Package, ShoppingCart, Users, AlertTriangle, Mail } from 'lucide-react';
import api from '../../api/client';
import { PageLoader, StatusBadge } from '../../components/ui';
import { dateTimeFmt, money } from '../../utils/format';

const Stat = ({ icon: I, label, value, tone }) => (
  <div className="card flex items-center gap-4 p-5"><span className={`grid h-12 w-12 place-items-center rounded-xl ${tone}`}><I size={22} /></span>
    <div><div className="text-xs font-semibold uppercase tracking-wide text-ink/50">{label}</div><div className="text-2xl font-bold">{value}</div></div></div>
);

export default function Dashboard() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get('/admin/stats').then((r) => setS(r.data.stats)); }, []);
  if (!s) return <PageLoader />;
  const max = Math.max(1, ...s.sales.map((d) => d.revenue));
  const total30 = s.sales.reduce((a, d) => a + d.revenue, 0);
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Dashboard</h1><p className="text-sm text-ink/55">Live data from your store database.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={DollarSign} label="Total revenue" value={money(s.totalRevenue)} tone="bg-emerald-100 text-emerald-700" />
        <Stat icon={ShoppingCart} label="Total orders" value={s.totalOrders} tone="bg-brand-100 text-brand-700" />
        <Stat icon={Package} label="Products" value={s.totalProducts} tone="bg-amber-100 text-amber-700" />
        <Stat icon={Users} label="Customers" value={s.totalUsers} tone="bg-peach-100 text-peach-600" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="card p-6">
          <div className="mb-4 flex items-end justify-between"><div><h2 className="text-lg font-bold">Sales - last 30 days</h2><p className="text-sm text-ink/55">{money(total30)} · avg order {money(s.averageOrderValue)}</p></div></div>
          <div className="flex h-48 items-end gap-1">{s.sales.map((d) => (
            <div key={d.date} className="group relative flex-1" title={`${d.date}: ${money(d.revenue)} (${d.orders} orders)`}>
              <div className="w-full rounded-t bg-brand-500/80 transition group-hover:bg-peach-500" style={{ height: `${Math.max(2, (d.revenue / max) * 100)}%` }} /></div>))}</div>
          <div className="mt-2 flex justify-between text-xs text-ink/40"><span>{s.sales[0].date}</span><span>{s.sales[29].date}</span></div>
        </div>
        <div className="card p-6"><h2 className="mb-4 text-lg font-bold">Orders by status</h2>
          <ul className="space-y-3">{['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((k) => (
            <li key={k} className="flex items-center justify-between"><StatusBadge status={k} /><span className="font-semibold">{s.ordersByStatus[k] || 0}</span></li>))}</ul>
          {s.unreadMessages > 0 && <Link to="/admin/messages" className="mt-5 flex items-center gap-2 rounded-xl bg-brand-50 p-3 text-sm font-medium text-brand-800"><Mail size={16} />{s.unreadMessages} unread message{s.unreadMessages > 1 ? 's' : ''}</Link>}
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="card p-6 xl:col-span-2"><div className="mb-4 flex justify-between"><h2 className="text-lg font-bold">Recent orders</h2><Link to="/admin/orders" className="text-sm font-semibold text-brand-700">View all</Link></div>
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-xs uppercase text-ink/45"><th className="pb-2">Order</th><th>Customer</th><th>Date</th><th>Status</th><th className="text-right">Total</th></tr></thead>
            <tbody className="divide-y divide-ink/5">{s.recentOrders.map((o) => (<tr key={o._id}><td className="py-2.5 font-medium">{o.orderNumber}</td><td>{o.user?.name || 'Deleted user'}</td><td className="text-ink/55">{dateTimeFmt(o.createdAt)}</td><td><StatusBadge status={o.status} /></td><td className="text-right font-semibold">{money(o.totalPrice)}</td></tr>))}
              {s.recentOrders.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-ink/50">No orders yet.</td></tr>}</tbody></table></div></div>
        <div className="space-y-6">
          <div className="card p-6"><h2 className="mb-3 text-lg font-bold">Top sellers</h2><ul className="space-y-2.5 text-sm">{s.topProducts.map((p) => (<li key={p._id} className="flex justify-between gap-3"><span className="line-clamp-1">{p.name}</span><span className="shrink-0 font-semibold">{p.sold} sold</span></li>))}{s.topProducts.length === 0 && <li className="text-ink/50">No data yet.</li>}</ul></div>
          <div className="card p-6"><h2 className="mb-3 flex items-center gap-2 text-lg font-bold"><AlertTriangle size={18} className="text-amber-500" />Low stock</h2><ul className="space-y-2.5 text-sm">{s.lowStock.map((p) => (<li key={p._id} className="flex justify-between gap-3"><span className="line-clamp-1">{p.name}</span><span className={`shrink-0 font-semibold ${p.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>{p.stock} left</span></li>))}{s.lowStock.length === 0 && <li className="text-ink/50">All products well stocked.</li>}</ul></div>
        </div>
      </div>
    </div>
  );
}
