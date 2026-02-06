-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(15, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT uk_product_tenant_code UNIQUE (tenant_id, code)
);

-- Price history table
CREATE TABLE price_history (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    price DECIMAL(15, 2) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP
);

-- Indexes for products
CREATE INDEX idx_products_tenant ON products(tenant_id);
CREATE INDEX idx_products_tenant_active ON products(tenant_id, is_active);
CREATE INDEX idx_products_tenant_code ON products(tenant_id, code);

-- Indexes for price history
CREATE INDEX idx_price_history_product ON price_history(product_id);
CREATE INDEX idx_price_history_tenant ON price_history(tenant_id);
CREATE INDEX idx_price_history_product_tenant ON price_history(product_id, tenant_id);
