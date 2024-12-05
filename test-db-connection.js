import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: 'postgres',
    password: '123456',
    host: 'localhost',
    port: 5432,
    database: 'stockpos1'
});

async function testConnection() {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        console.log('Database connection successful!');
        console.log('Current timestamp:', result.rows[0].now);
        client.release();
    } catch (err) {
        console.error('Database connection error:', err);
        if (err.code === 'ECONNREFUSED') {
            console.error('Make sure PostgreSQL is running on port 5432');
        } else if (err.code === '28P01') {
            console.error('Invalid username or password');
        } else if (err.code === '3D000') {
            console.error('Database "stockpos1" does not exist');
        }
    } finally {
        await pool.end();
    }
}

testConnection();
