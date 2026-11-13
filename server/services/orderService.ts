import type {
  CreateOrderRequest,
  Order,
  OrderItem,
  OrdersListResponse,
  OrderStatus,
  PaymentMethod,
  Product,
} from '../../shared/types.ts';
import { MASTER_PRODUCTS } from '../data/products.ts';

const FREE_SHIPPING_THRESHOLD_INR = 1999;
const STANDARD_SHIPPING_FEE_INR = 149;

const VALID_PAYMENT_METHODS = new Set<PaymentMethod>([
  'UPI',
  'Credit / Debit Card',
  'Cash on Delivery',
]);

function createSeedOrders(): Order[] {
  const p1 = MASTER_PRODUCTS.find((p) => p.id === 'elec-001') ?? MASTER_PRODUCTS[0];
  const p2 = MASTER_PRODUCTS.find((p) => p.id === 'app-001') ?? MASTER_PRODUCTS[1];
  const p3 = MASTER_PRODUCTS.find((p) => p.id === 'foot-002') ?? MASTER_PRODUCTS[7];
  const p4 = MASTER_PRODUCTS.find((p) => p.id === 'home-002') ?? MASTER_PRODUCTS[15];

  const order1Subtotal = p1.price + p4.price;
  const order1Shipping = order1Subtotal >= FREE_SHIPPING_THRESHOLD_INR ? 0 : STANDARD_SHIPPING_FEE_INR;
  const order1Total = order1Subtotal + order1Shipping;

  const order2Subtotal = p2.price * 2 + p3.price;
  const order2Shipping = order2Subtotal >= FREE_SHIPPING_THRESHOLD_INR ? 0 : STANDARD_SHIPPING_FEE_INR;
  const order2Total = order2Subtotal + order2Shipping;

  return [
    {
      id: 'ord-seed-1042',
      orderNumber: 'ORD-2026-1042',
      createdAt: '2026-11-10T09:15:00.000Z',
      updatedAt: '2026-11-12T14:30:00.000Z',
      status: 'Shipped',
      paymentMethod: 'UPI',
      customer: {
        fullName: 'Aarav Deshmukh',
        phone: '9820456712',
        email: 'aarav.deshmukh@example.in',
        addressLine: '402, Skylark Residency, Indiranagar 100ft Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
      },
      items: [
        {
          productId: p1.id,
          name: p1.name,
          brand: p1.brand,
          category: p1.category,
          imageUrl: p1.imageUrl,
          unitPrice: p1.price,
          quantity: 1,
          lineTotal: p1.price,
        },
        {
          productId: p4.id,
          name: p4.name,
          brand: p4.brand,
          category: p4.category,
          imageUrl: p4.imageUrl,
          unitPrice: p4.price,
          quantity: 1,
          lineTotal: p4.price,
        },
      ],
      subtotal: order1Subtotal,
      shippingFee: order1Shipping,
      gstIncluded: Math.round(order1Subtotal - order1Subtotal / 1.18),
      totalAmount: order1Total,
      estimatedDelivery: 'Arriving Tomorrow by 8:00 PM',
    },
    {
      id: 'ord-seed-1039',
      orderNumber: 'ORD-2026-1039',
      createdAt: '2026-11-02T16:40:00.000Z',
      updatedAt: '2026-11-06T11:20:00.000Z',
      status: 'Delivered',
      paymentMethod: 'Credit / Debit Card',
      customer: {
        fullName: 'Aarav Deshmukh',
        phone: '9820456712',
        email: 'aarav.deshmukh@example.in',
        addressLine: '402, Skylark Residency, Indiranagar 100ft Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
      },
      items: [
        {
          productId: p2.id,
          name: p2.name,
          brand: p2.brand,
          category: p2.category,
          imageUrl: p2.imageUrl,
          unitPrice: p2.price,
          quantity: 2,
          lineTotal: p2.price * 2,
        },
        {
          productId: p3.id,
          name: p3.name,
          brand: p3.brand,
          category: p3.category,
          imageUrl: p3.imageUrl,
          unitPrice: p3.price,
          quantity: 1,
          lineTotal: p3.price,
        },
      ],
      subtotal: order2Subtotal,
      shippingFee: order2Shipping,
      gstIncluded: Math.round(order2Subtotal - order2Subtotal / 1.18),
      totalAmount: order2Total,
      estimatedDelivery: 'Delivered on 6 Nov 2026',
    },
  ];
}

export class OrderValidationError extends Error {
  public readonly statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'OrderValidationError';
    this.statusCode = statusCode;
  }
}

export class OrderService {
  private orders: Order[];
  private sequenceCounter = 1043;

  constructor(initialOrders?: Order[]) {
    this.orders = initialOrders ? [...initialOrders] : createSeedOrders();
  }

