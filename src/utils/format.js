let currency = 'PKR';
export const setCurrency = (c) => { currency = c || 'PKR'; };
export const money = (n = 0) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
export const dateFmt = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-');
export const dateTimeFmt = (d) => (d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-');
export const discountPct = (p) => (p.comparePrice > p.price ? Math.round((1 - p.price / p.comparePrice) * 100) : 0);
export const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-700',
};
