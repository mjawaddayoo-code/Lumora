import { useCallback, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import api, { errMsg } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { PageLoader, Pagination } from '../../components/ui';
import { dateFmt, money } from '../../utils/format';

export default function AdminCustomers() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const load = useCallback(() => api.get('/admin/users', { params: { search: q || undefined, page } }).then((r) => setData(r.data)), [q, page]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  const toggle = async (u) => { try { await api.patch(`/admin/users/${u._id}/active`, { isActive: !u.isActive }); toast.success(u.isActive ? 'Customer disabled' : 'Customer enabled'); load(); } catch (e) { toast.error(errMsg(e)); } };
  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name}? Their cart and reviews are removed; orders are kept.`)) return;
    try { await api.delete(`/admin/users/${u._id}`); toast.success('Customer deleted'); load(); } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Customers</h1>
      <input className="input max-w-sm" placeholder="Search name, email or phone..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
      {!data ? <PageLoader /> : (
        <div className="card overflow-x-auto"><table className="w-full min-w-[680px] text-sm">
          <thead className="bg-ink/[.03] text-left text-xs uppercase text-ink/50"><tr><th className="p-3">Customer</th><th>Phone</th><th>Joined</th><th>Orders</th><th>Spent</th><th>Status</th><th className="pr-3 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-ink/5">{data.users.map((u) => (
            <tr key={u._id}><td className="p-3"><div className="font-medium">{u.name}</div><div className="text-xs text-ink/50">{u.email}</div></td><td>{u.phone || '-'}</td><td className="text-ink/60">{dateFmt(u.createdAt)}</td><td>{u.orders}</td><td className="font-medium">{money(u.spent)}</td>
              <td><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{u.isActive ? 'Active' : 'Disabled'}</span></td>
              <td className="pr-3 text-right"><button onClick={() => toggle(u)} className="btn-ghost !px-3 !py-1.5 text-xs">{u.isActive ? 'Disable' : 'Enable'}</button><button onClick={() => remove(u)} className="ml-1 rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Delete"><Trash2 size={16} /></button></td></tr>))}
            {data.users.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-ink/50">No customers found.</td></tr>}</tbody></table></div>)}
      {data && <Pagination page={data.page} pages={data.pages} onChange={setPage} />}
    </div>
  );
}
