import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Edit3,
  Eye,
  LogOut,
  Package,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import type {
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  ProductInput,
} from '../types';
import {
  formatDateShort,
  formatRupiah,
  ORDER_STATUS_META,
  PAYMENT_STATUS_META,
} from '../utils/format';
import { ConfirmModal } from '../components/ConfirmModal';
import { OrderDetailModal } from '../components/admin/OrderDetailModal';
import { ProductFormModal } from '../components/admin/ProductFormModal';

type ActiveTab = 'orders' | 'products';

interface AdminDashboardPageProps {
  onCatalogMutated: () => void;
}

export function AdminDashboardPage({ onCatalogMutated }: AdminDashboardPageProps) {
  const { adminEmail, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<ActiveTab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Order filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ordersData, productsData] = await Promise.all([
        api.getOrders(),
        api.getProducts(),
      ]);
      setOrders(ordersData);
      setProducts(productsData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // KPIs
  const kpis = useMemo(() => {
    const totalOrders = orders.length;
    const needProcessing = orders.filter(
      (o) => o.order_status === 'new' || o.order_status === 'processing'
    ).length;
    const activeProducts = products.filter((p) => p.is_active).length;
    const estimatedRevenue = orders
      .filter((o) => o.payment_status === 'paid' || o.order_status === 'completed')
      .reduce((sum, o) => sum + o.total_amount, 0);

    return { totalOrders, needProcessing, activeProducts, estimatedRevenue };
  }, [orders, products]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus =
        orderStatusFilter === 'all' || order.order_status === orderStatusFilter;
      const matchesQuery =
        !q ||
        order.order_code.toLowerCase().includes(q) ||
        order.customer_name.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  const handleLogout = () => {
    logout();
    showToast('Anda telah keluar dari sesi Admin.', 'info');
    navigate('/admin/login', { replace: true });
  };

  // Order CRUD handlers
  const handleUpdateOrder = async (
    orderId: string,
    patch: { payment_status?: PaymentStatus; order_status?: OrderStatus }
  ) => {
    try {
      const { order: updated, stockRestored } = await api.updateOrderStatus(
        orderId,
        patch
      );
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (stockRestored) {
        const refreshedProducts = await api.getProducts();
        setProducts(refreshedProducts);
        onCatalogMutated();
        showToast(
          `Pesanan ${updated.order_code} dibatalkan dan stok produk telah dikembalikan.`
        );
      } else {
        showToast(`Status pesanan ${updated.order_code} berhasil diperbarui.`);
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Gagal memperbarui pesanan.',
        'error'
      );
    }
  };

  const handleConfirmDeleteOrder = async () => {
    if (!deletingOrder) return;
    setIsMutating(true);
    try {
      await api.deleteOrder(deletingOrder.id);
      setOrders((prev) => prev.filter((o) => o.id !== deletingOrder.id));
      showToast(`Pesanan ${deletingOrder.order_code} berhasil dihapus.`);
      setDeletingOrder(null);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Gagal menghapus pesanan.',
        'error'
      );
    } finally {
      setIsMutating(false);
    }
  };

  // Product CRUD handlers
  const handleSaveProduct = async (data: ProductInput, productId?: string) => {
    if (productId) {
      const updated = await api.updateProduct(productId, data);
      setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
      showToast(`Produk "${updated.name}" berhasil diperbarui.`);
    } else {
      const created = await api.createProduct(data);
      setProducts((prev) => [created, ...prev]);
      showToast(`Produk "${created.name}" berhasil ditambahkan.`);
    }
    onCatalogMutated();
  };

  const handleToggleProductActive = async (product: Product) => {
    try {
      const updated = await api.updateProduct(product.id, {
        is_active: !product.is_active,
      });
      setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
      onCatalogMutated();
      showToast(
        `${updated.name} kini ${updated.is_active ? 'aktif' : 'nonaktif'}.`
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Gagal mengubah status produk.',
        'error'
      );
    }
  };

  const handleConfirmDeleteProduct = async () => {
    if (!deletingProduct) return;
    setIsMutating(true);
    try {
      await api.deleteProduct(deletingProduct.id);
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
      onCatalogMutated();
      showToast(`Produk "${deletingProduct.name}" berhasil dihapus.`);
      setDeletingProduct(null);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Gagal menghapus produk.',
        'error'
      );
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1F2937]">Dashboard Admin</h1>
          <p className="mt-0.5 text-sm text-[#6B7280]">
            Masuk sebagai <span className="font-semibold text-[#0F3D3E]">{adminEmail}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#1F2937] transition-colors hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 sm:self-auto"
        >
          <LogOut className="h-4 w-4" />
          <span>Keluar</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <section className="mt-6 grid grid-cols-2 gap-3.5 lg:grid-cols-4 lg:gap-5">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280]">Total Pesanan</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0F3D3E]/10 text-[#0F3D3E]">
              <ShoppingBag className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2.5 text-2xl font-extrabold text-[#1F2937]">{kpis.totalOrders}</p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280]">Perlu Diproses</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#D97706]/15 text-[#D97706]">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2.5 text-2xl font-extrabold text-[#D97706]">
            {kpis.needProcessing}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280]">Total Produk Aktif</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0F3D3E]/10 text-[#0F3D3E]">
              <Package className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2.5 text-2xl font-extrabold text-[#1F2937]">
            {kpis.activeProducts}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280]">Estimasi Omzet</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Wallet className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2.5 text-lg font-extrabold text-[#0F3D3E] sm:text-2xl">
            {formatRupiah(kpis.estimatedRevenue)}
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="mt-8 flex items-center gap-2 border-b border-[#E5E7EB]">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
            activeTab === 'orders'
              ? 'border-[#0F3D3E] text-[#0F3D3E]'
              : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
          }`}
        >
          Manajemen Pesanan ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
            activeTab === 'products'
              ? 'border-[#0F3D3E] text-[#0F3D3E]'
              : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
          }`}
        >
          Manajemen Produk ({products.length})
        </button>
      </div>

      {/* TAB 1: ORDERS */}
      {activeTab === 'orders' && (
        <section className="mt-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Cari kode pesanan atau nama..."
                className="w-full rounded-xl border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#0F3D3E] focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/15"
              />
            </div>

            <select
              value={orderStatusFilter}
              onChange={(e) =>
                setOrderStatusFilter(e.target.value as 'all' | OrderStatus)
              }
              className="rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm font-medium text-[#1F2937] focus:border-[#0F3D3E] focus:outline-none"
            >
              <option value="all">Semua Status Pesanan</option>
              {(Object.keys(ORDER_STATUS_META) as OrderStatus[]).map((status) => (
                <option key={status} value={status}>
                  {ORDER_STATUS_META[status].label}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="h-48 animate-pulse rounded-2xl border border-[#E5E7EB] bg-white" />
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-10 text-center text-sm text-[#6B7280]">
              Tidak ada pesanan yang sesuai filter.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#E5E7EB] bg-[#FAF9F6] text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                    <tr>
                      <th className="px-4 py-3.5">Kode &amp; Tanggal</th>
                      <th className="px-4 py-3.5">Pelanggan</th>
                      <th className="px-4 py-3.5">Total</th>
                      <th className="px-4 py-3.5">Pembayaran</th>
                      <th className="px-4 py-3.5">Status Pesanan</th>
                      <th className="px-4 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-[#FAF9F6]/50">
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <p className="font-mono font-bold text-[#0F3D3E]">
                            {order.order_code}
                          </p>
                          <p className="text-xs text-[#6B7280]">
                            {formatDateShort(order.created_at)}
                          </p>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-[#1F2937]">
                            {order.customer_name}
                          </p>
                          <p className="text-xs text-[#6B7280]">{order.customer_phone}</p>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap font-bold text-[#1F2937]">
                          {formatRupiah(order.total_amount)}
                        </td>
                        <td className="px-4 py-3.5">
                          <select
                            value={order.payment_status}
                            onChange={(e) =>
                              void handleUpdateOrder(order.id, {
                                payment_status: e.target.value as PaymentStatus,
                              })
                            }
                            aria-label={`Status pembayaran ${order.order_code}`}
                            className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold focus:outline-none ${
                              PAYMENT_STATUS_META[order.payment_status].badgeClass
                            }`}
                          >
                            {(Object.keys(PAYMENT_STATUS_META) as PaymentStatus[]).map(
                              (ps) => (
                                <option key={ps} value={ps} className="bg-white text-[#1F2937]">
                                  {PAYMENT_STATUS_META[ps].label}
                                </option>
                              )
                            )}
                          </select>
                        </td>
                        <td className="px-4 py-3.5">
                          <select
                            value={order.order_status}
                            onChange={(e) =>
                              void handleUpdateOrder(order.id, {
                                order_status: e.target.value as OrderStatus,
                              })
                            }
                            aria-label={`Status pesanan ${order.order_code}`}
                            className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold focus:outline-none ${
                              ORDER_STATUS_META[order.order_status].badgeClass
                            }`}
                          >
                            {(Object.keys(ORDER_STATUS_META) as OrderStatus[]).map(
                              (os) => (
                                <option key={os} value={os} className="bg-white text-[#1F2937]">
                                  {ORDER_STATUS_META[os].label}
                                </option>
                              )
                            )}
                          </select>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="rounded-lg border border-[#E5E7EB] p-2 text-[#1F2937] transition-colors hover:bg-gray-50"
                              title="Lihat Detail"
                              aria-label="Lihat detail pesanan"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingOrder(order)}
                              className="rounded-lg border border-[#E5E7EB] p-2 text-rose-600 transition-colors hover:bg-rose-50 hover:border-rose-200"
                              title="Hapus Pesanan"
                              aria-label="Hapus pesanan"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      {/* TAB 2: PRODUCTS */}
      {activeTab === 'products' && (
        <section className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#6B7280]">
              Kelola ketersediaan stok, harga, dan tampilan produk di etalase.
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0F3D3E] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B2E2F]"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Produk</span>
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#E5E7EB] bg-[#FAF9F6] text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                  <tr>
                    <th className="px-4 py-3.5">Produk</th>
                    <th className="px-4 py-3.5">Kategori</th>
                    <th className="px-4 py-3.5">Harga</th>
                    <th className="px-4 py-3.5">Stok</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-[#FAF9F6]/50">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-12 w-12 shrink-0 rounded-xl object-cover bg-gray-100"
                          />
                          <div className="min-w-0 max-w-xs">
                            <p className="truncate font-semibold text-[#1F2937]">
                              {product.name}
                            </p>
                            <p className="truncate text-xs text-[#6B7280]">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="rounded-full bg-[#FAF9F6] border border-[#E5E7EB] px-2.5 py-1 text-xs font-medium text-[#1F2937]">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-bold text-[#0F3D3E]">
                        {formatRupiah(product.price)}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`font-semibold ${
                            product.stock === 0
                              ? 'text-rose-600'
                              : product.stock <= 5
                              ? 'text-[#D97706]'
                              : 'text-[#1F2937]'
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={product.is_active}
                          onClick={() => void handleToggleProductActive(product)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            product.is_active ? 'bg-[#0F3D3E]' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              product.is_active ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(product);
                              setIsProductModalOpen(true);
                            }}
                            className="rounded-lg border border-[#E5E7EB] p-2 text-[#1F2937] transition-colors hover:bg-gray-50"
                            title="Edit Produk"
                            aria-label={`Edit ${product.name}`}
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingProduct(product)}
                            className="rounded-lg border border-[#E5E7EB] p-2 text-rose-600 transition-colors hover:bg-rose-50 hover:border-rose-200"
                            title="Hapus Produk"
                            aria-label={`Hapus ${product.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Modals */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

      <ProductFormModal
        isOpen={isProductModalOpen}
        editingProduct={editingProduct}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
      />

      <ConfirmModal
        isOpen={Boolean(deletingOrder)}
        title="Hapus Pesanan?"
        description={`Pesanan ${deletingOrder?.order_code ?? ''} atas nama ${
          deletingOrder?.customer_name ?? ''
        } akan dihapus secara permanen.`}
        isLoading={isMutating}
        onConfirm={() => void handleConfirmDeleteOrder()}
        onCancel={() => setDeletingOrder(null)}
      />

      <ConfirmModal
        isOpen={Boolean(deletingProduct)}
        title="Hapus Produk?"
        description={`Produk "${deletingProduct?.name ?? ''}" akan dihapus secara permanen dari katalog.`}
        isLoading={isMutating}
        onConfirm={() => void handleConfirmDeleteProduct()}
        onCancel={() => setDeletingProduct(null)}
      />
    </main>
  );
}
