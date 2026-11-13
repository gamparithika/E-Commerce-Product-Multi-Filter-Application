import { X } from 'lucide-react';
import { useState } from 'react';

export function TopAnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <div className="bg-[#171C2C] text-white text-xs py-2 px-4 relative">
      <div className="max-w-[1440px] mx-auto flex items-center justify-center pr-6">
        <p className="text-center font-medium tracking-wide text-slate-100 truncate">
          Discover curated essentials across India · Free express shipping on orders over ₹1,999
        </p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-white rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
