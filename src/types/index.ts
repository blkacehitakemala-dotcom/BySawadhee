export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export type OrderStatus = 'new' | 'processing' | 'shipped' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  items: OrderItem[];
  total_amount: number;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CreateOrderInput {
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  notes?: string;
  items: {
    product_id: string;
    quantity: number;
  }[];
}

export interface ProductInput {
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  image_url: string;
  is_active: boolean;
}
