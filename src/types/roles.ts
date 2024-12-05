export type Permission = 
  | 'manage_inventory'
  | 'view_inventory'
  | 'manage_pos'
  | 'manage_employees'
  | 'view_employees'
  | 'manage_suppliers'
  | 'view_suppliers'
  | 'manage_categories'
  | 'view_categories'
  | 'manage_reports'
  | 'view_reports'
  | 'manage_roles'
  | 'manage_settings'
  | 'process_refunds'
  | 'view_dashboard';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem?: boolean;
}

export interface DefaultRole {
  name: string;
  permissions: Permission[];
}

export const DEFAULT_ROLES: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access',
    permissions: [
      'manage_inventory',
      'view_inventory',
      'manage_pos',
      'manage_employees',
      'view_employees',
      'manage_suppliers',
      'view_suppliers',
      'manage_categories',
      'view_categories',
      'manage_reports',
      'view_reports',
      'manage_roles',
      'manage_settings',
      'process_refunds',
      'view_dashboard'
    ],
    isSystem: true
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Store management access',
    permissions: [
      'manage_inventory',
      'view_inventory',
      'manage_pos',
      'view_employees',
      'manage_suppliers',
      'view_suppliers',
      'manage_categories',
      'view_categories',
      'manage_reports',
      'view_reports',
      'process_refunds',
      'view_dashboard'
    ],
    isSystem: true
  },
  {
    id: 'cashier',
    name: 'Cashier',
    description: 'POS and basic inventory access',
    permissions: [
      'view_inventory',
      'manage_pos',
      'view_dashboard'
    ],
    isSystem: true
  },
  {
    id: 'stock-clerk',
    name: 'Stock Clerk',
    description: 'Inventory management access',
    permissions: [
      'manage_inventory',
      'view_inventory',
      'view_suppliers',
      'view_categories',
      'view_dashboard'
    ],
    isSystem: true
  }
];