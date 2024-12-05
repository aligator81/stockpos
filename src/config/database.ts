import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Database configuration with fallback values
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '123456',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'stockpos1',
    ssl: false,
    connectionTimeoutMillis: 8000,
});

// Test the connection and handle errors properly
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Initial connection test
async function testDatabaseConnection() {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT version()');
        console.log('Successfully connected to PostgreSQL!');
        console.log('Database version:', result.rows[0].version);
        client.release();
    } catch (err) {
        console.error('Database connection error:', err);
        if (err.code === '28P01') {
            console.error('Authentication failed. Please check your database credentials in .env file');
        } else if (err.code === '3D000') {
            console.error('Database does not exist. Please create the database first');
        } else if (err.code === 'ECONNREFUSED') {
            console.error('Connection refused. Please check if PostgreSQL is running');
        }
        // Don't exit process here as the application might recover
    }
}

// Run the test but don't block initialization
testDatabaseConnection();

export default pool;
