import type {
  CreateOrderInput,
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  Product,
  ProductInput,
} from '../types';
import { normalizePhone } from '../utils/format';

const PRODUCTS_STORAGE_KEY = 'by_sawadhee_products_v1';
const ORDERS_STORAGE_KEY = 'by_sawadhee_orders_v1';
const SEEDED_STORAGE_KEY = 'by_sawadhee_seeded_v1';

const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'Kaftan Linen Sutra Sawadhee',
    category: 'Busana',
    price: 485000,
    stock: 14,
    description:
      'Kaftan potongan rileks berbahan linen-sutra bernapas dengan sentuhan bordir tangan minimalis di bagian kerah.',
    image_url:
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80',
    is_active: true,
    created_at: '2026-11-10T09:00:00.000Z',
  },
  {
    id: 'prod-002',
    name: 'Setelan Tunik Tenun Katun',
    category: 'Busana',
    price: 395000,
    stock: 9,
    description:
      'Setelan tunik dan celana kulot dari katun tenun lembut berwarna gading hangat, nyaman untuk acara santai maupun formal.',
    image_url:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
    is_active: true,
    created_at: '2026-11-12T10:30:00.000Z',
  },
  {
    id: 'prod-003',
    name: 'Lilin Aromaterapi Cendana & Teh Putih',
    category: 'Aroma & Rumah',
    price: 165000,
    stock: 22,
    description:
      'Lilin kedelai alami tuang tangan dalam wadah keramik matte dengan aroma cendana lembut dan teh putih yang menenangkan.',
    image_url:
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=80',
    is_active: true,
    created_at: '2026-11-14T11:15:00.000Z',
  },
  {
    id: 'prod-004',
    name: 'Diffuser Ruangan Amber Botanikal',
    category: 'Aroma & Rumah',
    price: 215000,
    stock: 11,
    description:
      'Reed diffuser minyak esensial murni dengan botol kaca amber dan 6 batang rotan alami, tahan hingga 8 minggu.',
    image_url:
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=80',
    is_active: true,
    created_at: '2026-11-15T14:20:00.000Z',
  },
  {
    id: 'prod-005',
    name: 'Tas Anyam Rotan & Kulit Nabati',
    category: 'Aksesori',
    price: 340000,
    stock: 6,
    description:
      'Tas jinjing anyaman pengrajin lokal dipadukan tali kulit samak nabati dan kantong dalam berbahan kanvas katun.',
    image_url:
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80',
    is_active: true,
    created_at: '2026-11-18T08:45:00.000Z',
  },
  {
    id: 'prod-006',
    name: 'Syal Voile Motif Tropis Terbatas',
    category: 'Aksesori',
    price: 145000,
    stock: 0,
    description:
      'Syal segiempat berbahan voile premium dengan ilustrasi flora Nusantara eksklusif dan tepi jahit lilit rapi.',
    image_url:
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=900&q=80',
    is_active: true,
    created_at: '2026-11-20T16:00:00.000Z',
  },
];

const SEED_ORDERS: Order[] = [
  {
    id: 'ord-001',
    order_code: 'SWD-20261124-101',
    customer_name: 'Nadia Kusuma',
    customer_phone: '081298765432',
    shipping_address: 'Jl. Kemang Raya No. 42, Jakarta Selatan, DKI Jakarta 12730',
    items: [
      {
        product_id: 'prod-001',
        product_name: 'Kaftan Linen Sutra Sawadhee',
        price: 485000,
        quantity: 1,
        subtotal: 485000,
      },
      {
        product_id: 'prod-003',
        product_name: 'Lilin Aromaterapi Cendana & Teh Putih',
        price: 165000,
        quantity: 2,
        subtotal: 330000,
      },
    ],
    total_amount: 815000,
    payment_status: 'paid',
    order_status: 'completed',
    notes: 'Mohon bungkus dengan pita kado.',
    created_at: '2026-11-24T09:15:00.000Z',
    updated_at: '2026-11-25T15:30:00.000Z',
  },
  {
    id: 'ord-002',
    order_code: 'SWD-20261125-204',
    customer_name: 'Raka Pratama',
    customer_phone: '085611223344',
    shipping_address: 'Jl. Dago Pakar Barat No. 18, Coblong, Kota Bandung 40191',
    items: [
      {
        product_id: 'prod-005',
        product_name: 'Tas Anyam Rotan & Kulit Nabati',
        price: 340000,
        quantity: 1,
        subtotal: 340000,
      },
    ],
    total_amount: 340000,
    payment_status: 'paid',
    order_status: 'processing',
    notes: 'Kirim sebelum akhir pekan ya.',
    created_at: '2026-11-25T13:40:00.000Z',
    updated_at: '2026-11-25T16:00:00.000Z',
  },
  {
    id: 'ord-003',
    order_code: 'SWD-20261126-309',
    customer_name: 'Siti Rahmawati',
    customer_phone: '081344556677',
    shipping_address: 'Perumahan Citra Indah Blok C5 No. 9, Surabaya 60213',
    items: [
      {
        product_id: 'prod-002',
        product_name: 'Setelan Tunik Tenun Katun',
        price: 395000,
        quantity: 1,
        subtotal: 395000,
      },
      {
        product_id: 'prod-004',
        product_name: 'Diffuser Ruangan Amber Botanikal',
        price: 215000,
        quantity: 1,
        subtotal: 215000,
      },
    ],
    total_amount: 610000,
    payment_status: 'pending',
    order_status: 'new',
    created_at: '2026-11-26T03:20:00.000Z',
    updated_at: '2026-11-26T03:20:00.000Z',
  },
];

