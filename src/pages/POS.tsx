import { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Wallet, AlertCircle, Loader2 } from 'lucide-react';
import { Product, Sale, SaleItem } from '../types';
import BarcodeScanner from '../components/BarcodeScanner';
import CameraScanner from '../components/CameraScanner';
import SearchInput from '../components/SearchInput';
import { showToast } from '../utils/toast';
import { printReceipt } from '../utils/receipt';
import { eventEmitter, EVENTS } from '../utils/events';

interface CartItem extends SaleItem {
  name: string;
  total: number;
}

interface PaymentError {
  message: string;
  code?: string;
  retry?: boolean;
}

export default function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<PaymentError | null>(null);

  // Load products from localStorage
  useEffect(() => {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      const parsedProducts = JSON.parse(storedProducts);
      setProducts(parsedProducts);
      setFilteredProducts(parsedProducts);
    }
  }, []);

  // Handle product search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredProducts(products);
      return;
    }
    
    const lowercaseQuery = query.toLowerCase();
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.code.toLowerCase().includes(lowercaseQuery) ||
      (product.barcode && product.barcode.toLowerCase().includes(lowercaseQuery))
    );
    setFilteredProducts(filtered);
  }, [products]);

  // Handle barcode scan
  const handleScan = (code: string) => {
    const product = products.find(p => 
      p.code === code || p.barcode === code
    );

    if (product) {
      if (product.stock <= 0) {
        showToast.error(`${product.name} is out of stock`);
        return;
      }
      addToCart(product);
      showToast.success(`Added ${product.name} to cart`);
    } else {
      showToast.error(`Product not found: ${code}`);
    }
  };

  // Cart operations
  const addToCart = (product: Product) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.productId === product.id);
      
      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          showToast.error(`Cannot add more ${product.name} (Stock: ${product.stock})`);
          return currentCart;
        }
        return currentCart.map(item =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.priceAtSale
              }
            : item
        );
      }

      return [...currentCart, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        priceAtSale: product.salePrice,
        total: product.salePrice
      }];
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQuantity > product.stock) {
      showToast.error(`Cannot add more ${product.name} (Stock: ${product.stock})`);
      return;
    }

    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.productId !== productId));
      return;
    }

    setCart(cart.map(item =>
      item.productId === productId
        ? {
            ...item,
            quantity: newQuantity,
            total: newQuantity * item.priceAtSale
          }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  // Calculate totals
  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);

  // Process payment
  const processPayment = async (method: 'cash' | 'etransfer') => {
    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Validate cart
      if (cart.length === 0) {
        throw new Error('Cart is empty');
      }

      // Validate stock levels again before processing
      for (const item of cart) {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
          throw new Error(`Product not found: ${item.name}`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }
      }

      // Create sale record
      const sale: Sale = {
        id: Date.now().toString(),
        employeeId: "default", // We'll update this when we implement employee login
        items: cart.map(({ productId, quantity, priceAtSale }) => ({
          productId,
          quantity,
          price: priceAtSale,
          discount: 0,
          total: quantity * priceAtSale,
          cost: products.find(p => p.id === productId)?.costPrice || 0
        })),
        subtotal: cartTotal,
        tax: 0, // We'll implement tax calculation later
        discount: 0,
        total: cartTotal,
        payments: [{
          type: method as 'cash' | 'card' | 'mobile',
          amount: cartTotal,
          reference: Date.now().toString()
        }],
        status: 'completed',
        receiptNumber: `RCP${Date.now()}`,
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Update product stock
      const updatedProducts = products.map(product => {
        const cartItem = cart.find(item => item.productId === product.id);
        if (cartItem) {
          return {
            ...product,
            stock: product.stock - cartItem.quantity
          };
        }
        return product;
      });

      // Save updates - wrapped in try-catch for storage errors
      try {
        const currentSales = JSON.parse(localStorage.getItem('sales') || '[]');
        localStorage.setItem('sales', JSON.stringify([...currentSales, sale]));
        localStorage.setItem('products', JSON.stringify(updatedProducts));
        setProducts(updatedProducts);
        
        // Emit event to notify other components
        eventEmitter.emit(EVENTS.SALE_COMPLETED);
      } catch (storageError) {
        throw new Error('Failed to save transaction. Please try again.');
      }

      // Try to print receipt
      try {
        await printReceipt(sale, { name: 'AtoZ Store', address: '123 Main St', phone: '555-0123' });
      } catch (printError) {
        console.error('Print error:', printError);
        showToast.error('Failed to print receipt. Transaction was successful.');
      }

      // Reset cart and close payment modal
      setCart([]);
      setShowPayment(false);
      showToast.success('Payment processed successfully');
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError({
        message: error instanceof Error ? error.message : 'Failed to process payment',
        retry: true
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex">
      {/* Product List */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="mb-4 flex gap-4">
          <div className="flex-1">
            <BarcodeScanner
              onScan={handleScan}
              onOpenCamera={() => setShowScanner(true)}
              placeholder="Scan barcode or search products..."
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className={`p-4 rounded-lg border text-left transition-all ${
                product.stock <= 0
                  ? 'bg-gray-100 opacity-60 cursor-not-allowed'
                  : 'bg-white hover:border-blue-500 hover:shadow-md'
              }`}
            >
              <h3 className="font-medium mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-2">Code: {product.code}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">${product.salePrice.toFixed(2)}</span>
                <span className={`text-sm ${
                  product.stock <= 5 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  Stock: {product.stock}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="w-96 border-l bg-white flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Shopping Cart</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <ShoppingCart className="mx-auto h-12 w-12 mb-2" />
              <p>Cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.productId} className="flex items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      ${item.priceAtSale.toFixed(2)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1 text-gray-600 hover:text-red-600"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1 text-gray-600 hover:text-blue-600"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="p-1 text-gray-600 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold">${cartTotal.toFixed(2)}</span>
          </div>

          <button
            onClick={() => setShowPayment(true)}
            disabled={cart.length === 0}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Process Payment
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Select Payment Method</h2>
            <p className="mb-6">Total Amount: ${cartTotal.toFixed(2)}</p>
            
            {paymentError && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Payment Error</p>
                  <p className="text-sm">{paymentError.message}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <button
                onClick={() => processPayment('cash')}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Wallet size={20} />
                )}
                Cash
              </button>
              
              <button
                onClick={() => processPayment('etransfer')}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <CreditCard size={20} />
                )}
                E-Transfer
              </button>
              
              <button
                onClick={() => {
                  setShowPayment(false);
                  setPaymentError(null);
                }}
                disabled={isProcessing}
                className="w-full border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scanner Modal */}
      {showScanner && (
        <CameraScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}