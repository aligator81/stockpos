import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../contexts/ToastContext';

interface NotificationSettings {
  lowStockThreshold: number;
  emailNotifications: boolean;
  stockAlerts: boolean;
  salesReports: boolean;
  employeeActivity: boolean;
  systemUpdates: boolean;
}

const NotificationSettings: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>({
    lowStockThreshold: 10,
    emailNotifications: true,
    stockAlerts: true,
    salesReports: true,
    employeeActivity: false,
    systemUpdates: true
  });

  useEffect(() => {
    const storedSettings = localStorage.getItem('notificationSettings');
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    showToast('Notification settings saved successfully', 'success');
  };

  const toggleSetting = (key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Bell className="w-6 h-6 mr-2" />
        <h1 className="text-2xl font-bold">Notification Settings</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Low Stock Threshold
            </label>
            <Input
              type="number"
              min="0"
              value={settings.lowStockThreshold}
              onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) })}
              className="w-full max-w-xs"
            />
            <p className="text-sm text-gray-500 mt-1">
              Get notified when product stock falls below this number
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <Button
                type="button"
                variant={settings.emailNotifications ? "default" : "outline"}
                onClick={() => toggleSetting('emailNotifications')}
              >
                {settings.emailNotifications ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Stock Alerts</h3>
                <p className="text-sm text-gray-500">Get notified about low stock</p>
              </div>
              <Button
                type="button"
                variant={settings.stockAlerts ? "default" : "outline"}
                onClick={() => toggleSetting('stockAlerts')}
              >
                {settings.stockAlerts ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Sales Reports</h3>
                <p className="text-sm text-gray-500">Daily sales report notifications</p>
              </div>
              <Button
                type="button"
                variant={settings.salesReports ? "default" : "outline"}
                onClick={() => toggleSetting('salesReports')}
              >
                {settings.salesReports ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Employee Activity</h3>
                <p className="text-sm text-gray-500">Track employee logins and actions</p>
              </div>
              <Button
                type="button"
                variant={settings.employeeActivity ? "default" : "outline"}
                onClick={() => toggleSetting('employeeActivity')}
              >
                {settings.employeeActivity ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">System Updates</h3>
                <p className="text-sm text-gray-500">Get notified about system updates</p>
              </div>
              <Button
                type="button"
                variant={settings.systemUpdates ? "default" : "outline"}
                onClick={() => toggleSetting('systemUpdates')}
              >
                {settings.systemUpdates ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit">Save Settings</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationSettings;