function ensureSeeded(): void {
  const alreadySeeded = localStorage.getItem(SEEDED_STORAGE_KEY);
  if (!alreadySeeded) {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(SEED_PRODUCTS));
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(SEED_ORDERS));
    localStorage.setItem(SEEDED_STORAGE_KEY, 'true');
  }
}

function readProductsSync(): Product[] {
  ensureSeeded();
  const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Product[];
  } catch {
    return [];
  }
}

function writeProductsSync(products: Product[]): void {
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
}

function readOrdersSync(): Order[] {
  ensureSeeded();
  const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Order[];
  } catch {
    return [];
  }
}

function writeOrdersSync(orders: Order[]): void {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
}

function generateId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function generateOrderCode(existingOrders: Order[]): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePart = `${year}${month}${day}`;

  const existingCodes = new Set(existingOrders.map((o) => o.order_code));
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const suffix = String(Math.floor(100 + Math.random() * 900));
    const candidate = `SWD-${datePart}-${suffix}`;
    if (!existingCodes.has(candidate)) {
      return candidate;
    }
  }
  return `SWD-${datePart}-${Date.now().toString().slice(-3)}`;
}

// Simulates async API latency cleanly so swapping to Supabase later stays drop-in
async function delay(ms = 80): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const api = {
  // ---------------- PRODUCTS ----------------
  async getProducts(options?: { activeOnly?: boolean }): Promise<Product[]> {
    await delay();
    const products = readProductsSync();
    const filtered = options?.activeOnly
      ? products.filter((p) => p.is_active)
      : products;
    return filtered.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  async createProduct(input: ProductInput): Promise<Product> {
    await delay();
    const products = readProductsSync();
    const newProduct: Product = {
      id: generateId('prod'),
      name: input.name.trim(),
      category: input.category.trim(),
      price: Number(input.price),
      stock: Number(input.stock),
      description: input.description.trim(),
      image_url: input.image_url.trim(),
      is_active: input.is_active,
      created_at: new Date().toISOString(),
    };
    writeProductsSync([newProduct, ...products]);
    return newProduct;
  },

  async updateProduct(id: string, patch: Partial<ProductInput>): Promise<Product> {
    await delay();
    const products = readProductsSync();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error('Produk tidak ditemukan.');
    }
    const existing = products[index];
    const updated: Product = {
      ...existing,
      ...patch,
      name: patch.name !== undefined ? patch.name.trim() : existing.name,
      category: patch.category !== undefined ? patch.category.trim() : existing.category,
      description:
        patch.description !== undefined ? patch.description.trim() : existing.description,
      image_url: patch.image_url !== undefined ? patch.image_url.trim() : existing.image_url,
      price: patch.price !== undefined ? Number(patch.price) : existing.price,
      stock: patch.stock !== undefined ? Number(patch.stock) : existing.stock,
    };
    products[index] = updated;
    writeProductsSync(products);
    return updated;
  },

  async deleteProduct(id: string): Promise<void> {
    await delay();
    const products = readProductsSync();
    const next = products.filter((p) => p.id !== id);
    if (next.length === products.length) {
      throw new Error('Produk tidak ditemukan.');
    }
    writeProductsSync(next);
  },

  // ---------------- ORDERS ----------------
  async getOrders(): Promise<Order[]> {
    await delay();
    const orders = readOrdersSync();
    return orders.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  async findOrderByCodeOrPhone(query: string): Promise<Order | null> {
    await delay();
    const trimmed = query.trim();
    if (!trimmed) return null;

    const orders = readOrdersSync().sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const upperQuery = trimmed.toUpperCase();
    const byCode = orders.find((o) => o.order_code.toUpperCase() === upperQuery);
    if (byCode) return byCode;

    const cleanPhone = normalizePhone(trimmed);
    if (cleanPhone.length >= 6) {
      const byPhone = orders.find(
        (o) => normalizePhone(o.customer_phone) === cleanPhone
      );
      if (byPhone) return byPhone;
    }

    return null;
  },

  async createOrder(input: CreateOrderInput): Promise<Order> {
    await delay(120);
    if (!input.items.length) {
      throw new Error('Keranjang belanja masih kosong.');
    }

    const products = readProductsSync();
    const orders = readOrdersSync();

    // Validate stock availability for all items before mutating anything
    const orderItems: OrderItem[] = [];
    for (const reqItem of input.items) {
      const product = products.find((p) => p.id === reqItem.product_id);
      if (!product || !product.is_active) {
        throw new Error('Salah satu produk tidak lagi tersedia.');
      }
      if (reqItem.quantity <= 0) {
        throw new Error(`Jumlah untuk ${product.name} tidak valid.`);
      }
      if (product.stock < reqItem.quantity) {
        throw new Error(
          `Stok ${product.name} tidak mencukupi (tersisa ${product.stock}).`
        );
      }
      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity: reqItem.quantity,
        subtotal: product.price * reqItem.quantity,
      });
    }

    // Deduct ordered quantities from product stock
    const updatedProducts = products.map((product) => {
      const ordered = input.items.find((i) => i.product_id === product.id);
      if (!ordered) return product;
      return {
        ...product,
        stock: Math.max(0, product.stock - ordered.quantity),
      };
    });

    const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const nowIso = new Date().toISOString();

    const newOrder: Order = {
      id: generateId('ord'),
      order_code: generateOrderCode(orders),
      customer_name: input.customer_name.trim(),
      customer_phone: input.customer_phone.trim(),
      shipping_address: input.shipping_address.trim(),
      items: orderItems,
      total_amount: totalAmount,
      payment_status: 'pending',
      order_status: 'new',
      notes: input.notes?.trim() ? input.notes.trim() : undefined,
      created_at: nowIso,
      updated_at: nowIso,
    };

    writeProductsSync(updatedProducts);
    writeOrdersSync([newOrder, ...orders]);
    return newOrder;
  },

  async updateOrderStatus(
    id: string,
    patch: { payment_status?: PaymentStatus; order_status?: OrderStatus }
  ): Promise<{ order: Order; stockRestored: boolean }> {
    await delay();
    const orders = readOrdersSync();
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) {
      throw new Error('Pesanan tidak ditemukan.');
    }

    const existing = orders[index];
    let stockRestored = false;

    // Business rule: If order_status transitions to 'cancelled' from a non-cancelled state,
    // automatically restore the item quantities back to product stock.
    if (
      patch.order_status === 'cancelled' &&
      existing.order_status !== 'cancelled'
    ) {
      const products = readProductsSync();
      const restoredProducts = products.map((product) => {
        const orderItem = existing.items.find((i) => i.product_id === product.id);
        if (!orderItem) return product;
        return {
          ...product,
          stock: product.stock + orderItem.quantity,
        };
      });
      writeProductsSync(restoredProducts);
      stockRestored = true;
    }

    const updated: Order = {
      ...existing,
      payment_status: patch.payment_status ?? existing.payment_status,
      order_status: patch.order_status ?? existing.order_status,
      updated_at: new Date().toISOString(),
    };

    orders[index] = updated;
    writeOrdersSync(orders);
    return { order: updated, stockRestored };
  },

  async deleteOrder(id: string): Promise<void> {
    await delay();
    const orders = readOrdersSync();
    const next = orders.filter((o) => o.id !== id);
    if (next.length === orders.length) {
      throw new Error('Pesanan tidak ditemukan.');
    }
    writeOrdersSync(next);
  },
};
