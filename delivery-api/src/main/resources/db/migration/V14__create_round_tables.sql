-- Rounds table
CREATE TABLE rounds (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    round_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    start_time TIME,
    end_time TIME,
    notes TEXT,
    created_by VARCHAR(50) NOT NULL,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_by VARCHAR(50),
    last_modified_date TIMESTAMP,
    CONSTRAINT chk_round_status CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'))
);

-- Indexes for rounds
CREATE INDEX idx_rounds_tenant ON rounds(tenant_id);
CREATE INDEX idx_rounds_driver ON rounds(driver_id);
CREATE INDEX idx_rounds_date ON rounds(round_date);
CREATE INDEX idx_rounds_status ON rounds(status);
CREATE INDEX idx_rounds_tenant_driver ON rounds(tenant_id, driver_id);
CREATE INDEX idx_rounds_tenant_date ON rounds(tenant_id, round_date);
CREATE INDEX idx_rounds_tenant_status ON rounds(tenant_id, status);
CREATE INDEX idx_rounds_tenant_driver_date ON rounds(tenant_id, driver_id, round_date);

-- Round customers table
CREATE TABLE round_customers (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL,
    visited BOOLEAN NOT NULL DEFAULT FALSE,
    visit_time TIME,
    delivery_id UUID,
    created_by VARCHAR(50) NOT NULL,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_by VARCHAR(50),
    last_modified_date TIMESTAMP,
    CONSTRAINT uk_round_customer UNIQUE (round_id, customer_id)
);

-- Indexes for round_customers
CREATE INDEX idx_round_customers_round ON round_customers(round_id);
CREATE INDEX idx_round_customers_customer ON round_customers(customer_id);
CREATE INDEX idx_round_customers_round_order ON round_customers(round_id, sequence_order);
CREATE INDEX idx_round_customers_delivery ON round_customers(delivery_id);
