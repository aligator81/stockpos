import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcrypt';

const pool = new Pool({
    user: 'postgres',
    password: '123456',
    host: 'localhost',
    port: 5432,
    database: 'stockpos1'
});

async function fixPermissions() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Update roles with correct permissions
        await client.query(`
            UPDATE roles 
            SET permissions = ARRAY[
                'manage_users',
                'manage_inventory',
                'view_inventory',
                'manage_sales',
                'view_sales',
                'manage_purchases',
                'view_purchases',
                'manage_reports',
                'view_reports',
                'manage_settings'
            ]
            WHERE id = 1;  -- Admin role
        `);

        await client.query(`
            UPDATE roles 
            SET permissions = ARRAY[
                'view_inventory',
                'view_sales',
                'view_reports'
            ]
            WHERE id = 2;  -- Regular user role
        `);

        // Ensure admin user exists with correct role
        const adminPassword = await bcrypt.hash('admin', 10);
        await client.query(`
            INSERT INTO users (username, password_hash, email, full_name, role)
            VALUES ('admin', $1, 'admin@stockpos.com', 'Administrator', 1)
            ON CONFLICT (username) 
            DO UPDATE SET role = 1, password_hash = $1
        `, [adminPassword]);

        await client.query('COMMIT');
        console.log('Permissions fixed successfully');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error fixing permissions:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

fixPermissions().catch(console.error);
