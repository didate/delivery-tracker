-- Production sites table
CREATE TABLE production_sites (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(tenant_id, name)
);

-- Indexes
CREATE INDEX idx_production_sites_tenant ON production_sites(tenant_id);
CREATE INDEX idx_production_sites_active ON production_sites(is_active);
CREATE INDEX idx_production_sites_tenant_active ON production_sites(tenant_id, is_active);
