export type MirrorType = 'Wall Mirror' | 'Decorative' | 'LED Mirror' | 'Custom Cut';
export type MirrorShape = 'Round' | 'Square' | 'Rectangle' | 'Oval' | 'Custom';
export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface Product {
  id: string;
  name: string;
  image: string;
  type: MirrorType;
  shape: MirrorShape;
  dimensions: string;
  price: number;
  stock: number;
  status: StockStatus;
  isVisible: boolean;
}

export type OrderStatus = 'New' | 'In Production' | 'Ready' | 'Installed' | 'Cancelled' | 'Completed';

export interface CustomOrderDetails {
  width: number;
  height: number;
  shape: MirrorShape;
  frameType: string;
  frameColor: string;
  isInstallationRequired: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  totalSpent: number;
  orderCount: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string; // Denormalized for display ease
  type: 'Standard' | 'Custom Project';
  date: string;
  totalPrice: number;
  paidAmount: number;
  status: OrderStatus;
  paymentMethod: 'Cash' | 'Transfer' | 'Card';
  items?: Product[]; // For standard orders
  customDetails?: CustomOrderDetails; // For custom orders
}

export interface KPI {
  revenueToday: number;
  revenueMonth: number;
  totalOrders: number;
  activeCustomProjects: number;
  inStock: number;
  outOfStock: number;
}