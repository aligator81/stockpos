-- Up Migration

-- Add role column to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user';
    END IF;
END $$;

-- Create roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions TEXT[] NOT NULL DEFAULT '{}',
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles if they don't exist
INSERT INTO roles (id, name, description, permissions, is_system)
VALUES 
    ('admin', 'Administrator', 'Full system access', 
    ARRAY[
        'manage_inventory',
        'view_inventory',
        'manage_pos',
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
        'process_refunds',
        'view_dashboard'
    ], true)
ON CONFLICT (id) DO NOTHING;

-- Insert default admin user if it doesn't exist
INSERT INTO users (username, password_hash, email, full_name, role)
VALUES (
    'admin',
    '$2b$10$rYkT5.ZOE9WxWPm1VPCWxONXhxNVEkNENGbpKJ.jFb7ZjVwZqNBPK', -- password: admin123
    'admin@example.com',
    'Admin User',
    'admin'
)
ON CONFLICT (username) DO NOTHING;

-- Down Migration
DROP TABLE IF EXISTS roles;
ALTER TABLE users DROP COLUMN IF EXISTS role;
