-- Productions table
CREATE TABLE productions (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    production_site_id UUID NOT NULL REFERENCES production_sites(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    production_date DATE NOT NULL,
    notes TEXT,
    created_by VARCHAR(50) NOT NULL,
    created_date TIMESTAMP,
    last_modified_by VARCHAR(50),
    last_modified_date TIMESTAMP
);

-- Indexes for productions
CREATE INDEX idx_productions_tenant ON productions(tenant_id);
CREATE INDEX idx_productions_production_site ON productions(production_site_id);
CREATE INDEX idx_productions_product ON productions(product_id);
CREATE INDEX idx_productions_date ON productions(production_date);
CREATE INDEX idx_productions_tenant_site_date ON productions(tenant_id, production_site_id, production_date);
CREATE INDEX idx_productions_tenant_product ON productions(tenant_id, product_id);
CREATE INDEX idx_productions_tenant_date ON productions(tenant_id, production_date);
