import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  PackageCheck,
  Search,
  Truck,
  XCircle,
} from 'lucide-react';
import { api } from '../services/api';
import type { Order, OrderStatus } from '../types';
import {
  formatDateTime,
  formatRupiah,
  ORDER_STATUS_META,
  PAYMENT_STATUS_META,
} from '../utils/format';

const TRACKING_STEPS: { status: OrderStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { status: 'new', label: 'Pesanan Masuk', icon: Clock },
  { status: 'processing', label: 'Diproses', icon: Package },
  { status: 'shipped', label: 'Dikirim', icon: Truck },
  { status: 'completed', label: 'Selesai', icon: PackageCheck },
];

export function TrackOrderPage() {
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const found = await api.findOrderByCodeOrPhone(query);
      setOrder(found);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  const currentStepIndex = order
    ? TRACKING_STEPS.findIndex((s) => s.status === order.order_status)
    : -1;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Search Card */}
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs sm:p-8">
        <div className="text-center">
          <span className="inline-flex rounded-full bg-[#0F3D3E]/10 px-3 py-1 text-xs font-semibold text-[#0F3D3E]">
            Lacak Status Pesanan
          </span>
          <h1 className="mt-2.5 text-2xl font-extrabold text-[#1F2937]">
            Lacak Pesanan By Sawadhee
          </h1>
          <p className="mt-1.5 text-sm text-[#6B7280]">
            Masukkan kode pesanan (contoh: <span className="font-mono font-semibold text-[#1F2937]">SWD-20261125-204</span>) atau nomor WhatsApp yang Anda gunakan saat memesan.
          </p>
        </div>

        <form onSubmit={handleSearch} className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Kode pesanan atau nomor WhatsApp..."
              className="w-full rounded-xl border border-[#E5E7EB] bg-[#FAF9F6] py-3 pl-10 pr-4 text-sm text-[#1F2937] placeholder:text-[#6B7280] focus:border-[#0F3D3E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/15"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="rounded-xl bg-[#0F3D3E] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0B2E2F] disabled:opacity-50"
          >
            {isSearching ? 'Mencari...' : 'Lacak Pesanan'}
          </button>
        </form>
      </section>

      {/* Result */}
      {hasSearched && !order && (
        <section className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <XCircle className="h-6 w-6" />
          </div>
          <h2 className="mt-3 text-base font-bold text-[#1F2937]">
            Pesanan tidak ditemukan
          </h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Pastikan kode pesanan atau nomor WhatsApp yang Anda masukkan sudah benar.
          </p>
        </section>
      )}

      {order && (
        <section className="animate-fade-in mt-6 space-y-5 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E5E7EB] pb-5">
            <div>
              <p className="text-xs font-medium text-[#6B7280]">Kode Pesanan</p>
              <h2 className="mt-0.5 font-mono text-xl font-extrabold text-[#0F3D3E]">
                {order.order_code}
              </h2>
              <p className="mt-1 text-xs text-[#6B7280]">
                Dibuat pada {formatDateTime(order.created_at)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                  PAYMENT_STATUS_META[order.payment_status].badgeClass
                }`}
              >
                Pembayaran: {PAYMENT_STATUS_META[order.payment_status].label}
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                  ORDER_STATUS_META[order.order_status].badgeClass
                }`}
              >
                {ORDER_STATUS_META[order.order_status].label}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          {order.order_status === 'cancelled' ? (
            <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
              <XCircle className="h-5 w-5 shrink-0" />
              <div className="text-sm">
                <p className="font-bold">Pesanan Dibatalkan</p>
                <p className="text-xs text-rose-700">
                  Pesanan ini telah dibatalkan dan stok produk telah dikembalikan.
                </p>
              </div>
            </div>
          ) : (
            <div className="py-2">
              <div className="grid grid-cols-4 gap-2">
                {TRACKING_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  return (
                    <div key={step.status} className="relative flex flex-col items-center text-center">
                      {idx < TRACKING_STEPS.length - 1 && (
                        <div
                          className={`absolute left-1/2 top-5 h-0.5 w-full ${
                            idx < currentStepIndex ? 'bg-[#0F3D3E]' : 'bg-[#E5E7EB]'
                          }`}
                        />
                      )}
                      <div
                        className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                          isCompleted
                            ? 'border-[#0F3D3E] bg-[#0F3D3E] text-white'
                            : 'border-[#E5E7EB] bg-white text-[#6B7280]'
                        } ${isCurrent ? 'ring-4 ring-[#0F3D3E]/15' : ''}`}
                      >
                        {isCompleted && idx < currentStepIndex ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <span
                        className={`mt-2 text-[11px] font-semibold sm:text-xs ${
                          isCompleted ? 'text-[#0F3D3E]' : 'text-[#6B7280]'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Customer & Shipping Info */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAF9F6] p-4">
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#0F3D3E]" />
              <div className="text-sm">
                <p className="font-bold text-[#1F2937]">
                  {order.customer_name} • {order.customer_phone}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-[#6B7280]">
                  {order.shipping_address}
                </p>
                {order.notes && (
                  <p className="mt-1.5 text-xs italic text-[#6B7280]">
                    Catatan: &ldquo;{order.notes}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Itemized List */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
              Rincian Barang
            </h3>
            <ul className="mt-2.5 divide-y divide-[#E5E7EB] rounded-2xl border border-[#E5E7EB] px-4">
              {order.items.map((item) => (
                <li
                  key={item.product_id}
                  className="flex items-center justify-between gap-4 py-3 text-sm"
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
            <div className="mt-4 flex items-center justify-between px-1">
              <span className="text-sm font-semibold text-[#6B7280]">Total Pembayaran</span>
              <span className="text-xl font-extrabold text-[#0F3D3E]">
                {formatRupiah(order.total_amount)}
              </span>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
