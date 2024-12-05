import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: 'postgres',
    password: '123456',
    host: 'localhost',
    port: 5432,
    database: 'stockpos1'
});

async function fixRoles() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Update users table to ensure role column is INTEGER
        await client.query(`
            ALTER TABLE users 
            ALTER COLUMN role TYPE INTEGER 
            USING CASE 
                WHEN role = 'admin' THEN 1
                WHEN role = 'user' THEN 2
                ELSE 2
            END::INTEGER
        `);

        // Ensure default roles exist
        await client.query(`
            INSERT INTO roles (id, name, permissions)
            VALUES 
                (1, 'Administrator', 
                ARRAY['manage_inventory', 'view_inventory', 'manage_pos', 'manage_employees']),
                (2, 'Regular User', 
                ARRAY['view_inventory'])
            ON CONFLICT (id) DO NOTHING
        `);

        // Set default role for users without role
        await client.query(`
            UPDATE users 
            SET role = 2 
            WHERE role IS NULL
        `);

        await client.query('COMMIT');
        console.log('Roles fixed successfully');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error fixing roles:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

fixRoles();
