import pg from 'pg';

const { Pool } = pg;

// Force SSL to false and set a longer connection timeout
const pool = new Pool({
    user: 'postgres',
    password: '123456',
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    ssl: false,
    connectionTimeoutMillis: 8000,
});

async function testConnection() {
    try {
        console.log('Connecting to PostgreSQL...');
        const client = await pool.connect();
        console.log('Successfully connected!');
        
        const result = await client.query('SELECT version()');
        console.log('PostgreSQL version:', result.rows[0].version);
        
        client.release();
    } catch (err) {
        console.error('Error details:', {
            name: err.name,
            message: err.message,
            code: err.code,
            detail: err.detail
        });
    } finally {
        await pool.end();
    }
}

testConnection();
