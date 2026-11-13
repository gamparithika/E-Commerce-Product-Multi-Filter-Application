import { Heart, ShoppingBag, Trash2, X } from 'lucide-react';
import { useEffect } from 'react';
import type { Product } from '../../../shared/types';
import { formatINR } from '../../utils/formatters';
import { ProductImage } from '../products/ProductImage';

interface WishlistDrawerProps {
  open: boolean;
  onClose: () => void;
  items: Product[];
  onRemove: (product: Product) => void;
  onMoveToCart: (product: Product) => void;
}

export function WishlistDrawer({
  open,
  onClose,
  items,
  onRemove,
  onMoveToCart,
}: WishlistDrawerProps) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Saved Wishlist"
    >
      <div
        className="fixed inset-0 bg-[#171C2C]/40 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md bg-white h-full flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-base font-semibold text-[#171C2C] font-display">
            Saved Wishlist ({items.length})
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close wishlist"
            className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#171C2C] hover:bg-[#F6F7F9]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-[#F6F7F9] border border-[#E5E7EB] flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-[#6B7280]" />
              </div>
              <p className="text-base font-semibold text-[#171C2C] font-display">
                No saved items yet
              </p>
              <p className="text-sm text-[#6B7280] mt-1 max-w-xs">
                Tap the heart icon on any product card to save it for later.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[#E5E7EB]">
              {items.map((product) => (
                <li key={product.id} className="py-4 flex gap-3.5">
                  <div className="w-20 h-16 rounded-lg overflow-hidden bg-[#F6F7F9] border border-[#E5E7EB] shrink-0">
                    <ProductImage
                      src={product.imageUrl}
                      alt={product.name}
                      category={product.category}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#171C2C] line-clamp-1">
                      {product.name}
                    </p>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      {product.category} ·{' '}
                      <span className="font-semibold text-[#171C2C] tabular-nums">
                        {formatINR(product.price)}
                      </span>
                    </p>

                    <div className="mt-2.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onMoveToCart(product)}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#3457D5] hover:bg-[#2947B5] text-white text-xs font-semibold transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Move to Bag</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove(product)}
                        aria-label={`Remove ${product.name}`}
                        className="h-8 px-2.5 rounded-lg border border-[#E5E7EB] text-xs text-[#6B7280] hover:text-[#DC2626] transition-colors inline-flex items-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
