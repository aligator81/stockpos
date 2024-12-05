import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: 'postgres',
    password: '123456',
    host: 'localhost',
    port: 5432,
    database: 'stockpos1'
});

async function fixDatabase() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // First, drop the default value constraint on the role column
        await client.query(`
            ALTER TABLE users 
            ALTER COLUMN role DROP DEFAULT;
        `);

        // Update existing roles to integers
        await client.query(`
            UPDATE users 
            SET role = CASE 
                WHEN role = 'admin' THEN '1'
                ELSE '2'
            END;
        `);

        // Now change the column type to integer
        await client.query(`
            ALTER TABLE users 
            ALTER COLUMN role TYPE INTEGER USING role::INTEGER;
        `);

        // Set the new default value
        await client.query(`
            ALTER TABLE users 
            ALTER COLUMN role SET DEFAULT 2;
        `);

        // Ensure roles table has correct records
        await client.query(`
            INSERT INTO roles (id, name, permissions)
            VALUES 
                (1, 'Administrator', ARRAY['manage_inventory', 'view_inventory', 'manage_pos', 'manage_employees']),
                (2, 'Regular User', ARRAY['view_inventory'])
            ON CONFLICT (id) DO UPDATE 
            SET name = EXCLUDED.name,
                permissions = EXCLUDED.permissions;
        `);

        await client.query('COMMIT');
        console.log('Database fixed successfully');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error fixing database:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

fixDatabase().catch(console.error);
