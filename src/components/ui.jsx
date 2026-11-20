import { Star, Loader2, ImageOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { STATUS_STYLES } from '../utils/format';

export const Spinner = ({ className = '' }) => <Loader2 className={`animate-spin text-brand-600 ${className}`} />;
export const PageLoader = () => <div className="flex min-h-[50vh] items-center justify-center"><Spinner size={32} /></div>;

export const Rating = ({ value = 0, count, size = 14 }) => (
  <div className="flex items-center gap-1.5">
    <div className="flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-ink/20'} />
      ))}
    </div>
    {count !== undefined && <span className="text-xs text-ink/50">({count})</span>}
  </div>
);

export const StatusBadge = ({ status }) => (
  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>
);

export const ProductImage = ({ product, className = '', index = 0 }) => {
  const img = product?.images?.[index]?.url || product?.image;
  if (img) return <img src={img} alt={product.name} loading="lazy" className={`h-full w-full object-cover ${className}`} />;
  return (
    <div className={`flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-brand-100 via-white to-peach-100 text-brand-600/60 ${className}`}>
      <ImageOff size={26} />
      <span className="px-3 text-center font-display text-sm text-ink/40">{product?.name?.slice(0, 22)}</span>
    </div>
  );
};

export const Empty = ({ icon: Icon, title, text, to, cta }) => (
  <div className="flex flex-col items-center rounded-2xl border border-dashed border-ink/15 bg-white px-6 py-16 text-center">
    {Icon && <Icon size={36} className="mb-3 text-brand-500" />}
    <h3 className="text-xl font-semibold">{title}</h3>
    {text && <p className="mt-1 max-w-sm text-sm text-ink/60">{text}</p>}
    {to && <Link to={to} className="btn-primary mt-5">{cta}</Link>}
  </div>
);

export const Field = ({ label, error, children }) => (
  <label className="block">
    <span className="label">{label}</span>
    {children}
    {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
  </label>
);

export const Pagination = ({ page, pages, onChange }) =>
  pages > 1 && (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button className="btn-ghost !px-3 !py-1.5" disabled={page <= 1} onClick={() => onChange(page - 1)}>Prev</button>
      <span className="text-sm text-ink/60">Page {page} of {pages}</span>
      <button className="btn-ghost !px-3 !py-1.5" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button>
    </div>
  );

export const SkeletonCard = () => (
  <div className="card animate-pulse overflow-hidden">
    <div className="aspect-square bg-ink/5" />
    <div className="space-y-2 p-4"><div className="h-3 w-1/3 rounded bg-ink/5" /><div className="h-4 w-4/5 rounded bg-ink/5" /><div className="h-4 w-1/2 rounded bg-ink/5" /></div>
  </div>
);

export const Modal = ({ open, onClose, title, children, wide }) =>
  open && (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/50 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`card my-8 w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} p-6`}>
        <div className="mb-4 flex items-center justify-between"><h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-ink/50 hover:bg-ink/5" aria-label="Close">✕</button></div>
        {children}
      </div>
    </div>
  );
