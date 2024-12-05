import pkg from 'pg';
const { Client } = pkg;

async function setupDatabase() {
    // Connect to postgres database to create our app database
    const client = new Client({
        user: 'postgres',
        password: '123456',
        host: 'localhost',
        port: 5432,
        database: 'postgres'
    });

    try {
        await client.connect();
        
        // Check if database exists
        const checkDb = await client.query(
            "SELECT 1 FROM pg_database WHERE datname = 'stockpos1'"
        );

        // Create database if it doesn't exist
        if (checkDb.rows.length === 0) {
            await client.query('CREATE DATABASE stockpos1');
            console.log('Database created successfully');
        } else {
            console.log('Database already exists');
        }
    } catch (err) {
        console.error('Error setting up database:', err);
    } finally {
        await client.end();
    }
}

setupDatabase();
