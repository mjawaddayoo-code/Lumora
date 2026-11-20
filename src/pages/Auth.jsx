import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { errMsg } from '../api/client';
import { Field } from '../components/ui';
import { Logo } from '../components/Layout';

function Shell({ title, sub, children, footer }) {
  return (
    <div className="container-x grid min-h-[70vh] place-items-center py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card w-full max-w-md p-8">
        <div className="mb-6 flex flex-col items-center text-center"><Logo /><h1 className="mt-5 text-3xl font-bold">{title}</h1><p className="mt-1 text-sm text-ink/55">{sub}</p></div>
        {children}<p className="mt-6 text-center text-sm text-ink/60">{footer}</p>
      </motion.div>
    </div>
  );
}

export function Login() {
  const { user, login } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const { state } = useLocation();
  const [f, setF] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={state?.from || '/'} replace />;
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { const u = await login(f.email, f.password); toast.success(`Welcome back, ${u.name.split(' ')[0]}!`); nav(state?.from || '/', { replace: true }); }
    catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };
  return (
    <Shell title="Welcome back" sub="Sign in to your account" footer={<>New here? <Link to="/register" state={state} className="font-semibold text-brand-700">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email"><input type="email" required autoComplete="email" className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Password"><input type="password" required autoComplete="current-password" className="input" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
        <button className="btn-primary w-full !py-3" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </Shell>
  );
}

export function Register() {
  const { user, register } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const { state } = useLocation();
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' });
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={state?.from || '/'} replace />;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await register(f); toast.success('Account created!'); nav(state?.from || '/', { replace: true }); }
    catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };
  return (
    <Shell title="Create your account" sub="Join Lumora in under a minute" footer={<>Already registered? <Link to="/login" state={state} className="font-semibold text-brand-700">Sign in</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Full name"><input required className="input" value={f.name} onChange={set('name')} /></Field>
        <Field label="Email"><input type="email" required className="input" value={f.email} onChange={set('email')} /></Field>
        <Field label="Phone (optional)"><input className="input" placeholder="03XX-XXXXXXX" value={f.phone} onChange={set('phone')} /></Field>
        <Field label="Password"><input type="password" required minLength={8} className="input" placeholder="At least 8 characters" value={f.password} onChange={set('password')} /></Field>
        <button className="btn-primary w-full !py-3" disabled={busy}>{busy ? 'Creating...' : 'Create account'}</button>
      </form>
    </Shell>
  );
}
