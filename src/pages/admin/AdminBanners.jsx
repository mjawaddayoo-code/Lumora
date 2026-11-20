import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import api, { errMsg } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Field, Modal, PageLoader } from '../../components/ui';
import ImageUploader from '../../components/ImageUploader';

const blank = { tag: '', title: '', text: '', ctaText: 'Shop now', ctaLink: '/shop', order: 0, isActive: true, image: { url: '', publicId: '' } };

export default function AdminBanners() {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [form, setForm] = useState(null);
  const load = () => api.get('/banners/admin/all').then((r) => setItems(r.data.banners));
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const save = async (e) => {
    e.preventDefault();
    const body = { ...form, order: Number(form.order) || 0 };
    try { if (form._id) await api.put(`/banners/${form._id}`, body); else await api.post('/banners', body); toast.success('Banner saved'); setForm(null); load(); }
    catch (err) { toast.error(errMsg(err)); }
  };
  const remove = async (b) => {
    if (!window.confirm(`Delete banner "${b.title}"?`)) return;
    try { await api.delete(`/banners/${b._id}`); toast.success('Banner deleted'); load(); } catch (err) { toast.error(errMsg(err)); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-bold">Homepage banners</h1>
        <p className="text-sm text-ink/55">These photo slides appear in the homepage hero. The full picture is shown on the right of the hero with the text on the left. Best: a product photo with a clean or transparent (PNG/WEBP) background, around 1200 × 1000 px.</p></div>
        <button className="btn-primary" onClick={() => setForm(blank)}><Plus size={16} />Add banner</button></div>
      {!items ? <PageLoader /> : (
        <div className="grid gap-4 md:grid-cols-2">{items.map((b) => (
          <div key={b._id} className="card overflow-hidden">
            <div className="relative aspect-[21/9] bg-gradient-to-br from-brand-700 to-peach-500">{b.image?.url && <img src={b.image.url} alt="" className="h-full w-full object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-r from-black/65 to-transparent p-4 text-white"><div className="line-clamp-2 max-w-[60%] font-display text-lg font-bold">{b.title}</div></div></div>
            <div className="flex items-center justify-between p-3 text-sm"><span className="text-ink/55">Order {b.order} · {b.isActive ? 'Visible' : 'Hidden'}</span>
              <div><button onClick={() => setForm(b)} className="rounded-lg p-2 hover:bg-brand-50" aria-label="Edit"><Pencil size={16} /></button><button onClick={() => remove(b)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Delete"><Trash2 size={16} /></button></div></div>
          </div>))}
          {items.length === 0 && <p className="card p-8 text-center text-ink/55 md:col-span-2">No banners yet - the homepage shows default colour slides. Add a photo banner to replace them.</p>}</div>)}
      <Modal open={!!form} onClose={() => setForm(null)} title={form?._id ? 'Edit banner' : 'Add banner'} wide>
        {form && (
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><span className="label">Background photo</span><ImageUploader multiple={false} folder="banners" value={form.image?.url ? [form.image] : []} onChange={(v) => setForm({ ...form, image: v[0] || { url: '', publicId: '' } })} /></div>
            <Field label="Small tag (optional)"><input className="input" maxLength={40} value={form.tag} onChange={set('tag')} /></Field>
            <Field label="Display order (0 = first)"><input type="number" className="input" value={form.order} onChange={set('order')} /></Field>
            <div className="sm:col-span-2"><Field label="Headline"><input required maxLength={120} className="input" value={form.title} onChange={set('title')} /></Field></div>
            <div className="sm:col-span-2"><Field label="Sub text"><textarea maxLength={240} className="input" value={form.text} onChange={set('text')} /></Field></div>
            <Field label="Button text"><input maxLength={30} className="input" value={form.ctaText} onChange={set('ctaText')} /></Field>
            <Field label="Button link"><input className="input" placeholder="/shop?category=..." value={form.ctaLink} onChange={set('ctaLink')} /></Field>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-brand-600" checked={form.isActive} onChange={set('isActive')} />Visible on homepage</label>
            <div className="flex justify-end gap-3 sm:col-span-2"><button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancel</button><button className="btn-primary">Save banner</button></div>
          </form>)}
      </Modal>
    </div>
  );
}
