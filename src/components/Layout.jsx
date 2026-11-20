import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Menu, Search, ShoppingBag, User as UserIcon, X, LogOut, Package, LayoutDashboard, Truck, ShieldCheck, Banknote, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

export const Logo = ({ light }) => (
  <Link to="/" className="flex items-center gap-2">
    <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-peach-500 font-display text-xl font-bold text-white">L</span>
    <span className={`font-display text-2xl font-bold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>Lumora</span>
  </Link>
);

const links = [['/', 'Home'], ['/shop', 'Shop'], ['/about', 'About'], ['/contact', 'Contact']];

function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { cart, wishlist } = useStore();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const { pathname } = useLocation();
  useEffect(() => { setOpen(false); setMenu(false); }, [pathname]);

  const submit = (e) => { e.preventDefault(); nav(`/shop${q.trim() ? `?search=${encodeURIComponent(q.trim())}` : ''}`); setQ(''); setOpen(false); };
  const cls = ({ isActive }) => `text-sm font-medium transition hover:text-brand-600 ${isActive ? 'text-brand-600' : 'text-ink/70'}`;

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-sand/85 backdrop-blur-lg">
      <div className="bg-ink py-1.5 text-center text-xs font-medium text-white/90">Cash on Delivery across Pakistan · 100% original products</div>
      <div className="container-x flex h-16 items-center gap-6">
        <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
        <Logo />
        <nav className="ml-4 hidden gap-7 lg:flex">{links.map(([to, l]) => <NavLink key={to} to={to} end={to === '/'} className={cls}>{l}</NavLink>)}</nav>
        <form onSubmit={submit} className="relative ml-auto hidden max-w-xs flex-1 md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products..." className="input !rounded-full !py-2 pl-9" />
        </form>
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Link to="/wishlist" className="relative rounded-full p-2 hover:bg-brand-100" aria-label="Wishlist">
            <Heart size={20} />{wishlist.length > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-peach-500 px-1 text-[10px] font-bold text-brand-900">{wishlist.length}</span>}
          </Link>
          <Link to="/cart" className="relative rounded-full p-2 hover:bg-brand-100" aria-label="Cart">
            <ShoppingBag size={20} />{cart.count > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">{cart.count}</span>}
          </Link>
          {user ? (
            <div className="relative">
              <button onClick={() => setMenu(!menu)} className="flex items-center gap-2 rounded-full p-1.5 pr-3 hover:bg-brand-100">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">{user.name[0].toUpperCase()}</span>
                <span className="hidden text-sm font-medium sm:block">{user.name.split(' ')[0]}</span>
              </button>
              {menu && (
                <div className="card absolute right-0 mt-2 w-52 overflow-hidden p-1.5 text-sm" onMouseLeave={() => setMenu(false)}>
                  {isAdmin && <Link to="/admin" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-brand-50"><LayoutDashboard size={16} />Admin dashboard</Link>}
                  <Link to="/profile" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-brand-50"><UserIcon size={16} />My profile</Link>
                  <Link to="/orders" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-brand-50"><Package size={16} />My orders</Link>
                  <button onClick={() => { logout(); nav('/'); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50"><LogOut size={16} />Sign out</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-primary ml-1 !py-2">Sign in</Link>
          )}
        </div>
      </div>
      {open && (
        <div className="border-t border-ink/10 bg-white p-4 lg:hidden">
          <form onSubmit={submit} className="relative mb-3"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products..." className="input pl-9" /></form>
          <div className="flex flex-col gap-1">{links.map(([to, l]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `rounded-lg px-3 py-2.5 font-medium ${isActive ? 'bg-brand-50 text-brand-700' : ''}`}>{l}</NavLink>)}</div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-20 bg-ink text-white/80">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo light />
          <p className="mt-4 text-sm leading-relaxed text-white/60">Quality products at honest prices, checked with care and delivered to your door.</p>
        </div>
        <div><h4 className="mb-3 font-sans text-sm font-semibold text-white">Shop</h4>
          <ul className="space-y-2 text-sm"><li><Link to="/shop" className="hover:text-white">All products</Link></li><li><Link to="/shop?sort=trending" className="hover:text-white">Best sellers</Link></li><li><Link to="/shop?sort=newest" className="hover:text-white">New arrivals</Link></li><li><Link to="/wishlist" className="hover:text-white">Wishlist</Link></li></ul></div>
        <div><h4 className="mb-3 font-sans text-sm font-semibold text-white">Company</h4>
          <ul className="space-y-2 text-sm"><li><Link to="/about" className="hover:text-white">About us</Link></li><li><Link to="/contact" className="hover:text-white">Contact</Link></li><li><Link to="/orders" className="hover:text-white">Track orders</Link></li><li><Link to="/profile" className="hover:text-white">My account</Link></li></ul></div>
        <div><h4 className="mb-3 font-sans text-sm font-semibold text-white">Get in touch</h4>
          <ul className="space-y-2 text-sm text-white/60"><li className="flex items-center gap-2"><Mail size={14} />Use the <Link to="/contact" className="underline hover:text-white">contact form</Link></li><li className="flex items-center gap-2"><MapPin size={14} />Delivering across Pakistan</li><li className="flex items-center gap-2"><Banknote size={14} />Cash on Delivery</li></ul></div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">© {new Date().getFullYear()} Lumora. All rights reserved.</div>
    </footer>
  );
}

export const TrustBar = () => (
  <div className="grid gap-4 sm:grid-cols-3">
    {[[Truck, 'Fast delivery', 'Nationwide shipping'], [ShieldCheck, '100% original', 'Authentic, checked products'], [Banknote, 'Cash on delivery', 'Pay when it arrives']].map(([I, t, s]) => (
      <div key={t} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-soft"><span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-100 text-brand-700"><I size={20} /></span>
        <div><div className="text-sm font-semibold">{t}</div><div className="text-xs text-ink/55">{s}</div></div></div>
    ))}
  </div>
);

export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (<div className="flex min-h-screen flex-col"><Navbar /><main className="flex-1"><Outlet /></main><Footer /></div>);
}
