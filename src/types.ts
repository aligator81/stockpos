export interface Product {
  id: string;
  name: string;
  code: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  categoryId: string;
  supplierId: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export type Permission = 
  | 'all'
  | 'manage_users'
  | 'manage_inventory'
  | 'manage_sales'
  | 'view_reports'
  | 'pos'
  | 'view_inventory';

export interface Employee {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  priceAtSale: number;
}

export type PaymentMethod = 'cash' | 'etransfer';

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  timestamp: number;
  paymentMethod: PaymentMethod;
}