# Implementation Guide - Parallel Development Strategy

This guide helps organize parallel implementation of modules using Claude Code's multi-agent capabilities.

---

## Module Dependencies Graph

```
                              ┌──────────┐
                              │  TENANT  │ (Phase 0)
                              │  SHARED  │
                              └────┬─────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
        ▼                          ▼                          ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│   IDENTITY    │         │    CATALOG    │         │PRODUCTION_SITE│ (Phase 1)
│   (Users)     │         │  (Products)   │         │               │
└───────┬───────┘         └───────┬───────┘         └───────┬───────┘
        │                         │                         │
        │    ┌────────────────────┼─────────────────────────┤
        │    │                    │                         │
        ▼    ▼                    ▼                         ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│    DRIVER     │         │   CUSTOMER    │         │  PRODUCTION   │ (Phase 2)
│               │◄────────│  (assignment) │         │               │
└───────┬───────┘         └───────┬───────┘         └───────────────┘
        │                         │
        │    ┌────────────────────┤
        ▼    ▼                    ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│     ROUND     │         │   DELIVERY    │         │    EXPENSE    │ (Phase 3)
│               │         │    RETURN     │         │               │
└───────┬───────┘         └───────┬───────┘         └───────────────┘
        │                         │
        │                         ▼
        │                 ┌───────────────┐
        │                 │    PAYMENT    │
        │                 └───────┬───────┘
        │                         │
        ▼                         ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│     SYNC      │         │    PAYROLL    │         │    REPORT     │ (Phase 4)
└───────────────┘         └───────────────┘         └───────────────┘
```

---

## Implementation Phases

### Phase 0: Foundation (SEQUENTIAL - Must be first)

| Module | Priority | Description |
|--------|----------|-------------|
| **shared** | P0 | Security, TenantContext, exceptions, utils |
| **tenant** | P0 | Tenant entity, registration, settings |

**Why sequential:** All modules depend on shared infrastructure and tenant isolation.

```bash
# Implement in order:
1. shared/config (SecurityConfig, JwtConfig)
2. shared/tenant (TenantContext, TenantFilter, TenantAwareEntity)
3. shared/exception
4. tenant module (entity, service, controller)
```

---

### Phase 1: Core Entities (PARALLEL - No conflicts)

These modules have NO dependencies on each other. **Implement all 3 in parallel.**

| Module | Dependencies | Entities |
|--------|--------------|----------|
| **identity** | shared, tenant | User, Role, Auth |
| **catalog** | shared, tenant | Product, PriceHistory |
| **production-site** | shared, tenant | ProductionSite |

```bash
# Can run 3 agents in parallel:
Agent 1: identity module
Agent 2: catalog module
Agent 3: production-site (part of driver module)
```

**Parallel command example:**
```
Implement identity module (User, Role, Auth) with tenant support
---
Implement catalog module (Product, PriceHistory) with tenant support
---
Implement ProductionSite entity with tenant support
```

---

### Phase 2: Secondary Entities (PARTIAL PARALLEL)

| Module | Dependencies | Can Parallel With |
|--------|--------------|-------------------|
| **driver** | identity, production-site | expense |
| **expense** | production-site (optional) | driver, production |
| **production** | production-site, catalog | expense |
| **customer** (base) | tenant only | driver, expense, production |

**Parallel Groups:**

**Group 2A** (after Phase 1):
```bash
Agent 1: driver module (needs production-site done)
Agent 2: expense module (production-site optional)
Agent 3: production module (needs production-site, product)
Agent 4: customer module (base entity, without driver assignment)
```

**Group 2B** (after driver is done):
```bash
# Update customer module to add driver assignment feature
Agent 1: customer-driver assignment (CLI-009, CLI-010, CLI-011)
```

---

### Phase 3: Operations (PARTIAL PARALLEL)

| Module | Dependencies | Can Parallel With |
|--------|--------------|-------------------|
| **delivery** | customer, driver, catalog | return, payment |
| **return** | customer, driver, catalog | delivery, payment |
| **payment** | customer | delivery, return |
| **round** | driver, customer | - |

**Parallel Groups:**

**Group 3A**:
```bash
Agent 1: delivery module
Agent 2: return module
Agent 3: payment module
```

**Group 3B** (after 3A or parallel if careful):
```bash
Agent 1: round module (depends on customer, driver)
```

---

### Phase 4: Advanced Features (PARTIAL PARALLEL)

| Module | Dependencies | Can Parallel With |
|--------|--------------|-------------------|
| **payroll** | driver, delivery (stats) | report |
| **report** | all (read-only) | payroll |
| **sync** | delivery, return, round, customer, catalog | - |

**Parallel Groups:**

**Group 4A**:
```bash
Agent 1: payroll module
Agent 2: report module (dashboards, exports)
```

**Group 4B** (final):
```bash
Agent 1: sync module (mobile synchronization)
```

---

## Parallel Implementation Matrix

