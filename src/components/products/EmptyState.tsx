import { RotateCcw, SearchX } from 'lucide-react';

interface EmptyStateProps {
  onResetFilters: () => void;
}

export function EmptyState({ onResetFilters }: EmptyStateProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl px-6 py-16 text-center flex flex-col items-center justify-center">
      <div className="w-14 h-14 rounded-2xl bg-[#F6F7F9] border border-[#E5E7EB] flex items-center justify-center mb-5">
        <SearchX className="w-7 h-7 text-[#6B7280]" aria-hidden="true" />
      </div>

      <h3 className="text-lg font-semibold text-[#171C2C] font-display">
        No products found
      </h3>
      <p className="text-sm text-[#6B7280] mt-1.5 max-w-md">
        Try adjusting your filters to discover more products.
      </p>
      <p className="text-sm font-medium text-[#171C2C] mt-3">
        No items match your criteria. Reset filters
      </p>

      <button
        type="button"
        onClick={onResetFilters}
        className="mt-6 inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-[#3457D5] hover:bg-[#2947B5] text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3457D5] focus-visible:ring-offset-2"
      >
        <RotateCcw className="w-4 h-4" aria-hidden="true" />
        <span>Reset Filters</span>
      </button>
    </div>
  );
}
