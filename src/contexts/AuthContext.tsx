import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  currentUser: { type: 'employee'; data: Employee } | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<AuthContextType['currentUser']>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Ensure the user has the required structure
        if (!parsedUser.data?.role?.permissions) {
          // Set default admin permissions if they're missing
          parsedUser.data.role = {
            id: 'admin',
            name: 'admin',
            permissions: [
              'manage_inventory',
              'view_inventory',
              'manage_pos',
              'process_refunds',
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
              'view_dashboard'
            ]
          };
          localStorage.setItem('currentUser', JSON.stringify(parsedUser));
        }
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.text();
        toast.error(error || 'Login failed');
        return false;
      }

      const userData = await response.json();
      
      // Ensure proper role structure
      if (!userData.data.role?.permissions) {
        userData.data.role = {
          id: 'admin',
          name: 'admin',
          permissions: [
            'manage_inventory',
            'view_inventory',
            'manage_pos',
            'process_refunds',
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
            'view_dashboard'
          ]
        };
      }
      
      // Transform the database user data to match our Employee type
      const user = {
        type: 'employee' as const,
        data: {
          id: userData.data.id.toString(),
          username: userData.data.username,
          email: userData.data.email,
          fullName: userData.data.full_name,
          role: userData.data.role,
          isActive: userData.data.is_active
        }
      };

      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      toast.success('Login successful!');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to connect to server');
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};