import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { errMsg } from '../../api/client';
import { Field } from '../../components/ui';
import { useToast } from '../../context/ToastContext';

export default function AdminLogin() {
  const { user, isAdmin, adminLogin } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const [f, setF] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  if (user && isAdmin) return <Navigate to="/admin" replace />;
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await adminLogin(f.email, f.password); nav('/admin', { replace: true }); } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-ink via-brand-900 to-brand-700 p-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4 p-8">
        <div className="text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-100 text-brand-700"><ShieldCheck size={28} /></span>
          <h1 className="mt-4 text-2xl font-bold">Admin sign in</h1><p className="text-sm text-ink/55">Authorized administrators only</p></div>
        {user && !isAdmin && <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">You're signed in as a customer. Sign in with an admin account to continue.</p>}
        <Field label="Email"><input type="email" required className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Password"><input type="password" required className="input" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
        <button className="btn-primary w-full !py-3" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </div>
  );
}
