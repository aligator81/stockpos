import { useState, useEffect, useRef } from 'react';
import { Upload, X, Save, Image as ImageIcon } from 'lucide-react';
import { showToast } from '../utils/toast';

interface ReceiptSettings {
  logo?: string;
  storeName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  headerNote: string;
  footerNote: string;
  showLogo: boolean;
}

const defaultSettings: ReceiptSettings = {
  storeName: 'AtoZ Store',
  address: '',
  phone: '',
  email: '',
  website: '',
  headerNote: 'Thank you for shopping with us!',
  footerNote: 'Please come again!',
  showLogo: true,
};

export default function ReceiptSettings() {
  const [settings, setSettings] = useState<ReceiptSettings>(defaultSettings);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedSettings = localStorage.getItem('receiptSettings');
    if (storedSettings) {
      const parsed = JSON.parse(storedSettings);
      setSettings(parsed);
      if (parsed.logo) {
        setPreviewLogo(parsed.logo);
      }
    }
  }, []);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast.error('Please upload an image file');
      return;
    }

    if (file.size > 500000) { // 500KB limit
      showToast.error('Image size should be less than 500KB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreviewLogo(dataUrl);
      setSettings(prev => ({ ...prev, logo: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setPreviewLogo(null);
    setSettings(prev => ({ ...prev, logo: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    try {
      localStorage.setItem('receiptSettings', JSON.stringify(settings));
      showToast.success('Receipt settings saved successfully');
    } catch (error) {
      showToast.error('Failed to save settings');
      console.error('Save error:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Receipt Settings</h1>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Save size={20} />
          Save Settings
        </button>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-6">
        {/* Logo Section */}
        <div>
          <h2 className="text-lg font-medium mb-4">Receipt Logo</h2>
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <label className="relative cursor-pointer">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                  <div className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                    <Upload size={20} />
                    Upload Logo
                  </div>
                </label>
                {previewLogo && (
                  <button
                    onClick={removeLogo}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <X size={20} />
                    Remove
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Recommended size: 300x100px. Maximum file size: 500KB
              </p>
            </div>
            <div className="w-48 h-24 border rounded-lg flex items-center justify-center bg-gray-50">
              {previewLogo ? (
                <img
                  src={previewLogo}
                  alt="Receipt logo"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        {/* Store Information */}
        <div>
          <h2 className="text-lg font-medium mb-4">Store Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Name
              </label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="text"
                value={settings.website}
                onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Custom Notes */}
        <div>
          <h2 className="text-lg font-medium mb-4">Custom Notes</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Header Note
              </label>
              <input
                type="text"
                value={settings.headerNote}
                onChange={(e) => setSettings({ ...settings, headerNote: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Appears at the top of the receipt"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Footer Note
              </label>
              <input
                type="text"
                value={settings.footerNote}
                onChange={(e) => setSettings({ ...settings, footerNote: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Appears at the bottom of the receipt"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}