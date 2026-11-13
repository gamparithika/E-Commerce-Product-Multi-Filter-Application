import assert from 'node:assert/strict';
import test from 'node:test';
import { MASTER_PRODUCTS } from '../data/products.ts';
import { filterProducts } from './filterService.ts';
import { OrderService, OrderValidationError } from './orderService.ts';
import { queryProductInventory } from './productQueryService.ts';
import { sortProducts } from './sortService.ts';
import { getInventoryPriceBounds } from './validationService.ts';

const bounds = getInventoryPriceBounds(MASTER_PRODUCTS);

test('1. No filters selected: all products appear in original order', () => {
  const result = queryProductInventory(MASTER_PRODUCTS, {});
  assert.equal(result.products.length, MASTER_PRODUCTS.length);
  assert.deepEqual(
    result.products.map((p) => p.id),
    MASTER_PRODUCTS.map((p) => p.id)
  );
});

test('2. Only category selected: correct category products appear', () => {
  const result = queryProductInventory(MASTER_PRODUCTS, {
    categories: 'Electronics',
  });
  assert.ok(result.products.length > 0);
  assert.ok(result.products.every((p) => p.category === 'Electronics'));
});

test('3. Multiple categories selected: matching categories appear', () => {
  const result = queryProductInventory(MASTER_PRODUCTS, {
    categories: ['Electronics', 'Footwear'],
  });
  const allowed = new Set(['Electronics', 'Footwear']);
  assert.ok(result.products.length > 0);
  assert.ok(result.products.every((p) => allowed.has(p.category)));
  assert.ok(result.products.some((p) => p.category === 'Electronics'));
  assert.ok(result.products.some((p) => p.category === 'Footwear'));
});

test('4. Only minimum price selected', () => {
  const minPrice = 10000;
  const result = queryProductInventory(MASTER_PRODUCTS, { minPrice });
  assert.ok(result.products.length > 0);
  assert.ok(result.products.every((p) => p.price >= minPrice));
});

test('5. Only maximum price selected', () => {
  const maxPrice = 3000;
  const result = queryProductInventory(MASTER_PRODUCTS, { maxPrice });
  assert.ok(result.products.length > 0);
  assert.ok(result.products.every((p) => p.price <= maxPrice));
});

test('6. Price boundaries are inclusive', () => {
  const target = MASTER_PRODUCTS[0];
  const result = queryProductInventory(MASTER_PRODUCTS, {
    minPrice: target.price,
    maxPrice: target.price,
  });
  assert.ok(result.products.some((p) => p.id === target.id));
  assert.ok(result.products.every((p) => p.price === target.price));
});

test('7. Only rating selected', () => {
  const result = queryProductInventory(MASTER_PRODUCTS, { minRating: 4 });
  assert.ok(result.products.length > 0);
  assert.ok(result.products.every((p) => p.rating >= 4));

  const fiveStar = queryProductInventory(MASTER_PRODUCTS, { minRating: 5 });
  assert.ok(fiveStar.products.length > 0);
  assert.ok(fiveStar.products.every((p) => p.rating === 5));
});

test('8. Combined category, price, and rating filters (intersection)', () => {
  const result = queryProductInventory(MASTER_PRODUCTS, {
    categories: ['Electronics', 'Apparel'],
    minPrice: 2000,
    maxPrice: 12000,
    minRating: 4,
  });
  assert.ok(result.products.length > 0);
  assert.ok(
    result.products.every(
      (p) =>
        (p.category === 'Electronics' || p.category === 'Apparel') &&
        p.price >= 2000 &&
        p.price <= 12000 &&
        p.rating >= 4
    )
  );
});

test('9. No matching products: returns empty list cleanly', () => {
  const result = queryProductInventory(MASTER_PRODUCTS, {
    categories: ['Footwear'],
    minPrice: 25000,
    maxPrice: 28999,
    minRating: 5,
  });
  assert.equal(result.products.length, 0);
  assert.equal(result.meta.filteredCount, 0);
  assert.equal(result.meta.totalInventoryCount, MASTER_PRODUCTS.length);
});

test('10. Reset filters: complete inventory returns', () => {
  const filtered = queryProductInventory(MASTER_PRODUCTS, {
    categories: ['Electronics'],
    minRating: 4,
  });
  assert.ok(filtered.products.length < MASTER_PRODUCTS.length);

  const reset = queryProductInventory(MASTER_PRODUCTS, {
    categories: [],
    minPrice: bounds.minAvailablePrice,
    maxPrice: bounds.maxAvailablePrice,
    minRating: null,
    sort: 'default',
  });
  assert.equal(reset.products.length, MASTER_PRODUCTS.length);
});

