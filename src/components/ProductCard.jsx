import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { ProductImage, Rating } from './ui';
import { discountPct, money } from '../utils/format';

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { addToCart, toggleWishlist, wishIds } = useStore();
  const toast = useToast();
  const nav = useNavigate();
  const out = product.stock < 1;
  const off = discountPct(product);
  const needLogin = () => { toast.error('Please sign in first'); nav('/login', { state: { from: location.pathname + location.search } }); };

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }} className="card group flex flex-col overflow-hidden hover:shadow-lift">
      <div className="relative aspect-square overflow-hidden bg-brand-50">
        <Link to={`/product/${product.slug}`} className="block h-full">
          <ProductImage product={product} className="transition duration-500 group-hover:scale-105" />
        </Link>
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {off > 0 && <span className="rounded-full bg-peach-500 px-2.5 py-0.5 text-xs font-bold text-brand-900">-{off}%</span>}
          {out && <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-bold text-white">Sold out</span>}
        </div>
        <button aria-label="Toggle wishlist" onClick={() => (user ? toggleWishlist(product._id) : needLogin())}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-soft backdrop-blur transition hover:scale-110">
          <Heart size={18} className={wishIds.has(product._id) ? 'fill-peach-500 text-peach-500' : 'text-ink/60'} />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-brand-600">{product.category?.name}</span>
        <Link to={`/product/${product.slug}`} className="mt-1 line-clamp-2 font-semibold leading-snug hover:text-brand-700">{product.name}</Link>
        <div className="mt-1.5"><Rating value={product.ratingAvg} count={product.numReviews} /></div>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <div className="text-lg font-bold">{money(product.price)}</div>
            {off > 0 && <div className="text-xs text-ink/40 line-through">{money(product.comparePrice)}</div>}
          </div>
          <button disabled={out} onClick={() => (user ? addToCart(product._id) : needLogin())} className="btn-primary !px-3 !py-2" aria-label="Add to cart">
            <ShoppingBag size={16} /> Add
          </button>
        </div>
      </div>
    </motion.div>
  );
}
