import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users,
  Calendar,
  CreditCard,
  Wallet,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import { Sale, Product, Employee } from '../types';
import { eventEmitter, EVENTS } from '../utils/events';

export default function Dashboard() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [startDate, setStartDate] = useState(
    startOfMonth(new Date()).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    endOfMonth(new Date()).toISOString().split('T')[0]
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
    
    // Subscribe to sales completed event
    const unsubscribe = eventEmitter.subscribe(EVENTS.SALE_COMPLETED, loadData);
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const loadData = () => {
    setIsLoading(true);
    try {
      const storedSales = localStorage.getItem('sales');
      const storedProducts = localStorage.getItem('products');
      const storedEmployees = localStorage.getItem('employees');

      if (storedSales) setSales(JSON.parse(storedSales));
      if (storedProducts) setProducts(JSON.parse(storedProducts));
      if (storedEmployees) setEmployees(JSON.parse(storedEmployees));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSales = useMemo(() => {
    if (!sales.length) return [];
    return sales.filter(sale => {
      const saleDate = parseISO(sale.timestamp);
      return isWithinInterval(saleDate, {
        start: parseISO(startDate),
        end: parseISO(endDate)
      });
    });
  }, [sales, startDate, endDate]);

  const metrics = useMemo(() => {
    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const cashSales = filteredSales
      .filter(sale => sale.paymentMethod.toLowerCase() === 'cash')
      .reduce((sum, sale) => sum + sale.total, 0);
    const cardSales = filteredSales
      .filter(sale => sale.paymentMethod.toLowerCase() === 'card')
      .reduce((sum, sale) => sum + sale.total, 0);
    
    const totalItems = filteredSales.reduce((sum, sale) => 
      sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );
    
    return {
      totalSales,
      cashSales,
      cardSales,
      averageSale: filteredSales.length ? totalSales / filteredSales.length : 0,
      totalTransactions: filteredSales.length,
      totalItems,
      averageItemsPerSale: filteredSales.length ? totalItems / filteredSales.length : 0
    };
  }, [filteredSales]);

  const inventoryMetrics = useMemo(() => {
    return {
      lowStock: products.filter(p => p.stock <= 10).length,
      outOfStock: products.filter(p => p.stock === 0).length,
      totalProducts: products.length,
      totalValue: products.reduce((sum, p) => sum + (p.costPrice * p.stock), 0)
    };
  }, [products]);

  const topProducts = useMemo(() => {
    const productSales = new Map<string, { quantity: number; revenue: number }>();
    
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const current = productSales.get(item.productId) || { quantity: 0, revenue: 0 };
        productSales.set(item.productId, {
          quantity: current.quantity + item.quantity,
          revenue: current.revenue + (item.price * item.quantity)
        });
      });
    });

    return Array.from(productSales.entries())
      .map(([id, data]) => ({
        product: products.find(p => p.id === id),
        ...data
      }))
      .filter(item => item.product)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredSales, products]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <button 
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Refresh Data
              </>
            )}
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-500" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <DollarSign className="h-8 w-8" />
              </div>
              <div>
                <p className="text-white/80 font-medium">Total Sales</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.totalSales)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <Wallet className="h-8 w-8" />
              </div>
              <div>
                <p className="text-white/80 font-medium">Cash Sales</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.cashSales)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <CreditCard className="h-8 w-8" />
              </div>
              <div>
                <p className="text-white/80 font-medium">Card Sales</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.cardSales)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <TrendingUp className="h-8 w-8" />
              </div>
              <div>
                <p className="text-white/80 font-medium">Average Sale</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.averageSale)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inventory Overview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Inventory Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">Total Products</p>
                <p className="text-2xl font-bold text-blue-700">{inventoryMetrics.totalProducts}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-yellow-600 font-medium">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-700">{inventoryMetrics.lowStock}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-red-600 font-medium">Out of Stock</p>
                <p className="text-2xl font-bold text-red-700">{inventoryMetrics.outOfStock}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Total Value</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(inventoryMetrics.totalValue)}</p>
              </div>
            </div>
          </div>

          {/* Transaction Overview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Transaction Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-medium">Total Transactions</p>
                <p className="text-2xl font-bold text-purple-700">{metrics.totalTransactions}</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-sm text-indigo-600 font-medium">Total Items Sold</p>
                <p className="text-2xl font-bold text-indigo-700">{metrics.totalItems}</p>
              </div>
              <div className="bg-pink-50 rounded-lg p-4">
                <p className="text-sm text-pink-600 font-medium">Active Employees</p>
                <p className="text-2xl font-bold text-pink-700">{employees.length}</p>
              </div>
              <div className="bg-cyan-50 rounded-lg p-4">
                <p className="text-sm text-cyan-600 font-medium">Average Items/Sale</p>
                <p className="text-2xl font-bold text-cyan-700">
                  {metrics.averageItemsPerSale.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products and Recent Sales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Top Selling Products</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topProducts.map((item, index) => (
                  <div key={item.product?.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Package className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.product?.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} units sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(item.revenue)}</p>
                      <p className="text-sm text-gray-500">Revenue</p>
                    </div>
                  </div>
                ))}
                {topProducts.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    No sales data available for the selected period
                  </div>
                )}
              </div>
              <div className="mt-6">
                <Link
                  to="/inventory"
                  className="block w-full text-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                >
                  View All Products
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Sales */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Recent Sales</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {filteredSales.slice(0, 5).map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <ShoppingCart className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {employees.find(emp => emp.id === sale.employeeId)?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(parseISO(sale.timestamp), 'MMM d, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(sale.total)}</p>
                      <p className="text-sm text-gray-500">{sale.items.length} items</p>
                    </div>
                  </div>
                ))}
                {filteredSales.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    No sales found for the selected period
                  </div>
                )}
              </div>
              <div className="mt-6">
                <Link
                  to="/sales"
                  className="block w-full text-center px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors duration-200"
                >
                  View All Sales
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {inventoryMetrics.lowStock > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-xl p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Package className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Low Stock Alert
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    {inventoryMetrics.lowStock} products are running low on stock.{' '}
                    <Link to="/inventory" className="font-medium underline hover:text-yellow-800">
                      View inventory
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}