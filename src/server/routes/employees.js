import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;

const router = express.Router();

const pool = new Pool({
    user: 'postgres',
    password: '123456',
    host: 'localhost',
    port: 5432,
    database: 'stockpos1'
});

// Get all employees with their roles
router.get('/', async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT 
                e.id,
                e.full_name,
                e.email,
                e.phone,
                e.hire_date,
                e.username,
                e.is_active,
                r.id as role_id,
                r.name as role_name,
                r.permissions as role_permissions
            FROM employees e
            LEFT JOIN roles r ON e.role_id = r.id
            ORDER BY e.full_name
        `);

        const employees = result.rows.map(row => ({
            id: row.id,
            name: row.full_name,
            email: row.email,
            phone: row.phone,
            role: {
                id: row.role_id,
                name: row.role_name,
                permissions: row.role_permissions || []
            },
            hireDate: row.hire_date,
            username: row.username,
            isActive: row.is_active
        }));

        res.json(employees);
    } catch (err) {
        console.error('Error fetching employees:', err);
        res.status(500).json({ error: 'Error fetching employees' });
    } finally {
        client.release();
    }
});

// Create new employee
router.post('/', async (req, res) => {
    const { id, name, email, phone, role, hireDate, username, password, isActive } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Check if email or username already exists
        const existingUser = await client.query(
            'SELECT * FROM employees WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (existingUser.rows.length > 0) {
            throw new Error('Email or username already exists');
        }

        // Insert the new employee
        const result = await client.query(`
            INSERT INTO employees 
            (id, full_name, email, phone, role_id, hire_date, username, password_hash, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `, [
            id,
            name,
            email,
            phone,
            role.id,
            hireDate,
            username,
            password,
            isActive
        ]);

        // Get the role details
        const roleResult = await client.query(
            'SELECT * FROM roles WHERE id = $1',
            [role.id]
        );

        await client.query('COMMIT');

        const employee = {
            ...result.rows[0],
            name: result.rows[0].full_name,
            role: roleResult.rows[0]
        };

        res.status(201).json(employee);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error creating employee:', err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// Delete employee
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM employees WHERE id = $1', [id]);
        await client.query('COMMIT');
        res.json({ message: 'Employee deleted successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error deleting employee:', err);
        res.status(500).json({ error: 'Error deleting employee' });
    } finally {
        client.release();
    }
});

// Toggle employee status
router.patch('/:id/toggle-status', async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const result = await client.query(
            'UPDATE employees SET is_active = NOT is_active WHERE id = $1 RETURNING *',
            [id]
        );
        await client.query('COMMIT');
        res.json(result.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error toggling employee status:', err);
        res.status(500).json({ error: 'Error toggling employee status' });
    } finally {
        client.release();
    }
});

export default router;
