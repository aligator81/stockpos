export const createBackup = () => {
  const backup: Record<string, any> = {};
  const timestamp = new Date().toISOString();

  // List of keys to backup
  const keysToBackup = [
    'products',
    'categories',
    'suppliers',
    'employees',
    'sales',
    'settings',
    'userPreferences'
  ];

  for (const key of keysToBackup) {
    const data = localStorage.getItem(key);
    if (data) {
      backup[key] = JSON.parse(data);
    }
  }

  // Create backup file
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = `pos_backup_${timestamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return true;
};

export const restoreBackup = async (file: File): Promise<boolean> => {
  try {
    const text = await file.text();
    const backup = JSON.parse(text);

    // Validate backup data
    const requiredKeys = ['products', 'categories', 'suppliers'];
    if (!requiredKeys.every(key => key in backup)) {
      throw new Error('Invalid backup file');
    }

    // Clear current data
    localStorage.clear();

    // Restore data
    Object.entries(backup).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });

    return true;
  } catch (error) {
    console.error('Failed to restore backup:', error);
    return false;
  }
};