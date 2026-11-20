import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import { SkeletonCard } from '../components/ui';
import { TrustBar } from '../components/Layout';

// Shown until the admin adds banners in Admin > Banners (then real photo slides replace these).
const fallbackSlides = [
  { tag: 'New season', title: 'Quality you can trust, delivered to your door', text: 'Hand-picked products, honest prices and Cash on Delivery across Pakistan.', ctaText: 'Shop collection', ctaLink: '/shop', grad: 'from-brand-800 via-brand-600 to-peach-500' },
  { tag: 'Best sellers', title: 'What everyone is adding to cart', text: 'Explore our most loved products, rated by real customers.', ctaText: 'See best sellers', ctaLink: '/shop?sort=trending', grad: 'from-ink via-brand-900 to-brand-600' },
  { tag: 'Just landed', title: 'Fresh arrivals, first look', text: 'Be the first to try our newest additions across every category.', ctaText: 'Browse new arrivals', ctaLink: '/shop?sort=newest', grad: 'from-peach-600 via-peach-500 to-brand-500' },
];

// Cloudinary delivers a right-sized, auto-format image; other URLs are used as-is.
const optimise = (url) => (url?.includes('/upload/') ? url.replace('/upload/', '/upload/f_auto,q_auto,w_1920/') : url);
const SLIDE_MS = 6500;
const item = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };

function CtaLink({ to, className, children }) {
  return /^https?:/.test(to) ? <a href={to} className={className}>{children}</a> : <Link to={to} className={className}>{children}</Link>;
}

function Hero({ slides }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = slides.length;
  const idx = i % n;
  const s = slides[idx];

  useEffect(() => {
    if (paused || n < 2) return undefined;
    const t = setTimeout(() => setI((v) => (v + 1) % n), SLIDE_MS);
    return () => clearTimeout(t);
  }, [i, paused, n]);

  const fade = 'lg:[-webkit-mask-image:linear-gradient(to_right,transparent,black_24%)] lg:[mask-image:linear-gradient(to_right,transparent,black_24%)]';

  return (
    <section className="container-x pt-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 text-white"
        onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="pointer-events-none absolute -right-20 top-1/2 h-[460px] w-[460px] -translate-y-1/2 rounded-full bg-peach-500/30 blur-3xl" />
        <div className="relative grid items-center lg:min-h-[560px] lg:grid-cols-[1.05fr_1fr]">
          {/* LEFT: text, sits above the picture */}
          <motion.div key={`t${idx}`} variants={{ show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } } }} initial="hidden" animate="show"
            className="relative z-20 flex flex-col items-start px-6 pb-2 pt-12 sm:px-12 lg:py-20 lg:pl-16">
            {s.tag && <motion.span variants={item} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur"><Sparkles size={14} />{s.tag}</motion.span>}
            <motion.h1 variants={item} className="mt-4 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">{s.title}</motion.h1>
            {s.text && <motion.p variants={item} className="mt-4 max-w-xl text-base text-white/85 sm:text-lg">{s.text}</motion.p>}
            <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
              <CtaLink to={s.ctaLink || '/shop'} className="btn bg-white text-brand-800 hover:bg-brand-50">{s.ctaText || 'Shop now'} <ArrowRight size={16} /></CtaLink>
              <Link to="/shop?sort=trending" className="btn border border-white/50 text-white hover:bg-white/15">View best sellers</Link>
            </motion.div>
          </motion.div>

          {/* RIGHT: full picture. On desktop it tucks slightly under the text and fades in from the left edge */}
          <div className="relative z-10 h-72 sm:h-96 lg:-ml-24 lg:h-[560px]">
            <AnimatePresence initial={false}>
              <motion.div key={idx} className="absolute inset-0 flex items-center justify-end p-4 lg:p-0 lg:pr-6" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
                {s.image?.url ? (
                  <motion.img src={optimise(s.image.url)} alt={s.title} className={`h-full w-full object-contain object-right ${fade}`}
                    initial={{ scale: 0.96 }} animate={{ scale: 1.03 }} transition={{ duration: (SLIDE_MS + 1500) / 1000, ease: 'easeOut' }} />
                ) : (
                  <div className={`grid h-full w-full place-items-center ${fade}`}>
                    <div className="grid h-56 w-56 place-items-center rounded-full bg-white/10 backdrop-blur sm:h-72 sm:w-72"><Sparkles size={72} className="text-peach-400" /></div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {n > 1 && (
          <>
            <div className="absolute bottom-5 left-6 z-30 flex items-center gap-2 sm:left-12 lg:left-16">
              <button aria-label="Previous slide" onClick={() => setI((idx + n - 1) % n)} className="rounded-full bg-white/20 p-2 backdrop-blur hover:bg-white/35"><ChevronLeft size={18} /></button>
              {slides.map((_, k) => <button key={k} aria-label={`Slide ${k + 1}`} onClick={() => setI(k)} className={`h-2 rounded-full transition-all ${k === idx ? 'w-6 bg-white' : 'w-2 bg-white/50'}`} />)}
              <button aria-label="Next slide" onClick={() => setI((idx + 1) % n)} className="rounded-full bg-white/20 p-2 backdrop-blur hover:bg-white/35"><ChevronRight size={18} /></button>
            </div>
            {!paused && <motion.div key={`p${i}`} className="absolute bottom-0 left-0 z-30 h-1 bg-peach-500" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: SLIDE_MS / 1000, ease: 'linear' }} />}
          </>
        )}
      </div>
    </section>
  );
}

