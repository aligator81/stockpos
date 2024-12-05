import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { Admin } from '../types';

export default function Admins() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
  });

  useEffect(() => {
    const storedAdmins = localStorage.getItem('admins');
    if (storedAdmins) {
      setAdmins(JSON.parse(storedAdmins));
    } else {
      // Initialize with the default admin if no admins exist
      const defaultAdmin = localStorage.getItem('admin');
      if (defaultAdmin) {
        const adminData = JSON.parse(defaultAdmin);
        setAdmins([adminData]);
        localStorage.setItem('admins', JSON.stringify([adminData]));
      }
    }
  }, []);

  const saveAdmins = (newAdmins: Admin[]) => {
    localStorage.setItem('admins', JSON.stringify(newAdmins));
    setAdmins(newAdmins);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAdmin) {
      const updatedAdmins = admins.map(a =>
        a.id === editingAdmin.id
          ? {
              ...formData,
              id: a.id,
              password: formData.password || a.password // Keep old password if not changed
            }
          : a
      );
      saveAdmins(updatedAdmins);
    } else {
      const newAdmin = {
        ...formData,
        id: Date.now().toString(),
      };
      saveAdmins([...admins, newAdmin]);
    }
    
    setShowForm(false);
    setEditingAdmin(null);
    setFormData({ username: '', password: '', name: '' });
  };

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setFormData({
      username: admin.username,
      password: '', // Don't show existing password
      name: admin.name,
    });
    setShowForm(true);
  };

  const handleDelete = (adminId: string) => {
    if (admins.length <= 1) {
      alert('Cannot delete the last admin user');
      return;
    }
    
    if (confirm('Are you sure you want to delete this admin?')) {
      saveAdmins(admins.filter(a => a.id !== adminId));
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Admin Users</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Admin
        </button>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="grid grid-cols-3 gap-4 p-4 font-medium border-b">
          <div>Name</div>
          <div>Username</div>
          <div>Actions</div>
        </div>

        {admins.map(admin => (
          <div key={admin.id} className="grid grid-cols-3 gap-4 p-4 border-b last:border-0">
            <div>{admin.name}</div>
            <div>{admin.username}</div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(admin)}
                className="p-1 text-gray-600 hover:text-blue-600"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => handleDelete(admin.id)}
                className="p-1 text-gray-600 hover:text-red-600"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {admins.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No admin users found. Add some admin users to get started.
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingAdmin ? 'Edit Admin User' : 'Add Admin User'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingAdmin ? 'New Password (leave blank to keep current)' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 pr-10"
                    required={!editingAdmin}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700"
                >
                  {editingAdmin ? 'Update Admin' : 'Add Admin'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAdmin(null);
                    setFormData({ username: '', password: '', name: '' });
                  }}
                  className="flex-1 border border-gray-300 rounded-lg py-2 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}