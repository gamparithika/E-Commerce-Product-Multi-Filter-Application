import type {
  CreateOrderRequest,
  Order,
  OrdersListResponse,
  ProductCategory,
  ProductQueryResponse,
  SortOption,
} from '../../shared/types';

export interface ProductQueryParams {
  categories: ProductCategory[];
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number | null;
  sort: SortOption;
  search: string;
}

export async function fetchProducts(
  params: ProductQueryParams,
  signal?: AbortSignal
): Promise<ProductQueryResponse> {
  const searchParams = new URLSearchParams();

  if (params.categories.length > 0) {
    searchParams.set('categories', params.categories.join(','));
  }
  if (params.minPrice !== null) {
    searchParams.set('minPrice', String(params.minPrice));
  }
  if (params.maxPrice !== null) {
    searchParams.set('maxPrice', String(params.maxPrice));
  }
  if (params.minRating !== null) {
    searchParams.set('minRating', String(params.minRating));
  }
  if (params.sort && params.sort !== 'default') {
    searchParams.set('sort', params.sort);
  }
  if (params.search.trim().length > 0) {
    searchParams.set('search', params.search.trim());
  }

  const queryString = searchParams.toString();
  const url = queryString ? `/api/products?${queryString}` : '/api/products';

  const response = await fetch(url, { signal });
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || 'Failed to load products from server.');
  }
  return (await response.json()) as ProductQueryResponse;
}

export async function fetchOrders(
  status?: string,
  signal?: AbortSignal
): Promise<OrdersListResponse> {
  const url =
    status && status !== 'All'
      ? `/api/orders?status=${encodeURIComponent(status)}`
      : '/api/orders';
  const response = await fetch(url, { signal });
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || 'Failed to fetch orders.');
  }
  return (await response.json()) as OrdersListResponse;
}

export async function submitOrder(
  payload: CreateOrderRequest
): Promise<{ order: Order }> {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || 'Unable to place order.');
  }
  return body as { order: Order };
}

export async function cancelOrderRequest(
  orderId: string
): Promise<{ order: Order }> {
  const response = await fetch(
    `/api/orders/${encodeURIComponent(orderId)}/cancel`,
    {
      method: 'PATCH',
    }
  );
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || 'Unable to cancel order.');
  }
  return body as { order: Order };
}
