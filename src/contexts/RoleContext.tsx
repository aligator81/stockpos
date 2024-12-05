import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Role, Permission, DEFAULT_ROLES } from '../types/roles';
import { showToast } from '../utils/toast';
import { useAuth } from './AuthContext';

interface RoleContextType {
  roles: Role[];
  addRole: (role: Omit<Role, 'id'>) => void;
  updateRole: (id: string, role: Partial<Role>) => void;
  deleteRole: (id: string) => boolean;
  hasPermission: (roleId: string, permission: Permission) => boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [roles, setRoles] = useState<Role[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    // Initialize roles from localStorage or use defaults
    const storedRoles = localStorage.getItem('roles');
    if (storedRoles) {
      setRoles(JSON.parse(storedRoles));
    } else {
      setRoles(DEFAULT_ROLES);
      localStorage.setItem('roles', JSON.stringify(DEFAULT_ROLES));
    }
  }, []);

  const saveRoles = (newRoles: Role[]) => {
    localStorage.setItem('roles', JSON.stringify(newRoles));
    setRoles(newRoles);
  };

  const addRole = (role: Omit<Role, 'id'>) => {
    const newRole: Role = {
      ...role,
      id: Date.now().toString(),
    };
    saveRoles([...roles, newRole]);
    showToast.success('Role added successfully');
  };

  const updateRole = (id: string, roleUpdates: Partial<Role>) => {
    const role = roles.find(r => r.id === id);
    if (!role) {
      showToast.error('Role not found');
      return;
    }

    // Allow admin to modify system roles
    if (role.isSystem && currentUser?.type !== 'admin') {
      showToast.error('Only administrators can modify system roles');
      return;
    }

    const updatedRoles = roles.map(r =>
      r.id === id
        ? { ...r, ...roleUpdates, isSystem: r.isSystem }  // Preserve isSystem flag
        : r
    );
    saveRoles(updatedRoles);
    showToast.success('Role updated successfully');
  };

  const deleteRole = (id: string) => {
    const role = roles.find(r => r.id === id);
    if (!role) {
      showToast.error('Role not found');
      return false;
    }

    // Allow admin to delete system roles
    if (role.isSystem && currentUser?.type !== 'admin') {
      showToast.error('Only administrators can delete system roles');
      return false;
    }

    // Check if role is assigned to any employees
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    if (employees.some((emp: any) => emp.roleId === id)) {
      showToast.error('Cannot delete role that is assigned to employees');
      return false;
    }

    const updatedRoles = roles.filter(r => r.id !== id);
    saveRoles(updatedRoles);
    showToast.success('Role deleted successfully');
    return true;
  };

  const hasPermission = (roleId: string, permission: Permission) => {
    const role = roles.find(r => r.id === roleId);
    return role?.permissions.includes(permission) || false;
  };

  return (
    <RoleContext.Provider value={{ roles, addRole, updateRole, deleteRole, hasPermission }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRoles() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRoles must be used within a RoleProvider');
  }
  return context;
}