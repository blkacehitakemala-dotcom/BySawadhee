import { useCallback, useEffect, useMemo, useState } from 'react';
import { Package, Search, ShoppingBag, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import type { Product } from '../types';
import { formatRupiah } from '../utils/format';
import { useCart } from '../context/CartContext';

interface StorefrontPageProps {
  refreshSignal: number;
}

export function StorefrontPage({ refreshSignal }: StorefrontPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const { addToCart, syncCartWithProducts } = useCart();

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getProducts({ activeOnly: true });
      setProducts(data);
      syncCartWithProducts(data);
    } finally {
      setIsLoading(false);
    }
  }, [syncCartWithProducts]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts, refreshSignal]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category))).sort();
    return ['Semua', ...unique];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'Semua' || product.category === selectedCategory;
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Compact Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#0F3D3E] px-6 py-8 text-white shadow-sm sm:px-10 sm:py-10">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-amber-200">
            <Sparkles className="h-3.5 w-3.5" />
            Koleksi Kurasi Butik
          </span>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Keindahan Hangat untuk Keseharian Anda
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-white/80 sm:text-base">
            Temukan busana linen pilihan, aroma ruang alami, dan aksesori buatan tangan yang dikurasi khusus oleh By Sawadhee.
          </p>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-12 h-56 w-56 rounded-full bg-[#D97706]/20 blur-3xl"
        />
      </section>

      {/* Search & Category Filter */}
      <section className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama produk..."
            className="w-full rounded-xl border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-4 text-sm text-[#1F2937] placeholder:text-[#6B7280] focus:border-[#0F3D3E] focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {categories.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all sm:text-sm ${
                  active
                    ? 'bg-[#0F3D3E] text-white shadow-sm'
                    : 'border border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#0F3D3E]/30 hover:text-[#1F2937]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </section>

      {/* Product Grid */}
      <section className="mt-6">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3.5 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="h-80 animate-pulse rounded-2xl border border-[#E5E7EB] bg-white"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF9F6] text-[#6B7280] border border-[#E5E7EB]">
              <Package className="h-6 w-6" />
            </div>
            <h2 className="mt-3 text-base font-bold text-[#1F2937]">
              Produk tidak ditemukan
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Coba ubah kata kunci pencarian atau pilih kategori lain.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => {
              const outOfStock = product.stock <= 0;
              return (
                <article
                  key={product.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white transition-all hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      loading="lazy"
                      className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                        outOfStock ? 'opacity-60 grayscale-[30%]' : ''
                      }`}
                    />
                    <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-semibold text-[#0F3D3E] shadow-xs backdrop-blur-xs">
                      {product.category}
                    </span>
                    <span
                      className={`absolute bottom-2.5 right-2.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold shadow-xs ${
                        outOfStock
                          ? 'bg-rose-600 text-white'
                          : product.stock <= 5
                          ? 'bg-[#D97706] text-white'
                          : 'bg-[#1F2937]/80 text-white'
                      }`}
                    >
                      {outOfStock ? 'Stok Habis' : `Stok: ${product.stock}`}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-3.5 sm:p-4">
                    <h2 className="line-clamp-2 text-sm font-bold leading-snug text-[#1F2937] sm:text-base">
                      {product.name}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-xs text-[#6B7280]">
                      {product.description}
                    </p>

                    <div className="mt-auto pt-3.5">
                      <p className="text-sm font-extrabold text-[#0F3D3E] sm:text-base">
                        {formatRupiah(product.price)}
                      </p>
                      <button
                        type="button"
                        disabled={outOfStock}
                        onClick={() => addToCart(product, 1)}
                        className={`mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all sm:text-sm ${
                          outOfStock
                            ? 'cursor-not-allowed bg-gray-100 text-[#6B7280]'
                            : 'bg-[#0F3D3E] text-white hover:bg-[#0B2E2F] active:scale-[0.98]'
                        }`}
                      >
                        <ShoppingBag className="h-4 w-4" />
                        <span>{outOfStock ? 'Stok Habis' : 'Tambah ke Keranjang'}</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
