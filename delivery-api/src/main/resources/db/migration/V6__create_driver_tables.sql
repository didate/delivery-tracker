-- Drivers table
CREATE TABLE drivers (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    license_number VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    production_site_id UUID REFERENCES production_sites(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(50) NOT NULL,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_by VARCHAR(50),
    last_modified_date TIMESTAMP,
    CONSTRAINT uk_drivers_tenant_license UNIQUE (tenant_id, license_number)
);

-- Indexes for drivers
CREATE INDEX idx_drivers_tenant ON drivers(tenant_id);
CREATE INDEX idx_drivers_active ON drivers(is_active);
CREATE INDEX idx_drivers_tenant_active ON drivers(tenant_id, is_active);
CREATE INDEX idx_drivers_user ON drivers(user_id);
CREATE INDEX idx_drivers_production_site ON drivers(production_site_id);
CREATE INDEX idx_drivers_tenant_production_site ON drivers(tenant_id, production_site_id);
