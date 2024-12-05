import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: 'postgres',
    password: '123456',
    host: 'localhost',
    port: 5432,
    database: 'stockpos1'
});

async function updateAdminPermissions() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Update admin role (id = 1) with full permissions
        await client.query(`
            UPDATE roles 
            SET permissions = ARRAY[
                'manage_inventory',
                'view_inventory',
                'manage_pos',
                'process_refunds',
                'manage_employees',
                'view_employees',
                'manage_suppliers',
                'view_suppliers',
                'manage_categories',
                'view_categories',
                'manage_reports',
                'view_reports',
                'manage_roles',
                'manage_settings',
                'view_dashboard',
                'manage_users',
                'manage_sales',
                'view_sales',
                'manage_purchases',
                'view_purchases'
            ]
            WHERE id = 1;  -- Admin role
        `);

        // Verify the update
        const result = await client.query('SELECT permissions FROM roles WHERE id = 1');
        console.log('Updated admin permissions:', result.rows[0].permissions);

        await client.query('COMMIT');
        console.log('Admin permissions updated successfully');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error updating admin permissions:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

updateAdminPermissions().catch(console.error);
