import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

// Use hardcoded values that we know work
const config = {
    user: 'postgres',
    password: '123456',
    host: 'localhost',
    port: 5432,
    database: 'postgres' // Connect to default database first
};

async function executeSQL(client, sql) {
    const statements = sql
        .split(';')
        .map(statement => statement.trim())
        .filter(statement => statement.length > 0);

    for (const statement of statements) {
        await client.query(statement + ';');
    }
}

async function setupDatabase() {
    const client = new Client(config);
    
    try {
        // Connect to default database
        await client.connect();
        console.log('Connected to PostgreSQL');

        // Check if database exists
        const dbCheckResult = await client.query(
            "SELECT 1 FROM pg_database WHERE datname = 'stockpos1'"
        );
        
        if (dbCheckResult.rows.length === 0) {
            // Create database if it doesn't exist
            await client.query('CREATE DATABASE stockpos1');
            console.log('Database created successfully');
        } else {
            console.log('Database already exists');
        }

        // Close connection to default database
        await client.end();

        // Connect to our database
        const dbClient = new Client({
            ...config,
            database: 'stockpos1'
        });
        await dbClient.connect();
        console.log('Connected to application database');

        // Start transaction
        await dbClient.query('BEGIN');

        try {
            // Drop existing tables if they exist
            console.log('Dropping existing tables...');
            const dropTables = `
                DROP TABLE IF EXISTS inventory_transactions CASCADE;
                DROP TABLE IF EXISTS sale_items CASCADE;
                DROP TABLE IF EXISTS sales CASCADE;
                DROP TABLE IF EXISTS purchase_items CASCADE;
                DROP TABLE IF EXISTS purchases CASCADE;
                DROP TABLE IF EXISTS suppliers CASCADE;
                DROP TABLE IF EXISTS products CASCADE;
                DROP TABLE IF EXISTS categories CASCADE;
                DROP TABLE IF EXISTS users CASCADE;
            `;
            await executeSQL(dbClient, dropTables);
            console.log('Tables dropped successfully');

            // Read and execute schema migration
            console.log('Creating database schema...');
            const schemaPath = path.join(__dirname, '..', '..', 'migrations', '001_initial_schema.sql');
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');
            await executeSQL(dbClient, schemaSql);
            console.log('Schema created successfully');

            // Read and execute seed data migration
            console.log('Inserting seed data...');
            const seedPath = path.join(__dirname, '..', '..', 'migrations', '002_seed_data.sql');
            const seedSql = fs.readFileSync(seedPath, 'utf8');
            await executeSQL(dbClient, seedSql);
            console.log('Seed data inserted successfully');

            // Commit transaction
            await dbClient.query('COMMIT');
            console.log('Database setup completed successfully');
        } catch (err) {
            // Rollback transaction on error
            await dbClient.query('ROLLBACK');
            throw err;
        } finally {
            await dbClient.end();
        }

    } catch (err) {
        console.error('Error setting up database:', err);
        if (err.code) {
            console.error('Error code:', err.code);
            if (err.position) {
                console.error('Error position:', err.position);
                console.error('Error detail:', err.detail);
            }
        }
        process.exit(1);
    }
}

setupDatabase();
