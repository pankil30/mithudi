import type { JarArt } from '@/data/catalog';

export type { JarArt };

export interface Variant {
  id: string;
  label: string;
  grams: number;
  price: number;
  mrp: number;
  sku: string;
  inStock: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  ingredients: string[];
  benefits: string[];
  howToUse: string;
  images: string[];
  art: JarArt;
  categories: string[];
  variants: Variant[];
  isBestSeller: boolean;
  isNew: boolean;
  rating: number;
  reviewCount: number;
}

export interface Category {
  /** PHP category id */
  id?: string;
  slug: string;
  name: string;
  blurb: string;
  image?: string | null;
  _count?: { products: number };
}

export interface Review {
  id: string;
  name: string;
  city?: string | null;
  rating: number;
  title?: string | null;
  body: string;
  verified?: boolean;
  createdAt?: string;
  product?: { slug: string; name: string };
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'CUSTOMER' | 'ADMIN';
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  orderNumber: string;
  name: string;
  email: string;
  phone: string;
  shippingAddress: { line1: string; line2?: string; city: string; state: string; pincode: string };
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string | null;
  paymentMethod: 'RAZORPAY' | 'COD';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  status: OrderStatus;
  courier?: string | null;
  trackingNumber?: string | null;
  notes?: string | null;
  createdAt: string;
  items: { slug: string; name: string; variantLabel: string; sku: string; price: number; quantity: number; image: string | null; art: JarArt | null }[];
  events: { status: OrderStatus; note?: string | null; at: string }[];
  itemCount?: number;
}

export interface PaymentParams {
  mode: 'live' | 'mock' | 'disabled';
  keyId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  name: string;
  email: string;
  phone: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  weights?: number[];
  q?: string;
  sort?: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'new';
  bestSeller?: boolean;
}
