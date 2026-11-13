import type { Product, SortOption } from '../../shared/types.ts';

/**
 * Non-mutating server-side sorting function.
 * Always receives an already-filtered subset and returns a newly sorted array.
 */
export function sortProducts(
  products: readonly Product[],
  sortBy: SortOption | null | undefined
): Product[] {
  if (!Array.isArray(products) || products.length === 0) {
    return [];
  }

  const copy = [...products];

  switch (sortBy) {
    case 'price_asc':
      return copy.sort((a, b) => a.price - b.price);

    case 'rating_desc':
      return copy.sort((a, b) => {
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        return b.reviewCount - a.reviewCount;
      });

    case 'default':
    default:
      // Preserve original inventory ordering
      return copy;
  }
}
