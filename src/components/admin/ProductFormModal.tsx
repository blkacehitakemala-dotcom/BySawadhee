import React, { useEffect, useState } from 'react';
import { ImageOff, X } from 'lucide-react';
import type { Product, ProductInput } from '../../types';

interface ProductFormModalProps {
  isOpen: boolean;
  editingProduct: Product | null;
  onClose: () => void;
  onSave: (data: ProductInput, productId?: string) => Promise<void>;
}

interface FormErrors {
  name?: string;
  category?: string;
  price?: string;
  stock?: string;
  image_url?: string;
}

const DEFAULT_FORM: ProductInput = {
  name: '',
  category: 'Busana',
  price: 0,
  stock: 10,
  description: '',
  image_url: '',
  is_active: true,
};

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function ProductFormModal({
  isOpen,
  editingProduct,
  onClose,
  onSave,
}: ProductFormModalProps) {
  const [form, setForm] = useState<ProductInput>(DEFAULT_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [imgLoadError, setImgLoadError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (editingProduct) {
      setForm({
        name: editingProduct.name,
        category: editingProduct.category,
        price: editingProduct.price,
        stock: editingProduct.stock,
        description: editingProduct.description,
        image_url: editingProduct.image_url,
        is_active: editingProduct.is_active,
      });
    } else {
      setForm(DEFAULT_FORM);
    }
    setErrors({});
    setImgLoadError(false);
  }, [isOpen, editingProduct]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    if (!form.name.trim()) {
      nextErrors.name = 'Nama produk wajib diisi.';
    }
    if (!form.category.trim()) {
      nextErrors.category = 'Kategori produk wajib diisi.';
    }
    if (!Number.isFinite(form.price) || form.price <= 0) {
      nextErrors.price = 'Harga harus lebih dari 0.';
    }
    if (!Number.isFinite(form.stock) || form.stock < 0) {
      nextErrors.stock = 'Stok tidak boleh kurang dari 0.';
    }
    if (!form.image_url.trim() || !isValidHttpUrl(form.image_url.trim())) {
      nextErrors.image_url = 'Masukkan URL gambar yang valid (http/https).';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    try {
      await onSave(form, editingProduct?.id);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const showPreview = isValidHttpUrl(form.image_url.trim()) && !imgLoadError;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        className="animate-fade-in max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E5E7EB] bg-white px-6 py-4">
          <h3 className="text-base font-bold text-[#1F2937]">
            {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#6B7280] hover:bg-gray-100 hover:text-[#1F2937]"
            aria-label="Tutup form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-[#1F2937]">
                Nama Produk <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Contoh: Kaftan Linen Sutra"
                className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm focus:border-[#0F3D3E] focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/15"
              />
              {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#1F2937]">
                Kategori <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="Busana / Aroma & Rumah / Aksesori"
                className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm focus:border-[#0F3D3E] focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/15"
              />
              {errors.category && (
                <p className="mt-1 text-xs text-rose-600">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#1F2937]">
                Status Tampil
              </label>
              <label className="flex h-[42px] cursor-pointer items-center justify-between rounded-xl border border-[#E5E7EB] px-3.5">
                <span className="text-sm text-[#1F2937]">
                  {form.is_active ? 'Aktif di Etalase' : 'Disembunyikan'}
                </span>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="h-4 w-4 accent-[#0F3D3E]"
                />
              </label>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#1F2937]">
                Harga (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={form.price || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: Number(e.target.value) }))
                }
                placeholder="250000"
                className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm focus:border-[#0F3D3E] focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/15"
              />
              {errors.price && <p className="mt-1 text-xs text-rose-600">{errors.price}</p>}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#1F2937]">
                Stok Tersedia <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) =>
                  setForm((f) => ({ ...f, stock: Number(e.target.value) }))
                }
                className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm focus:border-[#0F3D3E] focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/15"
              />
              {errors.stock && <p className="mt-1 text-xs text-rose-600">{errors.stock}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-[#1F2937]">
                URL Gambar Produk <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                value={form.image_url}
                onChange={(e) => {
                  setImgLoadError(false);
                  setForm((f) => ({ ...f, image_url: e.target.value }));
                }}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm focus:border-[#0F3D3E] focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/15"
              />
              {errors.image_url && (
                <p className="mt-1 text-xs text-rose-600">{errors.image_url}</p>
              )}

              {/* Live Image Preview */}
              <div className="mt-2.5 flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-[#FAF9F6] p-2.5">
                {showPreview ? (
                  <img
                    src={form.image_url.trim()}
                    alt="Pratinjau produk"
                    onError={() => setImgLoadError(true)}
                    className="h-16 w-16 rounded-lg object-cover bg-white"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-[#E5E7EB] bg-white text-[#6B7280]">
                    <ImageOff className="h-5 w-5" />
                  </div>
                )}
                <div className="text-xs text-[#6B7280]">
                  <p className="font-semibold text-[#1F2937]">Pratinjau Gambar</p>
                  <p>
                    {showPreview
                      ? 'Gambar berhasil dimuat dan siap ditampilkan.'
                      : 'Masukkan URL gambar valid untuk melihat pratinjau.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-[#1F2937]">
                Deskripsi Produk
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Ceritakan bahan, ukuran, atau keunggulan produk ini..."
                className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm focus:border-[#0F3D3E] focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/15"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#1F2937] hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-[#0F3D3E] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B2E2F] disabled:opacity-60"
            >
              {isSaving
                ? 'Menyimpan...'
                : editingProduct
                ? 'Simpan Perubahan'
                : 'Tambah Produk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
