import { Package } from 'lucide-react';
import { useState } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  category: string;
  className?: string;
}

export function ProductImage({
  src,
  alt,
  category,
  className = '',
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center bg-[#F6F7F9] text-[#6B7280] p-4 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Package className="w-8 h-8 mb-2 text-[#9CA3AF]" aria-hidden="true" />
        <span className="text-xs font-medium text-[#6B7280] line-clamp-1">
          {category}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setHasError(true)}
      className={`w-full h-full object-cover object-center ${className}`}
    />
  );
}
