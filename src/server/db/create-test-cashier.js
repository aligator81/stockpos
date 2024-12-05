import pkg from 'pg';
const { Pool } = pkg;
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({
    user: 'postgres',
    password: '123456',
    host: 'localhost',
    port: 5432,
    database: 'stockpos1'
});

async function createTestCashier() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const cashier = {
            id: uuidv4(),
            full_name: 'John Cashier',
            email: 'john.cashier@stockpos.com',
            phone: '123-456-7890',
            role_id: 3, // Cashier role
            hire_date: new Date(),
            username: 'johncashier',
            password_hash: '123456', // In production, this should be properly hashed
            is_active: true
        };

        // Insert the cashier
        const result = await client.query(`
            INSERT INTO employees 
            (id, full_name, email, phone, role_id, hire_date, username, password_hash, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `, [
            cashier.id,
            cashier.full_name,
            cashier.email,
            cashier.phone,
            cashier.role_id,
            cashier.hire_date,
            cashier.username,
            cashier.password_hash,
            cashier.is_active
        ]);

        await client.query('COMMIT');
        console.log('Test cashier created successfully:', result.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error creating test cashier:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

createTestCashier().catch(console.error);
