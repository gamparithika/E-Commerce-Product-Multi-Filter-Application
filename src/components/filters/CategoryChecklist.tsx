import { Check } from 'lucide-react';
import type { ProductCategory } from '../../../shared/types';

interface CategoryChecklistProps {
  categories: ProductCategory[];
  selectedCategories: ProductCategory[];
  categoryCounts: Record<ProductCategory, number>;
  onToggleCategory: (category: ProductCategory) => void;
}

export function CategoryChecklist({
  categories,
  selectedCategories,
  categoryCounts,
  onToggleCategory,
}: CategoryChecklistProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-[#171C2C] font-display">
        Category
      </legend>

      <div className="space-y-1.5 pt-1">
        {categories.map((category) => {
          const isChecked = selectedCategories.includes(category);
          const count = categoryCounts[category] ?? 0;

          return (
            <label
              key={category}
              className={`group flex items-center justify-between gap-3 px-2.5 py-2 rounded-lg cursor-pointer transition-colors select-none ${
                isChecked
                  ? 'bg-[#3457D5]/6 text-[#171C2C]'
                  : 'hover:bg-[#F6F7F9] text-[#171C2C]'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleCategory(category)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`w-4.5 h-4.5 rounded flex items-center justify-center border transition-colors shrink-0 ${
                    isChecked
                      ? 'bg-[#3457D5] border-[#3457D5] text-white'
                      : 'bg-white border-[#D1D5DB] group-hover:border-[#3457D5]'
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </span>
                <span
                  className={`text-sm truncate ${
                    isChecked ? 'font-medium text-[#171C2C]' : 'text-[#374151]'
                  }`}
                >
                  {category}
                </span>
              </span>

              <span className="text-xs text-[#6B7280] tabular-nums shrink-0">
                {count}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
