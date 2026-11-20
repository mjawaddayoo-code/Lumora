import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Field } from '../components/ui';

export default function Profile() {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [f, setF] = useState({ name: user.name, email: user.email, phone: user.phone || '', ...user.address });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [del, setDel] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    try { await updateProfile({ name: f.name, email: f.email, phone: f.phone, address: { street: f.street, city: f.city, province: f.province, postalCode: f.postalCode, country: f.country } }); toast.success('Profile updated'); }
    catch (err) { toast.error(errMsg(err)); }
  };
  const savePw = async (e) => {
    e.preventDefault();
    try { await changePassword(pw.currentPassword, pw.newPassword); setPw({ currentPassword: '', newPassword: '' }); toast.success('Password changed'); }
    catch (err) { toast.error(errMsg(err)); }
  };
  const remove = async (e) => {
    e.preventDefault();
    if (!window.confirm('This permanently deletes your account. Continue?')) return;
    try { await api.delete('/auth/me', { data: { password: del } }); logout(); toast.success('Account deleted'); nav('/'); }
    catch (err) { toast.error(errMsg(err)); }
  };

  return (
    <div className="container-x max-w-3xl space-y-6 py-10">
      <h1 className="text-3xl font-bold">My profile</h1>
      <form onSubmit={save} className="card grid gap-4 p-6 sm:grid-cols-2">
        <h2 className="text-xl font-bold sm:col-span-2">Personal details</h2>
        <Field label="Full name"><input className="input" required value={f.name} onChange={set('name')} /></Field>
        <Field label="Email"><input type="email" className="input" required value={f.email} onChange={set('email')} /></Field>
        <Field label="Phone"><input className="input" value={f.phone} onChange={set('phone')} /></Field>
        <div className="hidden sm:block" />
        <div className="sm:col-span-2"><Field label="Street address"><input className="input" value={f.street || ''} onChange={set('street')} /></Field></div>
        <Field label="City"><input className="input" value={f.city || ''} onChange={set('city')} /></Field>
        <Field label="Province"><input className="input" value={f.province || ''} onChange={set('province')} /></Field>
        <Field label="Postal code"><input className="input" value={f.postalCode || ''} onChange={set('postalCode')} /></Field>
        <Field label="Country"><input className="input" value={f.country || ''} onChange={set('country')} /></Field>
        <div className="sm:col-span-2"><button className="btn-primary">Save changes</button></div>
      </form>
      <form onSubmit={savePw} className="card grid gap-4 p-6 sm:grid-cols-2">
        <h2 className="text-xl font-bold sm:col-span-2">Change password</h2>
        <Field label="Current password"><input type="password" required className="input" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></Field>
        <Field label="New password"><input type="password" required minLength={8} className="input" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></Field>
        <div className="sm:col-span-2"><button className="btn-ghost">Update password</button></div>
      </form>
      {user.role !== 'admin' && (
        <form onSubmit={remove} className="card space-y-3 border-red-200 p-6">
          <h2 className="text-xl font-bold text-red-700">Delete account</h2>
          <p className="text-sm text-ink/60">This removes your account, cart and reviews. Past orders are kept for our records. Enter your password to confirm.</p>
          <div className="flex flex-wrap gap-3"><input type="password" required className="input max-w-xs" placeholder="Password" value={del} onChange={(e) => setDel(e.target.value)} /><button className="btn-danger">Delete my account</button></div>
        </form>)}
    </div>
  );
}
