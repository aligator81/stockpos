import pg from 'pg';
const { Client } = pg;

const client = new Client({
    user: 'postgres',
    password: '123456',
    host: 'localhost',
    port: 5432,
    database: 'postgres'
});

async function testConnection() {
    try {
        await client.connect();
        console.log('Connected successfully');
        
        const res = await client.query('SELECT version()');
        console.log('PostgreSQL version:', res.rows[0].version);
        
        await client.end();
    } catch (err) {
        console.error('Connection error:', err);
    }
}

testConnection();
