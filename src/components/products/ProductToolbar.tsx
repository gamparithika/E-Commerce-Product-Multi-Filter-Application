import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import type { ProductCategory, SortOption } from '../../../shared/types';

interface ProductToolbarProps {
  filteredCount: number;
  totalCount: number;
  selectedCategories: ProductCategory[];
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onOpenMobileFilters: () => void;
  activeFilterCount: number;
}

export function ProductToolbar({
  filteredCount,
  totalCount,
  selectedCategories,
  sortBy,
  onSortChange,
  onOpenMobileFilters,
  activeFilterCount,
}: ProductToolbarProps) {
  const browsingContext =
    selectedCategories.length === 0
      ? 'All Categories'
      : selectedCategories.join(', ');

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-[#E5E7EB] rounded-xl px-4 py-3">
      {/* Left: Results Summary */}
      <div className="flex items-center justify-between sm:justify-start gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#171C2C] tabular-nums">
            Showing <span className="font-semibold">{filteredCount}</span> of{' '}
            <span>{totalCount}</span>{' '}
            {totalCount === 1 ? 'product' : 'products'}
          </p>
          <p className="text-xs text-[#6B7280] truncate">{browsingContext}</p>
        </div>

        {/* Mobile Filter Trigger */}
        <button
          type="button"
          onClick={onOpenMobileFilters}
          className="lg:hidden inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border border-[#E5E7EB] bg-white text-sm font-medium text-[#171C2C] hover:bg-[#F6F7F9] transition-colors shrink-0"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#3457D5] text-white text-[11px] font-semibold tabular-nums">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Right: Sort By Dropdown */}
      <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
        <label
          htmlFor="product-sort-select"
          className="text-xs font-medium text-[#6B7280] whitespace-nowrap"
        >
          Sort By
        </label>
        <div className="relative">
          <select
            id="product-sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="appearance-none h-9 pl-3.5 pr-9 rounded-lg border border-[#E5E7EB] bg-[#F6F7F9] hover:bg-white text-sm font-medium text-[#171C2C] focus:bg-white focus:border-[#3457D5] focus:outline-none focus:ring-2 focus:ring-[#3457D5]/15 transition-colors cursor-pointer"
          >
            <option value="default">Default</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="rating_desc">Top Rated First</option>
          </select>
          <ChevronDown
            className="w-4 h-4 text-[#6B7280] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
