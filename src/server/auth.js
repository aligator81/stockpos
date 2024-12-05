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

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt for username:', username);

    try {
        // Get user and role information in a single query
        const result = await pool.query(
            `SELECT 
                u.id::text as user_id,
                u.username,
                u.password_hash,
                u.email,
                u.full_name,
                u.role,
                r.id as role_id,
                r.name as role_name,
                r.permissions::text[] as permissions
             FROM users u 
             LEFT JOIN roles r ON u.role = r.id 
             WHERE u.username = $1`,
            [username]
        );

        console.log('Database query result:', result.rows);

        const user = result.rows[0];

        // Check if user exists
        if (!user) {
            console.log('User not found:', username);
            return res.status(401).send('Invalid username or password');
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        console.log('Password validation result:', validPassword);
        
        if (!validPassword) {
            console.log('Invalid password for user:', username);
            return res.status(401).send('Invalid username or password');
        }

        // Prepare user response
        const userResponse = {
            data: {
                id: user.user_id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                role: {
                    id: user.role_id.toString(),
                    name: user.role_name,
                    permissions: user.permissions || []
                },
                is_active: true
            }
        };

        console.log('Sending user response:', userResponse);
        res.json(userResponse);
    } catch (error) {
        console.error('Login error details:', {
            message: error.message,
            stack: error.stack,
            error
        });
        res.status(500).send('Internal server error: ' + error.message);
    }
});

// Route to create admin user
router.post('/setup-admin', async (req, res) => {
    try {
        // Create admin role if it doesn't exist
        const roleResult = await pool.query(`
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
            RETURNING id
        `);

        // Create admin user
        const password = 'admin123';
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const result = await pool.query(`
            INSERT INTO users (username, password_hash, email, full_name, role)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (username) DO UPDATE
            SET password_hash = EXCLUDED.password_hash,
                email = EXCLUDED.email,
                full_name = EXCLUDED.full_name,
                role = EXCLUDED.role
            RETURNING id, username, email, full_name, role
        `, ['admin', hashedPassword, 'admin@example.com', 'Admin User', 1]);

        console.log('Admin user created:', result.rows[0]);
        res.json({ message: 'Admin user created successfully', user: result.rows[0] });
    } catch (error) {
        console.error('Setup admin error:', error);
        res.status(500).send('Error setting up admin user: ' + error.message);
    }
});

export default router;
