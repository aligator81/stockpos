// Base interfaces
export interface Product {
  id: string;
  name: string;
  description: string;
  code: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  barcode: string;
  categoryId: string;
  supplierId: string;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  hireDate: Date;
  username: string;
  password: string;
  isActive: boolean;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  username: string;
  password: string;
  isActive: boolean;
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

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export type Permission = 
  | 'manage_pos'
  | 'manage_inventory'
  | 'manage_employees'
  | 'manage_reports'
  | 'manage_settings'
  | 'manage_roles'
  | 'view_dashboard';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  points: number;
}

export interface PaymentMethod {
  type: 'cash' | 'card' | 'mobile';
  amount: number;
  reference?: string;
  cardLast4?: string;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
  cost: number;
}

export interface Sale {
  id: string;
  employeeId: string;
  customerId?: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payments: PaymentMethod[];
  status: 'pending' | 'completed' | 'cancelled';
  receiptNumber: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleWithDetails extends Sale {
  employee: Employee;
  customer?: Customer;
  items: (SaleItem & { product: Product })[];
}

export interface StoreSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxRate: number;
  currency: string;
  logo?: string;
  receiptFooter?: string;
}

export interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}