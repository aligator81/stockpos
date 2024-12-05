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

// Get all roles
router.get('/', async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM roles ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching roles:', err);
        res.status(500).json({ error: 'Error fetching roles' });
    } finally {
        client.release();
    }
});

// Get role by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM roles WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Role not found' });
        } else {
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error('Error fetching role:', err);
        res.status(500).json({ error: 'Error fetching role' });
    } finally {
        client.release();
    }
});

// Create new role
router.post('/', async (req, res) => {
    const { name, permissions } = req.body;
    const client = await pool.connect();
    try {
        const result = await client.query(
            'INSERT INTO roles (name, permissions) VALUES ($1, $2) RETURNING *',
            [name, permissions]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating role:', err);
        res.status(500).json({ error: 'Error creating role' });
    } finally {
        client.release();
    }
});

// Update role
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, permissions } = req.body;
    const client = await pool.connect();
    try {
        const result = await client.query(
            'UPDATE roles SET name = $1, permissions = $2 WHERE id = $3 RETURNING *',
            [name, permissions, id]
        );
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Role not found' });
        } else {
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error('Error updating role:', err);
        res.status(500).json({ error: 'Error updating role' });
    } finally {
        client.release();
    }
});

// Delete role
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        await client.query('DELETE FROM roles WHERE id = $1', [id]);
        res.json({ message: 'Role deleted successfully' });
    } catch (err) {
        console.error('Error deleting role:', err);
        res.status(500).json({ error: 'Error deleting role' });
    } finally {
        client.release();
    }
});

export default router;
