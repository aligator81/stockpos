// Clear all data from localStorage
const clearLocalStorage = () => {
    // List of all keys we want to clear
    const keys = [
        'categories',
        'suppliers',
        'roles',
        'products',
        'employees',
        'sales',
        'storeSettings',
        'users'
    ];

    // Clear each key
    keys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`Cleared ${key} from localStorage`);
    });

    console.log('All data has been cleared from localStorage');
};

// Run the cleanup
clearLocalStorage();