function Section({ eyebrow, title, to, products, loading }) {
  return (
    <section className="container-x mt-16">
      <div className="mb-6 flex items-end justify-between">
        <div><span className="text-xs font-semibold uppercase tracking-widest text-peach-500">{eyebrow}</span><h2 className="text-3xl font-bold">{title}</h2></div>
        <Link to={to} className="hidden items-center gap-1 text-sm font-semibold text-brand-700 hover:underline sm:flex">View all <ArrowRight size={14} /></Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {loading ? Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} />) : products.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>
      {!loading && products.length === 0 && <p className="rounded-2xl bg-white p-8 text-center text-sm text-ink/60">Nothing here yet - check back soon.</p>}
    </section>
  );
}

export default function Home() {
  const [data, setData] = useState({ cats: [], featured: [], trending: [], latest: [] });
  const [loading, setLoading] = useState(true);
  const [slides, setSlides] = useState(fallbackSlides);
  useEffect(() => {
    api.get('/banners').then((r) => r.data.banners.length && setSlides(r.data.banners)).catch(() => {});
    Promise.all([
      api.get('/categories'), api.get('/products', { params: { featured: true, limit: 4, sort: 'rating' } }),
      api.get('/products', { params: { sort: 'trending', limit: 4 } }), api.get('/products', { params: { sort: 'newest', limit: 8 } }),
    ]).then(([c, f, t, l]) => setData({ cats: c.data.categories, featured: f.data.products, trending: t.data.products, latest: l.data.products }))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Hero slides={slides} />
      <div className="container-x mt-8"><TrustBar /></div>
      {data.cats.length > 0 && (
        <section className="container-x mt-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-peach-500">Browse</span>
          <h2 className="mb-6 text-3xl font-bold">Shop by category</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {data.cats.map((c, n) => (
              <motion.div key={c._id} whileHover={{ y: -4 }}>
                <Link to={`/shop?category=${c.slug}`} className="group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-brand-100 to-peach-100 shadow-soft">
                  {c.image?.url && <img src={c.image.url} alt={c.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
                  <div className={`absolute inset-0 ${c.image?.url ? 'bg-gradient-to-t from-ink/70 to-transparent' : ''}`} />
                  <div className={`absolute inset-x-0 bottom-0 p-4 ${c.image?.url ? 'text-white' : 'text-ink'}`}>
                    <div className="font-display text-lg font-bold leading-tight">{c.name}</div>
                    <div className="text-xs opacity-70">{c.productCount} product{c.productCount === 1 ? '' : 's'}</div>
                  </div>
                  {!c.image?.url && <span className="absolute right-3 top-3 font-display text-5xl font-bold text-brand-600/15">{n + 1}</span>}
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}
      <Section eyebrow="Handpicked" title="Featured products" to="/shop?featured=true" products={data.featured} loading={loading} />
      <section className="container-x mt-16">
        <div className="grid items-center gap-6 overflow-hidden rounded-3xl bg-ink p-8 text-white sm:p-12 md:grid-cols-2">
          <div><span className="text-xs font-semibold uppercase tracking-widest text-peach-400">Why Lumora</span>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Authentic quality, honest pricing, pay on delivery.</h2></div>
          <div><p className="text-white/70">Every product is checked before it ships. Order online, receive at your door and pay in cash - no card needed.</p>
            <Link to="/about" className="btn-accent mt-5">Our story <ArrowRight size={16} /></Link></div>
        </div>
      </section>
      <Section eyebrow="Popular right now" title="Trending products" to="/shop?sort=trending" products={data.trending} loading={loading} />
      <Section eyebrow="Fresh in" title="Latest products" to="/shop?sort=newest" products={data.latest} loading={loading} />
    </>
  );
}
