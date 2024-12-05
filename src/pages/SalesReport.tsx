import { useState, useEffect, useMemo } from 'react';
import { Download, DollarSign, TrendingUp, ShoppingCart, CreditCard, RefreshCw, Loader2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import { Sale, Product } from '../types';
import { exportToExcel } from '../utils/export';
import { eventEmitter, EVENTS } from '../utils/events';

interface SaleWithDetails extends Sale {
  productDetails: Array<{
    name: string;
    quantity: number;
    price: number;
    costPrice: number;
    total: number;
    netRevenue: number;
  }>;
  totalNetRevenue: number;
}

export default function SalesReport() {
  const [sales, setSales] = useState<SaleWithDetails[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [startDate, setStartDate] = useState(
    startOfMonth(new Date()).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    endOfMonth(new Date()).toISOString().split('T')[0]
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setIsLoading(true);
    try {
      const storedSales = localStorage.getItem('sales');
      const storedProducts = localStorage.getItem('products');
      
      if (storedSales && storedProducts) {
        const parsedSales: Sale[] = JSON.parse(storedSales);
        const parsedProducts: Product[] = JSON.parse(storedProducts);
        
        // Enhance sales with product details
        const salesWithDetails = parsedSales.map((sale: Sale) => {
          const productDetails = sale.items.map(item => {
            const product = parsedProducts.find((p: Product) => p.id === item.productId);
            const quantity = item.quantity || 0;
            const price = item.price || 0;
            const costPrice = product?.costPrice || 0;
            const total = quantity * price;
            const netRevenue = total - (quantity * costPrice);
            
            return {
              name: product?.name || 'Unknown Product',
              quantity,
              price,
              costPrice,
              total,
              netRevenue
            };
          });

          const totalNetRevenue = productDetails.reduce((sum, detail) => sum + detail.netRevenue, 0);

          return {
            ...sale,
            productDetails,
            totalNetRevenue
          };
        });

        setSales(salesWithDetails);
        setProducts(parsedProducts);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCAD = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return isWithinInterval(saleDate, {
        start: parseISO(startDate),
        end: parseISO(endDate)
      });
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, startDate, endDate]);

  const statistics = useMemo(() => {
    const stats = {
      totalRevenue: 0,
      totalNetRevenue: 0,
      totalTransactions: filteredSales.length,
      averageTransaction: 0,
      averageNetRevenue: 0,
      totalItems: 0,
      paymentMethods: {} as Record<string, { count: number; total: number }>,
      topProducts: [] as { name: string; quantity: number; revenue: number; netRevenue: number }[]
    };

    // Calculate product sales
    const productSales = new Map<string, { 
      quantity: number; 
      revenue: number; 
      netRevenue: number;
      costPrice: number 
    }>();

    filteredSales.forEach(sale => {
      stats.totalRevenue += sale.total;
      stats.totalNetRevenue += sale.totalNetRevenue;
      stats.totalItems += sale.items.reduce((sum, item) => sum + item.quantity, 0);
      
      // Track payment methods with totals
      const paymentMethod = sale.paymentMethod;
      if (!stats.paymentMethods[paymentMethod]) {
        stats.paymentMethods[paymentMethod] = { count: 0, total: 0 };
      }
      stats.paymentMethods[paymentMethod].count += 1;
      stats.paymentMethods[paymentMethod].total += sale.total;

      // Track product sales
      sale.productDetails.forEach(product => {
        const existing = productSales.get(product.name) || { 
          quantity: 0, 
          revenue: 0, 
          netRevenue: 0,
          costPrice: product.costPrice 
        };
        
        productSales.set(product.name, {
          quantity: existing.quantity + product.quantity,
          revenue: existing.revenue + product.total,
          netRevenue: existing.netRevenue + product.netRevenue,
          costPrice: product.costPrice
        });
      });
    });

    stats.averageTransaction = stats.totalRevenue / (stats.totalTransactions || 1);
    stats.averageNetRevenue = stats.totalNetRevenue / (stats.totalTransactions || 1);

    // Convert product sales to sorted array
    stats.topProducts = Array.from(productSales.entries())
      .map(([name, data]) => ({
        name,
        quantity: data.quantity,
        revenue: data.revenue,
        netRevenue: data.netRevenue
      }))
      .sort((a, b) => b.netRevenue - a.netRevenue)
      .slice(0, 5);

    return stats;
  }, [filteredSales]);

  const handleExport = () => {
    const data = filteredSales.flatMap(sale => 
      sale.productDetails.map(product => ({
        'Date': format(parseISO(sale.date), 'MMM d, yyyy HH:mm'),
        'Transaction ID': sale.id,
        'Product': product.name,
        'Quantity': product.quantity,
        'Unit Price': formatCAD(product.price),
        'Cost Price': formatCAD(product.costPrice),
        'Total': formatCAD(product.total),
        'Net Revenue': formatCAD(product.netRevenue),
        'Sale Total': formatCAD(sale.total),
        'Payment Method': sale.paymentMethod
      }))
    );

    exportToExcel(data, `Sales_Report_${format(new Date(), 'yyyy-MM-dd')}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Refresh Button */}
        <div className="flex justify-between items-center bg-white rounded-xl shadow-lg p-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales Report</h1>
            <p className="text-gray-500">View and analyze your sales data</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Date Range Selection */}
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              />
            </div>
            {/* Refresh Button */}
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
            {/* Export Button */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-md transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-8 h-8 text-white/90" />
              <h3 className="text-lg font-semibold text-white">Total Revenue</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {formatCAD(statistics.totalRevenue)}
            </p>
            <p className="text-sm text-white/80 mt-1">
              Net: {formatCAD(statistics.totalNetRevenue)}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-md transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingCart className="w-8 h-8 text-white/90" />
              <h3 className="text-lg font-semibold text-white">Transactions</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {statistics.totalTransactions}
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-md transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-white/90" />
              <h3 className="text-lg font-semibold text-white">Avg. Sale</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {formatCAD(statistics.averageTransaction)}
            </p>
            <p className="text-sm text-white/80 mt-1">
              Net: {formatCAD(statistics.averageNetRevenue)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-6 shadow-md transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-8 h-8 text-white/90" />
              <h3 className="text-lg font-semibold text-white">Total Items</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {statistics.totalItems}
            </p>
          </div>
        </div>

        {/* Products and Payment Methods Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Top Selling Products</h3>
            <div className="space-y-4">
              {statistics.topProducts.map((product, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div>
                    <p className="font-medium text-gray-800">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.quantity} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {formatCAD(product.revenue)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Net: {formatCAD(product.netRevenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Payment Methods</h3>
            <div className="space-y-4">
              {Object.entries(statistics.paymentMethods).map(([method, data], index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div>
                    <p className="font-medium text-gray-800">{method}</p>
                    <p className="text-sm text-gray-600">{data.count} transactions</p>
                  </div>
                  <p className="font-semibold text-green-600">
                    {formatCAD(data.total)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sales Table */}
        <div className="p-6">
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      'Date',
                      'Transaction ID',
                      'Item Name',
                      'Quantity',
                      'Unit Price',
                      'Cost Price',
                      'Item Total',
                      'Net Revenue',
                      'Sale Total',
                      'Payment'
                    ].map((header) => (
                      <th key={header} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSales.map((sale) => (
                    sale.productDetails.map((product, productIndex) => (
                      <tr key={`${sale.id}-${productIndex}`} className="hover:bg-gray-50">
                        {productIndex === 0 ? (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" rowSpan={sale.productDetails.length}>
                              {format(parseISO(sale.date), 'MMM d, yyyy HH:mm')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" rowSpan={sale.productDetails.length}>
                              {sale.id}
                            </td>
                          </>
                        ) : null}
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center">
                          {product.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">
                          {formatCAD(product.price)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">
                          {formatCAD(product.costPrice)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">
                          {formatCAD(product.total)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">
                          {formatCAD(product.netRevenue)}
                        </td>
                        {productIndex === 0 ? (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right" rowSpan={sale.productDetails.length}>
                              {formatCAD(sale.total)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" rowSpan={sale.productDetails.length}>
                              {sale.paymentMethod}
                            </td>
                          </>
                        ) : null}
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
