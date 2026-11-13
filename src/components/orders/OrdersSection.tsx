import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  RefreshCw,
  Truck,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import type { Order, OrdersListResponse, OrderStatus } from '../../../shared/types';
import { formatINR, formatOrderDate } from '../../utils/formatters';
import { ProductImage } from '../products/ProductImage';

interface OrdersSectionProps {
  ordersData: OrdersListResponse | null;
  loading: boolean;
  error: string | null;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onCancelOrder: (orderId: string) => Promise<void>;
  onReorder: (order: Order) => void;
  onBackToShop: () => void;
}

const ORDER_TABS = ['All', 'Active', 'Delivered', 'Cancelled'] as const;
const TIMELINE_STEPS: OrderStatus[] = [
  'Confirmed',
  'Preparing',
  'Shipped',
  'Delivered',
];

function getStatusBadgeInfo(status: OrderStatus) {
  switch (status) {
    case 'Delivered':
      return {
        icon: CheckCircle2,
        textColor: 'text-[#15966B]',
        bgColor: 'bg-[#15966B]/10',
        label: 'Delivered',
      };
    case 'Shipped':
      return {
        icon: Truck,
        textColor: 'text-[#3457D5]',
        bgColor: 'bg-[#3457D5]/10',
        label: 'Shipped',
      };
    case 'Preparing':
    case 'Confirmed':
      return {
        icon: Clock,
        textColor: 'text-[#B45309]',
        bgColor: 'bg-[#F5A623]/15',
        label: status,
      };
    case 'Cancelled':
      return {
        icon: XCircle,
        textColor: 'text-[#DC2626]',
        bgColor: 'bg-red-50',
        label: 'Cancelled',
      };
  }
}

