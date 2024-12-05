import pool from '../config/database';
import { QueryResult } from 'pg';

/**
 * Execute a database query with proper error handling
 * @param query The SQL query to execute
 * @param params Optional parameters for the query
 * @returns Promise with the query result
 */
export async function executeQuery<T = any>(
    query: string,
    params?: any[]
): Promise<QueryResult<T>> {
    const client = await pool.connect();
    try {
        const result = await client.query(query, params);
        return result;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Execute a transaction with proper error handling
 * @param callback Function that executes queries within the transaction
 * @returns Promise with the result of the transaction
 */
export async function executeTransaction<T>(
    callback: (client: any) => Promise<T>
): Promise<T> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Transaction error:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Example usage:
/*
// Simple query
const result = await executeQuery('SELECT * FROM users WHERE id = $1', [userId]);

// Transaction
const result = await executeTransaction(async (client) => {
    const result1 = await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [amount, fromAccount]);
    const result2 = await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [amount, toAccount]);
    return { result1, result2 };
});
*/
