import { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, Package, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';
import { Product, Category, Supplier } from '../types';
import ProductForm from '../components/ProductForm';

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const storedProducts = localStorage.getItem('products');
    const storedCategories = localStorage.getItem('categories');
    const storedSuppliers = localStorage.getItem('suppliers');
    
    if (storedProducts) setProducts(JSON.parse(storedProducts));
    if (storedCategories) setCategories(JSON.parse(storedCategories));
    if (storedSuppliers) setSuppliers(JSON.parse(storedSuppliers));
  }, []);

  const inventoryMetrics = useMemo(() => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.costPrice * p.stock), 0);
    const retailValue = products.reduce((sum, p) => sum + (p.salePrice * p.stock), 0);
    const lowStock = products.filter(p => p.stock <= 10).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const potentialProfit = retailValue - totalValue;
    const averageMargin = totalValue > 0 
      ? ((retailValue - totalValue) / totalValue) * 100 
      : 0;

    return {
      totalProducts,
      totalValue,
      retailValue,
      lowStock,
      outOfStock,
      potentialProfit,
      averageMargin
    };
  }, [products]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  const saveProducts = (newProducts: Product[]) => {
    localStorage.setItem('products', JSON.stringify(newProducts));
    setProducts(newProducts);
  };

  const handleSubmit = (productData: Omit<Product, 'id'>) => {
    if (editingProduct) {
      const updatedProducts = products.map(p =>
        p.id === editingProduct.id ? { ...productData, id: p.id } : p
      );
      saveProducts(updatedProducts);
    } else {
      const newProduct = {
        ...productData,
        id: Date.now().toString(),
      };
      saveProducts([...products, newProduct]);
    }
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      saveProducts(products.filter(p => p.id !== productId));
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Unknown Category';
  };

  const getSupplierName = (supplierId: string) => {
    return suppliers.find(s => s.id === supplierId)?.name || 'Unknown Supplier';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <Package className="h-8 w-8" />
              </div>
              <div>
                <p className="text-white/80 font-medium">Total Products</p>
                <p className="text-2xl font-bold">{inventoryMetrics.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <DollarSign className="h-8 w-8" />
              </div>
              <div>
                <p className="text-white/80 font-medium">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(inventoryMetrics.totalValue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <TrendingUp className="h-8 w-8" />
              </div>
              <div>
                <p className="text-white/80 font-medium">Potential Profit</p>
                <p className="text-2xl font-bold">{formatCurrency(inventoryMetrics.potentialProfit)}</p>
                <p className="text-sm text-white/80">
                  {inventoryMetrics.averageMargin.toFixed(1)}% margin
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <div>
                <p className="text-white/80 font-medium">Stock Alerts</p>
                <p className="text-2xl font-bold">{inventoryMetrics.lowStock}</p>
                <p className="text-sm text-white/80">
                  {inventoryMetrics.outOfStock} out of stock
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left p-4 text-gray-600">Code</th>
                  <th className="text-left p-4 text-gray-600">Barcode</th>
                  <th className="text-left p-4 text-gray-600">Name</th>
                  <th className="text-left p-4 text-gray-600">Category</th>
                  <th className="text-left p-4 text-gray-600">Supplier</th>
                  <th className="text-left p-4 text-gray-600">Stock</th>
                  <th className="text-right p-4 text-gray-600">Cost Price</th>
                  <th className="text-right p-4 text-gray-600">Sale Price</th>
                  <th className="text-right p-4 text-gray-600">Net Revenue</th>
                  <th className="text-left p-4 text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="p-4">{product.code}</td>
                    <td className="p-4">{product.barcode || '-'}</td>
                    <td className="p-4 font-medium">{product.name}</td>
                    <td className="p-4">{getCategoryName(product.categoryId)}</td>
                    <td className="p-4">{getSupplierName(product.supplierId)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        product.stock === 0
                          ? 'bg-red-100 text-red-800'
                          : product.stock <= 10
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4 text-right">{formatCurrency(product.costPrice)}</td>
                    <td className="p-4 text-right">{formatCurrency(product.salePrice)}</td>
                    <td className="p-4 text-right whitespace-nowrap">
                      {formatCurrency(product.salePrice - product.costPrice)}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {products.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No products found. Add some products to get started.
              </div>
            )}
          </div>
        </div>

        {showForm && (
          <ProductForm
            onSubmit={handleSubmit}
            onClose={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
            initialProduct={editingProduct || undefined}
          />
        )}
      </div>
    </div>
  );
}