import React, { useState, useEffect } from 'react';
import { Employee, Role } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../contexts/ToastContext';

interface EmployeeFormData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  hireDate: Date;
  username: string;
  password: string;
  isActive: boolean;
}

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    email: '',
    phone: '',
    role: { id: '', name: '', permissions: [] },
    hireDate: new Date(),
    username: '',
    password: '',
    isActive: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load roles first
      const rolesResponse = await fetch('http://localhost:3001/api/roles');
      if (!rolesResponse.ok) {
        throw new Error('Failed to load roles');
      }
      const rolesData = await rolesResponse.json();
      setRoles(rolesData);

      // Then load employees
      const employeesResponse = await fetch('http://localhost:3001/api/employees');
      if (!employeesResponse.ok) {
        throw new Error('Failed to load employees');
      }
      const employeesData = await employeesResponse.json();
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Error loading data', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.role || !formData.role.id) {
      showToast('Please select a role', 'error');
      return;
    }

    if (!formData.name || !formData.email || !formData.username || (!isEditing && !formData.password)) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/employees', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: formData.id || crypto.randomUUID(),
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          hireDate: formData.hireDate,
          username: formData.username,
          password: formData.password,
          isActive: formData.isActive
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save employee');
      }

      showToast(isEditing ? 'Employee updated successfully' : 'Employee added successfully', 'success');
      await loadData();
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving employee:', error);
      showToast(error instanceof Error ? error.message : 'Error saving employee', 'error');
    }
  };

  const handleEdit = (employee: Employee) => {
    setFormData({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      hireDate: new Date(employee.hireDate),
      username: employee.username,
      password: '',
      isActive: employee.isActive
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/employees/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete employee');
        }

        showToast('Employee deleted successfully', 'success');
        await loadData();
      } catch (error) {
        console.error('Error deleting employee:', error);
        showToast('Error deleting employee', 'error');
      }
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/employees/${id}/toggle-status`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle employee status');
      }

      showToast('Employee status updated', 'success');
      await loadData();
    } catch (error) {
      console.error('Error toggling employee status:', error);
      showToast('Error toggling employee status', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: roles[0] || { id: '', name: '', permissions: [] },
      hireDate: new Date(),
      username: '',
      password: '',
      isActive: true
    });
    setShowForm(false);
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Button onClick={() => {
          resetForm();
          setShowForm(true);
        }}>
          Add Employee
        </Button>
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hire Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td className="px-6 py-4 whitespace-nowrap">{employee.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{employee.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{employee.role.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(employee.hireDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={() => handleEdit(employee)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={() => toggleStatus(employee.id)}
                  >
                    {employee.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(employee.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Employee Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? 'Edit Employee' : 'Add Employee'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <Input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select 
                  className="w-full border rounded-lg px-3 py-2"
                  value={formData.role?.id || ''}
                  onChange={(e) => {
                    const selectedRole = roles.find(role => role.id === Number(e.target.value));
                    if (selectedRole) {
                      setFormData({ ...formData, role: selectedRole });
                    }
                  }}
                  required
                >
                  <option value="">Select a role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hire Date
                </label>
                <Input
                  type="date"
                  value={formData.hireDate.toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, hireDate: new Date(e.target.value) })}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? 'Update' : 'Add'} Employee
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;