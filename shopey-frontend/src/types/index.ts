// Types shared across the entire application

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images?: string[];
  gallery?: Array<{ id?: number; url: string; is_thumbnail?: boolean; order?: number }>;
  thumbnail?: { id?: number; url: string; is_thumbnail?: boolean; order?: number } | null;
  category: string;
  rating?: number;
  reviewCount?: number;
  stock?: number;
  featured?: boolean;
  popularity?: number;
  tags?: string[];
  brand?: string | null;
  shop?: { name: string; id: string };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  final_amount: number;
  county: string;
  town: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
}

export type OrderStatus = "pending" | "processing" | "picked" | "in_transit" | "delivered";

export interface Delivery {
  id: string;
  order_id: string;
  status: string;
  location: string;
  rider?: { name: string; phone: string };
}

// Status label and color mapping
export const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:     { label: "Waiting",        color: "bg-yellow-100 text-yellow-800" },
  processing:  { label: "Preparing",      color: "bg-blue-100 text-blue-800" },
  picked:      { label: "Rider Picked",   color: "bg-purple-100 text-purple-800" },
  in_transit:  { label: "On the Way",     color: "bg-orange-100 text-orange-800" },
  delivered:   { label: "Completed",      color: "bg-green-100 text-green-800" },
};
