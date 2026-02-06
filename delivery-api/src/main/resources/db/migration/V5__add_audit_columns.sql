-- Add audit columns to all tables following JHipster conventions

-- Tenants table
ALTER TABLE tenants ADD COLUMN created_by VARCHAR(50);
ALTER TABLE tenants ADD COLUMN created_date TIMESTAMP;
ALTER TABLE tenants ADD COLUMN last_modified_by VARCHAR(50);
ALTER TABLE tenants ADD COLUMN last_modified_date TIMESTAMP;

-- Migrate existing data
UPDATE tenants SET created_date = created_at, last_modified_date = updated_at, created_by = 'system', last_modified_by = 'system';

-- Make created_by NOT NULL after migration
ALTER TABLE tenants ALTER COLUMN created_by SET NOT NULL;

-- Drop old columns
ALTER TABLE tenants DROP COLUMN created_at;
ALTER TABLE tenants DROP COLUMN updated_at;

-- Tenant settings table
ALTER TABLE tenant_settings ADD COLUMN created_by VARCHAR(50);
ALTER TABLE tenant_settings ADD COLUMN created_date TIMESTAMP;
ALTER TABLE tenant_settings ADD COLUMN last_modified_by VARCHAR(50);
ALTER TABLE tenant_settings ADD COLUMN last_modified_date TIMESTAMP;

-- Migrate existing data
UPDATE tenant_settings SET last_modified_date = updated_at, created_by = 'system', last_modified_by = 'system', created_date = COALESCE(updated_at, CURRENT_TIMESTAMP);

-- Make created_by NOT NULL after migration
ALTER TABLE tenant_settings ALTER COLUMN created_by SET NOT NULL;

-- Drop old columns
ALTER TABLE tenant_settings DROP COLUMN updated_at;

-- Users table
ALTER TABLE users ADD COLUMN created_by VARCHAR(50);
ALTER TABLE users ADD COLUMN created_date TIMESTAMP;
ALTER TABLE users ADD COLUMN last_modified_by VARCHAR(50);
ALTER TABLE users ADD COLUMN last_modified_date TIMESTAMP;

-- Migrate existing data
UPDATE users SET created_date = created_at, last_modified_date = updated_at, created_by = 'system', last_modified_by = 'system';

-- Make created_by NOT NULL after migration
ALTER TABLE users ALTER COLUMN created_by SET NOT NULL;

-- Drop old columns
ALTER TABLE users DROP COLUMN created_at;
ALTER TABLE users DROP COLUMN updated_at;

-- Products table
ALTER TABLE products ADD COLUMN created_by VARCHAR(50);
ALTER TABLE products ADD COLUMN created_date TIMESTAMP;
ALTER TABLE products ADD COLUMN last_modified_by VARCHAR(50);
ALTER TABLE products ADD COLUMN last_modified_date TIMESTAMP;

-- Migrate existing data
UPDATE products SET created_date = created_at, last_modified_date = updated_at, created_by = 'system', last_modified_by = 'system';

-- Make created_by NOT NULL after migration
ALTER TABLE products ALTER COLUMN created_by SET NOT NULL;

-- Drop old columns
ALTER TABLE products DROP COLUMN created_at;
ALTER TABLE products DROP COLUMN updated_at;

-- Price history table (add audit columns)
ALTER TABLE price_history ADD COLUMN created_by VARCHAR(50);
ALTER TABLE price_history ADD COLUMN created_date TIMESTAMP;
ALTER TABLE price_history ADD COLUMN last_modified_by VARCHAR(50);
ALTER TABLE price_history ADD COLUMN last_modified_date TIMESTAMP;

-- Set default values for price history
UPDATE price_history SET created_date = start_date, last_modified_date = start_date, created_by = 'system', last_modified_by = 'system';

-- Make created_by NOT NULL after migration
ALTER TABLE price_history ALTER COLUMN created_by SET NOT NULL;

-- Production sites table
ALTER TABLE production_sites ADD COLUMN created_by VARCHAR(50);
ALTER TABLE production_sites ADD COLUMN created_date TIMESTAMP;
ALTER TABLE production_sites ADD COLUMN last_modified_by VARCHAR(50);
ALTER TABLE production_sites ADD COLUMN last_modified_date TIMESTAMP;

-- Migrate existing data
UPDATE production_sites SET created_date = created_at, last_modified_date = updated_at, created_by = 'system', last_modified_by = 'system';

-- Make created_by NOT NULL after migration
ALTER TABLE production_sites ALTER COLUMN created_by SET NOT NULL;

-- Drop old columns
ALTER TABLE production_sites DROP COLUMN created_at;
ALTER TABLE production_sites DROP COLUMN updated_at;
