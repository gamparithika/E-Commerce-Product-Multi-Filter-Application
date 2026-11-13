import { ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  Order,
  OrdersListResponse,
  Product,
  ProductCategory,
  ProductQueryResponse,
  SortOption,
} from '../shared/types';
import { CartDrawer, type CartEntry } from './components/cart/CartDrawer';
import { WishlistDrawer } from './components/cart/WishlistDrawer';
import { FilterSidebar } from './components/filters/FilterSidebar';
import { MobileFilterDrawer } from './components/filters/MobileFilterDrawer';
import { Navbar, type ActivePage } from './components/layout/Navbar';
import { TopAnnouncementBar } from './components/layout/TopAnnouncementBar';
import { OrdersSection } from './components/orders/OrdersSection';
import { ActiveFilterChips } from './components/products/ActiveFilterChips';
import { ProductDetailModal } from './components/products/ProductDetailModal';
import { ProductGrid } from './components/products/ProductGrid';
import { ProductToolbar } from './components/products/ProductToolbar';
import {
  cancelOrderRequest,
  fetchOrders,
  fetchProducts,
} from './services/apiClient';

const DEFAULT_CATEGORIES: ProductCategory[] = [
  'Electronics',
  'Apparel',
  'Footwear',
  'Watches & Accessories',
  'Home & Living',
];

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('shop');

  // Filter & Sorting State (Single Source of Truth)
  const [selectedCategories, setSelectedCategories] = useState<ProductCategory[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number | null; max: number | null }>({
    min: null,
    max: null,
  });
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Server Product Inventory Response State
  const [catalogResponse, setCatalogResponse] = useState<ProductQueryResponse | null>(null);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  // UI Drawers & Modals
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Shopping Bag & Wishlist State
  const [cartItems, setCartItems] = useState<CartEntry[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);

  // Orders State
  const [ordersData, setOrdersData] = useState<OrdersListResponse | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');

  const requestSeqRef = useRef(0);

  // Debounce search input cleanly to avoid excessive backend calls while typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 200);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch filtered + sorted products from server API whenever filters/sort change
  const loadProducts = useCallback(async () => {
    const controller = new AbortController();
    const seq = ++requestSeqRef.current;

    setProductsLoading(true);
    setProductsError(null);

    try {
      const data = await fetchProducts(
        {
          categories: selectedCategories,
          minPrice: priceRange.min,
          maxPrice: priceRange.max,
          minRating: selectedRating,
          sort: sortBy,
          search: debouncedSearch,
        },
        controller.signal
      );

      if (seq === requestSeqRef.current) {
        setCatalogResponse(data);
        setProductsLoading(false);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      if (seq === requestSeqRef.current) {
        setProductsError(
          err instanceof Error ? err.message : 'Unable to load product inventory.'
        );
        setProductsLoading(false);
      }
    }

    return () => controller.abort();
  }, [
    selectedCategories,
    priceRange.min,
    priceRange.max,
    selectedRating,
    sortBy,
    debouncedSearch,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    const seq = ++requestSeqRef.current;

    setProductsLoading(true);
    setProductsError(null);

    fetchProducts(
      {
        categories: selectedCategories,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        minRating: selectedRating,
        sort: sortBy,
        search: debouncedSearch,
      },
      controller.signal
    )
      .then((data) => {
        if (seq === requestSeqRef.current) {
          setCatalogResponse(data);
          setProductsLoading(false);
        }
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        if (seq === requestSeqRef.current) {
          setProductsError(
            err instanceof Error ? err.message : 'Unable to load product inventory.'
          );
          setProductsLoading(false);
        }
      });

    return () => controller.abort();
  }, [
    selectedCategories,
    priceRange.min,
    priceRange.max,
    selectedRating,
    sortBy,
    debouncedSearch,
  ]);

  // Fetch orders from server
  const loadOrders = useCallback(async (status: string) => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const data = await fetchOrders(status);
      setOrdersData(data);
    } catch (err) {
      setOrdersError(
        err instanceof Error ? err.message : 'Unable to load orders.'
      );
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders(orderStatusFilter);
  }, [orderStatusFilter, loadOrders]);

  // Derived bounds and metadata from server response
  const minBound = catalogResponse?.meta.minAvailablePrice ?? 699;
  const maxBound = catalogResponse?.meta.maxAvailablePrice ?? 28999;
  const activeMinPrice = priceRange.min ?? minBound;
  const activeMaxPrice = priceRange.max ?? maxBound;

  const allCategories = catalogResponse?.meta.allCategories ?? DEFAULT_CATEGORIES;
  const categoryCounts = catalogResponse?.meta.categoryCounts ?? {
    Electronics: 0,
    Apparel: 0,
    Footwear: 0,
    'Watches & Accessories': 0,
    'Home & Living': 0,
  };

  const isPriceFiltered =
    (priceRange.min !== null && priceRange.min > minBound) ||
    (priceRange.max !== null && priceRange.max < maxBound);

  const activeFilterCount =
    selectedCategories.length +
    (isPriceFiltered ? 1 : 0) +
    (selectedRating !== null ? 1 : 0) +
    (debouncedSearch.length > 0 ? 1 : 0);

  const hasActiveFilters = activeFilterCount > 0 || sortBy !== 'default';

  // Filter Handlers
  function handleToggleCategory(category: ProductCategory) {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  }

  function handleQuickCategorySelect(category: ProductCategory | 'ALL') {
    if (category === 'ALL') {
      setSelectedCategories([]);
    } else {
      setSelectedCategories([category]);
    }
  }

  function handlePriceChange(nextMin: number, nextMax: number) {
    const safeMin = Math.max(minBound, Math.min(nextMin, nextMax));
    const safeMax = Math.min(maxBound, Math.max(nextMin, nextMax));
    setPriceRange({
      min: safeMin === minBound ? null : safeMin,
      max: safeMax === maxBound ? null : safeMax,
    });
  }

  function handleResetFilters() {
    setSelectedCategories([]);
    setPriceRange({ min: null, max: null });
    setSelectedRating(null);
    setSortBy('default');
    setSearchInput('');
    setDebouncedSearch('');
  }

  // Cart & Wishlist Handlers
  function handleAddToCart(product: Product, quantityToAdd = 1) {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(25, item.quantity + quantityToAdd) }
            : item
        );
      }
      return [...prev, { product, quantity: quantityToAdd }];
    });
  }

  function handleUpdateCartQuantity(productId: string, nextQuantity: number) {
    if (nextQuantity <= 0) {
      setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(25, nextQuantity) }
          : item
      )
    );
  }

  function handleRemoveFromCart(productId: string) {
    setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
  }

  function handleToggleWishlist(product: Product) {
    setWishlistItems((prev) =>
      prev.some((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product]
    );
  }

  function handleMoveWishlistToCart(product: Product) {
    handleAddToCart(product, 1);
    setWishlistItems((prev) => prev.filter((p) => p.id !== product.id));
  }

  // Order Handlers
  async function handleCancelOrder(orderId: string) {
    await cancelOrderRequest(orderId);
    await loadOrders(orderStatusFilter);
  }

  function handleReorder(order: Order) {
    const productsById = new Map(
      (catalogResponse?.products ?? []).map((p) => [p.id, p])
    );

    setCartItems((prev) => {
      const next = [...prev];
      for (const orderItem of order.items) {
        const matchedProduct: Product = productsById.get(orderItem.productId) ?? {
          id: orderItem.productId,
          sku: orderItem.productId.toUpperCase(),
          name: orderItem.name,
          brand: orderItem.brand,
          category: orderItem.category,
          price: orderItem.unitPrice,
          rating: 4.5,
          reviewCount: 100,
          imageUrl: orderItem.imageUrl,
          description: '',
          inStock: true,
        };
        const existingIdx = next.findIndex(
          (entry) => entry.product.id === matchedProduct.id
        );
        if (existingIdx >= 0) {
          next[existingIdx] = {
            ...next[existingIdx],
            quantity: Math.min(25, next[existingIdx].quantity + orderItem.quantity),
          };
        } else {
          next.push({ product: matchedProduct, quantity: orderItem.quantity });
        }
      }
      return next;
    });
    setCartOpen(true);
  }

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartQuantities = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of cartItems) {
      map[item.product.id] = item.quantity;
    }
    return map;
  }, [cartItems]);

  const wishlistIds = useMemo(
    () => new Set(wishlistItems.map((p) => p.id)),
    [wishlistItems]
  );

  const products = catalogResponse?.products ?? [];
  const totalCount = catalogResponse?.meta.totalInventoryCount ?? 0;
  const filteredCount = catalogResponse?.meta.filteredCount ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F9] text-[#171C2C]">
      <TopAnnouncementBar />

      <Navbar
        activePage={activePage}
        onNavigate={setActivePage}
        searchQuery={searchInput}
        onSearchChange={setSearchInput}
        allCategories={allCategories}
        selectedCategories={selectedCategories}
        onQuickCategorySelect={handleQuickCategorySelect}
        wishlistCount={wishlistItems.length}
        onOpenWishlist={() => setWishlistOpen(true)}
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        activeOrdersCount={ordersData?.summary.activeOrders ?? 0}
      />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activePage === 'orders' ? (
          <OrdersSection
            ordersData={ordersData}
            loading={ordersLoading}
            error={ordersError}
            statusFilter={orderStatusFilter}
            onStatusFilterChange={setOrderStatusFilter}
            onCancelOrder={handleCancelOrder}
            onReorder={handleReorder}
            onBackToShop={() => setActivePage('shop')}
          />
        ) : (
          <div className="space-y-6">
            {/* Page Breadcrumb & Heading */}
            <div className="space-y-1.5">
              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-1.5 text-xs text-[#6B7280]"
              >
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="hover:text-[#171C2C] transition-colors"
                >
                  Home
                </button>
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="text-[#171C2C] font-medium">
                  Discover Products
                </span>
              </nav>

              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#171C2C] font-display tracking-tight">
                    Discover Products
                  </h1>
                  <p className="text-sm text-[#6B7280] mt-1">
                    Find the right products for your needs across curated electronics, apparel, footwear, watches, and homeware.
                  </p>
                </div>
              </div>
            </div>

            {/* Two-Column Marketplace Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Desktop Sticky Filter Sidebar */}
              <div className="hidden lg:block lg:col-span-3">
                <FilterSidebar
                  allCategories={allCategories}
                  selectedCategories={selectedCategories}
                  categoryCounts={categoryCounts}
                  onToggleCategory={handleToggleCategory}
                  minBound={minBound}
                  maxBound={maxBound}
                  minPrice={activeMinPrice}
                  maxPrice={activeMaxPrice}
                  onPriceChange={handlePriceChange}
                  selectedRating={selectedRating}
                  onSelectRating={setSelectedRating}
                  hasActiveFilters={hasActiveFilters}
                  onClearAll={handleResetFilters}
                />
              </div>

              {/* Right Inventory Column */}
              <div className="lg:col-span-9 space-y-4">
                <ProductToolbar
                  filteredCount={filteredCount}
                  totalCount={totalCount}
                  selectedCategories={selectedCategories}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  onOpenMobileFilters={() => setMobileFilterOpen(true)}
                  activeFilterCount={activeFilterCount}
                />

                <ActiveFilterChips
                  selectedCategories={selectedCategories}
                  onRemoveCategory={handleToggleCategory}
                  minBound={minBound}
                  maxBound={maxBound}
                  minPrice={activeMinPrice}
                  maxPrice={activeMaxPrice}
                  onResetPrice={() => setPriceRange({ min: null, max: null })}
                  selectedRating={selectedRating}
                  onResetRating={() => setSelectedRating(null)}
                  searchQuery={debouncedSearch}
                  onResetSearch={() => {
                    setSearchInput('');
                    setDebouncedSearch('');
                  }}
                  onClearAll={handleResetFilters}
                />

                <ProductGrid
                  products={products}
                  loading={productsLoading}
                  error={productsError}
                  onRetry={() => loadProducts()}
                  onResetFilters={handleResetFilters}
                  wishlistIds={wishlistIds}
                  onToggleWishlist={handleToggleWishlist}
                  cartQuantities={cartQuantities}
                  onAddToCart={(product) => handleAddToCart(product, 1)}
                  onSelectProduct={setSelectedProduct}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Clean Quiet Footer */}
      <footer className="bg-white border-t border-[#E5E7EB] mt-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B7280]">
          <p>© 2026 KoraStore Retail India Pvt. Ltd. All prices inclusive of GST.</p>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => {
                setActivePage('shop');
                handleResetFilters();
              }}
              className="hover:text-[#171C2C] transition-colors"
            >
              All Products
            </button>
            <button
              type="button"
              onClick={() => setActivePage('orders')}
              className="hover:text-[#171C2C] transition-colors"
            >
              Track Orders
            </button>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="hover:text-[#171C2C] transition-colors"
            >
              Shopping Bag ({cartCount})
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        allCategories={allCategories}
        selectedCategories={selectedCategories}
        categoryCounts={categoryCounts}
        onToggleCategory={handleToggleCategory}
        minBound={minBound}
        maxBound={maxBound}
        minPrice={activeMinPrice}
        maxPrice={activeMaxPrice}
        onPriceChange={handlePriceChange}
        selectedRating={selectedRating}
        onSelectRating={setSelectedRating}
        hasActiveFilters={hasActiveFilters}
        onClearAll={handleResetFilters}
        filteredCount={filteredCount}
      />

      {/* Product Detail Quick View Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        isWishlisted={
          selectedProduct ? wishlistIds.has(selectedProduct.id) : false
        }
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
      />

      {/* Shopping Bag & Checkout Drawer */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={() => setCartItems([])}
        onOrderCreated={() => {
          loadOrders(orderStatusFilter);
        }}
        onViewOrders={() => setActivePage('orders')}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        open={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        items={wishlistItems}
        onRemove={handleToggleWishlist}
        onMoveToCart={handleMoveWishlistToCart}
      />
    </div>
  );
}
