import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Permission } from '../types';
import { Button } from './ui/button';
import {
  ShoppingCart,
  Package,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  LayoutDashboard,
  Tags,
  Truck,
  Shield
} from 'lucide-react';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  permission: Permission;
}

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems: NavItem[] = [
    {
      to: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: 'Dashboard',
      permission: 'view_dashboard'
    },
    {
      to: '/pos',
      icon: <ShoppingCart className="h-5 w-5" />,
      label: 'POS',
      permission: 'manage_pos'
    },
    {
      to: '/inventory',
      icon: <Package className="h-5 w-5" />,
      label: 'Inventory',
      permission: 'view_inventory'
    },
    {
      to: '/categories',
      icon: <Tags className="h-5 w-5" />,
      label: 'Categories',
      permission: 'view_inventory'
    },
    {
      to: '/suppliers',
      icon: <Truck className="h-5 w-5" />,
      label: 'Suppliers',
      permission: 'view_inventory'
    },
    {
      to: '/employees',
      icon: <Users className="h-5 w-5" />,
      label: 'Employees',
      permission: 'manage_employees'
    },
    {
      to: '/roles',
      icon: <Shield className="h-5 w-5" />,
      label: 'Roles',
      permission: 'manage_roles'
    },
    {
      to: '/reports',
      icon: <FileText className="h-5 w-5" />,
      label: 'Reports',
      permission: 'view_reports'
    },
    {
      to: '/settings',
      icon: <Settings className="h-5 w-5" />,
      label: 'Settings',
      permission: 'manage_settings'
    }
  ];

  const hasPermission = (permission: Permission) => {
    // If no user is logged in, return false
    if (!currentUser?.data) return false;

    // Admin always has full access
    if (currentUser.data.role === 1) {
      return true;
    }

    // For other roles, check specific permissions
    return currentUser.data.role?.permissions?.includes?.(permission) || false;
  };

  return (
    <nav className="h-full flex flex-col bg-white shadow-lg">
      {/* Logo Section */}
      <div className="p-4 border-b">
        <Link to="/" className="text-xl font-bold text-gray-900">
          StockPOS
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 overflow-y-auto">
        <div className="flex flex-col space-y-1">
          {navItems.map(item =>
            hasPermission(item.permission) && (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                <span className="inline-flex items-center justify-center w-5 h-5 mr-3">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            )
          )}
        </div>
      </div>

      {/* User Section */}
      <div className="p-4 border-t mt-auto">
        <div className="flex flex-col space-y-2">
          <div className="text-sm font-medium text-gray-700">
            {currentUser?.data.fullName || currentUser?.data.username}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;