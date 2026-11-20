import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import api, { errMsg } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Field, Modal, PageLoader } from '../../components/ui';
import ImageUploader from '../../components/ImageUploader';

const blank = { name: '', description: '', image: { url: '', publicId: '' }, isActive: true };

export default function AdminCategories() {
  const toast = useToast();
  const [cats, setCats] = useState(null);
  const [form, setForm] = useState(null);
  const load = () => api.get('/categories/admin/all').then((r) => setCats(r.data.categories));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (form._id) await api.put(`/categories/${form._id}`, form); else await api.post('/categories', form);
      toast.success('Category saved'); setForm(null); load();
    } catch (err) { toast.error(errMsg(err)); }
  };
  const remove = async (c) => {
    if (!window.confirm(`Delete category "${c.name}"?`)) return;
    try { await api.delete(`/categories/${c._id}`); toast.success('Category deleted'); load(); } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-3xl font-bold">Categories</h1><button className="btn-primary" onClick={() => setForm(blank)}><Plus size={16} />Add category</button></div>
      {!cats ? <PageLoader /> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cats.map((c) => (
          <div key={c._id} className="card flex items-center gap-4 p-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-100 to-peach-100">{c.image?.url ? <img src={c.image.url} alt="" className="h-full w-full object-cover" /> : <span className="font-display text-2xl font-bold text-brand-600/40">{c.name[0]}</span>}</div>
            <div className="min-w-0 flex-1"><div className="font-semibold">{c.name}</div><div className="text-xs text-ink/50">{c.productCount} products {!c.isActive && '· Hidden'}</div></div>
            <button onClick={() => setForm(c)} className="rounded-lg p-2 hover:bg-brand-50" aria-label="Edit"><Pencil size={16} /></button>
            <button onClick={() => remove(c)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Delete"><Trash2 size={16} /></button>
          </div>))}
          {cats.length === 0 && <p className="text-sm text-ink/55">No categories yet. Add one before creating products.</p>}</div>)}
      <Modal open={!!form} onClose={() => setForm(null)} title={form?._id ? 'Edit category' : 'Add category'}>
        {form && (
          <form onSubmit={save} className="space-y-4">
            <Field label="Name"><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Description"><textarea maxLength={300} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <div><span className="label">Image</span><ImageUploader multiple={false} folder="categories" value={form.image?.url ? [form.image] : []} onChange={(v) => setForm({ ...form, image: v[0] || { url: '', publicId: '' } })} /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-brand-600" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />Visible in store</label>
            <div className="flex justify-end gap-3"><button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancel</button><button className="btn-primary">Save</button></div>
          </form>)}
      </Modal>
    </div>
  );
}
