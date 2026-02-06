-- Add driver assignment to customers table

ALTER TABLE customers ADD COLUMN driver_id UUID;

-- Add foreign key constraint
ALTER TABLE customers ADD CONSTRAINT fk_customers_driver
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL;

-- Add index for driver lookup
CREATE INDEX idx_customers_driver ON customers(driver_id);

-- Add composite index for tenant and driver
CREATE INDEX idx_customers_tenant_driver ON customers(tenant_id, driver_id);

-- Add index for unassigned customers
CREATE INDEX idx_customers_tenant_unassigned ON customers(tenant_id) WHERE driver_id IS NULL;
