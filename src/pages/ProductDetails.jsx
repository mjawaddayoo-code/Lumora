import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Heart, Minus, Plus, ShoppingBag, Truck, ShieldCheck, Trash2 } from 'lucide-react';
import api, { errMsg } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import { PageLoader, ProductImage, Rating, Empty } from '../components/ui';
import { dateFmt, discountPct, money } from '../utils/format';

function ReviewForm({ productId, onAdded }) {
  const toast = useToast();
  const [f, setF] = useState({ rating: 5, title: '', comment: '' });
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { const r = await api.post(`/reviews/product/${productId}`, f); toast.success('Thanks for your review!'); setF({ rating: 5, title: '', comment: '' }); onAdded(r.data.review); }
    catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="card space-y-3 p-5">
      <h4 className="font-sans font-semibold">Write a review</h4>
      <div className="flex items-center gap-1">{[1, 2, 3, 4, 5].map((n) => (
        <button type="button" key={n} onClick={() => setF({ ...f, rating: n })} aria-label={`${n} stars`} className={`text-2xl leading-none ${n <= f.rating ? 'text-amber-400' : 'text-ink/20'}`}>★</button>))}</div>
      <input className="input" placeholder="Title (optional)" value={f.title} maxLength={100} onChange={(e) => setF({ ...f, title: e.target.value })} />
      <textarea className="input min-h-24" placeholder="Share your experience..." required value={f.comment} onChange={(e) => setF({ ...f, comment: e.target.value })} />
      <button className="btn-primary" disabled={busy}>{busy ? 'Posting...' : 'Post review'}</button>
    </form>
  );
}