| Phase | Parallel Agents | Modules | Est. Complexity |
|-------|-----------------|---------|-----------------|
| 0 | 1 (sequential) | shared, tenant | High |
| 1 | 3 | identity, catalog, production-site | Medium |
| 2A | 4 | driver, expense, production, customer-base | Medium |
| 2B | 1 | customer-assignment | Low |
| 3A | 3 | delivery, return, payment | High |
| 3B | 1 | round | Medium |
| 4A | 2 | payroll, report | Medium |
| 4B | 1 | sync | High |

---

## Conflict Avoidance Rules

### Files That Should NOT Be Modified in Parallel

1. **Shared Module Files:**
   - `SecurityConfig.java` - Only one agent
   - `TenantContext.java` - Only one agent
   - `GlobalExceptionHandler.java` - Coordinate additions

2. **Database Migrations:**
   - Use sequential version numbers
   - Agent 1: V1-V10, Agent 2: V11-V20, etc.
   - Or use timestamps: `V20240206_1_*.sql`, `V20240206_2_*.sql`

3. **Application Configuration:**
   - `application.yml` - Coordinate changes
   - `pom.xml` - Add dependencies sequentially

### Safe Parallel Patterns

1. **Each module in its own package:**
   ```
   com.delivery.identity/    - Agent 1
   com.delivery.catalog/     - Agent 2
   com.delivery.customer/    - Agent 3
   ```

2. **Each module has own migration files:**
   ```
   V2__create_identity_tables.sql   - Agent 1
   V3__create_catalog_tables.sql    - Agent 2
   V4__create_customer_tables.sql   - Agent 3
   ```

3. **Tests are isolated per module:**
   ```
   src/test/java/com/delivery/identity/
   src/test/java/com/delivery/catalog/
   ```

---

## Recommended Claude Code Commands

### Phase 0 (Sequential)
```
Implement the shared module with TenantContext, TenantFilter,
SecurityConfig, JwtConfig, and exception handlers. All entities
must extend TenantAwareEntity.
```

```
Implement the tenant module with Tenant entity, TenantService,
TenantRegistrationService, and TenantController. Include
registration, profile update, and settings management.
```

### Phase 1 (Parallel - 3 agents)
```
# Agent 1
Implement identity module: User entity with tenant_id,
UserRepository, UserService, AuthService, AuthController,
UserController. Include JWT authentication with tenant_id in token.

# Agent 2
Implement catalog module: Product entity with tenant_id,
PriceHistory entity, ProductRepository, ProductService,
ProductController. Include price history tracking.

# Agent 3
Implement ProductionSite entity in driver module:
ProductionSite with tenant_id, ProductionSiteRepository,
ProductionSiteService, ProductionSiteController.
```

### Phase 2A (Parallel - 4 agents)
```
# Agent 1
Implement driver module: Driver entity with tenant_id,
link to User and ProductionSite, DriverRepository,
DriverService, DriverController.

# Agent 2
Implement expense module: Expense entity with tenant_id
and ExpenseCategory enum, ExpenseRepository, ExpenseService,
ExpenseController.

# Agent 3
Implement production module: Production entity with tenant_id,
link to ProductionSite and Product, ProductionRepository,
ProductionService, ProductionController.

# Agent 4
Implement customer module base: Customer entity with tenant_id,
CustomerRepository, CustomerService, CustomerController.
Do NOT implement driver assignment yet.
```

---

## Quick Reference: Module → Package Mapping

| Module | Package | Main Entities |
|--------|---------|---------------|
| shared | `com.delivery.shared` | TenantContext, Configs |
| tenant | `com.delivery.tenant` | Tenant, TenantSettings |
| identity | `com.delivery.identity` | User, Role |
| catalog | `com.delivery.catalog` | Product, PriceHistory |
| driver | `com.delivery.driver` | Driver, ProductionSite |
| customer | `com.delivery.customer` | Customer |
| delivery | `com.delivery.delivery` | Delivery, DeliveryItem, Return |
| payment | `com.delivery.payment` | Payment |
| production | `com.delivery.production` | Production |
| expense | `com.delivery.expense` | Expense |
| round | `com.delivery.round` | Round, RoundCustomer |
| payroll | `com.delivery.payroll` | BonusConfig, SalaryPayment |
| report | `com.delivery.report` | (Services only) |
| sync | `com.delivery.sync` | (Services only) |

---

## Estimated Implementation Order (Total: 8 parallel waves)

| Wave | Duration | Modules | Agents |
|------|----------|---------|--------|
| 1 | - | shared | 1 |
| 2 | - | tenant | 1 |
| 3 | - | identity, catalog, production-site | 3 |
| 4 | - | driver, expense, production, customer-base | 4 |
| 5 | - | customer-assignment | 1 |
| 6 | - | delivery, return, payment | 3 |
| 7 | - | round, payroll, report | 3 |
| 8 | - | sync | 1 |

**Maximum parallelism: 4 agents simultaneously**

---

*Implementation Guide - Version 1.0*
*Optimized for Claude Code parallel development*
