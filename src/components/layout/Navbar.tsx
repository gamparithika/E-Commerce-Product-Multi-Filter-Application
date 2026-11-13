import {
  Heart,
  Package,
  Search,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ProductCategory } from '../../../shared/types';

export type ActivePage = 'shop' | 'orders';

interface NavbarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  allCategories: ProductCategory[];
  selectedCategories: ProductCategory[];
  onQuickCategorySelect: (category: ProductCategory | 'ALL') => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  cartCount: number;
  onOpenCart: () => void;
  activeOrdersCount: number;
}

export function Navbar({
  activePage,
  onNavigate,
  searchQuery,
  onSearchChange,
  allCategories,
  selectedCategories,
  onQuickCategorySelect,
  wishlistCount,
  onOpenWishlist,
  cartCount,
  onOpenCart,
  activeOrdersCount,
}: NavbarProps) {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const isAllSelected =
    activePage === 'shop' && selectedCategories.length === 0;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E5E7EB]">
      {/* Primary Navigation Row */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Brand Logo */}
        <button
          type="button"
          onClick={() => {
            onNavigate('shop');
            onQuickCategorySelect('ALL');
          }}
          className="flex items-center gap-2.5 text-left min-w-0 shrink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3457D5] rounded-md"
        >
          <span className="w-8 h-8 rounded-lg bg-[#3457D5] text-white flex items-center justify-center font-display font-bold text-base tracking-tight shrink-0">
            E
          </span>
          <span className="font-display font-bold text-sm sm:text-base lg:text-lg tracking-tight text-[#171C2C] truncate">
            E-Commerce Product Multi-Filter Application
          </span>
        </button>

        {/* Desktop / Tablet Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl">
          <div className="relative w-full">
            <Search
              className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                if (activePage !== 'shop') {
                  onNavigate('shop');
                }
                onSearchChange(e.target.value);
              }}
              placeholder="Search electronics, apparel, footwear, watches..."
              aria-label="Search products"
              className="w-full h-10 pl-10 pr-9 bg-[#F6F7F9] border border-[#E5E7EB] rounded-lg text-sm text-[#171C2C] placeholder:text-[#6B7280] focus:bg-white focus:border-[#3457D5] focus:outline-none focus:ring-2 focus:ring-[#3457D5]/15 transition-colors"
            />
            {searchQuery.length > 0 && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#6B7280] hover:text-[#171C2C] rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Actions: Orders, Wishlist, Cart, Account */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() =>
              onNavigate(activePage === 'orders' ? 'shop' : 'orders')
            }
            className={`relative inline-flex items-center gap-2 h-10 px-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3457D5] ${
              activePage === 'orders'
                ? 'bg-[#3457D5]/10 text-[#3457D5]'
                : 'text-[#171C2C] hover:bg-[#F6F7F9]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Orders</span>
            {activeOrdersCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#171C2C] text-white text-[11px] font-semibold tabular-nums">
                {activeOrdersCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenWishlist}
            aria-label={`Open wishlist (${wishlistCount} saved)`}
            className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg text-[#171C2C] hover:bg-[#F6F7F9] transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3457D5]"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#3457D5] text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
                {wishlistCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Open shopping cart (${cartCount} items)`}
            className="relative inline-flex items-center gap-2 h-10 px-3 rounded-lg text-sm font-medium text-[#171C2C] hover:bg-[#F6F7F9] transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3457D5]"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="hidden lg:inline">Bag</span>
            {cartCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#3457D5] text-white text-xs font-semibold tabular-nums">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Account Dropdown */}
          <div className="relative" ref={accountMenuRef}>
            <button
              type="button"
              onClick={() => setAccountMenuOpen((prev) => !prev)}
              aria-expanded={accountMenuOpen}
              aria-label="User account menu"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-[#171C2C] hover:bg-[#F6F7F9] transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3457D5]"
            >
              <User className="w-5 h-5" />
            </button>

            {accountMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-[#E5E7EB] rounded-xl shadow-lg py-2 z-50">
                <div className="px-4 py-2.5 border-b border-[#E5E7EB]">
                  <p className="text-sm font-semibold text-[#171C2C]">
                    Aarav Deshmukh
                  </p>
                  <p className="text-xs text-[#6B7280] truncate">
                    Bengaluru, Karnataka · 560038
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('shop');
                    setAccountMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-[#171C2C] hover:bg-[#F6F7F9] transition-colors"
                >
                  Discover Products
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('orders');
                    setAccountMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-[#171C2C] hover:bg-[#F6F7F9] transition-colors flex items-center justify-between"
                >
                  <span>My Orders</span>
                  <span className="text-xs text-[#6B7280] tabular-nums">
                    {activeOrdersCount} active
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenWishlist();
                    setAccountMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-[#171C2C] hover:bg-[#F6F7F9] transition-colors flex items-center justify-between"
                >
                  <span>Saved Wishlist</span>
                  <span className="text-xs text-[#6B7280] tabular-nums">
                    {wishlistCount}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search
            className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => {
              if (activePage !== 'shop') {
                onNavigate('shop');
              }
              onSearchChange(e.target.value);
            }}
            placeholder="Search products..."
            aria-label="Search products"
            className="w-full h-10 pl-10 pr-9 bg-[#F6F7F9] border border-[#E5E7EB] rounded-lg text-sm text-[#171C2C] placeholder:text-[#6B7280] focus:bg-white focus:border-[#3457D5] focus:outline-none"
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#6B7280]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Navigation Strip */}
      <div className="border-t border-[#E5E7EB] bg-white">
        <nav
          aria-label="Category quick navigation"
          className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 overflow-x-auto no-scrollbar h-11"
        >
          <button
            type="button"
            onClick={() => {
              onNavigate('shop');
              onQuickCategorySelect('ALL');
            }}
            className={`text-sm font-medium whitespace-nowrap shrink-0 h-full border-b-2 transition-colors ${
              isAllSelected
                ? 'border-[#3457D5] text-[#3457D5]'
                : 'border-transparent text-[#6B7280] hover:text-[#171C2C]'
            }`}
          >
            All Products
          </button>

          {allCategories.map((category) => {
            const isActive =
              activePage === 'shop' &&
              selectedCategories.length === 1 &&
              selectedCategories[0] === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => {
                  onNavigate('shop');
                  onQuickCategorySelect(category);
                }}
                className={`text-sm font-medium whitespace-nowrap shrink-0 h-full border-b-2 transition-colors ${
                  isActive
                    ? 'border-[#3457D5] text-[#3457D5]'
                    : 'border-transparent text-[#6B7280] hover:text-[#171C2C]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
