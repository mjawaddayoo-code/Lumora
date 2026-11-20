import { useEffect, useState } from 'react';
import { Trash2, MailOpen, Mail } from 'lucide-react';
import api, { errMsg } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { PageLoader } from '../../components/ui';
import { dateTimeFmt } from '../../utils/format';

export default function AdminMessages() {
  const toast = useToast();
  const [msgs, setMsgs] = useState(null);
  const load = () => api.get('/admin/messages').then((r) => setMsgs(r.data.messages));
  useEffect(() => { load(); }, []);
  const mark = async (m) => { try { await api.patch(`/admin/messages/${m._id}`, { read: !m.read }); load(); } catch (e) { toast.error(errMsg(e)); } };
  const remove = async (m) => { if (!window.confirm('Delete this message?')) return; try { await api.delete(`/admin/messages/${m._id}`); load(); } catch (e) { toast.error(errMsg(e)); } };
  if (!msgs) return <PageLoader />;
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Messages</h1>
      <div className="space-y-3">{msgs.map((m) => (
        <div key={m._id} className={`card p-4 ${m.read ? '' : 'border-brand-300 bg-brand-50/50'}`}>
          <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="font-semibold">{m.subject || '(no subject)'}</div>
            <div className="text-sm text-ink/55">{m.name} · <a className="text-brand-700 underline" href={`mailto:${m.email}`}>{m.email}</a> · {dateTimeFmt(m.createdAt)}</div></div>
            <div className="flex gap-1"><button onClick={() => mark(m)} className="rounded-lg p-2 hover:bg-brand-100" aria-label="Toggle read">{m.read ? <Mail size={16} /> : <MailOpen size={16} />}</button>
              <button onClick={() => remove(m)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Delete"><Trash2 size={16} /></button></div></div>
          <p className="mt-3 whitespace-pre-line text-sm text-ink/75">{m.message}</p></div>))}
        {msgs.length === 0 && <p className="card p-8 text-center text-ink/55">No messages yet.</p>}</div>
    </div>
  );
}
