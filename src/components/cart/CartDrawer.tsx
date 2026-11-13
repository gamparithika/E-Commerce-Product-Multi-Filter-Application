import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import type {
  Order,
  OrderCustomerDetails,
  PaymentMethod,
  Product,
} from '../../../shared/types';
import { submitOrder } from '../../services/apiClient';
import { formatINR } from '../../utils/formatters';
import { ProductImage } from '../products/ProductImage';

export interface CartEntry {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  items: CartEntry[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onOrderCreated: (order: Order) => void;
  onViewOrders: () => void;
}

type DrawerStep = 'bag' | 'checkout' | 'confirmation';

const INITIAL_CUSTOMER: OrderCustomerDetails = {
  fullName: 'Aarav Deshmukh',
  phone: '9820456712',
  email: 'aarav.deshmukh@example.in',
  addressLine: '402, Skylark Residency, Indiranagar 100ft Road',
  city: 'Bengaluru',
  state: 'Karnataka',
  postalCode: '560038',
};

export function CartDrawer({
  open,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderCreated,
  onViewOrders,
}: CartDrawerProps) {
  const [step, setStep] = useState<DrawerStep>('bag');
  const [customer, setCustomer] = useState<OrderCustomerDetails>(INITIAL_CUSTOMER);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!open) {
      setStep('bag');
      setSubmitError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const freeShippingThreshold = 1999;
  const shippingFee =
    items.length === 0 || subtotal >= freeShippingThreshold ? 0 : 149;
  const totalAmount = subtotal + shippingFee;
  const amountRemainingForFreeShipping = Math.max(
    0,
    freeShippingThreshold - subtotal
  );

  async function handlePlaceOrder(e: FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const { order } = await submitOrder({
        customer,
        paymentMethod,
        items: items.map((entry) => ({
          productId: entry.product.id,
          quantity: entry.quantity,
        })),
      });
      setPlacedOrder(order);
      onOrderCreated(order);
      onClearCart();
      setStep('confirmation');
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Unable to place order.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag and Checkout"
    >
      <div
        className="fixed inset-0 bg-[#171C2C]/40 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md bg-white h-full flex flex-col shadow-xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2.5">
            {step === 'checkout' && (
              <button
                type="button"
                onClick={() => setStep('bag')}
                aria-label="Back to shopping bag"
                className="p-1 rounded-lg text-[#6B7280] hover:text-[#171C2C] hover:bg-[#F6F7F9]"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-base font-semibold text-[#171C2C] font-display">
              {step === 'bag' && 'Shopping Bag'}
              {step === 'checkout' && 'Checkout Details'}
              {step === 'confirmation' && 'Order Confirmed'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close bag"
            className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#171C2C] hover:bg-[#F6F7F9]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Bag View */}
        {step === 'bag' && (
          <>
            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-14 h-14 rounded-2xl bg-[#F6F7F9] border border-[#E5E7EB] flex items-center justify-center mb-4">
                    <ShoppingBag className="w-6 h-6 text-[#6B7280]" />
                  </div>
                  <p className="text-base font-semibold text-[#171C2C] font-display">
                    Your bag is empty
                  </p>
                  <p className="text-sm text-[#6B7280] mt-1 max-w-xs">
                    Browse our collection and add items to proceed to checkout.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Shipping Threshold Notice */}
                  <div className="px-3.5 py-2.5 rounded-lg bg-[#F6F7F9] border border-[#E5E7EB] text-xs text-[#171C2C]">
                    {amountRemainingForFreeShipping === 0 ? (
                      <span className="font-medium text-[#15966B]">
                        You unlocked free express shipping across India.
                      </span>
                    ) : (
                      <span>
                        Add{' '}
                        <strong className="tabular-nums">
                          {formatINR(amountRemainingForFreeShipping)}
                        </strong>{' '}
                        more for free express shipping.
                      </span>
                    )}
                  </div>

                  <ul className="divide-y divide-[#E5E7EB]">
                    {items.map(({ product, quantity }) => (
                      <li key={product.id} className="py-4 flex gap-3.5">
                        <div className="w-20 h-16 rounded-lg overflow-hidden bg-[#F6F7F9] border border-[#E5E7EB] shrink-0">
                          <ProductImage
                            src={product.imageUrl}
                            alt={product.name}
                            category={product.category}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-[#171C2C] line-clamp-2">
                              {product.name}
                            </p>
                            <button
                              type="button"
                              onClick={() => onRemoveItem(product.id)}
                              aria-label={`Remove ${product.name}`}
                              className="p-1 text-[#6B7280] hover:text-[#DC2626] rounded transition-colors shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <p className="text-xs text-[#6B7280] mt-0.5">
                            {product.category}
                          </p>

                          <div className="mt-2.5 flex items-center justify-between">
                            <div className="inline-flex items-center border border-[#E5E7EB] rounded-lg h-8 bg-[#F6F7F9]">
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateQuantity(product.id, quantity - 1)
                                }
                                aria-label="Decrease quantity"
                                className="w-7 h-full flex items-center justify-center text-[#171C2C] hover:bg-white rounded-l-lg"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-7 text-center text-xs font-semibold tabular-nums">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateQuantity(product.id, quantity + 1)
                                }
                                aria-label="Increase quantity"
                                className="w-7 h-full flex items-center justify-center text-[#171C2C] hover:bg-white rounded-r-lg"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="text-sm font-bold text-[#171C2C] tabular-nums">
                              {formatINR(product.price * quantity)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-5 border-t border-[#E5E7EB] bg-[#F6F7F9] space-y-3">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-[#6B7280]">
                    <span>Subtotal (incl. GST)</span>
                    <span className="tabular-nums text-[#171C2C] font-medium">
                      {formatINR(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#6B7280]">
                    <span>Shipping</span>
                    <span className="tabular-nums font-medium text-[#15966B]">
                      {shippingFee === 0 ? 'Free' : formatINR(shippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#E5E7EB] text-base font-bold text-[#171C2C]">
                    <span>Total</span>
                    <span className="tabular-nums">{formatINR(totalAmount)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep('checkout')}
                  className="w-full h-11 rounded-lg bg-[#3457D5] hover:bg-[#2947B5] text-white text-sm font-semibold transition-colors"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </>
        )}

        {/* Step 2: Checkout Form */}
        {step === 'checkout' && (
          <form
            onSubmit={handlePlaceOrder}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {submitError && (
                <div
                  role="alert"
                  className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700"
                >
                  {submitError}
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[#171C2C] font-display">
                  Shipping Address
                </h3>

                <div>
                  <label className="block text-xs font-medium text-[#4B5563] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.fullName}
                    onChange={(e) =>
                      setCustomer({ ...customer, fullName: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-lg border border-[#E5E7EB] text-sm focus:border-[#3457D5] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#4B5563] mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={customer.phone}
                      onChange={(e) =>
                        setCustomer({ ...customer, phone: e.target.value })
                      }
                      className="w-full h-10 px-3 rounded-lg border border-[#E5E7EB] text-sm tabular-nums focus:border-[#3457D5] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#4B5563] mb-1">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={customer.postalCode}
                      onChange={(e) =>
                        setCustomer({ ...customer, postalCode: e.target.value })
                      }
                      className="w-full h-10 px-3 rounded-lg border border-[#E5E7EB] text-sm tabular-nums focus:border-[#3457D5] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4B5563] mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.addressLine}
                    onChange={(e) =>
                      setCustomer({ ...customer, addressLine: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-lg border border-[#E5E7EB] text-sm focus:border-[#3457D5] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#4B5563] mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={customer.city}
                      onChange={(e) =>
                        setCustomer({ ...customer, city: e.target.value })
                      }
                      className="w-full h-10 px-3 rounded-lg border border-[#E5E7EB] text-sm focus:border-[#3457D5] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#4B5563] mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      required
                      value={customer.state}
                      onChange={(e) =>
                        setCustomer({ ...customer, state: e.target.value })
                      }
                      className="w-full h-10 px-3 rounded-lg border border-[#E5E7EB] text-sm focus:border-[#3457D5] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-2.5">
                <h3 className="text-sm font-semibold text-[#171C2C] font-display flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#6B7280]" />
                  <span>Payment Method</span>
                </h3>
                {(
                  [
                    'UPI',
                    'Credit / Debit Card',
                    'Cash on Delivery',
                  ] as PaymentMethod[]
                ).map((method) => (
                  <label
                    key={method}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                      paymentMethod === method
                        ? 'border-[#3457D5] bg-[#3457D5]/5'
                        : 'border-[#E5E7EB] hover:bg-[#F6F7F9]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment-method"
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      className="accent-[#3457D5]"
                    />
                    <span className="text-sm font-medium text-[#171C2C]">
                      {method}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-5 border-t border-[#E5E7EB] bg-[#F6F7F9] space-y-3">
              <div className="flex justify-between text-sm font-bold text-[#171C2C]">
                <span>Payable Total</span>
                <span className="tabular-nums">{formatINR(totalAmount)}</span>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 rounded-lg bg-[#3457D5] hover:bg-[#2947B5] disabled:opacity-60 text-white text-sm font-semibold transition-colors"
              >
                {submitting ? 'Confirming Order...' : `Place Order · ${formatINR(totalAmount)}`}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Confirmation Receipt */}
        {step === 'confirmation' && placedOrder && (
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div className="space-y-5 pt-4">
              <div className="w-12 h-12 rounded-2xl bg-[#15966B]/10 text-[#15966B] flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <p className="text-xs font-mono font-semibold text-[#15966B] uppercase tracking-wider">
                  {placedOrder.orderNumber}
                </p>
                <h3 className="text-xl font-bold text-[#171C2C] font-display mt-1">
                  Order Confirmed
                </h3>
                <p className="text-sm text-[#6B7280] mt-1">
                  Thank you, {placedOrder.customer.fullName}. Your order has been verified and confirmed.
                </p>
              </div>

              <div className="bg-[#F6F7F9] border border-[#E5E7EB] rounded-xl p-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Payment</span>
                  <span className="font-medium text-[#171C2C]">
                    {placedOrder.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Items</span>
                  <span className="font-medium text-[#171C2C] tabular-nums">
                    {placedOrder.items.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#E5E7EB] font-bold text-[#171C2C]">
                  <span>Total Paid</span>
                  <span className="tabular-nums">
                    {formatINR(placedOrder.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewOrders();
                }}
                className="w-full h-11 rounded-lg bg-[#3457D5] hover:bg-[#2947B5] text-white text-sm font-semibold transition-colors"
              >
                Track in My Orders
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full h-10 rounded-lg border border-[#E5E7EB] text-sm font-medium text-[#171C2C] hover:bg-[#F6F7F9] transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
