import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { useRoles } from '../contexts/RoleContext';
import { Permission, Role } from '../types/roles';
import { showToast } from '../utils/toast';
import { useAuth } from '../contexts/AuthContext';

const PERMISSION_GROUPS = {
  'Inventory': [
    'manage_inventory',
    'view_inventory'
  ],
  'POS': [
    'manage_pos',
    'process_refunds'
  ],
  'Employees': [
    'manage_employees',
    'view_employees'
  ],
  'Suppliers': [
    'manage_suppliers',
    'view_suppliers'
  ],
  'Categories': [
    'manage_categories',
    'view_categories'
  ],
  'Reports': [
    'manage_reports',
    'view_reports'
  ],
  'System': [
    'manage_roles',
    'manage_settings',
    'view_dashboard'
  ]
} as const;

export default function Roles() {
  const { roles, addRole, updateRole, deleteRole } = useRoles();
  const { currentUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as Permission[]
  });

  const isAdmin = currentUser?.type === 'admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast.error('Role name is required');
      return;
    }

    if (formData.permissions.length === 0) {
      showToast.error('Select at least one permission');
      return;
    }

    if (editingRole) {
      updateRole(editingRole.id, formData);
    } else {
      addRole(formData);
    }

    setShowForm(false);
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: []
    });
  };

  const handleEdit = (role: Role) => {
    if (role.isSystem && !isAdmin) {
      showToast.error('Only administrators can modify system roles');
      return;
    }

    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions]
    });
    setShowForm(true);
  };

  const handleDelete = async (roleId: string) => {
    const role = roles.find(role => role.id === roleId);
    if (role?.isSystem && !isAdmin) {
      showToast.error('Only administrators can delete system roles');
      return;
    }

    if (window.confirm('Are you sure you want to delete this role?')) {
      deleteRole(roleId);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Role Management</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingRole(null);
            setFormData({
              name: '',
              description: '',
              permissions: []
            });
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Role
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingRole ? 'Edit Role' : 'Add Role'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter role name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter role description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="space-y-4">
                  {Object.entries(PERMISSION_GROUPS).map(([group, permissions]) => (
                    <div key={group} className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">{group}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {permissions.map(permission => (
                          <label
                            key={permission}
                            className="flex items-center space-x-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(permission)}
                              onChange={e => {
                                const checked = e.target.checked;
                                setFormData(prev => ({
                                  ...prev,
                                  permissions: checked
                                    ? [...prev.permissions, permission]
                                    : prev.permissions.filter(p => p !== permission)
                                }));
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span>{permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingRole(null);
                    setFormData({
                      name: '',
                      description: '',
                      permissions: []
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <X size={20} />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Check size={20} />
                  {editingRole ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permissions
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roles.map(role => (
              <tr key={role.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">
                      {role.name}
                      {role.isSystem && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          System
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{role.description}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.map(permission => (
                      <span
                        key={permission}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(role)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      <Pencil size={20} />
                    </button>
                    {!role.isSystem && (
                      <button
                        onClick={() => handleDelete(role.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}