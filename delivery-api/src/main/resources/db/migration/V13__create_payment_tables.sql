-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    amount DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    payment_date DATE NOT NULL,
    reference VARCHAR(100),
    notes TEXT,
    created_by VARCHAR(50) NOT NULL,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_by VARCHAR(50),
    last_modified_date TIMESTAMP,
    CONSTRAINT chk_payment_method CHECK (payment_method IN ('CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CHECK', 'CREDIT')),
    CONSTRAINT chk_payment_amount_positive CHECK (amount > 0)
);

-- Indexes for common queries
CREATE INDEX idx_payments_tenant ON payments(tenant_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_driver ON payments(driver_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_payments_payment_method ON payments(payment_method);
CREATE INDEX idx_payments_tenant_customer ON payments(tenant_id, customer_id);
CREATE INDEX idx_payments_tenant_driver ON payments(tenant_id, driver_id);
CREATE INDEX idx_payments_tenant_date ON payments(tenant_id, payment_date);
CREATE INDEX idx_payments_tenant_method ON payments(tenant_id, payment_method);
CREATE INDEX idx_payments_tenant_date_range ON payments(tenant_id, payment_date DESC);

-- Indexes for aggregation queries
CREATE INDEX idx_payments_tenant_customer_agg ON payments(tenant_id, customer_id, amount);
CREATE INDEX idx_payments_tenant_driver_date_agg ON payments(tenant_id, driver_id, payment_date, amount);
