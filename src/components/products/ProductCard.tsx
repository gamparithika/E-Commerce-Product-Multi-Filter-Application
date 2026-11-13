import { Check, Heart, Plus, Star } from 'lucide-react';
import type { Product } from '../../../shared/types';
import { formatINR } from '../../utils/formatters';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  cartQuantity: number;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export function ProductCard({
  product,
  isWishlisted,
  onToggleWishlist,
  cartQuantity,
  onAddToCart,
  onSelectProduct,
}: ProductCardProps) {
  const hasDiscount =
    typeof product.originalPrice === 'number' &&
    product.originalPrice > product.price;

  return (
    <article className="group bg-white border border-[#E5E7EB] rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[#D1D5DB]">
      {/* Product Image Area */}
      <div className="relative aspect-[4/3] bg-[#F6F7F9] overflow-hidden">
        <button
          type="button"
          onClick={() => onSelectProduct(product)}
          className="w-full h-full block text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3457D5]"
          aria-label={`View details for ${product.name}`}
        >
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            category={product.category}
            className="transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </button>

        {/* Wishlist Toggle */}
        <button
          type="button"
          onClick={() => onToggleWishlist(product)}
          aria-label={
            isWishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          aria-pressed={isWishlisted}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center border transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3457D5] ${
            isWishlisted
              ? 'bg-white border-[#E5E7EB] text-[#E11D48]'
              : 'bg-white/90 border-[#E5E7EB] text-[#6B7280] hover:text-[#171C2C]'
          }`}
        >
          <Heart
            className={`w-4 h-4 ${isWishlisted ? 'fill-[#E11D48]' : ''}`}
          />
        </button>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1.5">
          {/* Unboxed clean metadata */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">
            <span className="truncate">{product.category}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{product.brand}</span>
          </div>

          <h3 className="text-[15px] font-semibold text-[#171C2C] leading-snug line-clamp-2 font-display">
            <button
              type="button"
              onClick={() => onSelectProduct(product)}
              className="text-left hover:text-[#3457D5] transition-colors focus-visible:outline-none focus-visible:underline"
            >
              {product.name}
            </button>
          </h3>

          {/* Rating Row */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <div
              className="flex items-center gap-0.5"
              aria-label={`Rated ${product.rating} out of 5 stars`}
            >
              {[1, 2, 3, 4, 5].map((starIndex) => (
                <Star
                  key={starIndex}
                  className={`w-3.5 h-3.5 ${
                    starIndex <= Math.round(product.rating)
                      ? 'fill-[#F5A623] text-[#F5A623]'
                      : 'fill-[#E5E7EB] text-[#E5E7EB]'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-[#171C2C] tabular-nums">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-xs text-[#6B7280] tabular-nums">
              ({product.reviewCount})
            </span>
          </div>
        </div>

        {/* Price & Action Footer */}
        <div className="pt-2 border-t border-[#F3F4F6] flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base font-bold text-[#171C2C] tabular-nums">
                {formatINR(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-[#6B7280] line-through tabular-nums">
                  {formatINR(product.originalPrice!)}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className={`inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold transition-colors shrink-0 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3457D5] ${
              cartQuantity > 0
                ? 'bg-[#15966B] hover:bg-[#12805B] text-white'
                : 'bg-[#3457D5] hover:bg-[#2947B5] text-white'
            }`}
          >
            {cartQuantity > 0 ? (
              <>
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="tabular-nums">In Bag ({cartQuantity})</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