test('11. Price: Low to High sorting', () => {
  const result = queryProductInventory(MASTER_PRODUCTS, {
    sort: 'price_asc',
  });
  assert.equal(result.products.length, MASTER_PRODUCTS.length);
  for (let i = 1; i < result.products.length; i++) {
    assert.ok(result.products[i].price >= result.products[i - 1].price);
  }
});

test('12. Top Rated First sorting', () => {
  const result = queryProductInventory(MASTER_PRODUCTS, {
    sort: 'rating_desc',
  });
  assert.equal(result.products.length, MASTER_PRODUCTS.length);
  for (let i = 1; i < result.products.length; i++) {
    assert.ok(result.products[i].rating <= result.products[i - 1].rating);
  }
});

test('13. Filtering and sorting together (filter first, sort second)', () => {
  const result = queryProductInventory(MASTER_PRODUCTS, {
    categories: ['Electronics', 'Footwear'],
    minRating: 3,
    sort: 'price_asc',
  });
  assert.ok(result.products.length > 1);
  for (let i = 0; i < result.products.length; i++) {
    assert.ok(
      result.products[i].category === 'Electronics' ||
        result.products[i].category === 'Footwear'
    );
    assert.ok(result.products[i].rating >= 3);
    if (i > 0) {
      assert.ok(result.products[i].price >= result.products[i - 1].price);
    }
  }
});

test('14. Null, undefined, and invalid filter handling', () => {
  const nullResult = queryProductInventory(MASTER_PRODUCTS, {
    categories: null,
    minPrice: null,
    maxPrice: null,
    minRating: null,
    sort: null,
    search: null,
  });
  assert.equal(nullResult.products.length, MASTER_PRODUCTS.length);

  const invalidResult = queryProductInventory(MASTER_PRODUCTS, {
    categories: ['NonExistentCategory'],
    minPrice: 'not-a-number',
    maxPrice: 'undefined',
    minRating: 'abc',
    sort: 'unknown_sort',
  });
  assert.equal(invalidResult.products.length, MASTER_PRODUCTS.length);
  assert.equal(invalidResult.meta.appliedFilters.sort, 'default');

  // Inverted min/max safely normalized without breaking
  const invertedResult = queryProductInventory(MASTER_PRODUCTS, {
    minPrice: 10000,
    maxPrice: 2000,
  });
  assert.ok(invertedResult.products.length > 0);
  assert.ok(
    invertedResult.products.every((p) => p.price >= 2000 && p.price <= 10000)
  );
});

test('15. Original master inventory remains unchanged (non-mutation)', () => {
  const snapshot = JSON.stringify(MASTER_PRODUCTS);
  const filtered = filterProducts(MASTER_PRODUCTS, {
    categories: ['Apparel'],
    minPrice: 1000,
    maxPrice: 6000,
    minRating: 4,
  });
  const sorted = sortProducts(filtered, 'price_asc');
  assert.ok(sorted.length > 0);
  assert.equal(JSON.stringify(MASTER_PRODUCTS), snapshot);
});

test('16. Server-side order creation computes pricing from inventory and validates inputs', () => {
  const service = new OrderService([]);
  const product = MASTER_PRODUCTS[0];
  const created = service.createOrder(
    {
      customer: {
        fullName: 'Priya Sharma',
        phone: '9876543210',
        email: 'priya@example.in',
        addressLine: '14, Linking Road, Bandra West',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400050',
      },
      paymentMethod: 'UPI',
      items: [{ productId: product.id, quantity: 2 }],
    },
    MASTER_PRODUCTS
  );

  assert.equal(created.subtotal, product.price * 2);
  assert.equal(created.shippingFee, 0);
  assert.equal(created.totalAmount, product.price * 2);
  assert.equal(created.status, 'Confirmed');

  assert.throws(
    () =>
      service.createOrder(
        {
          customer: {
            fullName: 'Priya Sharma',
            phone: '9876543210',
            email: 'priya@example.in',
            addressLine: '14, Linking Road',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '123', // invalid PIN
          },
          paymentMethod: 'UPI',
          items: [{ productId: product.id, quantity: 1 }],
        },
        MASTER_PRODUCTS
      ),
    OrderValidationError
  );
});

test('17. Newly added categories (Beauty & Grooming, Sports & Fitness) filter and sort accurately', () => {
  const result = queryProductInventory(MASTER_PRODUCTS, {
    categories: ['Beauty & Grooming', 'Sports & Fitness'],
    minRating: 4,
    sort: 'price_asc',
  });
  assert.ok(result.products.length >= 4);
  for (let i = 0; i < result.products.length; i++) {
    assert.ok(
      result.products[i].category === 'Beauty & Grooming' ||
        result.products[i].category === 'Sports & Fitness'
    );
    assert.ok(result.products[i].rating >= 4);
    if (i > 0) {
      assert.ok(result.products[i].price >= result.products[i - 1].price);
    }
  }
});
