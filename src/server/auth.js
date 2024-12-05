import express from 'express';
import pg from 'pg';
import bcrypt from 'bcrypt';

const router = express.Router();

const config = {
    user: 'postgres',
    password: '123456',
    host: 'localhost',
    port: 5432,
    database: 'stockpos1'
};

const pool = new pg.Pool(config);

// Login endpoint
router.post('/login', async (req, res) => {
    console.log('Login request received:', req.body);
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        // Get user and role information in a single query
        const result = await pool.query(
            `SELECT 
                u.id,
                u.username,
                u.password_hash,
                u.email,
                u.full_name,
                u.role,
                r.name as role_name,
                r.permissions
             FROM users u 
             LEFT JOIN roles r ON r.id = u.role
             WHERE u.username = $1`,
            [username]
        );

        const user = result.rows[0];
        console.log('User found:', user ? 'Yes' : 'No');

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        console.log('Password valid:', validPassword);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const userResponse = {
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                role: {
                    id: user.role,
                    name: user.role_name,
                    permissions: user.permissions || []
                },
                is_active: true
            }
        };

        console.log('Sending response:', userResponse);
        res.json(userResponse);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Setup admin endpoint
router.post('/setup-admin', async (req, res) => {
    try {
        // Create admin role if it doesn't exist
        await pool.query(`
            INSERT INTO roles (id, name, permissions)
            VALUES (
                1,
                'Administrator',
                ARRAY[
                    'manage_inventory',
                    'view_inventory',
                    'manage_pos',
                    'process_refunds',
                    'manage_employees',
                    'view_employees',
                    'manage_suppliers',
                    'view_suppliers',
                    'manage_categories',
                    'view_categories',
                    'manage_reports',
                    'view_reports',
                    'manage_roles',
                    'manage_settings',
                    'view_dashboard'
                ]
            )
            ON CONFLICT (id) DO NOTHING
        `);

        // Create admin user
        const password = 'admin123';
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await pool.query(`
            INSERT INTO users (username, password_hash, email, full_name, role)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (username) DO UPDATE
            SET password_hash = EXCLUDED.password_hash
            RETURNING id, username, email, full_name, role
        `, ['admin', hashedPassword, 'admin@example.com', 'Admin User', 1]);

        res.json({ message: 'Admin user created successfully' });
    } catch (error) {
        console.error('Setup admin error:', error);
        res.status(500).json({ error: 'Error setting up admin user' });
    }
});

export default router;
