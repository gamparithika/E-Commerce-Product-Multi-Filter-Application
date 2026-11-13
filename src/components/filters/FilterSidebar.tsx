import { SlidersHorizontal } from 'lucide-react';
import type { ProductCategory } from '../../../shared/types';
import { CategoryChecklist } from './CategoryChecklist';
import { PriceRangeSlider } from './PriceRangeSlider';
import { RatingSelector } from './RatingSelector';

interface FilterSidebarProps {
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
}

export function FilterSidebar({
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
}: FilterSidebarProps) {
  return (
    <aside
      aria-label="Product filters"
      className="bg-white border border-[#E5E7EB] rounded-xl p-5 lg:sticky lg:top-32"
    >
      <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#171C2C]" aria-hidden="true" />
          <h2 className="text-base font-semibold text-[#171C2C] font-display">
            Filters
          </h2>
        </div>

        <button
          type="button"
          onClick={onClearAll}
          disabled={!hasActiveFilters}
          className={`text-xs font-medium transition-colors ${
            hasActiveFilters
              ? 'text-[#3457D5] hover:text-[#2947B5] cursor-pointer'
              : 'text-[#9CA3AF] cursor-not-allowed'
          }`}
        >
          Clear All
        </button>
      </div>

      <div className="divide-y divide-[#E5E7EB]">
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

        <div className="pt-5">
          <RatingSelector
            selectedRating={selectedRating}
            onSelectRating={onSelectRating}
          />
        </div>
      </div>
    </aside>
  );
}