export function OrdersSection({
  ordersData,
  loading,
  error,
  statusFilter,
  onStatusFilterChange,
  onCancelOrder,
  onReorder,
  onBackToShop,
}: OrdersSectionProps) {
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleCancel(orderId: string) {
    setCancellingId(orderId);
    setActionError(null);
    try {
      await onCancelOrder(orderId);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Unable to cancel order.'
      );
    } finally {
      setCancellingId(null);
    }
  }

  const orders = ordersData?.orders ?? [];
  const summary = ordersData?.summary ?? {
    totalOrders: 0,
    activeOrders: 0,
    deliveredOrders: 0,
    totalSpent: 0,
  };

  return (
    <section aria-label="Customer Orders" className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onBackToShop}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#3457D5] hover:text-[#2947B5] mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Discover Products</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#171C2C] font-display tracking-tight">
            My Orders
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Track active shipments, review GST invoices, and reorder past purchases.
          </p>
        </div>

        {/* Status Filter Segmented Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white border border-[#E5E7EB] rounded-xl self-start sm:self-auto">
          {ORDER_TABS.map((tab) => {
            const active = statusFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => onStatusFilterChange(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#3457D5] text-white'
                    : 'text-[#6B7280] hover:text-[#171C2C]'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <p className="text-xs font-medium text-[#6B7280]">Total Orders</p>
          <p className="text-2xl font-bold text-[#171C2C] tabular-nums mt-1 font-display">
            {summary.totalOrders}
          </p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <p className="text-xs font-medium text-[#6B7280]">Active Shipments</p>
          <p className="text-2xl font-bold text-[#3457D5] tabular-nums mt-1 font-display">
            {summary.activeOrders}
          </p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <p className="text-xs font-medium text-[#6B7280]">Delivered</p>
          <p className="text-2xl font-bold text-[#15966B] tabular-nums mt-1 font-display">
            {summary.deliveredOrders}
          </p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <p className="text-xs font-medium text-[#6B7280]">Total Order Value</p>
          <p className="text-2xl font-bold text-[#171C2C] tabular-nums mt-1 font-display">
            {formatINR(summary.totalSpent)}
          </p>
        </div>
      </div>

      {actionError && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700"
        >
          {actionError}
        </div>
      )}

      {error && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 text-center text-sm text-red-600">
          {error}
        </div>
      )}

      {loading && orders.length === 0 ? (
        <div className="space-y-4">
          {[1, 2].map((idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E5E7EB] rounded-xl p-6 h-48 animate-pulse"
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-6 py-16 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-[#F6F7F9] border border-[#E5E7EB] flex items-center justify-center mb-4">
            <Package className="w-7 h-7 text-[#6B7280]" />
          </div>
          <h2 className="text-lg font-semibold text-[#171C2C] font-display">
            No orders in this view
          </h2>
          <p className="text-sm text-[#6B7280] mt-1 max-w-md">
            Place an order from your shopping bag or switch filter tabs to view other orders.
          </p>
          <button
            type="button"
            onClick={onBackToShop}
            className="mt-5 h-10 px-5 rounded-lg bg-[#3457D5] hover:bg-[#2947B5] text-white text-sm font-medium transition-colors"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const statusInfo = getStatusBadgeInfo(order.status);
            const StatusIcon = statusInfo.icon;
            const currentStepIndex = TIMELINE_STEPS.indexOf(order.status);
            const canCancel =
              order.status === 'Confirmed' || order.status === 'Preparing';

            return (
              <article
                key={order.id}
                className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden"
              >
                {/* Order Top Metadata Header */}
                <div className="px-5 py-4 bg-[#F6F7F9] border-b border-[#E5E7EB] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                    <div>
                      <span className="text-[#6B7280] block">Order ID</span>
                      <span className="font-mono font-semibold text-[#171C2C] text-sm">
                        {order.orderNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#6B7280] block">Placed On</span>
                      <span className="font-medium text-[#171C2C] text-sm">
                        {formatOrderDate(order.createdAt)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#6B7280] block">Payment</span>
                      <span className="font-medium text-[#171C2C] text-sm">
                        {order.paymentMethod}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#6B7280] block">Total</span>
                      <span className="font-bold text-[#171C2C] text-sm tabular-nums">
                        {formatINR(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${statusInfo.bgColor} ${statusInfo.textColor}`}
                  >
                    <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{statusInfo.label}</span>
                  </div>
                </div>

                {/* Progress Stepper for non-cancelled orders */}
                {order.status !== 'Cancelled' && (
                  <div className="px-5 py-4 border-b border-[#E5E7EB]">
                    <div className="flex items-center justify-between text-xs text-[#6B7280] mb-3">
                      <span className="font-medium text-[#171C2C]">
                        {order.estimatedDelivery}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>
                          {order.customer.city}, {order.customer.state} ·{' '}
                          {order.customer.postalCode}
                        </span>
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {TIMELINE_STEPS.map((stepName, index) => {
                        const completed = index <= currentStepIndex;
                        return (
                          <div key={stepName} className="space-y-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-colors ${
                                completed ? 'bg-[#15966B]' : 'bg-[#E5E7EB]'
                              }`}
                            />
                            <p
                              className={`text-[11px] font-medium ${
                                completed ? 'text-[#171C2C]' : 'text-[#9CA3AF]'
                              }`}
                            >
                              {stepName}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Order Line Items & Actions */}
                <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8 divide-y divide-[#F3F4F6]">
                    {order.items.map((item) => (
                      <div
                        key={item.productId}
                        className="py-3 first:pt-0 last:pb-0 flex items-center gap-4"
                      >
                        <div className="w-16 h-14 rounded-lg overflow-hidden bg-[#F6F7F9] border border-[#E5E7EB] shrink-0">
                          <ProductImage
                            src={item.imageUrl}
                            alt={item.name}
                            category={item.category}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#171C2C] truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-[#6B7280] mt-0.5 tabular-nums">
                            {item.category} · Qty {item.quantity} ×{' '}
                            {formatINR(item.unitPrice)}
                          </p>
                        </div>
                        <div className="text-sm font-semibold text-[#171C2C] tabular-nums shrink-0">
                          {formatINR(item.lineTotal)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Invoice & Action Column */}
                  <div className="lg:col-span-4 lg:border-l lg:border-[#E5E7EB] lg:pl-6 flex flex-col justify-between gap-4">
                    <div className="space-y-1.5 text-xs">
                      <p className="font-semibold text-[#171C2C] text-sm mb-2">
                        Delivering to {order.customer.fullName}
                      </p>
                      <p className="text-[#6B7280]">
                        {order.customer.addressLine}, {order.customer.city},{' '}
                        {order.customer.state} - {order.customer.postalCode}
                      </p>
                      <div className="pt-2 space-y-1 border-t border-[#F3F4F6] mt-2">
                        <div className="flex justify-between text-[#6B7280]">
                          <span>Subtotal</span>
                          <span className="tabular-nums">
                            {formatINR(order.subtotal)}
                          </span>
                        </div>
                        <div className="flex justify-between text-[#6B7280]">
                          <span>Shipping</span>
                          <span className="tabular-nums">
                            {order.shippingFee === 0
                              ? 'Free'
                              : formatINR(order.shippingFee)}
                          </span>
                        </div>
                        <div className="flex justify-between text-[#6B7280]">
                          <span>GST Included (18%)</span>
                          <span className="tabular-nums">
                            {formatINR(order.gstIncluded)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onReorder(order)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F6F7F9] text-xs font-semibold text-[#171C2C] transition-colors whitespace-nowrap"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Buy Again</span>
                      </button>

                      {canCancel && (
                        <button
                          type="button"
                          disabled={cancellingId === order.id}
                          onClick={() => handleCancel(order.id)}
                          className="inline-flex items-center justify-center h-9 px-3.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors whitespace-nowrap"
                        >
                          {cancellingId === order.id
                            ? 'Cancelling...'
                            : 'Cancel Order'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