export default function ProductDetails() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { user, isAdmin } = useAuth();
  const { addToCart, toggleWishlist, wishIds, config } = useStore();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [state, setState] = useState('loading');
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('description');

  useEffect(() => {
    setState('loading'); setImg(0); setQty(1);
    api.get(`/products/${slug}`).then(async (r) => {
      const p = r.data.product; setProduct(p); setState('ok');
      const [rel, rev] = await Promise.all([api.get(`/products/${p._id}/related`), api.get(`/reviews/product/${p._id}`)]);
      setRelated(rel.data.products); setReviews(rev.data.reviews);
    }).catch(() => setState('missing'));
  }, [slug]);

  if (state === 'loading') return <PageLoader />;
  if (state === 'missing') return <div className="container-x py-16"><Empty title="Product not found" text="It may have been removed." to="/shop" cta="Back to shop" /></div>;

  const out = product.stock < 1;
  const off = discountPct(product);
  const needLogin = () => { toast.error('Please sign in first'); nav('/login', { state: { from: `/product/${slug}` } }); };
  const refreshRating = async () => { const r = await api.get(`/products/${product._id}`); setProduct(r.data.product); };
  const mine = reviews.find((r) => r.user?._id === user?._id);
  const delReview = async (id) => {
    try { await api.delete(`/reviews/${id}`); setReviews((rs) => rs.filter((r) => r._id !== id)); refreshRating(); toast.success('Review removed'); } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <div className="container-x py-8">
      <nav className="mb-6 text-sm text-ink/50"><Link to="/" className="hover:text-brand-600">Home</Link> / <Link to="/shop" className="hover:text-brand-600">Shop</Link>
        {product.category && <> / <Link to={`/shop?category=${product.category.slug}`} className="hover:text-brand-600">{product.category.name}</Link></>}</nav>
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="card aspect-square overflow-hidden"><ProductImage product={product} index={img} /></div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1">{product.images.map((im, i) => (
              <button key={im.url} onClick={() => setImg(i)} className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 ${i === img ? 'border-brand-600' : 'border-transparent opacity-70'}`}><img src={im.url} alt="" className="h-full w-full object-cover" /></button>))}</div>)}
        </div>
        <div>
          {product.brand && <span className="text-xs font-semibold uppercase tracking-widest text-brand-600">{product.brand}</span>}
          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">{product.name}</h1>
          <div className="mt-3"><Rating value={product.ratingAvg} count={product.numReviews} size={18} /></div>
          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-brand-700">{money(product.price)}</span>
            {off > 0 && <><span className="text-lg text-ink/40 line-through">{money(product.comparePrice)}</span><span className="rounded-full bg-peach-100 px-2.5 py-0.5 text-sm font-bold text-peach-600">Save {off}%</span></>}
          </div>
          <p className="mt-5 leading-relaxed text-ink/70">{product.description.length > 220 ? `${product.description.slice(0, 220)}...` : product.description}</p>
          <div className="mt-5 text-sm font-medium">{out ? <span className="text-red-600">Out of stock</span> : product.stock <= 5 ? <span className="text-amber-600">Only {product.stock} left</span> : <span className="text-emerald-600">In stock</span>}</div>
          {!isAdmin && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-xl border border-ink/15 bg-white">
                <button className="p-3" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease"><Minus size={16} /></button>
                <span className="w-10 text-center font-semibold">{qty}</span>
                <button className="p-3" onClick={() => setQty(Math.min(product.stock, qty + 1))} aria-label="Increase"><Plus size={16} /></button>
              </div>
              <button disabled={out} onClick={() => (user ? addToCart(product._id, qty) : needLogin())} className="btn-primary flex-1 !py-3 sm:flex-none sm:px-8"><ShoppingBag size={18} />Add to cart</button>
              <button onClick={() => (user ? toggleWishlist(product._id) : needLogin())} className="btn-ghost !p-3" aria-label="Wishlist"><Heart size={18} className={wishIds.has(product._id) ? 'fill-peach-500 text-peach-500' : ''} /></button>
            </div>
          )}
          <div className="mt-8 grid gap-3 text-sm text-ink/70 sm:grid-cols-2">
            <div className="flex items-center gap-2"><Truck size={18} className="text-brand-600" />Delivery {config.deliveryFee ? money(config.deliveryFee) : 'free'} · Cash on Delivery</div>
            <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-brand-600" />100% original products</div>
          </div>
          {product.sku && <p className="mt-4 text-xs text-ink/40">SKU: {product.sku}</p>}
        </div>
      </div>

      <div className="mt-14">
        <div className="flex gap-6 border-b border-ink/10">{[['description', 'Description'], ['reviews', `Reviews (${reviews.length})`]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`-mb-px border-b-2 pb-3 text-sm font-semibold ${tab === k ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink/50'}`}>{l}</button>))}</div>
        {tab === 'description' ? <p className="mt-6 max-w-3xl whitespace-pre-line leading-relaxed text-ink/75">{product.description}</p> : (
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              {reviews.length === 0 && <p className="text-sm text-ink/55">No reviews yet - be the first to share your thoughts.</p>}
              {reviews.map((r) => (
                <div key={r._id} className="card p-5">
                  <div className="flex items-start justify-between gap-3"><div><Rating value={r.rating} />{r.title && <div className="mt-1 font-semibold">{r.title}</div>}</div>
                    {(r.user?._id === user?._id || isAdmin) && <button onClick={() => delReview(r._id)} className="text-ink/40 hover:text-red-600" aria-label="Delete review"><Trash2 size={16} /></button>}</div>
                  <p className="mt-2 text-sm text-ink/75">{r.comment}</p>
                  <div className="mt-3 text-xs text-ink/45">{r.user?.name || 'Customer'} · {dateFmt(r.createdAt)}{r.verifiedPurchase && <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">Verified purchase</span>}</div>
                </div>))}
            </div>
            <div>{!user ? <div className="card p-5 text-sm">Please <Link to="/login" state={{ from: `/product/${slug}` }} className="font-semibold text-brand-700 underline">sign in</Link> to write a review.</div>
              : isAdmin ? null : mine ? <div className="card p-5 text-sm text-ink/60">You've already reviewed this product.</div>
              : <ReviewForm productId={product._id} onAdded={(r) => { setReviews((rs) => [r, ...rs]); refreshRating(); }} />}</div>
          </div>)}
      </div>

      {related.length > 0 && (
        <section className="mt-16"><h2 className="mb-6 text-2xl font-bold">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">{related.slice(0, 4).map((p) => <ProductCard key={p._id} product={p} />)}</div></section>)}
    </div>
  );
}
