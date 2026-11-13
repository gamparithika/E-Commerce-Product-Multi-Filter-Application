import type {
  NormalizedProductFilters,
  Product,
  ProductCategory,
} from '../../shared/types.ts';
import { PRODUCT_CATEGORIES } from '../data/products.ts';

export interface FilterCriteriaInput {
  categories?: readonly string[] | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  minRating?: number | null;
  search?: string | null;
}

/**
 * Centralized, non-mutating combinatorial intersection filtering function.
 * Every product in the returned array satisfies ALL active criteria simultaneously.
 */
export function filterProducts(
  inventory: readonly Product[],
  criteria: FilterCriteriaInput | NormalizedProductFilters | null | undefined
): Product[] {
  if (!Array.isArray(inventory) || inventory.length === 0) {
    return [];
  }

  const safeCriteria = criteria ?? {};

  const activeCategories = Array.isArray(safeCriteria.categories)
    ? new Set(
        safeCriteria.categories.filter(
          (cat): cat is string => typeof cat === 'string' && cat.trim().length > 0
        )
      )
    : new Set<string>();

  const hasMinPrice =
    typeof safeCriteria.minPrice === 'number' && Number.isFinite(safeCriteria.minPrice);
  const hasMaxPrice =
    typeof safeCriteria.maxPrice === 'number' && Number.isFinite(safeCriteria.maxPrice);
  const hasMinRating =
    typeof safeCriteria.minRating === 'number' &&
    Number.isFinite(safeCriteria.minRating) &&
    safeCriteria.minRating >= 1;
  const searchTerm =
    typeof safeCriteria.search === 'string'
      ? safeCriteria.search.trim().toLowerCase()
      : '';

  return inventory.filter((product) => {
    // 1. Category membership (empty selection = no category restriction)
    if (activeCategories.size > 0 && !activeCategories.has(product.category)) {
      return false;
    }

    // 2. Inclusive minimum and maximum price boundaries
    if (hasMinPrice && product.price < (safeCriteria.minPrice as number)) {
      return false;
    }
    if (hasMaxPrice && product.price > (safeCriteria.maxPrice as number)) {
      return false;
    }

    // 3. Minimum star rating (>= comparison)
    if (hasMinRating && product.rating < (safeCriteria.minRating as number)) {
      return false;
    }

    // 4. Optional search keyword filter across name, brand, category, and description
    if (searchTerm.length > 0) {
      const haystack =
        `${product.name} ${product.brand} ${product.category} ${product.description}`.toLowerCase();
      if (!haystack.includes(searchTerm)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Computes product counts per category using all non-category filters
 * so users see accurate available counts for each category option.
 */
export function computeCategoryCounts(
  inventory: readonly Product[],
  filters: NormalizedProductFilters
): Record<ProductCategory, number> {
  const counts = {} as Record<ProductCategory, number>;
  for (const cat of PRODUCT_CATEGORIES) {
    counts[cat] = 0;
  }

  const matchingWithoutCategory = filterProducts(inventory, {
    categories: [],
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minRating: filters.minRating,
    search: filters.search,
  });

  for (const product of matchingWithoutCategory) {
    if (counts[product.category] !== undefined) {
      counts[product.category] += 1;
    }
  }

  return counts;
}
