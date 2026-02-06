-- Seed data for testing
-- Password for all users: Password123! (BCrypt hash)

-- Insert demo tenant
INSERT INTO tenants (id, code, name, email, phone, address, is_active, created_by, created_date, last_modified_by, last_modified_date)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'demo',
    'Demo Company',
    'contact@demo.com',
    '+1234567890',
    '123 Demo Street, Demo City',
    true,
    'system',
    NOW(),
    'system',
    NOW()
);

-- Insert admin user (password: Password123!)
INSERT INTO users (id, tenant_id, email, password, name, role, is_active, created_by, created_date, last_modified_by, last_modified_date)
VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'admin@demo.com',
    '$2a$10$ujAVZUn9C8Lvm7TkAB9LF.bgxpX3ppU5eKLVvTIM6v562or9llvGC',
    'Admin User',
    'ADMIN',
    true,
    'system',
    NOW(),
    'system',
    NOW()
);

-- Insert manager user
INSERT INTO users (id, tenant_id, email, password, name, role, is_active, created_by, created_date, last_modified_by, last_modified_date)
VALUES (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'manager@demo.com',
    '$2a$10$ujAVZUn9C8Lvm7TkAB9LF.bgxpX3ppU5eKLVvTIM6v562or9llvGC',
    'Manager User',
    'MANAGER',
    true,
    'system',
    NOW(),
    'system',
    NOW()
);

-- Insert production site
INSERT INTO production_sites (id, tenant_id, name, address, latitude, longitude, is_active, created_by, created_date, last_modified_by, last_modified_date)
VALUES (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Main Production Site',
    '456 Production Ave, Industrial Zone',
    40.7128,
    -74.0060,
    true,
    'system',
    NOW(),
    'system',
    NOW()
);

-- Insert products
INSERT INTO products (id, tenant_id, code, name, description, price, is_active, created_by, created_date, last_modified_by, last_modified_date)
VALUES
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'PROD-001', 'Fresh Milk 1L', 'Fresh whole milk, 1 liter bottle', 2.50, true, 'system', NOW(), 'system', NOW()),
    ('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'PROD-002', 'Organic Yogurt 500g', 'Natural organic yogurt, 500 grams', 3.75, true, 'system', NOW(), 'system', NOW()),
    ('e2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'PROD-003', 'Butter 250g', 'Premium butter, 250 grams', 4.25, true, 'system', NOW(), 'system', NOW()),
    ('e3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'PROD-004', 'Cheese Block 500g', 'Aged cheddar cheese, 500 grams', 8.50, true, 'system', NOW(), 'system', NOW()),
    ('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'PROD-005', 'Cream 200ml', 'Fresh cream for cooking, 200ml', 2.00, true, 'system', NOW(), 'system', NOW());

-- Insert drivers (name, phone, license_number, production_site_id)
INSERT INTO drivers (id, tenant_id, name, phone, license_number, production_site_id, is_active, created_by, created_date, last_modified_by, last_modified_date)
VALUES
    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'John Smith', '+1234567001', 'DL12345678', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, 'system', NOW(), 'system', NOW()),
    ('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Jane Doe', '+1234567002', 'DL87654321', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, 'system', NOW(), 'system', NOW()),
    ('f2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Bob Johnson', '+1234567003', 'DL11223344', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, 'system', NOW(), 'system', NOW());

-- Insert customers
INSERT INTO customers (id, tenant_id, code, name, phone, email, address, latitude, longitude, driver_id, is_active, created_by, created_date, last_modified_by, last_modified_date)
VALUES
    ('a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'CUST-001', 'Coffee Shop Downtown', '+1234560001', 'downtown@coffeeshop.com', '100 Main Street, Downtown', 40.7580, -73.9855, 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, 'system', NOW(), 'system', NOW()),
    ('a2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'CUST-002', 'Fresh Bakery', '+1234560002', 'orders@freshbakery.com', '250 Baker Lane, Midtown', 40.7549, -73.9840, 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, 'system', NOW(), 'system', NOW()),
    ('a3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'CUST-003', 'Restaurant Le Gourmet', '+1234560003', 'chef@legourmet.com', '75 Cuisine Boulevard, Uptown', 40.7829, -73.9654, 'f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, 'system', NOW(), 'system', NOW()),
    ('a4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'CUST-004', 'Supermarket Express', '+1234560004', 'supply@superexpress.com', '500 Commerce Drive, East Side', 40.7282, -73.7949, 'f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, 'system', NOW(), 'system', NOW()),
    ('a5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'CUST-005', 'Hotel Grand Plaza', '+1234560005', 'kitchen@grandplaza.com', '1 Plaza Avenue, Financial District', 40.7074, -74.0113, 'f2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, 'system', NOW(), 'system', NOW()),
    ('a6eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'CUST-006', 'School Cafeteria Central', '+1234560006', 'food@schoolcentral.edu', '200 Education Street, West Side', 40.7831, -73.9712, 'f2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, 'system', NOW(), 'system', NOW());

-- Insert sample deliveries (no code column)
INSERT INTO deliveries (id, tenant_id, customer_id, driver_id, delivery_date, status, total_amount, paid_amount, notes, created_by, created_date, last_modified_by, last_modified_date)
VALUES
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', CURRENT_DATE, 'COMPLETED', 43.75, 43.75, 'Regular weekly delivery', 'system', NOW(), 'system', NOW()),
    ('b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', CURRENT_DATE, 'IN_PROGRESS', 34.00, 0.00, 'Urgent order', 'system', NOW(), 'system', NOW()),
    ('b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', CURRENT_DATE + INTERVAL '1 day', 'PENDING', 66.50, 0.00, 'Next day delivery', 'system', NOW(), 'system', NOW());

-- Insert delivery items
INSERT INTO delivery_items (id, tenant_id, delivery_id, product_id, quantity, unit_price, total_price, created_by, created_date, last_modified_by, last_modified_date)
VALUES
    ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 10, 2.50, 25.00, 'system', NOW(), 'system', NOW()),
    ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 5, 3.75, 18.75, 'system', NOW(), 'system', NOW()),
    ('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 8, 4.25, 34.00, 'system', NOW(), 'system', NOW()),
    ('c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 5, 8.50, 42.50, 'system', NOW(), 'system', NOW()),
    ('c5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 12, 2.00, 24.00, 'system', NOW(), 'system', NOW());

-- Insert sample payments (no code column, payment_method not method)
INSERT INTO payments (id, tenant_id, customer_id, driver_id, amount, payment_method, payment_date, reference, notes, created_by, created_date, last_modified_by, last_modified_date)
VALUES
    ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 100.00, 'BANK_TRANSFER', CURRENT_DATE - INTERVAL '5 days', 'TRF-20240101', 'January payment', 'system', NOW(), 'system', NOW()),
    ('d2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 75.50, 'CASH', CURRENT_DATE - INTERVAL '3 days', NULL, 'Cash payment', 'system', NOW(), 'system', NOW()),
    ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 250.00, 'CHECK', CURRENT_DATE - INTERVAL '1 day', 'CHK-5678', 'Monthly settlement', 'system', NOW(), 'system', NOW());
