import { X } from 'lucide-react';
import type { ProductCategory } from '../../../shared/types';
import { formatINR } from '../../utils/formatters';

interface ActiveFilterChipsProps {
  selectedCategories: ProductCategory[];
  onRemoveCategory: (category: ProductCategory) => void;
  minBound: number;
  maxBound: number;
  minPrice: number;
  maxPrice: number;
  onResetPrice: () => void;
  selectedRating: number | null;
  onResetRating: () => void;
  searchQuery: string;
  onResetSearch: () => void;
  onClearAll: () => void;
}

export function ActiveFilterChips({
  selectedCategories,
  onRemoveCategory,
  minBound,
  maxBound,
  minPrice,
  maxPrice,
  onResetPrice,
  selectedRating,
  onResetRating,
  searchQuery,
  onResetSearch,
  onClearAll,
}: ActiveFilterChipsProps) {
  const isPriceFiltered = minPrice > minBound || maxPrice < maxBound;
  const hasSearch = searchQuery.trim().length > 0;
  const hasAny =
    selectedCategories.length > 0 ||
    isPriceFiltered ||
    selectedRating !== null ||
    hasSearch;

  if (!hasAny) {
    return null;
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2 py-1"
      aria-label="Active filters"
    >
      {selectedCategories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onRemoveCategory(category)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E5E7EB] text-xs font-medium text-[#171C2C] hover:border-[#3457D5] hover:text-[#3457D5] transition-colors whitespace-nowrap shrink-0"
        >
          <span>{category}</span>
          <X className="w-3.5 h-3.5 text-[#6B7280]" aria-hidden="true" />
        </button>
      ))}

      {isPriceFiltered && (
        <button
          type="button"
          onClick={onResetPrice}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E5E7EB] text-xs font-medium text-[#171C2C] hover:border-[#3457D5] hover:text-[#3457D5] transition-colors tabular-nums whitespace-nowrap shrink-0"
        >
          <span>
            {formatINR(minPrice)} – {formatINR(maxPrice)}
          </span>
          <X className="w-3.5 h-3.5 text-[#6B7280]" aria-hidden="true" />
        </button>
      )}

      {selectedRating !== null && (
        <button
          type="button"
          onClick={onResetRating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E5E7EB] text-xs font-medium text-[#171C2C] hover:border-[#3457D5] hover:text-[#3457D5] transition-colors whitespace-nowrap shrink-0"
        >
          <span>
            {selectedRating}★ {selectedRating < 5 ? '& Above' : ''}
          </span>
          <X className="w-3.5 h-3.5 text-[#6B7280]" aria-hidden="true" />
        </button>
      )}

      {hasSearch && (
        <button
          type="button"
          onClick={onResetSearch}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E5E7EB] text-xs font-medium text-[#171C2C] hover:border-[#3457D5] hover:text-[#3457D5] transition-colors whitespace-nowrap shrink-0"
        >
          <span>Search: &ldquo;{searchQuery.trim()}&rdquo;</span>
          <X className="w-3.5 h-3.5 text-[#6B7280]" aria-hidden="true" />
        </button>
      )}

      <button
        type="button"
        onClick={onClearAll}
        className="text-xs font-medium text-[#3457D5] hover:text-[#2947B5] px-2 py-1.5 transition-colors whitespace-nowrap shrink-0"
      >
        Clear All
      </button>
    </div>
  );
}
