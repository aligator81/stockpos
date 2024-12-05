import pg from 'pg';

const { Client } = pg;

const config = {
    user: 'postgres',
    password: '123456',
    host: 'localhost',
    port: 5432,
    database: 'stockpos1'
};

async function clearAllData() {
    const client = new Client(config);
    
    try {
        await client.connect();
        console.log('Connected to database');

        // Start transaction
        await client.query('BEGIN');

        try {
            // Delete data from all tables in the correct order to respect foreign key constraints
            console.log('Deleting data from all tables...');
            
            await client.query('DELETE FROM inventory_transactions');
            await client.query('DELETE FROM sale_items');
            await client.query('DELETE FROM sales');
            await client.query('DELETE FROM purchase_items');
            await client.query('DELETE FROM purchases');
            await client.query('DELETE FROM products');
            await client.query('DELETE FROM categories');
            await client.query('DELETE FROM suppliers');
            await client.query('DELETE FROM users WHERE username != \'admin\''); // Keep admin user

            // Reset all sequences
            console.log('Resetting sequences...');
            const tables = [
                'inventory_transactions',
                'sale_items',
                'sales',
                'purchase_items',
                'purchases',
                'products',
                'categories',
                'suppliers',
                'users'
            ];

            for (const table of tables) {
                await client.query(`ALTER SEQUENCE ${table}_id_seq RESTART WITH 1`);
            }

            // Commit transaction
            await client.query('COMMIT');
            console.log('All data has been cleared successfully');

            // Verify empty tables
            const counts = await client.query(`
                SELECT 
                    (SELECT COUNT(*) FROM users) as users_count,
                    (SELECT COUNT(*) FROM categories) as categories_count,
                    (SELECT COUNT(*) FROM products) as products_count,
                    (SELECT COUNT(*) FROM suppliers) as suppliers_count,
                    (SELECT COUNT(*) FROM sales) as sales_count,
                    (SELECT COUNT(*) FROM purchases) as purchases_count;
            `);
            
            console.log('\nCurrent record counts:');
            console.log(`- Users: ${counts.rows[0].users_count}`);
            console.log(`- Categories: ${counts.rows[0].categories_count}`);
            console.log(`- Products: ${counts.rows[0].products_count}`);
            console.log(`- Suppliers: ${counts.rows[0].suppliers_count}`);
            console.log(`- Sales: ${counts.rows[0].sales_count}`);
            console.log(`- Purchases: ${counts.rows[0].purchases_count}`);

        } catch (err) {
            // Rollback transaction on error
            await client.query('ROLLBACK');
            throw err;
        }

    } catch (err) {
        console.error('Error:', err);
        if (err.position) {
            console.error('Error position:', err.position);
        }
        if (err.detail) {
            console.error('Error detail:', err.detail);
        }
    } finally {
        await client.end();
    }
}

clearAllData();
