import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Leaf, ShieldCheck, Truck, Mail, MapPin, Banknote } from 'lucide-react';
import api, { errMsg } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Field } from '../components/ui';

export function About() {
  return (
    <div>
      <section className="bg-gradient-to-br from-brand-700 to-peach-500 py-20 text-center text-white">
        <div className="container-x max-w-3xl"><span className="text-xs font-semibold uppercase tracking-widest text-white/70">Our story</span>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Everyday luxuries, honestly sourced.</h1>
          <p className="mt-4 text-lg text-white/85">Lumora brings together quality products at honest prices - delivered to your door and paid for when they arrive.</p></div>
      </section>
      <section className="container-x grid gap-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {[[ShieldCheck, 'Authentic always', 'Every product is checked for quality and originality before it ships.'], [Leaf, 'Hand-picked range', 'A focused catalogue chosen for quality and value, not endless clutter.'], [Truck, 'Delivered nationwide', 'Reliable shipping across Pakistan with Cash on Delivery.'], [Heart, 'Customer first', 'Real reviews, honest prices and a team that answers your messages.']].map(([I, t, s]) => (
          <div key={t} className="card p-6"><span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-100 text-brand-700"><I /></span><h3 className="mt-4 text-lg font-bold">{t}</h3><p className="mt-1 text-sm text-ink/60">{s}</p></div>))}
      </section>
      <section className="container-x pb-8 text-center"><Link to="/shop" className="btn-primary">Explore the collection</Link></section>
    </div>
  );
}

export function Contact() {
  const toast = useToast();
  const [f, setF] = useState({ name: '', email: '', subject: '', message: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { const r = await api.post('/contact', f); toast.success(r.data.message); setF({ name: '', email: '', subject: '', message: '' }); }
    catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };
  return (
    <div className="container-x grid gap-10 py-12 lg:grid-cols-[1fr_1.3fr]">
      <div><span className="text-xs font-semibold uppercase tracking-widest text-peach-500">Contact</span>
        <h1 className="mt-1 text-4xl font-bold">We'd love to hear from you</h1>
        <p className="mt-3 text-ink/65">Questions about an order, a product or wholesale? Send us a message and we'll reply by email.</p>
        <ul className="mt-8 space-y-4 text-sm">
          <li className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-brand-700"><Mail size={18} /></span>Replies within 1-2 business days</li>
          <li className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-brand-700"><MapPin size={18} /></span>Delivering across Pakistan</li>
          <li className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-brand-700"><Banknote size={18} /></span>Cash on Delivery available</li></ul></div>
      <form onSubmit={submit} className="card grid gap-4 p-6 sm:grid-cols-2">
        <Field label="Name"><input required className="input" value={f.name} onChange={set('name')} /></Field>
        <Field label="Email"><input type="email" required className="input" value={f.email} onChange={set('email')} /></Field>
        <div className="sm:col-span-2"><Field label="Subject"><input className="input" value={f.subject} onChange={set('subject')} /></Field></div>
        <div className="sm:col-span-2"><Field label="Message"><textarea required minLength={10} className="input min-h-36" value={f.message} onChange={set('message')} /></Field></div>
        <div className="sm:col-span-2"><button className="btn-primary" disabled={busy}>{busy ? 'Sending...' : 'Send message'}</button></div>
      </form>
    </div>
  );
}
