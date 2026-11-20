import { Heart } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import { Empty } from '../components/ui';

export default function Wishlist() {
  const { wishlist } = useStore();
  return (
    <div className="container-x py-10">
      <h1 className="mb-6 text-3xl font-bold">My wishlist</h1>
      {wishlist.length === 0 ? <Empty icon={Heart} title="Your wishlist is empty" text="Tap the heart on any product to save it for later." to="/shop" cta="Browse products" /> : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">{wishlist.map((p) => <ProductCard key={p._id} product={p} />)}</div>)}
    </div>
  );
}
