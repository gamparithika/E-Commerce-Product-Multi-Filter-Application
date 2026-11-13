import type {
  Product,
  ProductQueryResponse,
  RawProductFilterQuery,
} from '../../shared/types.ts';
import { PRODUCT_CATEGORIES } from '../data/products.ts';
import { computeCategoryCounts, filterProducts } from './filterService.ts';
import { sortProducts } from './sortService.ts';
import {
  getInventoryPriceBounds,
  validateAndNormalizeFilters,
} from './validationService.ts';

/**
 * Complete server-side product pipeline:
 * MASTER INVENTORY -> VALIDATE -> FILTER -> SORT -> RESPONSE
 */
export function queryProductInventory(
  inventory: readonly Product[],
  rawQuery: RawProductFilterQuery | null | undefined
): ProductQueryResponse {
  const bounds = getInventoryPriceBounds(inventory);
  const appliedFilters = validateAndNormalizeFilters(rawQuery, bounds);

  // Step 1: Filter first
  const filteredProducts = filterProducts(inventory, appliedFilters);

  // Step 2: Sort the already-filtered results
  const sortedProducts = sortProducts(filteredProducts, appliedFilters.sort);

  // Step 3: Compute dynamic category counts (ignoring active category filter so users can multi-select cleanly)
  const categoryCounts = computeCategoryCounts(inventory, appliedFilters);

  return {
    products: sortedProducts,
    meta: {
      totalInventoryCount: inventory.length,
      filteredCount: sortedProducts.length,
      minAvailablePrice: bounds.minAvailablePrice,
      maxAvailablePrice: bounds.maxAvailablePrice,
      allCategories: [...PRODUCT_CATEGORIES],
      categoryCounts,
      appliedFilters,
    },
  };
}
