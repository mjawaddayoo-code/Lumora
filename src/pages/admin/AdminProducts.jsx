import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import api, { errMsg } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Field, Modal, PageLoader, Pagination, ProductImage } from '../../components/ui';
import ImageUploader from '../../components/ImageUploader';
import { money } from '../../utils/format';

const blank = { name: '', description: '', price: '', comparePrice: '', category: '', stock: 0, sku: '', brand: '', tags: '', featured: false, isActive: true, images: [] };

function StockCell({ product, onSaved }) {
  const toast = useToast();
  const [v, setV] = useState(product.stock);
  useEffect(() => setV(product.stock), [product.stock]);
  const save = async () => {
    if (Number(v) === product.stock || v === '') return;
    try { await api.patch(`/products/${product._id}/stock`, { stock: Number(v) }); toast.success('Stock updated'); onSaved(); } catch (e) { toast.error(errMsg(e)); setV(product.stock); }
  };
  return <input type="number" min="0" value={v} onChange={(e) => setV(e.target.value)} onBlur={save} onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
    className={`w-20 rounded-lg border px-2 py-1 text-sm ${product.stock === 0 ? 'border-red-300 bg-red-50' : product.stock <= 5 ? 'border-amber-300 bg-amber-50' : 'border-ink/15'}`} aria-label="Stock" />;
}

export default function AdminProducts() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [cats, setCats] = useState([]);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => api.get('/products/admin/list', { params: { search: q || undefined, page, limit: 10 } }).then((r) => setData(r.data)), [q, page]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);
  useEffect(() => { api.get('/categories/admin/all').then((r) => setCats(r.data.categories)); }, []);

  const edit = (p) => setForm({ ...p, category: p.category?._id || '', tags: (p.tags || []).join(', '), comparePrice: p.comparePrice || '' });
  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    const body = { ...form, price: Number(form.price), stock: Number(form.stock), comparePrice: Number(form.comparePrice) || 0 };
    try {
      if (form._id) await api.put(`/products/${form._id}`, body); else await api.post('/products', body);
      toast.success(form._id ? 'Product updated' : 'Product created'); setForm(null); load();
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };
  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? Its images and reviews will also be deleted.`)) return;
    try { await api.delete(`/products/${p._id}`); toast.success('Product deleted'); load(); } catch (e) { toast.error(errMsg(e)); }
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-bold">Products</h1>
        <button className="btn-primary" onClick={() => setForm({ ...blank, category: cats[0]?._id || '' })} disabled={!cats.length} title={!cats.length ? 'Create a category first' : ''}><Plus size={16} />Add product</button></div>
      <div className="relative max-w-sm"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" /><input className="input pl-9" placeholder="Search products..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></div>
      {!data ? <PageLoader /> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-ink/[.03] text-left text-xs uppercase text-ink/50"><tr><th className="p-3">Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th className="pr-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-ink/5">{data.products.map((p) => (
              <tr key={p._id}>
                <td className="p-3"><div className="flex items-center gap-3"><div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg"><ProductImage product={p} /></div><div className="min-w-0"><div className="line-clamp-1 font-medium">{p.name}</div><div className="text-xs text-ink/45">{p.sold} sold {p.featured && '· Featured'}</div></div></div></td>
                <td className="text-ink/65">{p.category?.name || '-'}</td>
                <td className="font-medium">{money(p.price)}</td>
                <td><StockCell product={p} onSaved={load} /></td>
                <td><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>{p.isActive ? 'Active' : 'Hidden'}</span></td>
                <td className="pr-3 text-right"><button onClick={() => edit(p)} className="rounded-lg p-2 hover:bg-brand-50" aria-label="Edit"><Pencil size={16} /></button><button onClick={() => remove(p)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Delete"><Trash2 size={16} /></button></td>
              </tr>))}
              {data.products.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-ink/50">No products found.</td></tr>}</tbody>
          </table>
        </div>)}
      {data && <Pagination page={data.page} pages={data.pages} onChange={setPage} />}

      <Modal open={!!form} onClose={() => setForm(null)} title={form?._id ? 'Edit product' : 'Add product'} wide>
        {form && (
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Field label="Name"><input required className="input" value={form.name} onChange={set('name')} /></Field></div>
            <div className="sm:col-span-2"><Field label="Description"><textarea required className="input min-h-28" value={form.description} onChange={set('description')} /></Field></div>
            <Field label="Price"><input required type="number" min="0" step="any" className="input" value={form.price} onChange={set('price')} /></Field>
            <Field label="Compare-at price (optional)"><input type="number" min="0" step="any" className="input" value={form.comparePrice} onChange={set('comparePrice')} /></Field>
            <Field label="Category"><select required className="input" value={form.category} onChange={set('category')}>{cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select></Field>
            <Field label="Stock"><input required type="number" min="0" className="input" value={form.stock} onChange={set('stock')} /></Field>
            <Field label="Brand"><input className="input" value={form.brand} onChange={set('brand')} /></Field>
            <Field label="SKU"><input className="input" value={form.sku} onChange={set('sku')} /></Field>
            <div className="sm:col-span-2"><Field label="Tags (comma separated)"><input className="input" value={form.tags} onChange={set('tags')} /></Field></div>
            <div className="sm:col-span-2"><span className="label">Images (first image is the main photo)</span><ImageUploader value={form.images} onChange={(images) => setForm({ ...form, images })} /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-brand-600" checked={form.featured} onChange={set('featured')} />Featured on homepage</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-brand-600" checked={form.isActive} onChange={set('isActive')} />Visible in store</label>
            <div className="flex justify-end gap-3 sm:col-span-2"><button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancel</button><button className="btn-primary" disabled={busy}>{busy ? 'Saving...' : 'Save product'}</button></div>
          </form>)}
      </Modal>
    </div>
  );
}
