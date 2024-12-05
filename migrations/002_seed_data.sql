-- Up Migration

-- Insert test user
INSERT INTO users (username, password_hash, email, full_name, role)
VALUES (
    'admin',
    '$2b$10$rYkT5.ZOE9WxWPm1VPCWxONXhxNVEkNENGbpKJ.jFb7ZjVwZqNBPK', -- password: admin123
    'admin@example.com',
    'Admin User',
    'admin'
);

-- Insert sample categories
INSERT INTO categories (name, description)
VALUES 
    ('Electronics', 'Electronic devices and accessories'),
    ('Groceries', 'Food and household items'),
    ('Clothing', 'Apparel and accessories');

-- Insert sample products
INSERT INTO products (name, description, sku, barcode, category_id, price, cost_price, stock_quantity, min_stock_level, unit)
VALUES 
    ('Laptop', 'High-performance laptop', 'LAP001', 'BAR001', 1, 999.99, 800.00, 10, 2, 'unit'),
    ('Smartphone', 'Latest model smartphone', 'PHO001', 'BAR002', 1, 699.99, 500.00, 15, 3, 'unit'),
    ('Rice', 'Premium quality rice', 'RIC001', 'BAR003', 2, 25.99, 20.00, 50, 10, 'kg'),
    ('T-Shirt', 'Cotton t-shirt', 'TSH001', 'BAR004', 3, 19.99, 10.00, 100, 20, 'unit');

-- Insert sample supplier
INSERT INTO suppliers (name, contact_person, email, phone, address)
VALUES (
    'Tech Suppliers Inc',
    'John Doe',
    'john@techsuppliers.com',
    '123-456-7890',
    '123 Tech Street, Silicon Valley, CA'
);

-- Down Migration
DELETE FROM suppliers;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM users;
