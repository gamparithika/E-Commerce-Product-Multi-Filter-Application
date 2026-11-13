import type { ChangeEvent } from 'react';
import { formatINR } from '../../utils/formatters';

interface PriceRangeSliderProps {
  minBound: number;
  maxBound: number;
  minValue: number;
  maxValue: number;
  onChange: (nextMin: number, nextMax: number) => void;
}

export function PriceRangeSlider({
  minBound,
  maxBound,
  minValue,
  maxValue,
  onChange,
}: PriceRangeSliderProps) {
  const safeSpan = Math.max(1, maxBound - minBound);
  const minPercent = ((minValue - minBound) / safeSpan) * 100;
  const maxPercent = ((maxValue - minBound) / safeSpan) * 100;
  const step = safeSpan > 5000 ? 100 : 50;

  function handleMinSliderChange(e: ChangeEvent<HTMLInputElement>) {
    const raw = Number(e.target.value);
    const clamped = Math.min(raw, maxValue);
    onChange(Math.max(minBound, clamped), maxValue);
  }

  function handleMaxSliderChange(e: ChangeEvent<HTMLInputElement>) {
    const raw = Number(e.target.value);
    const clamped = Math.max(raw, minValue);
    onChange(minValue, Math.min(maxBound, clamped));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[#171C2C] font-display">
          Price Range
        </span>
        <span className="text-xs font-medium text-[#6B7280] tabular-nums">
          {formatINR(minValue)} – {formatINR(maxValue)}
        </span>
      </div>

      {/* Selected Min / Max Display Boxes */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="px-3 py-2 rounded-lg bg-[#F6F7F9] border border-[#E5E7EB]">
          <span className="block text-[11px] font-medium text-[#6B7280]">
            Minimum
          </span>
          <span className="block text-sm font-semibold text-[#171C2C] tabular-nums mt-0.5">
            {formatINR(minValue)}
          </span>
        </div>
        <div className="px-3 py-2 rounded-lg bg-[#F6F7F9] border border-[#E5E7EB]">
          <span className="block text-[11px] font-medium text-[#6B7280]">
            Maximum
          </span>
          <span className="block text-sm font-semibold text-[#171C2C] tabular-nums mt-0.5">
            {formatINR(maxValue)}
          </span>
        </div>
      </div>

      {/* Dual-Thumb Range Slider */}
      <div className="pt-2 pb-1">
        <div className="relative h-6 flex items-center">
          {/* Base Track */}
          <div className="w-full h-1.5 rounded-full bg-[#E5E7EB]" />

          {/* Active Range Highlight */}
          <div
            className="absolute h-1.5 rounded-full bg-[#3457D5] pointer-events-none"
            style={{
              left: `${Math.max(0, Math.min(100, minPercent))}%`,
              right: `${Math.max(0, Math.min(100, 100 - maxPercent))}%`,
            }}
          />

          {/* Minimum Handle */}
          <input
            type="range"
            min={minBound}
            max={maxBound}
            step={step}
            value={minValue}
            onChange={handleMinSliderChange}
            aria-label="Minimum price"
            aria-valuemin={minBound}
            aria-valuemax={maxValue}
            aria-valuenow={minValue}
            className="dual-range-input absolute inset-0 w-full h-full m-0"
            style={{ zIndex: minValue > maxBound - safeSpan * 0.1 ? 4 : 3 }}
          />

          {/* Maximum Handle */}
          <input
            type="range"
            min={minBound}
            max={maxBound}
            step={step}
            value={maxValue}
            onChange={handleMaxSliderChange}
            aria-label="Maximum price"
            aria-valuemin={minValue}
            aria-valuemax={maxBound}
            aria-valuenow={maxValue}
            className="dual-range-input absolute inset-0 w-full h-full m-0"
            style={{ zIndex: 3 }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#6B7280] tabular-nums mt-1">
          <span>{formatINR(minBound)}</span>
          <span>{formatINR(maxBound)}</span>
        </div>
      </div>
    </div>
  );
}
