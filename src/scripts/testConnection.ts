import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '123456',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'stockpos1',
    ssl: false,
    connectionTimeoutMillis: 8000,
});

async function testConnection() {
    try {
        console.log('Connecting to PostgreSQL...');
        const client = await pool.connect();
        console.log('Successfully connected to PostgreSQL!');
        
        // Test the connection by getting database version
        const versionResult = await client.query('SELECT version()');
        console.log('PostgreSQL version:', versionResult.rows[0].version);
        
        // Try to create the database if it doesn't exist
        try {
            await client.query(`CREATE DATABASE ${process.env.DB_NAME || 'stockpos1'}`);
            console.log(`Database ${process.env.DB_NAME || 'stockpos1'} created successfully`);
        } catch (err: any) {
            if (err.code === '42P04') {
                console.log(`Database ${process.env.DB_NAME || 'stockpos1'} already exists`);
            } else {
                throw err;
            }
        }
        
        client.release();
    } catch (err: any) {
        console.error('Connection error:', err.message);
        if (err.code === '28P01') {
            console.error('Authentication failed. Please check your username and password.');
        } else if (err.code === '3D000') {
            console.error('Database does not exist. Attempting to create it...');
        } else if (err.code === 'ECONNREFUSED') {
            console.error('Connection refused. Please check if PostgreSQL is running.');
        }
        throw err;
    } finally {
        await pool.end();
    }
}

testConnection();
