import React, { useState } from 'react';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import type { Order } from '../types';
import { formatRupiah, normalizePhone } from '../utils/format';

interface CartDrawerProps {
  onOrderCreated: (order: Order) => void;
}

interface FormErrors {
  customer_name?: string;
  customer_phone?: string;
  shipping_address?: string;
}

export function CartDrawer({ onOrderCreated }: CartDrawerProps) {
  const {
    items,
    totalItems,
    totalAmount,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const { showToast } = useToast();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isDrawerOpen) return null;

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    if (!customerName.trim()) {
      nextErrors.customer_name = 'Nama lengkap wajib diisi.';
    }
    const cleanPhone = normalizePhone(customerPhone);
    if (!cleanPhone) {
      nextErrors.customer_phone = 'Nomor WhatsApp wajib diisi.';
    } else if (cleanPhone.length < 10) {
      nextErrors.customer_phone = 'Nomor WhatsApp minimal 10 digit.';
    }
    if (!shippingAddress.trim() || shippingAddress.trim().length < 10) {
      nextErrors.shipping_address = 'Alamat lengkap wajib diisi (minimal 10 karakter).';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      showToast('Keranjang belanja Anda masih kosong.', 'error');
      return;
    }
    if (!validate()) {
      showToast('Mohon lengkapi data pengiriman dengan benar.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await api.createOrder({
        customer_name: customerName,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        notes,
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      });

      clearCart();
      setCustomerName('');
      setCustomerPhone('');
      setShippingAddress('');
      setNotes('');
      setErrors({});
      closeDrawer();
      showToast(`Pesanan ${order.order_code} berhasil dibuat!`);
      onOrderCreated(order);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Gagal membuat pesanan. Silakan coba lagi.';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-black/45 backdrop-blur-[2px]">
      <div className="fixed inset-0" onClick={closeDrawer} aria-hidden="true" />
      <aside
        aria-label="Keranjang Belanja dan Checkout"
        className="animate-slide-in-right relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F3D3E]/10 text-[#0F3D3E]">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1F2937]">Keranjang Belanja</h2>
              <p className="text-xs text-[#6B7280]">{totalItems} item dipilih</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="rounded-xl p-2 text-[#6B7280] transition-colors hover:bg-gray-100 hover:text-[#1F2937]"
            aria-label="Tutup keranjang"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FAF9F6] text-[#6B7280] border border-[#E5E7EB]">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <p className="mt-4 text-sm font-semibold text-[#1F2937]">
                Keranjang Anda masih kosong
              </p>
              <p className="mt-1 max-w-xs text-xs text-[#6B7280]">
                Jelajahi koleksi By Sawadhee dan tambahkan produk favorit Anda ke keranjang.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Items */}
              <ul className="space-y-3">
                {items.map(({ product, quantity }) => (
                  <li
                    key={product.id}
                    className="flex gap-3.5 rounded-2xl border border-[#E5E7EB] bg-[#FAF9F6]/60 p-3"
                  >
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-20 w-20 shrink-0 rounded-xl object-cover bg-gray-100"
                    />
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-[#1F2937]">
                            {product.name}
                          </h3>
                          <p className="mt-0.5 text-xs font-medium text-[#0F3D3E]">
                            {formatRupiah(product.price)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(product.id)}
                          className="rounded-lg p-1 text-[#6B7280] transition-colors hover:bg-rose-50 hover:text-rose-600"
                          aria-label={`Hapus ${product.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-xl border border-[#E5E7EB] bg-white">
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="p-1.5 text-[#1F2937] transition-colors hover:bg-gray-50 rounded-l-xl"
                            aria-label="Kurangi jumlah"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-8 text-center text-xs font-bold text-[#1F2937]">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            disabled={quantity >= product.stock}
                            className="p-1.5 text-[#1F2937] transition-colors hover:bg-gray-50 rounded-r-xl disabled:opacity-40"
                            aria-label="Tambah jumlah"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="text-xs font-bold text-[#1F2937]">
                          {formatRupiah(product.price * quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Checkout Form */}
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-3.5 pt-2 border-t border-[#E5E7EB]">
                <h3 className="text-sm font-bold text-[#1F2937]">Data Pengiriman</h3>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#1F2937]">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Nadia Kusuma"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#1F2937] placeholder:text-[#6B7280]/60 focus:border-[#0F3D3E] focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/15"
                  />
                  {errors.customer_name && (
                    <p className="mt-1 text-xs text-rose-600">{errors.customer_name}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#1F2937]">
                    Nomor WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#1F2937] placeholder:text-[#6B7280]/60 focus:border-[#0F3D3E] focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/15"
                  />
                  {errors.customer_phone && (
                    <p className="mt-1 text-xs text-rose-600">{errors.customer_phone}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#1F2937]">
                    Alamat Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Jalan, nomor rumah, kecamatan, kota, dan kode pos"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#1F2937] placeholder:text-[#6B7280]/60 focus:border-[#0F3D3E] focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/15"
                  />
                  {errors.shipping_address && (
                    <p className="mt-1 text-xs text-rose-600">{errors.shipping_address}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#1F2937]">
                    Catatan <span className="text-[#6B7280] font-normal">(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Bungkus kado atau kirim sore hari"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#1F2937] placeholder:text-[#6B7280]/60 focus:border-[#0F3D3E] focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/15"
                  />
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#E5E7EB] bg-[#FAF9F6] px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-[#6B7280]">Total Pembayaran</span>
              <span className="text-lg font-extrabold text-[#0F3D3E]">
                {formatRupiah(totalAmount)}
              </span>
            </div>
            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#0F3D3E] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0B2E2F] active:scale-[0.99] disabled:opacity-60"
            >
              {isSubmitting ? 'Memproses Pesanan...' : 'Buat Pesanan Sekarang'}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
