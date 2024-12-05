import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

const config = {
    user: 'postgres',
    password: '123456',
    host: 'localhost',
    port: 5432,
    database: 'stockpos1'
};

async function createSchema() {
    const client = new Client(config);
    
    try {
        await client.connect();
        console.log('Connected to database');

        // Read schema file
        const schemaPath = path.join(__dirname, '..', '..', 'migrations', '001_initial_schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Execute schema creation
        console.log('Creating schema...');
        await client.query(schema);
        console.log('Schema created successfully');

        // Verify tables were created
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        
        console.log('\nCreated tables:');
        tables.rows.forEach(row => {
            console.log(`- ${row.table_name}`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

createSchema();
