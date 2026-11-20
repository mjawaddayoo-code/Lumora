import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import api, { errMsg } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { PageLoader, Pagination, Rating } from '../../components/ui';
import { dateFmt } from '../../utils/format';

export default function AdminReviews() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const load = () => api.get('/reviews/admin/all', { params: { page } }).then((r) => setData(r.data));
  useEffect(() => { load(); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps
  const remove = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try { await api.delete(`/reviews/${id}`); toast.success('Review deleted'); load(); } catch (e) { toast.error(errMsg(e)); }
  };
  if (!data) return <PageLoader />;
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reviews <span className="text-lg font-normal text-ink/45">({data.total})</span></h1>
      <div className="space-y-3">{data.reviews.map((r) => (
        <div key={r._id} className="card flex items-start gap-4 p-4">
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-3"><Rating value={r.rating} /><span className="font-semibold">{r.product?.name || 'Deleted product'}</span></div>
            {r.title && <div className="mt-1 font-medium">{r.title}</div>}<p className="mt-1 text-sm text-ink/70">{r.comment}</p>
            <div className="mt-2 text-xs text-ink/45">{r.user?.name || 'Deleted user'} ({r.user?.email}) · {dateFmt(r.createdAt)}{r.verifiedPurchase && ' · Verified purchase'}</div></div>
          <button onClick={() => remove(r._id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Delete review"><Trash2 size={18} /></button>
        </div>))}
        {data.reviews.length === 0 && <p className="card p-8 text-center text-ink/55">No reviews yet.</p>}</div>
      <Pagination page={data.page} pages={data.pages} onChange={setPage} />
    </div>
  );
}
