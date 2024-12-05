import { Package, AlertCircle } from 'lucide-react';
import { Product } from '../types';

interface LowStockAlertProps {
  products: Product[];
  threshold?: number;
}

export default function LowStockAlert({ products, threshold = 10 }: LowStockAlertProps) {
  const lowStockProducts = products.filter(product => product.stock <= threshold);

  if (lowStockProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Low Stock Alerts</h2>
        <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-sm">
          {lowStockProducts.length} items
        </span>
      </div>
      <div className="space-y-3">
        {lowStockProducts.map(product => (
          <div
            key={product.id}
            className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                <Package size={20} />
              </div>
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-gray-600">Code: {product.code}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle size={16} />
              <span className="font-medium">{product.stock} left</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}