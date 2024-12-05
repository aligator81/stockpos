import React, { useState, useEffect } from 'react';
import { Store } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../contexts/ToastContext';

interface StoreSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxRate: number;
  currency: string;
  businessHours: string;
}

const StoreSettings: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<StoreSettings>({
    name: '',
    address: '',
    phone: '',
    email: '',
    taxRate: 0,
    currency: 'USD',
    businessHours: ''
  });

  useEffect(() => {
    const storedSettings = localStorage.getItem('storeSettings');
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('storeSettings', JSON.stringify(settings));
    showToast('Store settings saved successfully', 'success');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Store className="w-6 h-6 mr-2" />
        <h1 className="text-2xl font-bold">Store Settings</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Store Name</label>
            <Input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <Input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <Input
              type="tel"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tax Rate (%)</label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={settings.taxRate}
              onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Currency</label>
            <Input
              type="text"
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Business Hours</label>
            <Input
              type="text"
              value={settings.businessHours}
              onChange={(e) => setSettings({ ...settings, businessHours: e.target.value })}
              placeholder="e.g., Mon-Fri: 9AM-6PM"
              required
            />
          </div>

          <div className="pt-4">
            <Button type="submit">Save Settings</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoreSettings;
