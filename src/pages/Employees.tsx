import React, { useState, useEffect } from 'react';
import { Employee, Role } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
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

  const loadData = () => {
    // Load roles first
    const storedRoles = localStorage.getItem('roles');
    if (storedRoles) {
      const parsedRoles = JSON.parse(storedRoles);
      setRoles(parsedRoles);

      // Then load employees and ensure they have valid roles
      const storedEmployees = localStorage.getItem('employees');
      if (storedEmployees) {
        const parsedEmployees = JSON.parse(storedEmployees);
        // Ensure each employee has a valid role
        const validEmployees = parsedEmployees.map((emp: Employee) => {
          const employeeRole = parsedRoles.find((role: Role) => role.id === emp.role.id);
          return {
            ...emp,
            role: employeeRole || parsedRoles[0],
            hireDate: new Date(emp.hireDate)
          };
        });
        setEmployees(validEmployees);
        localStorage.setItem('employees', JSON.stringify(validEmployees));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.role || !formData.role.id) {
      showToast('Please select a role', 'error');
      return;
    }

    const newEmployee: Employee = {
      id: formData.id || crypto.randomUUID(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      hireDate: formData.hireDate,
      username: formData.username,
      password: formData.password,
      isActive: formData.isActive
    };

    let updatedEmployees;
    if (isEditing) {
      updatedEmployees = employees.map(emp => emp.id === newEmployee.id ? newEmployee : emp);
      showToast('Employee updated successfully', 'success');
    } else {
      updatedEmployees = [...employees, newEmployee];
      showToast('Employee added successfully', 'success');
    }

    setEmployees(updatedEmployees);
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
    resetForm();
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
      password: employee.password,
      isActive: employee.isActive
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      const updatedEmployees = employees.filter(emp => emp.id !== id);
      setEmployees(updatedEmployees);
      localStorage.setItem('employees', JSON.stringify(updatedEmployees));
      showToast('Employee deleted successfully', 'success');
    }
  };

  const toggleStatus = (id: string) => {
    const updatedEmployees = employees.map(emp => 
      emp.id === id ? { ...emp, isActive: !emp.isActive } : emp
    );
    setEmployees(updatedEmployees);
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
    showToast('Employee status updated', 'success');
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
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(employee.id)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {isEditing ? 'Edit Employee' : 'Add Employee'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <Select
                  value={formData.role.id}
                  onChange={e => {
                    const selectedRole = roles.find(role => role.id === e.target.value);
                    if (selectedRole) {
                      setFormData(prev => ({ ...prev, role: selectedRole }));
                    }
                  }}
                  required
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <Input
                  type="text"
                  value={formData.username}
                  onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>

              {!isEditing && (
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required={!isEditing}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? 'Update' : 'Add'}
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