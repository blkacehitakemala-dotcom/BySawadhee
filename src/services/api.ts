import { supabase } from '../lib/supabase';
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

const PRODUCTS_TABLE = 'sawadhee_products';
const ORDERS_TABLE = 'sawadhee_orders';

const SEED_PRODUCTS_INPUT: (ProductInput & { created_at: string })[] = [
  {
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

let seedPromise: Promise<void> | null = null;

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    name: String(row.name),
    category: String(row.category),
    price: Number(row.price),
    stock: Number(row.stock),
    description: String(row.description ?? ''),
    image_url: String(row.image_url),
    is_active: Boolean(row.is_active),
    created_at: String(row.created_at),
  };
}

function mapOrder(row: Record<string, unknown>): Order {
  const rawItems = Array.isArray(row.items) ? (row.items as OrderItem[]) : [];
  return {
    id: String(row.id),
    order_code: String(row.order_code),
    customer_name: String(row.customer_name),
    customer_phone: String(row.customer_phone),
    shipping_address: String(row.shipping_address),
    items: rawItems.map((i) => ({
      product_id: String(i.product_id),
      product_name: String(i.product_name),
      price: Number(i.price),
      quantity: Number(i.quantity),
      subtotal: Number(i.subtotal),
    })),
    total_amount: Number(row.total_amount),
    payment_status: row.payment_status as PaymentStatus,
    order_status: row.order_status as OrderStatus,
    notes: row.notes ? String(row.notes) : undefined,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

async function ensureSeeded(): Promise<void> {
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    const { count: productCount, error: countErr } = await supabase
      .from(PRODUCTS_TABLE)
      .select('id', { count: 'exact', head: true });

    if (countErr) {
      throw new Error(countErr.message);
    }

    if ((productCount ?? 0) > 0) return;

    const { data: insertedProducts, error: insertProdErr } = await supabase
      .from(PRODUCTS_TABLE)
      .insert(SEED_PRODUCTS_INPUT)
      .select('*');

    if (insertProdErr || !insertedProducts) {
      throw new Error(insertProdErr?.message ?? 'Gagal mengisi data awal produk.');
    }

    const mapped = insertedProducts.map(mapProduct);
    const byName = new Map(mapped.map((p) => [p.name, p]));

    const p1 = byName.get('Kaftan Linen Sutra Sawadhee');
    const p2 = byName.get('Setelan Tunik Tenun Katun');
    const p3 = byName.get('Lilin Aromaterapi Cendana & Teh Putih');
    const p4 = byName.get('Diffuser Ruangan Amber Botanikal');
    const p5 = byName.get('Tas Anyam Rotan & Kulit Nabati');

    if (p1 && p2 && p3 && p4 && p5) {
      const { count: orderCount } = await supabase
        .from(ORDERS_TABLE)
        .select('id', { count: 'exact', head: true });

      if ((orderCount ?? 0) === 0) {
        const seedOrders = [
          {
            order_code: 'SWD-20261124-101',
            customer_name: 'Nadia Kusuma',
            customer_phone: '081298765432',
            shipping_address:
              'Jl. Kemang Raya No. 42, Jakarta Selatan, DKI Jakarta 12730',
            items: [
              {
                product_id: p1.id,
                product_name: p1.name,
                price: p1.price,
                quantity: 1,
                subtotal: p1.price,
              },
              {
                product_id: p3.id,
                product_name: p3.name,
                price: p3.price,
                quantity: 2,
                subtotal: p3.price * 2,
              },
            ],
            total_amount: p1.price + p3.price * 2,
            payment_status: 'paid',
            order_status: 'completed',
            notes: 'Mohon bungkus dengan pita kado.',
            created_at: '2026-11-24T09:15:00.000Z',
            updated_at: '2026-11-25T15:30:00.000Z',
          },
          {
            order_code: 'SWD-20261125-204',
            customer_name: 'Raka Pratama',
            customer_phone: '085611223344',
            shipping_address:
              'Jl. Dago Pakar Barat No. 18, Coblong, Kota Bandung 40191',
            items: [
              {
                product_id: p5.id,
                product_name: p5.name,
                price: p5.price,
                quantity: 1,
                subtotal: p5.price,
              },
            ],
            total_amount: p5.price,
            payment_status: 'paid',
            order_status: 'processing',
            notes: 'Kirim sebelum akhir pekan ya.',
            created_at: '2026-11-25T13:40:00.000Z',
            updated_at: '2026-11-25T16:00:00.000Z',
          },
          {
            order_code: 'SWD-20261126-309',
            customer_name: 'Siti Rahmawati',
            customer_phone: '081344556677',
            shipping_address:
              'Perumahan Citra Indah Blok C5 No. 9, Surabaya 60213',
            items: [
              {
                product_id: p2.id,
                product_name: p2.name,
                price: p2.price,
                quantity: 1,
                subtotal: p2.price,
              },
              {
                product_id: p4.id,
                product_name: p4.name,
                price: p4.price,
                quantity: 1,
                subtotal: p4.price,
              },
            ],
            total_amount: p2.price + p4.price,
            payment_status: 'pending',
            order_status: 'new',
            created_at: '2026-11-26T03:20:00.000Z',
            updated_at: '2026-11-26T03:20:00.000Z',
          },
        ];
        await supabase.from(ORDERS_TABLE).insert(seedOrders);
      }
    }
  })().finally(() => {
    seedPromise = null;
  });

  return seedPromise;
}

