import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
    user: 'postgres',
    password: '123456',
    host: 'localhost',
    port: 5432,
    database: 'postgres' // Connect to default database first
};

const dbName = 'stockpos1';

async function initializeDatabase() {
    const client = new pg.Client(config);
    
    try {
        await client.connect();
        
        // Drop database if exists
        await client.query(`DROP DATABASE IF EXISTS ${dbName};`);
        console.log('Dropped existing database if it existed');
        
        // Create new database
        await client.query(`CREATE DATABASE ${dbName};`);
        console.log('Created new database');
        
        // Close connection to postgres database
        await client.end();
        
        // Connect to new database
        const newDbClient = new pg.Client({
            ...config,
            database: dbName
        });
        await newDbClient.connect();
        
        // Read and execute migration files
        const migrationPath = path.join(__dirname, '..', '..', 'migrations');
        const files = ['001_initial_schema.sql', '002_seed_data.sql', '003_add_roles_and_permissions.sql'];
        
        for (const file of files) {
            const sql = fs.readFileSync(path.join(migrationPath, file), 'utf8');
            await newDbClient.query(sql);
            console.log(`Executed migration: ${file}`);
        }
        
        await newDbClient.end();
        console.log('Database initialization completed successfully');
        
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initializeDatabase();
