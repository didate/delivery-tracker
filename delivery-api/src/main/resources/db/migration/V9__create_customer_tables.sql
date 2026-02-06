-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    created_by VARCHAR(50) NOT NULL,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_by VARCHAR(50),
    last_modified_date TIMESTAMP,
    UNIQUE(tenant_id, code)
);

-- Indexes for search optimization
CREATE INDEX idx_customers_tenant ON customers(tenant_id);
CREATE INDEX idx_customers_tenant_active ON customers(tenant_id, is_active);
CREATE INDEX idx_customers_tenant_code ON customers(tenant_id, code);
CREATE INDEX idx_customers_tenant_name ON customers(tenant_id, name);
CREATE INDEX idx_customers_name_search ON customers(tenant_id, LOWER(name));
