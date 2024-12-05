import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Supplier } from '../types';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    const storedSuppliers = localStorage.getItem('suppliers');
    if (storedSuppliers) {
      setSuppliers(JSON.parse(storedSuppliers));
    }
  }, []);

  const saveSuppliers = (newSuppliers: Supplier[]) => {
    localStorage.setItem('suppliers', JSON.stringify(newSuppliers));
    setSuppliers(newSuppliers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSupplier) {
      const updatedSuppliers = suppliers.map(s =>
        s.id === editingSupplier.id ? { ...formData, id: s.id } : s
      );
      saveSuppliers(updatedSuppliers);
    } else {
      const newSupplier = {
        ...formData,
        id: Date.now().toString(),
      };
      saveSuppliers([...suppliers, newSupplier]);
    }
    setShowForm(false);
    setEditingSupplier(null);
    setFormData({ name: '', email: '', phone: '', address: '' });
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData(supplier);
    setShowForm(true);
  };

  const handleDelete = (supplierId: string) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      saveSuppliers(suppliers.filter(s => s.id !== supplierId));
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Suppliers</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Supplier
        </button>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="grid grid-cols-5 gap-4 p-4 font-medium border-b">
          <div>Name</div>
          <div>Email</div>
          <div>Phone</div>
          <div>Address</div>
          <div>Actions</div>
        </div>

        {suppliers.map(supplier => (
          <div key={supplier.id} className="grid grid-cols-5 gap-4 p-4 border-b last:border-0">
            <div>{supplier.name}</div>
            <div>{supplier.email}</div>
            <div>{supplier.phone}</div>
            <div>{supplier.address}</div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(supplier)}
                className="p-1 text-gray-600 hover:text-blue-600"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => handleDelete(supplier.id)}
                className="p-1 text-gray-600 hover:text-red-600"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {suppliers.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No suppliers found. Add some suppliers to get started.
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier Name
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
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700"
                >
                  {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSupplier(null);
                    setFormData({ name: '', email: '', phone: '', address: '' });
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