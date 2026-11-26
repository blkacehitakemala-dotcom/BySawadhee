import { MapPin, Phone, User, X } from 'lucide-react';
import type { Order } from '../../types';
import {
  formatDateTime,
  formatRupiah,
  ORDER_STATUS_META,
  PAYMENT_STATUS_META,
} from '../../utils/format';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        className="animate-fade-in max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-[#E5E7EB] bg-white px-6 py-4">
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Detail Pesanan</p>
            <h3 className="font-mono text-base font-extrabold text-[#0F3D3E]">
              {order.order_code}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#6B7280] hover:bg-gray-100 hover:text-[#1F2937]"
            aria-label="Tutup detail"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                ORDER_STATUS_META[order.order_status].badgeClass
              }`}
            >
              Status: {ORDER_STATUS_META[order.order_status].label}
            </span>
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                PAYMENT_STATUS_META[order.payment_status].badgeClass
              }`}
            >
              Pembayaran: {PAYMENT_STATUS_META[order.payment_status].label}
            </span>
          </div>

          <div className="space-y-2.5 rounded-2xl border border-[#E5E7EB] bg-[#FAF9F6] p-4 text-sm">
            <div className="flex items-center gap-2 text-[#1F2937]">
              <User className="h-4 w-4 text-[#0F3D3E]" />
              <span className="font-semibold">{order.customer_name}</span>
            </div>
            <div className="flex items-center gap-2 text-[#6B7280]">
              <Phone className="h-4 w-4 text-[#0F3D3E]" />
              <span>{order.customer_phone}</span>
            </div>
            <div className="flex items-start gap-2 text-[#6B7280]">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#0F3D3E]" />
              <span className="text-xs leading-relaxed">{order.shipping_address}</span>
            </div>
            {order.notes && (
              <p className="border-t border-[#E5E7EB] pt-2 text-xs italic text-[#6B7280]">
                Catatan: &ldquo;{order.notes}&rdquo;
              </p>
            )}
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
              Daftar Produk
            </h4>
            <ul className="mt-2 divide-y divide-[#E5E7EB] rounded-2xl border border-[#E5E7EB] px-4">
              {order.items.map((item) => (
                <li
                  key={item.product_id}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <div>
                    <p className="font-semibold text-[#1F2937]">{item.product_name}</p>
                    <p className="text-xs text-[#6B7280]">
                      {item.quantity} x {formatRupiah(item.price)}
                    </p>
                  </div>
                  <span className="font-bold text-[#1F2937]">
                    {formatRupiah(item.subtotal)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between px-1">
              <span className="text-sm font-semibold text-[#6B7280]">Total Pesanan</span>
              <span className="text-lg font-extrabold text-[#0F3D3E]">
                {formatRupiah(order.total_amount)}
              </span>
            </div>
          </div>

          <div className="border-t border-[#E5E7EB] pt-3 text-xs text-[#6B7280] flex flex-col gap-1 sm:flex-row sm:justify-between">
            <span>Dibuat: {formatDateTime(order.created_at)}</span>
            <span>Diperbarui: {formatDateTime(order.updated_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
