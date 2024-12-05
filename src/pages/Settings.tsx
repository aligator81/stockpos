import React from 'react';
import { Link } from 'react-router-dom';
import { Settings as SettingsIcon, Receipt, Store, Bell } from 'lucide-react';

const settingsMenu = [
  {
    title: 'Receipt Settings',
    description: 'Configure receipt layout and information',
    icon: <Receipt className="w-6 h-6" />,
    path: '/settings/receipt'
  },
  {
    title: 'Store Settings',
    description: 'Manage store information and preferences',
    icon: <Store className="w-6 h-6" />,
    path: '/settings/store'
  },
  {
    title: 'Notifications',
    description: 'Configure system notifications and alerts',
    icon: <Bell className="w-6 h-6" />,
    path: '/settings/notifications'
  }
];

const Settings: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <SettingsIcon className="w-6 h-6 mr-2" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsMenu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center mb-2">
              <div className="text-gray-600 mr-2">{item.icon}</div>
              <h2 className="text-lg font-semibold">{item.title}</h2>
            </div>
            <p className="text-gray-600">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Settings;
