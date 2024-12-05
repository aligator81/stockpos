import { useState, useEffect } from 'react';
import { Download, AlertTriangle } from 'lucide-react';
import { Product, Category } from '../../types';
import { exportToExcel } from '../../utils/export';
import { format } from 'date-fns';

export default function InventoryReport() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedProducts = localStorage.getItem('products');
    const storedCategories = localStorage.getItem('categories');
    
    if (storedProducts) setProducts(JSON.parse(storedProducts));
    if (storedCategories) setCategories(JSON.parse(storedCategories));
  };

  const getTotalInventoryValue = () => {
    return products.reduce((sum, product) => sum + (product.costPrice * product.stock), 0);
  };

  const getLowStockItems = () => {
    return products.filter(product => product.stock <= product.minStock);
  };

  const getOutOfStockItems = () => {
    return products.filter(product => product.stock === 0);
  };

  const getStockValue = (product: Product) => {
    return product.stock * product.costPrice;
  };

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return { class: 'bg-red-100 text-red-800', text: 'Out of Stock' };
    if (product.stock <= product.minStock) return { class: 'bg-yellow-100 text-yellow-800', text: 'Low Stock' };
    return { class: 'bg-green-100 text-green-800', text: 'In Stock' };
  };

  const handleExport = () => {
    const data = products.map(product => ({
      'Product Name': product.name,
      'Code': product.code,
      'Barcode': product.barcode,
      'Category': categories.find(c => c.id === product.categoryId)?.name || 'N/A',
      'Stock Level': product.stock,
      'Minimum Stock': product.minStock,
      'Cost Price': product.costPrice.toFixed(2),
      'Sale Price': product.salePrice.toFixed(2),
      'Total Value': getStockValue(product).toFixed(2),
      'Status': product.stock === 0 ? 'Out of Stock' : 
                product.stock <= product.minStock ? 'Low Stock' : 'In Stock',
      'Last Updated': format(new Date(product.updatedAt), 'yyyy-MM-dd HH:mm')
    }));

    exportToExcel(data, `Inventory_Report_${format(new Date(), 'yyyy-MM-dd')}`);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Inventory Report</h1>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <Download size={20} />
            Export Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Total Inventory Value</h3>
            <p className="text-3xl font-bold text-blue-900">
              ${getTotalInventoryValue().toFixed(2)}
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Low Stock Items</h3>
            <p className="text-3xl font-bold text-yellow-900">
              {getLowStockItems().length}
            </p>
          </div>
          <div className="bg-red-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Out of Stock</h3>
            <p className="text-3xl font-bold text-red-900">
              {getOutOfStockItems().length}
            </p>
          </div>
        </div>

        {/* Low Stock Alerts */}
        {getLowStockItems().length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Low Stock Alerts</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800 mb-4">
                <AlertTriangle size={20} />
                <span>The following items are running low on stock</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getLowStockItems().map(product => (
                  <div key={product.id} className="bg-white p-4 rounded-lg border border-yellow-200">
                    <h3 className="font-semibold text-gray-800">{product.name}</h3>
                    <p className="text-sm text-gray-600">Code: {product.code}</p>
                    <p className="text-sm text-gray-600">Barcode: {product.barcode}</p>
                    <p className="text-sm font-medium text-yellow-800">
                      Stock Level: {product.stock} units (Min: {product.minStock})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Inventory Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Level
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min Stock
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sale Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map(product => {
                const status = getStockStatus(product);
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        Code: {product.code}<br/>
                        Barcode: {product.barcode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {categories.find(c => c.id === product.categoryId)?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900">{product.stock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900">{product.minStock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900">${product.costPrice.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900">${product.salePrice.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ${getStockValue(product).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.class}`}>
                        {status.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
