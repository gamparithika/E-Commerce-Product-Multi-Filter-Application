import { Star } from 'lucide-react';

interface RatingSelectorProps {
  selectedRating: number | null;
  onSelectRating: (rating: number | null) => void;
}

const RATING_OPTIONS = [
  { value: 5, label: '5 Stars' },
  { value: 4, label: '4 Stars & Above' },
  { value: 3, label: '3 Stars & Above' },
  { value: 2, label: '2 Stars & Above' },
  { value: 1, label: '1 Star & Above' },
] as const;

export function RatingSelector({
  selectedRating,
  onSelectRating,
}: RatingSelectorProps) {
  return (
    <fieldset className="space-y-3">
      <div className="flex items-center justify-between">
        <legend className="text-sm font-semibold text-[#171C2C] font-display">
          Customer Rating
        </legend>
        {selectedRating !== null && (
          <button
            type="button"
            onClick={() => onSelectRating(null)}
            className="text-xs font-medium text-[#3457D5] hover:text-[#2947B5] transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="space-y-1.5 pt-0.5">
        {RATING_OPTIONS.map((option) => {
          const isSelected = selectedRating === option.value;

          return (
            <label
              key={option.value}
              className={`flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors select-none ${
                isSelected
                  ? 'bg-[#3457D5]/6 text-[#171C2C]'
                  : 'hover:bg-[#F6F7F9] text-[#374151]'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="minimum-star-rating"
                  value={option.value}
                  checked={isSelected}
                  onChange={() => onSelectRating(option.value)}
                  onClick={() => {
                    if (isSelected) {
                      onSelectRating(null);
                    }
                  }}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'border-[#3457D5]'
                      : 'border-[#D1D5DB] bg-white'
                  }`}
                >
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#3457D5]" />
                  )}
                </span>

                <span
                  className="flex items-center gap-0.5"
                  aria-hidden="true"
                >
                  {[1, 2, 3, 4, 5].map((starIndex) => (
                    <Star
                      key={starIndex}
                      className={`w-3.5 h-3.5 ${
                        starIndex <= option.value
                          ? 'fill-[#F5A623] text-[#F5A623]'
                          : 'fill-[#E5E7EB] text-[#E5E7EB]'
                      }`}
                    />
                  ))}
                </span>

                <span
                  className={`text-xs sm:text-sm ${
                    isSelected
                      ? 'font-medium text-[#171C2C]'
                      : 'text-[#4B5563]'
                  }`}
                >
                  {option.label}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
