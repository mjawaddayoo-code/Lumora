import { useRef, useState } from 'react';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import api, { errMsg } from '../api/client';
import { useToast } from '../context/ToastContext';

// Uploads straight to Cloudinary via the API. `value` = [{ url, publicId }]
export default function ImageUploader({ value, onChange, multiple = true, folder = 'products' }) {
  const ref = useRef();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const pick = async (e) => {
    const files = [...e.target.files];
    e.target.value = '';
    if (!files.length) return;
    setBusy(true);
    const added = [];
    for (const file of multiple ? files : files.slice(0, 1)) {
      const fd = new FormData();
      fd.append('image', file);
      try { added.push((await api.post(`/admin/upload?folder=${folder}`, fd)).data.image); }
      catch (err) { toast.error(`${file.name}: ${errMsg(err)}`); }
    }
    if (added.length) onChange(multiple ? [...value, ...added] : added);
    setBusy(false);
  };

  return (
    <div className="flex flex-wrap gap-3">
      {value.map((img, i) => (
        <div key={img.url} className="group relative h-24 w-24 overflow-hidden rounded-xl border border-ink/10">
          <img src={img.url} alt="" className="h-full w-full object-cover" />
          {multiple && i === 0 && <span className="absolute bottom-0 inset-x-0 bg-ink/70 text-center text-[10px] font-semibold text-white">MAIN</span>}
          <button type="button" onClick={() => onChange(value.filter((_, n) => n !== i))} className="absolute right-1 top-1 rounded-full bg-white p-1 shadow" aria-label="Remove image"><X size={12} /></button>
        </div>))}
      <button type="button" onClick={() => ref.current.click()} disabled={busy}
        className="grid h-24 w-24 place-items-center rounded-xl border-2 border-dashed border-ink/20 text-ink/50 hover:border-brand-500 hover:text-brand-600">
        {busy ? <Loader2 className="animate-spin" /> : <span className="flex flex-col items-center text-xs"><ImagePlus size={20} />Upload</span>}
      </button>
      <input ref={ref} type="file" accept="image/*" multiple={multiple} hidden onChange={pick} />
    </div>
  );
}
