import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { PreferencesProvider } from './contexts/PreferencesContext';
import { RoleProvider } from './contexts/RoleContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Categories from './pages/Categories';
import Suppliers from './pages/Suppliers';
import Employees from './pages/Employees';
import Reports from './pages/Reports';
import Admins from './pages/Admins';
import Roles from './pages/Roles';
import Settings from './pages/Settings';
import ReceiptSettings from './pages/ReceiptSettings';
import StoreSettings from './pages/StoreSettings';
import NotificationSettings from './pages/NotificationSettings';
import Unauthorized from './pages/Unauthorized';
import SalesReport from './pages/SalesReport';
import InventoryReport from './pages/reports/InventoryReport';
import EmployeeReport from './pages/reports/EmployeeReport';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <PreferencesProvider>
          <ToastProvider>
            <AuthProvider>
              <RoleProvider>
                <div className="min-h-screen bg-gray-50">
                  <Toaster 
                    position="top-right"
                    toastOptions={{
                      duration: 3000,
                      style: {
                        background: '#363636',
                        color: '#fff',
                      },
                      success: {
                        duration: 3000,
                        theme: {
                          primary: '#4aed88',
                        },
                      },
                    }}
                  />
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path="/" element={<Layout />}>
                      <Route index element={
                        <ProtectedRoute requiredPermission="view_dashboard">
                          <Dashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="dashboard" element={
                        <ProtectedRoute requiredPermission="view_dashboard">
                          <Dashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="pos" element={
                        <ProtectedRoute requiredPermission="manage_pos">
                          <POS />
                        </ProtectedRoute>
                      } />
                      <Route path="inventory" element={
                        <ProtectedRoute requiredPermission="manage_inventory">
                          <Inventory />
                        </ProtectedRoute>
                      } />
                      <Route path="categories" element={
                        <ProtectedRoute requiredPermission="manage_categories">
                          <Categories />
                        </ProtectedRoute>
                      } />
                      <Route path="suppliers" element={
                        <ProtectedRoute requiredPermission="manage_suppliers">
                          <Suppliers />
                        </ProtectedRoute>
                      } />
                      <Route path="employees" element={
                        <ProtectedRoute requiredPermission="manage_employees">
                          <Employees />
                        </ProtectedRoute>
                      } />
                      <Route path="reports" element={
                        <ProtectedRoute requiredPermission="manage_reports">
                          <Reports />
                        </ProtectedRoute>
                      } />
                      <Route path="reports/sales" element={
                        <ProtectedRoute requiredPermission="manage_reports">
                          <SalesReport />
                        </ProtectedRoute>
                      } />
                      <Route path="reports/inventory" element={
                        <ProtectedRoute requiredPermission="manage_reports">
                          <InventoryReport />
                        </ProtectedRoute>
                      } />
                      <Route path="reports/employees" element={
                        <ProtectedRoute requiredPermission="manage_reports">
                          <EmployeeReport />
                        </ProtectedRoute>
                      } />
                      <Route path="admins" element={
                        <ProtectedRoute requiredPermission="manage_employees">
                          <Admins />
                        </ProtectedRoute>
                      } />
                      <Route path="roles" element={
                        <ProtectedRoute requiredPermission="manage_roles">
                          <Roles />
                        </ProtectedRoute>
                      } />
                      <Route path="settings" element={
                        <ProtectedRoute requiredPermission="manage_settings">
                          <Settings />
                        </ProtectedRoute>
                      } />
                      <Route path="settings/receipt" element={
                        <ProtectedRoute requiredPermission="manage_settings">
                          <ReceiptSettings />
                        </ProtectedRoute>
                      } />
                      <Route path="settings/store" element={
                        <ProtectedRoute requiredPermission="manage_settings">
                          <StoreSettings />
                        </ProtectedRoute>
                      } />
                      <Route path="settings/notifications" element={
                        <ProtectedRoute requiredPermission="manage_settings">
                          <NotificationSettings />
                        </ProtectedRoute>
                      } />
                    </Route>
                  </Routes>
                </div>
              </RoleProvider>
            </AuthProvider>
          </ToastProvider>
        </PreferencesProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;