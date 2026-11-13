import type { Product } from '../../../shared/types';
import { EmptyState } from './EmptyState';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onResetFilters: () => void;
  wishlistIds: Set<string>;
  onToggleWishlist: (product: Product) => void;
  cartQuantities: Record<string, number>;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export function ProductGrid({
  products,
  loading,
  error,
  onRetry,
  onResetFilters,
  wishlistIds,
  onToggleWishlist,
  cartQuantities,
  onAddToCart,
  onSelectProduct,
}: ProductGridProps) {
  if (error) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 text-center">
        <p className="text-sm font-medium text-[#171C2C]">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 h-9 px-4 rounded-lg bg-[#3457D5] hover:bg-[#2947B5] text-white text-sm font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading && products.length === 0) {
    return (
      <div
        className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
        aria-label="Loading products"
      >
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden animate-pulse"
          >
            <div className="aspect-[4/3] bg-[#E5E7EB]/60" />
            <div className="p-4 space-y-3">
              <div className="h-3 w-24 bg-[#E5E7EB]/70 rounded" />
              <div className="h-4 w-full bg-[#E5E7EB]/80 rounded" />
              <div className="h-4 w-2/3 bg-[#E5E7EB]/60 rounded" />
              <div className="pt-2 flex items-center justify-between">
                <div className="h-5 w-16 bg-[#E5E7EB]/80 rounded" />
                <div className="h-8 w-16 bg-[#E5E7EB]/80 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <EmptyState onResetFilters={onResetFilters} />;
  }

  return (
    <div
      className={`grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 transition-opacity duration-150 ${
        loading ? 'opacity-65' : 'opacity-100'
      }`}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isWishlisted={wishlistIds.has(product.id)}
          onToggleWishlist={onToggleWishlist}
          cartQuantity={cartQuantities[product.id] ?? 0}
          onAddToCart={onAddToCart}
          onSelectProduct={onSelectProduct}
        />
      ))}
    </div>
  );
}
