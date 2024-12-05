import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: 'postgres',
    password: '123456',
    host: 'localhost',
    port: 5432,
    database: 'stockpos1'
});

const defaultRoles = [
    {
        id: 1,
        name: 'Administrator',
        permissions: [
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
            'view_dashboard'
        ]
    },
    {
        id: 2,
        name: 'Employee',
        permissions: [
            'view_inventory',
            'view_pos',
            'view_reports',
            'view_dashboard'
        ]
    },
    {
        id: 3,
        name: 'Cashier',
        permissions: [
            'view_inventory',
            'manage_pos',
            'process_sales',
            'view_reports',
            'view_dashboard'
        ]
    }
];

async function initRolesTable() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Create roles table if it doesn't exist
        await client.query(`
            CREATE TABLE IF NOT EXISTS roles (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                permissions TEXT[] NOT NULL DEFAULT '{}'
            )
        `);

        // Insert default roles if they don't exist
        for (const role of defaultRoles) {
            await client.query(`
                INSERT INTO roles (id, name, permissions)
                VALUES ($1, $2, $3)
                ON CONFLICT (id) DO UPDATE
                SET name = EXCLUDED.name,
                    permissions = EXCLUDED.permissions
            `, [role.id, role.name, role.permissions]);
        }

        await client.query('COMMIT');
        console.log('Roles table initialized successfully');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error initializing roles table:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

initRolesTable().catch(console.error);
