export type ProductCategory =
  | 'Electronics'
  | 'Apparel'
  | 'Footwear'
  | 'Watches & Accessories'
  | 'Home & Living';

export type SortOption = 'default' | 'price_asc' | 'rating_desc';

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  description: string;
  inStock: boolean;
}

export interface RawProductFilterQuery {
  categories?: string | string[] | null;
  minPrice?: string | number | null;
  maxPrice?: string | number | null;
  minRating?: string | number | null;
  sort?: string | null;
  search?: string | null;
}

export interface NormalizedProductFilters {
  categories: ProductCategory[];
  minPrice: number;
  maxPrice: number;
  minRating: number | null;
  sort: SortOption;
  search: string;
}

export interface ProductQueryMeta {
  totalInventoryCount: number;
  filteredCount: number;
  minAvailablePrice: number;
  maxAvailablePrice: number;
  allCategories: ProductCategory[];
  categoryCounts: Record<ProductCategory, number>;
  appliedFilters: NormalizedProductFilters;
}

export interface ProductQueryResponse {
  products: Product[];
  meta: ProductQueryMeta;
}

export type OrderStatus =
  | 'Confirmed'
  | 'Preparing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export type PaymentMethod = 'UPI' | 'Credit / Debit Card' | 'Cash on Delivery';

export interface OrderCustomerDetails {
  fullName: string;
  phone: string;
  email: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  category: ProductCategory;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  customer: OrderCustomerDetails;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  gstIncluded: number;
  totalAmount: number;
  estimatedDelivery: string;
}

export interface CreateOrderRequest {
  customer: OrderCustomerDetails;
  paymentMethod: PaymentMethod;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface OrdersListResponse {
  orders: Order[];
  summary: {
    totalOrders: number;
    activeOrders: number;
    deliveredOrders: number;
    totalSpent: number;
  };
}