  public listOrders(statusFilter?: string | null): OrdersListResponse {
    const normalizedFilter =
      typeof statusFilter === 'string' ? statusFilter.trim() : '';

    const activeStatuses = new Set<OrderStatus>([
      'Confirmed',
      'Preparing',
      'Shipped',
    ]);

    let filtered = [...this.orders];
    if (normalizedFilter && normalizedFilter !== 'All') {
      if (normalizedFilter === 'Active') {
        filtered = filtered.filter((o) => activeStatuses.has(o.status));
      } else {
        filtered = filtered.filter((o) => o.status === normalizedFilter);
      }
    }

    const totalOrders = this.orders.length;
    const activeOrders = this.orders.filter((o) =>
      activeStatuses.has(o.status)
    ).length;
    const deliveredOrders = this.orders.filter(
      (o) => o.status === 'Delivered'
    ).length;
    const totalSpent = this.orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      orders: filtered,
      summary: {
        totalOrders,
        activeOrders,
        deliveredOrders,
        totalSpent,
      },
    };
  }

  public createOrder(
    payload: CreateOrderRequest,
    inventory: readonly Product[]
  ): Order {
    if (!payload || typeof payload !== 'object') {
      throw new OrderValidationError('Invalid order payload.');
    }

    const { customer, paymentMethod, items } = payload;

    if (!customer || typeof customer !== 'object') {
      throw new OrderValidationError('Customer shipping details are required.');
    }

    const fullName = customer.fullName?.trim() ?? '';
    const phone = customer.phone?.replace(/\s+/g, '') ?? '';
    const email = customer.email?.trim() ?? '';
    const addressLine = customer.addressLine?.trim() ?? '';
    const city = customer.city?.trim() ?? '';
    const state = customer.state?.trim() ?? '';
    const postalCode = customer.postalCode?.trim() ?? '';

    if (fullName.length < 2) {
      throw new OrderValidationError('Please enter a valid full name.');
    }
    if (!/^[6-9]\d{9}$/.test(phone) && !/^\+?\d{10,13}$/.test(phone)) {
      throw new OrderValidationError(
        'Please enter a valid 10-digit mobile number.'
      );
    }
    if (!addressLine || addressLine.length < 5) {
      throw new OrderValidationError('Please enter a complete street address.');
    }
    if (!city || !state) {
      throw new OrderValidationError('City and state are required.');
    }
    if (!/^\d{6}$/.test(postalCode)) {
      throw new OrderValidationError(
        'Please enter a valid 6-digit Indian PIN code.'
      );
    }
    if (!VALID_PAYMENT_METHODS.has(paymentMethod)) {
      throw new OrderValidationError('Please select a valid payment method.');
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw new OrderValidationError('Your cart is empty.');
    }

    const catalogById = new Map(inventory.map((p) => [p.id, p]));
    const aggregatedQuantities = new Map<string, number>();

    for (const entry of items) {
      if (!entry || typeof entry.productId !== 'string') {
        throw new OrderValidationError('Invalid cart item.');
      }
      const qty = Number(entry.quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > 25) {
        throw new OrderValidationError(
          'Item quantity must be an integer between 1 and 25.'
        );
      }
      if (!catalogById.has(entry.productId)) {
        throw new OrderValidationError(
          `Product ${entry.productId} is no longer available.`
        );
      }
      aggregatedQuantities.set(
        entry.productId,
        (aggregatedQuantities.get(entry.productId) ?? 0) + qty
      );
    }

    const verifiedItems: OrderItem[] = [];
    let subtotal = 0;

    for (const [productId, quantity] of aggregatedQuantities.entries()) {
      const product = catalogById.get(productId)!;
      const lineTotal = product.price * quantity;
      subtotal += lineTotal;
      verifiedItems.push({
        productId: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        imageUrl: product.imageUrl,
        unitPrice: product.price,
        quantity,
        lineTotal,
      });
    }

    const shippingFee =
      subtotal >= FREE_SHIPPING_THRESHOLD_INR ? 0 : STANDARD_SHIPPING_FEE_INR;
    const gstIncluded = Math.round(subtotal - subtotal / 1.18);
    const totalAmount = subtotal + shippingFee;

    const nowIso = new Date().toISOString();
    const orderNum = this.sequenceCounter++;
    const newOrder: Order = {
      id: `ord-${orderNum}-${Date.now()}`,
      orderNumber: `ORD-2026-${orderNum}`,
      createdAt: nowIso,
      updatedAt: nowIso,
      status: 'Confirmed',
      paymentMethod,
      customer: {
        fullName,
        phone,
        email: email || 'customer@korastore.in',
        addressLine,
        city,
        state,
        postalCode,
      },
      items: verifiedItems,
      subtotal,
      shippingFee,
      gstIncluded,
      totalAmount,
      estimatedDelivery: 'Estimated delivery in 3–5 business days',
    };

    this.orders.unshift(newOrder);
    return newOrder;
  }

  public cancelOrder(orderId: string): Order {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) {
      throw new OrderValidationError('Order not found.', 404);
    }
    if (order.status === 'Cancelled') {
      throw new OrderValidationError('Order is already cancelled.', 400);
    }
    if (order.status === 'Shipped' || order.status === 'Delivered') {
      throw new OrderValidationError(
        `Cannot cancel an order that is already ${order.status.toLowerCase()}.`,
        400
      );
    }

    order.status = 'Cancelled';
    order.updatedAt = new Date().toISOString();
    order.estimatedDelivery = 'Order Cancelled';
    return order;
  }
}

export const orderService = new OrderService();
