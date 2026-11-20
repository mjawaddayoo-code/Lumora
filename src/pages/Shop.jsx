import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, SearchX } from 'lucide-react';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import { Empty, Pagination, SkeletonCard } from '../components/ui';

const SORTS = [['newest', 'Newest'], ['trending', 'Best selling'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low'], ['rating', 'Top rated'], ['name-asc', 'Name A-Z']];

export default function Shop() {
  const [sp, setSp] = useSearchParams();
  const [cats, setCats] = useState([]);
  const [data, setData] = useState({ products: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [price, setPrice] = useState({ min: sp.get('minPrice') || '', max: sp.get('maxPrice') || '' });
  const get = (k, d = '') => sp.get(k) || d;

  useEffect(() => { api.get('/categories').then((r) => setCats(r.data.categories)).catch(() => {}); }, []);
  useEffect(() => { setPrice({ min: sp.get('minPrice') || '', max: sp.get('maxPrice') || '' }); }, [sp]);
  useEffect(() => {
    setLoading(true);
    api.get('/products', { params: { ...Object.fromEntries(sp.entries()), limit: 12 } })
      .then((r) => setData(r.data)).catch(() => setData({ products: [], page: 1, pages: 1, total: 0 })).finally(() => setLoading(false));
  }, [sp]);

  const set = (patch) => {
    const next = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => (v === '' || v === false || v == null ? next.delete(k) : next.set(k, v)));
    if (!('page' in patch)) next.delete('page');
    setSp(next);
  };
  const applyPrice = (e) => { e.preventDefault(); set({ minPrice: price.min, maxPrice: price.max }); };
  const activeCat = cats.find((c) => c.slug === get('category'));
  const hasFilters = ['search', 'category', 'minPrice', 'maxPrice', 'inStock', 'featured'].some((k) => sp.get(k));

  const Filters = (
    <div className="space-y-7">
      <div>
        <h3 className="mb-3 font-sans text-sm font-semibold">Category</h3>
        <div className="space-y-1">
          <button onClick={() => set({ category: '' })} className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${!get('category') ? 'bg-brand-100 font-semibold text-brand-800' : 'hover:bg-brand-50'}`}>All products</button>
          {cats.map((c) => (
            <button key={c._id} onClick={() => set({ category: c.slug })} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${get('category') === c.slug ? 'bg-brand-100 font-semibold text-brand-800' : 'hover:bg-brand-50'}`}>
              {c.name}<span className="text-xs text-ink/40">{c.productCount}</span></button>
          ))}
        </div>
      </div>
      <form onSubmit={applyPrice}>
        <h3 className="mb-3 font-sans text-sm font-semibold">Price range</h3>
        <div className="flex items-center gap-2">
          <input type="number" min="0" placeholder="Min" value={price.min} onChange={(e) => setPrice({ ...price, min: e.target.value })} className="input !px-3" />
          <span className="text-ink/40">-</span>
          <input type="number" min="0" placeholder="Max" value={price.max} onChange={(e) => setPrice({ ...price, max: e.target.value })} className="input !px-3" />
        </div>
        <button className="btn-ghost mt-3 w-full !py-2">Apply</button>
      </form>
      <label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={get('inStock') === 'true'} onChange={(e) => set({ inStock: e.target.checked ? 'true' : '' })} className="h-4 w-4 accent-brand-600" />In stock only</label>
      <label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={get('featured') === 'true'} onChange={(e) => set({ featured: e.target.checked ? 'true' : '' })} className="h-4 w-4 accent-brand-600" />Featured only</label>
      {hasFilters && <button onClick={() => setSp({})} className="flex items-center gap-1 text-sm font-semibold text-peach-600"><X size={14} />Clear all filters</button>}
    </div>
  );

  return (
    <div className="container-x py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{get('search') ? `Results for "${get('search')}"` : activeCat?.name || 'All products'}</h1>
          <p className="text-sm text-ink/55">{loading ? 'Loading...' : `${data.total} product${data.total === 1 ? '' : 's'}`}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(true)} className="btn-ghost lg:hidden"><SlidersHorizontal size={16} />Filters</button>
          <select value={get('sort', 'newest')} onChange={(e) => set({ sort: e.target.value })} className="input !w-auto" aria-label="Sort">
            {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
        <aside className="card hidden h-fit p-5 lg:sticky lg:top-32 lg:block">{Filters}</aside>
        {showFilters && (
          <div className="fixed inset-0 z-50 bg-ink/50 lg:hidden" onClick={() => setShowFilters(false)}>
            <div className="absolute inset-y-0 left-0 w-80 max-w-[85%] overflow-y-auto bg-white p-5" onClick={(e) => e.stopPropagation()}>
              <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold">Filters</h2><button onClick={() => setShowFilters(false)}><X /></button></div>{Filters}
            </div>
          </div>
        )}
        <div>
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 xl:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}</div>
          ) : data.products.length === 0 ? (
            <Empty icon={SearchX} title="No products found" text="Try different keywords or clear some filters." />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 xl:grid-cols-3">{data.products.map((p) => <ProductCard key={p._id} product={p} />)}</div>
          )}
          <Pagination page={data.page} pages={data.pages} onChange={(p) => { set({ page: p }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
        </div>
      </div>
    </div>
  );
}
