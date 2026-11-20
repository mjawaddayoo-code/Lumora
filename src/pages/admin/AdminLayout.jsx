import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, ShoppingCart, Users, Star, Mail, Images, LogOut, Store, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const nav = [['/admin', 'Dashboard', LayoutDashboard, true], ['/admin/products', 'Products', Package], ['/admin/categories', 'Categories', Tags], ['/admin/banners', 'Banners', Images], ['/admin/orders', 'Orders', ShoppingCart], ['/admin/customers', 'Customers', Users], ['/admin/reviews', 'Reviews', Star], ['/admin/messages', 'Messages', Mail]];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const links = (
    <nav className="space-y-1">{nav.map(([to, label, Icon, end]) => (
      <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-brand-600 text-white shadow-soft' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}><Icon size={18} />{label}</NavLink>))}</nav>
  );
  const side = (
    <div className="flex h-full flex-col p-5">
      <Link to="/admin" className="mb-8 flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-peach-500 font-display text-xl font-bold text-white">L</span><span className="font-display text-xl font-bold text-white">Lumora <span className="text-xs font-sans font-medium text-white/50">Admin</span></span></Link>
      {links}
      <div className="mt-auto space-y-1 border-t border-white/10 pt-4">
        <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:bg-white/10"><Store size={18} />View storefront</Link>
        <button onClick={() => { logout(); navigate('/admin/login'); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:bg-white/10"><LogOut size={18} />Sign out</button>
        <div className="px-3 pt-2 text-xs text-white/40">{user.email}</div>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-sand lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="sticky top-0 hidden h-screen bg-ink lg:block">{side}</aside>
      {open && <div className="fixed inset-0 z-50 bg-ink/60 lg:hidden" onClick={() => setOpen(false)}><div className="h-full w-64 bg-ink" onClick={(e) => e.stopPropagation()}>{side}</div></div>}
      <div className="min-w-0">
        <div className="flex items-center gap-3 border-b border-ink/10 bg-white px-4 py-3 lg:hidden"><button onClick={() => setOpen(true)} aria-label="Menu"><Menu /></button><span className="font-display text-lg font-bold">Lumora Admin</span></div>
        <main className="p-4 sm:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
