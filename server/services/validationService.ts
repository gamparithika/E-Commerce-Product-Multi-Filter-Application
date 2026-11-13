import type {
  NormalizedProductFilters,
  Product,
  ProductCategory,
  RawProductFilterQuery,
  SortOption,
} from '../../shared/types.ts';
import { PRODUCT_CATEGORIES } from '../data/products.ts';

export interface InventoryPriceBounds {
  minAvailablePrice: number;
  maxAvailablePrice: number;
}

const VALID_CATEGORIES = new Set<string>(PRODUCT_CATEGORIES);
const VALID_SORT_OPTIONS = new Set<SortOption>([
  'default',
  'price_asc',
  'rating_desc',
]);

export function getInventoryPriceBounds(
  inventory: readonly Product[]
): InventoryPriceBounds {
  if (!inventory || inventory.length === 0) {
    return { minAvailablePrice: 0, maxAvailablePrice: 0 };
  }

  let min = Infinity;
  let max = -Infinity;

  for (const item of inventory) {
    if (Number.isFinite(item.price)) {
      if (item.price < min) min = item.price;
      if (item.price > max) max = item.price;
    }
  }

  if (min === Infinity || max === -Infinity) {
    return { minAvailablePrice: 0, maxAvailablePrice: 0 };
  }

  return { minAvailablePrice: min, maxAvailablePrice: max };
}

function parseCategoryList(
  rawCategories: string | string[] | null | undefined
): ProductCategory[] {
  if (rawCategories === null || rawCategories === undefined) {
    return [];
  }

  const tokens = Array.isArray(rawCategories)
    ? rawCategories.flatMap((entry) =>
        typeof entry === 'string' ? entry.split(',') : []
      )
    : typeof rawCategories === 'string'
      ? rawCategories.split(',')
      : [];

  const unique = new Set<ProductCategory>();
  for (const token of tokens) {
    const trimmed = token.trim();
    if (trimmed && VALID_CATEGORIES.has(trimmed)) {
      unique.add(trimmed as ProductCategory);
    }
  }

  return Array.from(unique);
}

function parseFiniteNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '' || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined') {
      return null;
    }
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  return null;
}

function parseMinRating(value: string | number | null | undefined): number | null {
  const parsed = parseFiniteNumber(value);
  if (parsed === null) {
    return null;
  }
  if (parsed < 1 || parsed > 5) {
    return null;
  }
  return Math.floor(parsed);
}

function parseSortOption(rawSort: string | null | undefined): SortOption {
  if (typeof rawSort !== 'string') {
    return 'default';
  }
  const normalized = rawSort.trim() as SortOption;
  return VALID_SORT_OPTIONS.has(normalized) ? normalized : 'default';
}

function parseSearch(rawSearch: string | null | undefined): string {
  if (typeof rawSearch !== 'string') {
    return '';
  }
  return rawSearch.trim().slice(0, 120);
}

export function validateAndNormalizeFilters(
  rawQuery: RawProductFilterQuery | null | undefined,
  bounds: InventoryPriceBounds
): NormalizedProductFilters {
  const safeQuery: RawProductFilterQuery = rawQuery ?? {};
  const { minAvailablePrice, maxAvailablePrice } = bounds;

  const categories = parseCategoryList(safeQuery.categories);

  const parsedMin = parseFiniteNumber(safeQuery.minPrice);
  const parsedMax = parseFiniteNumber(safeQuery.maxPrice);

  let minPrice =
    parsedMin !== null
      ? Math.max(minAvailablePrice, Math.min(maxAvailablePrice, parsedMin))
      : minAvailablePrice;

  let maxPrice =
    parsedMax !== null
      ? Math.min(maxAvailablePrice, Math.max(minAvailablePrice, parsedMax))
      : maxAvailablePrice;

  // Enforce invariant: minPrice must never exceed maxPrice
  if (minPrice > maxPrice) {
    const swappedMin = maxPrice;
    const swappedMax = minPrice;
    minPrice = swappedMin;
    maxPrice = swappedMax;
  }

  const minRating = parseMinRating(safeQuery.minRating);
  const sort = parseSortOption(safeQuery.sort);
  const search = parseSearch(safeQuery.search);

  return {
    categories,
    minPrice,
    maxPrice,
    minRating,
    sort,
    search,
  };
}
