import { Check, Heart, ShieldCheck, Star, Truck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Product } from '../../../shared/types';
import { formatINR } from '../../utils/formatters';
import { ProductImage } from './ProductImage';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export function ProductDetailModal({
  product,
  onClose,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    setQuantity(1);
    setJustAdded(false);
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [product, onClose]);

  if (!product) {
    return null;
  }

  const hasDiscount =
    typeof product.originalPrice === 'number' &&
    product.originalPrice > product.price;

  function handleAdd() {
    if (!product) return;
    onAddToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
    >
      <div
        className="fixed inset-0 bg-[#171C2C]/45 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-3xl bg-white border border-[#E5E7EB] rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/95 border border-[#E5E7EB] text-[#6B7280] hover:text-[#171C2C] flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="aspect-[4/3] md:aspect-auto md:h-full bg-[#F6F7F9]">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            category={product.category}
          />
        </div>

        <div className="p-6 flex flex-col justify-between gap-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#6B7280]">
              <span>{product.category}</span>
              <span aria-hidden="true">·</span>
              <span>{product.brand}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{product.sku}</span>
            </div>

            <h2 className="text-xl font-bold text-[#171C2C] font-display leading-snug">
              {product.name}
            </h2>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((idx) => (
                  <Star
                    key={idx}
                    className={`w-4 h-4 ${
                      idx <= Math.round(product.rating)
                        ? 'fill-[#F5A623] text-[#F5A623]'
                        : 'fill-[#E5E7EB] text-[#E5E7EB]'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-[#171C2C] tabular-nums">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-xs text-[#6B7280] tabular-nums">
                ({product.reviewCount} verified reviews)
              </span>
            </div>

            <div className="pt-1 flex items-baseline gap-2.5">
              <span className="text-2xl font-bold text-[#171C2C] tabular-nums">
                {formatINR(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-[#6B7280] line-through tabular-nums">
                  {formatINR(product.originalPrice!)}
                </span>
              )}
              <span className="text-xs font-medium text-[#15966B]">
                Inclusive of GST
              </span>
            </div>

            <p className="text-sm text-[#4B5563] leading-relaxed">
              {product.description}
            </p>

            <div className="pt-2 space-y-2 text-xs text-[#6B7280]">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#15966B] shrink-0" />
                <span>Free express delivery on orders above ₹1,999</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#3457D5] shrink-0" />
                <span>In stock · Dispatches within 24 hours across India</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5E7EB] flex items-center gap-3">
            <div className="flex items-center border border-[#E5E7EB] rounded-lg h-10 bg-[#F6F7F9]">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="w-9 h-full text-sm font-semibold text-[#171C2C] hover:bg-white rounded-l-lg transition-colors"
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-semibold tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                aria-label="Increase quantity"
                className="w-9 h-full text-sm font-semibold text-[#171C2C] hover:bg-white rounded-r-lg transition-colors"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className={`flex-1 h-10 rounded-lg text-sm font-semibold text-white transition-colors inline-flex items-center justify-center gap-2 ${
                justAdded
                  ? 'bg-[#15966B] hover:bg-[#12805B]'
                  : 'bg-[#3457D5] hover:bg-[#2947B5]'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Bag</span>
                </>
              ) : (
                <span>Add to Bag</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onToggleWishlist(product)}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors ${
                isWishlisted
                  ? 'border-[#E11D48]/30 bg-[#E11D48]/5 text-[#E11D48]'
                  : 'border-[#E5E7EB] text-[#6B7280] hover:text-[#171C2C]'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${isWishlisted ? 'fill-[#E11D48]' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