async function generateUniqueOrderCode(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePart = `${year}${month}${day}`;

  const { data } = await supabase
    .from(ORDERS_TABLE)
    .select('order_code')
    .like('order_code', `SWD-${datePart}-%`);

  const existingCodes = new Set(
    (data ?? []).map((r) => String((r as { order_code: string }).order_code))
  );

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const suffix = String(Math.floor(100 + Math.random() * 900));
    const candidate = `SWD-${datePart}-${suffix}`;
    if (!existingCodes.has(candidate)) {
      return candidate;
    }
  }
  return `SWD-${datePart}-${Date.now().toString().slice(-3)}`;
}

export const api = {
  // ---------------- PRODUCTS ----------------
  async getProducts(options?: { activeOnly?: boolean }): Promise<Product[]> {
    await ensureSeeded();

    let query = supabase
      .from(PRODUCTS_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (options?.activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []).map(mapProduct);
  },

  async createProduct(input: ProductInput): Promise<Product> {
    const { data, error } = await supabase
      .from(PRODUCTS_TABLE)
      .insert({
        name: input.name.trim(),
        category: input.category.trim(),
        price: Number(input.price),
        stock: Number(input.stock),
        description: input.description.trim(),
        image_url: input.image_url.trim(),
        is_active: input.is_active,
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Gagal menambahkan produk.');
    }
    return mapProduct(data);
  },

  async updateProduct(id: string, patch: Partial<ProductInput>): Promise<Product> {
    const payload: Record<string, unknown> = {};
    if (patch.name !== undefined) payload.name = patch.name.trim();
    if (patch.category !== undefined) payload.category = patch.category.trim();
    if (patch.description !== undefined) payload.description = patch.description.trim();
    if (patch.image_url !== undefined) payload.image_url = patch.image_url.trim();
    if (patch.price !== undefined) payload.price = Number(patch.price);
    if (patch.stock !== undefined) payload.stock = Number(patch.stock);
    if (patch.is_active !== undefined) payload.is_active = patch.is_active;

    const { data, error } = await supabase
      .from(PRODUCTS_TABLE)
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Produk tidak ditemukan.');
    }
    return mapProduct(data);
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase.from(PRODUCTS_TABLE).delete().eq('id', id);
    if (error) {
      throw new Error(error.message);
    }
  },

  // ---------------- ORDERS ----------------
  async getOrders(): Promise<Order[]> {
    await ensureSeeded();
    const { data, error } = await supabase
      .from(ORDERS_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []).map(mapOrder);
  },

  async findOrderByCodeOrPhone(query: string): Promise<Order | null> {
    await ensureSeeded();
    const trimmed = query.trim();
    if (!trimmed) return null;

    const { data: allOrders, error } = await supabase
      .from(ORDERS_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const orders = (allOrders ?? []).map(mapOrder);
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
    if (!input.items.length) {
      throw new Error('Keranjang belanja masih kosong.');
    }

    const productIds = input.items.map((i) => i.product_id);
    const { data: prodRows, error: prodErr } = await supabase
      .from(PRODUCTS_TABLE)
      .select('*')
      .in('id', productIds);

    if (prodErr) {
      throw new Error(prodErr.message);
    }

    const products = (prodRows ?? []).map(mapProduct);
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

    // Deduct ordered quantities from product stock in Supabase
    for (const reqItem of input.items) {
      const product = products.find((p) => p.id === reqItem.product_id)!;
      const nextStock = Math.max(0, product.stock - reqItem.quantity);
      const { error: stockErr } = await supabase
        .from(PRODUCTS_TABLE)
        .update({ stock: nextStock })
        .eq('id', product.id);
      if (stockErr) {
        throw new Error(`Gagal memperbarui stok ${product.name}.`);
      }
    }

    const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const orderCode = await generateUniqueOrderCode();
    const nowIso = new Date().toISOString();

    const { data: created, error: orderErr } = await supabase
      .from(ORDERS_TABLE)
      .insert({
        order_code: orderCode,
        customer_name: input.customer_name.trim(),
        customer_phone: input.customer_phone.trim(),
        shipping_address: input.shipping_address.trim(),
        items: orderItems,
        total_amount: totalAmount,
        payment_status: 'pending',
        order_status: 'new',
        notes: input.notes?.trim() ? input.notes.trim() : null,
        created_at: nowIso,
        updated_at: nowIso,
      })
      .select('*')
      .single();

    if (orderErr || !created) {
      throw new Error(orderErr?.message ?? 'Gagal menyimpan pesanan.');
    }

    return mapOrder(created);
  },

  async updateOrderStatus(
    id: string,
    patch: { payment_status?: PaymentStatus; order_status?: OrderStatus }
  ): Promise<{ order: Order; stockRestored: boolean }> {
    const { data: existingRow, error: fetchErr } = await supabase
      .from(ORDERS_TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !existingRow) {
      throw new Error('Pesanan tidak ditemukan.');
    }

    const existing = mapOrder(existingRow);
    let stockRestored = false;

    // Business rule: If order_status transitions to 'cancelled' from a non-cancelled state,
    // automatically restore the item quantities back to product stock.
    if (
      patch.order_status === 'cancelled' &&
      existing.order_status !== 'cancelled'
    ) {
      const itemProductIds = existing.items.map((i) => i.product_id);
      const { data: prodRows } = await supabase
        .from(PRODUCTS_TABLE)
        .select('id, stock')
        .in('id', itemProductIds);

      const stockMap = new Map(
        (prodRows ?? []).map((r) => [
          String((r as { id: string }).id),
          Number((r as { stock: number }).stock),
        ])
      );

      for (const orderItem of existing.items) {
        const currentStock = stockMap.get(orderItem.product_id);
        if (currentStock !== undefined) {
          await supabase
            .from(PRODUCTS_TABLE)
            .update({ stock: currentStock + orderItem.quantity })
            .eq('id', orderItem.product_id);
        }
      }
      stockRestored = true;
    }

    const { data: updatedRow, error: updateErr } = await supabase
      .from(ORDERS_TABLE)
      .update({
        payment_status: patch.payment_status ?? existing.payment_status,
        order_status: patch.order_status ?? existing.order_status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (updateErr || !updatedRow) {
      throw new Error(updateErr?.message ?? 'Gagal memperbarui status pesanan.');
    }

    return { order: mapOrder(updatedRow), stockRestored };
  },

  async deleteOrder(id: string): Promise<void> {
    const { error } = await supabase.from(ORDERS_TABLE).delete().eq('id', id);
    if (error) {
      throw new Error(error.message);
    }
  },
};
