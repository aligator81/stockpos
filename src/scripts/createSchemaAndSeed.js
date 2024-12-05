import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

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

async function executeSQL(client, sql) {
    const statements = sql
        .split(/;\s*$/m)
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

    for (const statement of statements) {
        try {
            await client.query(statement);
        } catch (err) {
            console.error('Error executing statement:', statement);
            throw err;
        }
    }
}

async function setupDatabase() {
    const client = new Client(config);
    
    try {
        await client.connect();
        console.log('Connected to database');

        // Drop existing tables
        console.log('Dropping existing tables...');
        const dropTables = `
            DROP TABLE IF EXISTS inventory_transactions CASCADE;
            DROP TABLE IF EXISTS sale_items CASCADE;
            DROP TABLE IF EXISTS sales CASCADE;
            DROP TABLE IF EXISTS purchase_items CASCADE;
            DROP TABLE IF EXISTS purchases CASCADE;
            DROP TABLE IF EXISTS suppliers CASCADE;
            DROP TABLE IF EXISTS products CASCADE;
            DROP TABLE IF EXISTS categories CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
        `;
        await executeSQL(client, dropTables);
        console.log('Tables dropped successfully');

        // Create tables
        console.log('Creating tables...');
        await client.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                full_name VARCHAR(100),
                role VARCHAR(20) NOT NULL DEFAULT 'user',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                description TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                sku VARCHAR(50) UNIQUE,
                barcode VARCHAR(50) UNIQUE,
                category_id INTEGER REFERENCES categories(id),
                price DECIMAL(10,2) NOT NULL,
                cost_price DECIMAL(10,2),
                stock_quantity INTEGER NOT NULL DEFAULT 0,
                min_stock_level INTEGER DEFAULT 0,
                unit VARCHAR(20),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE suppliers (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                contact_person VARCHAR(100),
                email VARCHAR(255),
                phone VARCHAR(20),
                address TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE purchases (
                id SERIAL PRIMARY KEY,
                supplier_id INTEGER REFERENCES suppliers(id),
                total_amount DECIMAL(10,2) NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'pending',
                purchase_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE purchase_items (
                id SERIAL PRIMARY KEY,
                purchase_id INTEGER REFERENCES purchases(id),
                product_id INTEGER REFERENCES products(id),
                quantity INTEGER NOT NULL,
                unit_price DECIMAL(10,2) NOT NULL,
                total_price DECIMAL(10,2) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE sales (
                id SERIAL PRIMARY KEY,
                customer_name VARCHAR(100),
                total_amount DECIMAL(10,2) NOT NULL,
                payment_method VARCHAR(20),
                status VARCHAR(20) NOT NULL DEFAULT 'completed',
                sale_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE sale_items (
                id SERIAL PRIMARY KEY,
                sale_id INTEGER REFERENCES sales(id),
                product_id INTEGER REFERENCES products(id),
                quantity INTEGER NOT NULL,
                unit_price DECIMAL(10,2) NOT NULL,
                total_price DECIMAL(10,2) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE inventory_transactions (
                id SERIAL PRIMARY KEY,
                product_id INTEGER REFERENCES products(id),
                quantity INTEGER NOT NULL,
                type VARCHAR(20) NOT NULL,
                reference_id INTEGER,
                notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Tables created successfully');

        // Hash the admin password
        const saltRounds = 10;
        const adminPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

        // Insert seed data
        console.log('Inserting seed data...');
        
        // Insert admin user
        await client.query(
            `INSERT INTO users (username, password_hash, email, full_name, role)
             VALUES ($1, $2, $3, $4, $5)`,
            ['admin', hashedPassword, 'admin@example.com', 'Admin User', 'admin']
        );

        // Insert categories
        await client.query(`
            INSERT INTO categories (name, description)
            VALUES 
                ('Electronics', 'Electronic devices and accessories'),
                ('Groceries', 'Food and household items'),
                ('Clothing', 'Apparel and accessories')
        `);

        // Insert products
        await client.query(`
            INSERT INTO products (name, description, sku, barcode, category_id, price, cost_price, stock_quantity, min_stock_level, unit)
            VALUES 
                ('Laptop', 'High-performance laptop', 'LAP001', 'BAR001', 1, 999.99, 800.00, 10, 2, 'unit'),
                ('Smartphone', 'Latest model smartphone', 'PHO001', 'BAR002', 1, 699.99, 500.00, 15, 3, 'unit'),
                ('Rice', 'Premium quality rice', 'RIC001', 'BAR003', 2, 25.99, 20.00, 50, 10, 'kg'),
                ('T-Shirt', 'Cotton t-shirt', 'TSH001', 'BAR004', 3, 19.99, 10.00, 100, 20, 'unit')
        `);

        // Insert supplier
        await client.query(`
            INSERT INTO suppliers (name, contact_person, email, phone, address)
            VALUES (
                'Tech Suppliers Inc',
                'John Doe',
                'john@techsuppliers.com',
                '123-456-7890',
                '123 Tech Street, Silicon Valley, CA'
            )
        `);
        console.log('Seed data inserted successfully');

        // Verify tables and data
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

        // Verify data
        const counts = await client.query(`
            SELECT 
                (SELECT COUNT(*) FROM users) as users_count,
                (SELECT COUNT(*) FROM categories) as categories_count,
                (SELECT COUNT(*) FROM products) as products_count,
                (SELECT COUNT(*) FROM suppliers) as suppliers_count;
        `);
        
        console.log('\nInserted records:');
        console.log(`- Users: ${counts.rows[0].users_count}`);
        console.log(`- Categories: ${counts.rows[0].categories_count}`);
        console.log(`- Products: ${counts.rows[0].products_count}`);
        console.log(`- Suppliers: ${counts.rows[0].suppliers_count}`);

    } catch (err) {
        console.error('Error:', err);
        if (err.position) {
            console.error('Error position:', err.position);
        }
        if (err.detail) {
            console.error('Error detail:', err.detail);
        }
    } finally {
        await client.end();
    }
}

setupDatabase();
