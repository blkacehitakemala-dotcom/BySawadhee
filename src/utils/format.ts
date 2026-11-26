import type { OrderStatus, PaymentStatus } from '../types';

export function formatRupiah(amount: number): string {
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rounded);
  return `Rp ${formatted}`;
}

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDateShort(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  new: {
    label: 'Pesanan Masuk',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
    dotClass: 'bg-sky-500',
  },
  processing: {
    label: 'Diproses',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  shipped: {
    label: 'Dikirim',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dotClass: 'bg-indigo-500',
  },
  completed: {
    label: 'Selesai',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  cancelled: {
    label: 'Dibatalkan',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    dotClass: 'bg-rose-500',
  },
};

export const PAYMENT_STATUS_META: Record<
  PaymentStatus,
  { label: string; badgeClass: string }
> = {
  pending: {
    label: 'Menunggu Pembayaran',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  paid: {
    label: 'Sudah Dibayar',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  refunded: {
    label: 'Dana Dikembalikan',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

export function buildWhatsAppOrderUrl(params: {
  orderCode: string;
  customerName: string;
  items: { product_name: string; quantity: number; subtotal: number }[];
  totalAmount: number;
  shippingAddress: string;
}): string {
  const itemLines = params.items
    .map((item) => `• ${item.product_name} (${item.quantity}x) — ${formatRupiah(item.subtotal)}`)
    .join('\n');

  const message = [
    `Halo Admin By Sawadhee, saya ingin konfirmasi pesanan:`,
    ``,
    `Kode Pesanan: *${params.orderCode}*`,
    `Nama: ${params.customerName}`,
    ``,
    `Rincian Produk:`,
    itemLines,
    ``,
    `Total Pembayaran: *${formatRupiah(params.totalAmount)}*`,
    `Alamat Pengiriman: ${params.shippingAddress}`,
    ``,
    `Mohon informasi langkah pembayaran selanjutnya. Terima kasih!`,
  ].join('\n');

  return `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
}
