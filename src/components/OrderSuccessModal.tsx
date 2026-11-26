import { useState } from 'react';
import { Check, Copy, ExternalLink, PackageCheck, X } from 'lucide-react';
import type { Order } from '../types';
import { buildWhatsAppOrderUrl, formatRupiah } from '../utils/format';
import { useToast } from '../context/ToastContext';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
}

export function OrderSuccessModal({ order, onClose }: OrderSuccessModalProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const waUrl = buildWhatsAppOrderUrl({
    orderCode: order.order_code,
    customerName: order.customer_name,
    items: order.items,
    totalAmount: order.total_amount,
    shippingAddress: order.shipping_address,
  });

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(order.order_code);
      setCopied(true);
      showToast('Kode pesanan berhasil disalin.');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Gagal menyalin kode. Silakan salin secara manual.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        className="animate-fade-in relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-[#6B7280] transition-colors hover:bg-gray-100 hover:text-[#1F2937]"
          aria-label="Tutup"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="bg-[#0F3D3E] px-6 py-6 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
              <PackageCheck className="h-6 w-6 text-amber-300" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/75">
                Pesanan Berhasil Dibuat
              </p>
              <h2 className="text-xl font-bold">Terima kasih, {order.customer_name}!</h2>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAF9F6] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-[#6B7280]">Kode Pesanan Anda</p>
                <p className="mt-0.5 font-mono text-lg font-bold tracking-tight text-[#0F3D3E]">
                  {order.order_code}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#1F2937] transition-colors hover:bg-gray-50"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Salin Kode Pesanan</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
              Ringkasan Pesanan
            </h3>
            <ul className="mt-2.5 max-h-40 divide-y divide-[#E5E7EB] overflow-y-auto rounded-xl border border-[#E5E7EB] px-3.5">
              {order.items.map((item) => (
                <li
                  key={item.product_id}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[#1F2937]">{item.product_name}</p>
                    <p className="text-xs text-[#6B7280]">
                      {item.quantity} x {formatRupiah(item.price)}
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold text-[#1F2937]">
                    {formatRupiah(item.subtotal)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex items-center justify-between px-1 text-base font-bold text-[#1F2937]">
              <span>Total Pembayaran</span>
              <span className="text-[#0F3D3E]">{formatRupiah(order.total_amount)}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0F3D3E] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0B2E2F]"
            >
              <span>Konfirmasi via WhatsApp</span>
              <ExternalLink className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-[#1F2937] transition-colors hover:bg-gray-50"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
