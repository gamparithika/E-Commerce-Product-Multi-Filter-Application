import { SlidersHorizontal, X } from 'lucide-react';
import { useEffect } from 'react';
import type { ProductCategory } from '../../../shared/types';
import { CategoryChecklist } from './CategoryChecklist';
import { PriceRangeSlider } from './PriceRangeSlider';
import { RatingSelector } from './RatingSelector';

interface MobileFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  allCategories: ProductCategory[];
  selectedCategories: ProductCategory[];
  categoryCounts: Record<ProductCategory, number>;
  onToggleCategory: (category: ProductCategory) => void;
  minBound: number;
  maxBound: number;
  minPrice: number;
  maxPrice: number;
  onPriceChange: (nextMin: number, nextMax: number) => void;
  selectedRating: number | null;
  onSelectRating: (rating: number | null) => void;
  hasActiveFilters: boolean;
  onClearAll: () => void;
  filteredCount: number;
}

export function MobileFilterDrawer({
  open,
  onClose,
  allCategories,
  selectedCategories,
  categoryCounts,
  onToggleCategory,
  minBound,
  maxBound,
  minPrice,
  maxPrice,
  onPriceChange,
  selectedRating,
  onSelectRating,
  hasActiveFilters,
  onClearAll,
  filteredCount,
}: MobileFilterDrawerProps) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden flex"
      role="dialog"
      aria-modal="true"
      aria-label="Filter products"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#171C2C]/40 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className="relative z-10 w-full max-w-sm bg-white h-full flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#171C2C]" />
            <h2 className="text-base font-semibold text-[#171C2C] font-display">
              Filters
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-xs font-medium text-[#3457D5] hover:text-[#2947B5]"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#171C2C] hover:bg-[#F6F7F9]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 divide-y divide-[#E5E7EB]">
          <div className="py-5">
            <CategoryChecklist
              categories={allCategories}
              selectedCategories={selectedCategories}
              categoryCounts={categoryCounts}
              onToggleCategory={onToggleCategory}
            />
          </div>

          <div className="py-5">
            <PriceRangeSlider
              minBound={minBound}
              maxBound={maxBound}
              minValue={minPrice}
              maxValue={maxPrice}
              onChange={onPriceChange}
            />
          </div>

          <div className="py-5">
            <RatingSelector
              selectedRating={selectedRating}
              onSelectRating={onSelectRating}
            />
          </div>
        </div>

        {/* Instant updates happen immediately; this button simply closes the drawer */}
        <div className="p-4 border-t border-[#E5E7EB] bg-[#F6F7F9]">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-11 rounded-lg bg-[#3457D5] hover:bg-[#2947B5] text-white text-sm font-medium transition-colors"
          >
            Done ({filteredCount} {filteredCount === 1 ? 'product' : 'products'})
          </button>
        </div>
      </div>
    </div>
  );
}
