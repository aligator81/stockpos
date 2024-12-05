import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: 'postgres',
    password: '123456',
    host: 'localhost',
    port: 5432,
    database: 'stockpos1'
});

async function initEmployeesTable() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Drop the table if it exists
        await client.query('DROP TABLE IF EXISTS employees');

        // Create employees table
        await client.query(`
            CREATE TABLE employees (
                id VARCHAR(255) PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(50),
                role_id INTEGER REFERENCES roles(id),
                hire_date DATE NOT NULL,
                username VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                is_active BOOLEAN DEFAULT true
            )
        `);

        await client.query('COMMIT');
        console.log('Employees table initialized successfully');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error initializing employees table:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

initEmployeesTable().catch(console.error);
