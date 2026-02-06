-- Expenses table
CREATE TABLE expenses (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    category VARCHAR(20) NOT NULL,
    expense_date DATE NOT NULL,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    production_site_id UUID REFERENCES production_sites(id) ON DELETE SET NULL,
    notes TEXT,
    created_by VARCHAR(50) NOT NULL,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_by VARCHAR(50),
    last_modified_date TIMESTAMP,
    CONSTRAINT chk_expense_category CHECK (category IN ('FUEL', 'MAINTENANCE', 'TOLL', 'PARKING', 'FOOD', 'OTHER')),
    CONSTRAINT chk_expense_amount_positive CHECK (amount > 0)
);

-- Indexes for common queries
CREATE INDEX idx_expenses_tenant ON expenses(tenant_id);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX idx_expenses_driver ON expenses(driver_id);
CREATE INDEX idx_expenses_production_site ON expenses(production_site_id);
CREATE INDEX idx_expenses_tenant_category ON expenses(tenant_id, category);
CREATE INDEX idx_expenses_tenant_date ON expenses(tenant_id, expense_date);
CREATE INDEX idx_expenses_tenant_driver ON expenses(tenant_id, driver_id);
CREATE INDEX idx_expenses_tenant_production_site ON expenses(tenant_id, production_site_id);
CREATE INDEX idx_expenses_tenant_date_range ON expenses(tenant_id, expense_date DESC);
