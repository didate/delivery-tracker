-- Product returns table
CREATE TABLE product_returns (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    return_date DATE NOT NULL,
    notes TEXT,
    created_by VARCHAR(50) NOT NULL,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_by VARCHAR(50),
    last_modified_date TIMESTAMP
);

-- Return items table
CREATE TABLE return_items (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    return_id UUID NOT NULL REFERENCES product_returns(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    reason VARCHAR(20) NOT NULL,
    unit_value DECIMAL(15, 2),
    created_by VARCHAR(50) NOT NULL,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_by VARCHAR(50),
    last_modified_date TIMESTAMP,
    CONSTRAINT chk_return_reason CHECK (reason IN ('EMPTY_CONTAINER', 'DAMAGED', 'EXPIRED', 'WRONG_PRODUCT', 'OTHER')),
    CONSTRAINT chk_return_quantity_positive CHECK (quantity > 0),
    CONSTRAINT chk_return_unit_value_non_negative CHECK (unit_value IS NULL OR unit_value >= 0)
);

-- Indexes for product_returns
CREATE INDEX idx_product_returns_tenant ON product_returns(tenant_id);
CREATE INDEX idx_product_returns_customer ON product_returns(customer_id);
CREATE INDEX idx_product_returns_driver ON product_returns(driver_id);
CREATE INDEX idx_product_returns_return_date ON product_returns(return_date);
CREATE INDEX idx_product_returns_tenant_customer ON product_returns(tenant_id, customer_id);
CREATE INDEX idx_product_returns_tenant_driver ON product_returns(tenant_id, driver_id);
CREATE INDEX idx_product_returns_tenant_date ON product_returns(tenant_id, return_date);
CREATE INDEX idx_product_returns_tenant_date_range ON product_returns(tenant_id, return_date DESC);

-- Indexes for return_items
CREATE INDEX idx_return_items_tenant ON return_items(tenant_id);
CREATE INDEX idx_return_items_return ON return_items(return_id);
CREATE INDEX idx_return_items_product ON return_items(product_id);
CREATE INDEX idx_return_items_reason ON return_items(reason);
CREATE INDEX idx_return_items_return_product ON return_items(return_id, product_id);
