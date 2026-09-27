export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  inStock: boolean;
  createdAt: string;
  sizes?: string[];
  sizePrices?: Record<string, number>;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  priceAtPurchase: number;
  quantity: number;
  selectedSize?: string;
}

export interface CustomerDetails {
  name: string;
  mobile: string;
  address: string;
  state: string;
  cityVillageTown: string;
  landmark: string;
  villageName: string;
  pincode: string;
  houseNoBuilding?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  customerDetails: CustomerDetails;
  status: 'Pending' | 'Accepted' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned';
  createdAt: string;
  username?: string;
  arrivalDate?: string;
  returnWindowDays?: number | null;
  deliveredAt?: string;
  updatedAt?: string;
}

export type UserRole = 'creator' | 'user' | null;

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Fashion & Clothes',
  'Footwear',
  'Home & Kitchen',
  'Beauty & Personal Care',
  'Groceries',
  'Toys & Kids',
  'Others'
];

export interface Notification {
  id: string;
  title: string;
  message: string;
  targetType: 'all' | 'user';
  targetUser?: string;
  createdAt: string;
}

