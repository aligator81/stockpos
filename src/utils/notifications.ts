import { Customer, Sale, Product } from '../types';

export const sendLowStockAlert = async (product: Product) => {
  try {
    // Simplified version that logs to console
    console.log('Low stock alert:', {
      product_name: product.name,
      current_stock: product.stock,
      minimum_stock: 10
    });
    return true;
  } catch (error) {
    console.error('Failed to send low stock alert:', error);
    return false;
  }
};

export const sendExpiryAlert = async (products: Product[]) => {
  try {
    const expiringProducts = products
      .filter(p => p.expiryDate && p.expiryDate <= Date.now() + (30 * 24 * 60 * 60 * 1000))
      .map(p => `${p.name} (Expires: ${new Date(p.expiryDate!).toLocaleDateString()})`);

    if (expiringProducts.length === 0) return true;

    // Simplified version that logs to console
    console.log('Product expiry alert:', expiringProducts.join('\n'));
    return true;
  } catch (error) {
    console.error('Failed to send expiry alert:', error);
    return false;
  }
};

export const sendCustomerReceipt = async (customer: Customer, sale: Sale) => {
  try {
    // Simplified version that logs to console
    console.log('Receipt sent to customer:', {
      email: customer.email,
      receipt_number: sale.receiptNumber
    });
    return true;
  } catch (error) {
    console.error('Failed to send receipt:', error);
    return false;
  }
};