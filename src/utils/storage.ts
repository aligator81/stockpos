import { Product, Sale, Customer, StoreSettings } from '../types';

const PREFIX = 'pos_';

export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(`${PREFIX}${key}`);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading ${key} from storage:`, error);
      return null;
    }
  },

  set: <T>(key: string, value: T): boolean => {
    try {
      localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing ${key} to storage:`, error);
      return false;
    }
  },

  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(`${PREFIX}${key}`);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
      return false;
    }
  },

  clear: (): boolean => {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(PREFIX))
        .forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }
};

export const getDefaultSettings = (): StoreSettings => ({
  name: 'AtoZ Store',
  address: '123 Main Street',
  phone: '555-0100',
  email: 'contact@atozstore.com',
  tax: {
    enabled: true,
    rate: 0.1,
    included: false
  },
  loyalty: {
    pointsPerDollar: 1,
    minimumRedemption: 100,
    pointValue: 5
  },
  currency: 'USD',
  receiptHeader: 'Thank you for shopping with us!',
  receiptFooter: 'Please come again!'
});

// Initialize default settings if none exist
if (!storage.get('settings')) {
  storage.set('settings', getDefaultSettings());
}