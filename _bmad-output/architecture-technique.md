# Architecture Technique - Plateforme SaaS Delivery Management System

## 0. Architecture Multi-Tenant

### 0.1 Strategie d'Isolation

L'application utilise une architecture **multi-tenant par colonne** (tenant_id) pour isoler les donnees de chaque entreprise.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MULTI-TENANT ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                        API LAYER                                     │   │
│   │  ┌──────────────────────────────────────────────────────────────┐  │   │
│   │  │                  TenantFilter                                 │  │   │
│   │  │  - Extract tenant_id from JWT                                 │  │   │
│   │  │  - Set TenantContext.currentTenant                           │  │   │
│   │  └──────────────────────────────────────────────────────────────┘  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                      SERVICE LAYER                                   │   │
│   │  ┌──────────────────────────────────────────────────────────────┐  │   │
│   │  │              TenantAwareService                               │  │   │
│   │  │  - Inject tenant_id in all queries                           │  │   │
│   │  │  - Validate tenant ownership on updates                      │  │   │
│   │  └──────────────────────────────────────────────────────────────┘  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                     REPOSITORY LAYER                                 │   │
│   │  ┌──────────────────────────────────────────────────────────────┐  │   │
│   │  │            @TenantFilter annotation                           │  │   │
│   │  │  - Hibernate filters auto-add WHERE tenant_id = ?            │  │   │
│   │  └──────────────────────────────────────────────────────────────┘  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 0.2 Implementation Spring Boot

```java
// TenantContext - ThreadLocal storage
public class TenantContext {
    private static final ThreadLocal<UUID> currentTenant = new ThreadLocal<>();

    public static UUID getCurrentTenant() {
        return currentTenant.get();
    }

    public static void setCurrentTenant(UUID tenantId) {
        currentTenant.set(tenantId);
    }

    public static void clear() {
        currentTenant.remove();
    }
}

// TenantFilter - Extract tenant from JWT
@Component
public class TenantFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) {
        String jwt = extractJwt(request);
        if (jwt != null) {
            UUID tenantId = extractTenantIdFromJwt(jwt);
            TenantContext.setCurrentTenant(tenantId);
        }
        try {
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}

// Base Entity with tenant_id
@MappedSuperclass
public abstract class TenantAwareEntity {

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @PrePersist
    public void prePersist() {
        if (tenantId == null) {
            tenantId = TenantContext.getCurrentTenant();
        }
    }
}
```

### 0.3 JWT Token Structure

```json
{
  "sub": "user-uuid",
  "tenant_id": "tenant-uuid",
  "email": "user@company.com",
  "role": "ADMIN",
  "iat": 1699000000,
  "exp": 1699003600
}
```

---

## 1. Stack Technologique

### Backend
| Composant | Technologie | Version |
|-----------|-------------|---------|
| Language | Java | 25+ |
| Framework | Spring Boot | 4+ |
| Build Tool | Maven | 3.9+ |
| ORM | Spring Data JPA / Hibernate | |
| Security | Spring Security + JWT | |
| API Docs | SpringDoc OpenAPI | |
| Validation | Bean Validation (Jakarta) | |

### Frontend Web
| Composant | Technologie | Version |
|-----------|-------------|---------|
| Framework | Angular | 19+ |
| Language | TypeScript | 5+ |
| UI Library |  PrimeNG | |
| State |  Signals | |
| HTTP | Angular HttpClient | |
| Charts | Chart.js / ngx-charts | |
| Maps | Leaflet  | |

### Mobile
| Composant | Technologie | Version |
|-----------|-------------|---------|
| Framework | Flutter | 3.16+ |
| Language | Dart | 3+ |
| State | Riverpod / Bloc | |
| Local DB | SQLite (sqflite) | |
| HTTP | Dio | |
| Maps | flutter_map / google_maps_flutter | |

### Base de Donnees
| Composant | Technologie |
|-----------|-------------|
| SGBD | PostgreSQL 18+ |
| Extensions | PostGIS (geospatial) |
| Migrations | Flyway |

### Infrastructure
| Composant | Technologie |
|-----------|-------------|
| Containerisation | Docker |
| Orchestration | Docker Compose (dev) |
| Reverse Proxy | Traefik |
| CI/CD | GitHub Actions |

---

## 2. Architecture Backend - Modular Monolith

### 2.1 Principes de l'Architecture Modulaire

L'architecture **Modular Monolith** organise le code par **domaine metier** plutot que par couche technique. Chaque module est autonome et communique avec les autres via des interfaces bien definies.

**Avantages:**
- Separation claire des responsabilites par domaine
- Modules faiblement couples, fortement cohesifs
- Facilite l'evolution vers microservices si necessaire
- Meilleure maintenabilite et testabilite
- Permet le travail en parallele sur differents modules

### 2.2 Modules Metier

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DELIVERY API (MULTI-TENANT SAAS)                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                          tenant                                      ││
│  │  - Tenant  - Registration  - Settings  - TenantContext               ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │   identity   │  │   catalog    │  │   customer   │  │    driver    ││
│  │              │  │              │  │              │  │              ││
│  │ - User       │  │ - Product    │  │ - Customer   │  │ - Driver     ││
│  │ - Auth       │  │ - PriceHist  │  │ - Assignment │  │ - ProdSite   ││
│  │ - Role       │  │              │  │              │  │              ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘│
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │   delivery   │  │   payment    │  │  production  │  │   expense    ││
│  │              │  │              │  │              │  │              ││
│  │ - Delivery   │  │ - Payment    │  │ - Production │  │ - Expense    ││
│  │ - DelivItem  │  │ - Balance    │  │ - Stock      │  │ - Category   ││
│  │ - Return     │  │              │  │              │  │              ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘│
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │    round     │  │   payroll    │  │    report    │  │     sync     ││
│  │              │  │              │  │              │  │              ││
│  │ - Round      │  │ - BonusCfg   │  │ - Dashboard  │  │ - SyncData   ││
│  │ - RoundCust  │  │ - SalaryPay  │  │ - Export     │  │ - Conflict   ││
│  │ - Optimize   │  │              │  │              │  │              ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                            shared                                    ││
│  │  - Security (JWT, Auth) - Exceptions - Utils - Events - Config      ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Structure du Projet

```
delivery-api/
├── src/main/java/com/delivery/
│   ├── DeliveryApplication.java
│   │
│   ├── shared/                          # Module partage
│   │   ├── config/
│   │   │   ├── SecurityConfig.java
│   │   │   ├── JwtConfig.java
│   │   │   ├── CorsConfig.java
│   │   │   └── OpenApiConfig.java
│   │   ├── security/
│   │   │   ├── JwtTokenProvider.java
│   │   │   ├── JwtAuthenticationFilter.java
│   │   │   └── CurrentUser.java
│   │   ├── tenant/                      # Multi-tenant infrastructure
│   │   │   ├── TenantContext.java
│   │   │   ├── TenantFilter.java
│   │   │   ├── TenantAwareEntity.java
│   │   │   └── TenantInterceptor.java
│   │   ├── exception/
│   │   │   ├── GlobalExceptionHandler.java
│   │   │   ├── ResourceNotFoundException.java
│   │   │   ├── BusinessException.java
│   │   │   ├── UnauthorizedException.java
│   │   │   └── TenantAccessDeniedException.java
│   │   ├── event/
│   │   │   ├── DomainEvent.java
│   │   │   └── EventPublisher.java
│   │   └── util/
│   │       ├── DateUtils.java
│   │       └── ValidationUtils.java
│   │
│   ├── tenant/                          # Module Tenant (SaaS)
│   │   ├── domain/
│   │   │   ├── entity/
│   │   │   │   ├── Tenant.java
│   │   │   │   └── TenantSettings.java
│   │   │   ├── repository/
│   │   │   │   ├── TenantRepository.java
│   │   │   │   └── TenantSettingsRepository.java
│   │   │   └── service/
│   │   │       ├── TenantService.java
│   │   │       └── TenantRegistrationService.java
│   │   ├── application/
│   │   │   ├── dto/
│   │   │   │   ├── RegisterTenantRequest.java
│   │   │   │   ├── UpdateTenantRequest.java
│   │   │   │   ├── TenantResponse.java
│   │   │   │   ├── TenantStatsResponse.java
│   │   │   │   └── TenantSettingsRequest.java
│   │   │   └── mapper/
│   │   │       └── TenantMapper.java
│   │   └── api/
│   │       ├── TenantController.java
│   │       └── TenantSettingsController.java
│   │
│   ├── identity/                        # Module Identity
│   │   ├── domain/
│   │   │   ├── entity/
│   │   │   │   ├── User.java
│   │   │   │   └── Role.java
│   │   │   ├── repository/
│   │   │   │   └── UserRepository.java
│   │   │   └── service/
│   │   │       ├── UserService.java
│   │   │       └── AuthService.java
│   │   ├── application/
│   │   │   ├── dto/
│   │   │   │   ├── LoginRequest.java
│   │   │   │   ├── RegisterRequest.java
│   │   │   │   ├── UserResponse.java
│   │   │   │   └── AuthResponse.java
│   │   │   └── mapper/
│   │   │       └── UserMapper.java
│   │   └── api/
│   │       ├── AuthController.java
│   │       └── UserController.java
│   │
│   ├── catalog/                         # Module Catalog (Products)
│   │   ├── domain/
│   │   │   ├── entity/
│   │   │   │   ├── Product.java
│   │   │   │   └── PriceHistory.java
│   │   │   ├── repository/
│   │   │   │   ├── ProductRepository.java
│   │   │   │   └── PriceHistoryRepository.java
│   │   │   └── service/
│   │   │       └── ProductService.java
│   │   ├── application/
│   │   │   ├── dto/
│   │   │   │   ├── CreateProductRequest.java
│   │   │   │   ├── UpdateProductRequest.java
│   │   │   │   └── ProductResponse.java
│   │   │   └── mapper/
│   │   │       └── ProductMapper.java
│   │   └── api/
│   │       └── ProductController.java
│   │
│   ├── customer/                        # Module Customer
│   │   ├── domain/
│   │   │   ├── entity/
│   │   │   │   └── Customer.java
│   │   │   ├── repository/
│   │   │   │   └── CustomerRepository.java
│   │   │   ├── service/
│   │   │   │   ├── CustomerService.java
│   │   │   │   └── BalanceService.java
│   │   │   └── event/
│   │   │       └── CustomerAssignedEvent.java
│   │   ├── application/
│   │   │   ├── dto/
│   │   │   │   ├── CreateCustomerRequest.java
│   │   │   │   ├── AssignDriverRequest.java
│   │   │   │   ├── CustomerResponse.java
│   │   │   │   └── CustomerBalanceResponse.java
│   │   │   └── mapper/
│   │   │       └── CustomerMapper.java
│   │   └── api/
│   │       └── CustomerController.java
│   │
│   ├── driver/                          # Module Driver
│   │   ├── domain/
│   │   │   ├── entity/
│   │   │   │   ├── Driver.java
│   │   │   │   └── ProductionSite.java
│   │   │   ├── repository/
│   │   │   │   ├── DriverRepository.java
│   │   │   │   └── ProductionSiteRepository.java
│   │   │   └── service/
│   │   │       ├── DriverService.java
│   │   │       └── ProductionSiteService.java
│   │   ├── application/
│   │   │   ├── dto/
│   │   │   │   ├── CreateDriverRequest.java
│   │   │   │   ├── DriverResponse.java
│   │   │   │   ├── DriverStatsResponse.java
│   │   │   │   └── ProductionSiteResponse.java
│   │   │   └── mapper/
│   │   │       └── DriverMapper.java
│   │   └── api/
│   │       ├── DriverController.java
│   │       └── ProductionSiteController.java
│   │
│   ├── delivery/                        # Module Delivery
│   │   ├── domain/
│   │   │   ├── entity/
│   │   │   │   ├── Delivery.java
│   │   │   │   ├── DeliveryItem.java
│   │   │   │   ├── Return.java
│   │   │   │   └── DeliveryStatus.java
│   │   │   ├── repository/
│   │   │   │   ├── DeliveryRepository.java
│   │   │   │   └── ReturnRepository.java
│   │   │   ├── service/
│   │   │   │   ├── DeliveryService.java
│   │   │   │   └── ReturnService.java
│   │   │   └── event/
│   │   │       ├── DeliveryCreatedEvent.java
│   │   │       └── ReturnCreatedEvent.java
│   │   ├── application/
│   │   │   ├── dto/
│   │   │   │   ├── CreateDeliveryRequest.java
│   │   │   │   ├── DeliveryItemRequest.java
│   │   │   │   ├── CreateReturnRequest.java
│   │   │   │   ├── DeliveryResponse.java
│   │   │   │   └── ReturnResponse.java
│   │   │   └── mapper/
│   │   │       ├── DeliveryMapper.java
│   │   │       └── ReturnMapper.java
│   │   └── api/
│   │       ├── DeliveryController.java
│   │       └── ReturnController.java
│   │
│   ├── payment/                         # Module Payment
│   │   ├── domain/
│   │   │   ├── entity/
│   │   │   │   ├── Payment.java
│   │   │   │   └── PaymentMethod.java
│   │   │   ├── repository/
│   │   │   │   └── PaymentRepository.java
│   │   │   ├── service/
│   │   │   │   └── PaymentService.java
│   │   │   └── event/
│   │   │       └── PaymentReceivedEvent.java
│   │   ├── application/
│   │   │   ├── dto/
│   │   │   │   ├── CreatePaymentRequest.java
│   │   │   │   └── PaymentResponse.java
│   │   │   └── mapper/
│   │   │       └── PaymentMapper.java
│   │   └── api/
│   │       └── PaymentController.java
│   │
│   ├── production/                      # Module Production
│   │   ├── domain/
│   │   │   ├── entity/
│   │   │   │   └── Production.java
│   │   │   ├── repository/
│   │   │   │   └── ProductionRepository.java
│   │   │   └── service/
│   │   │       ├── ProductionService.java
│   │   │       └── StockService.java
│   │   ├── application/
│   │   │   ├── dto/
│   │   │   │   ├── RecordProductionRequest.java
│   │   │   │   ├── ProductionResponse.java
│   │   │   │   └── StockResponse.java
│   │   │   └── mapper/
│   │   │       └── ProductionMapper.java
│   │   └── api/
│   │       └── ProductionController.java
│   │
│   ├── expense/                         # Module Expense
│   │   ├── domain/
│   │   │   ├── entity/
│   │   │   │   ├── Expense.java
│   │   │   │   └── ExpenseCategory.java
│   │   │   ├── repository/
│   │   │   │   └── ExpenseRepository.java
│   │   │   └── service/
│   │   │       └── ExpenseService.java
│   │   ├── application/
│   │   │   ├── dto/
│   │   │   │   ├── CreateExpenseRequest.java
│   │   │   │   └── ExpenseResponse.java
│   │   │   └── mapper/
│   │   │       └── ExpenseMapper.java
│   │   └── api/
│   │       └── ExpenseController.java
│   │
│   ├── round/                           # Module Round (Tournees)
│   │   ├── domain/
│   │   │   ├── entity/
│   │   │   │   ├── Round.java
│   │   │   │   ├── RoundCustomer.java
│   │   │   │   └── RoundStatus.java
│   │   │   ├── repository/
│   │   │   │   ├── RoundRepository.java
│   │   │   │   └── RoundCustomerRepository.java
│   │   │   └── service/
│   │   │       ├── RoundService.java
│   │   │       ├── RoundGeneratorService.java
│   │   │       └── RouteOptimizerService.java
│   │   ├── application/
│   │   │   ├── dto/
│   │   │   │   ├── RoundResponse.java
│   │   │   │   ├── RoundCustomerResponse.java
│   │   │   │   └── OptimizeRouteRequest.java
│   │   │   └── mapper/
│   │   │       └── RoundMapper.java
│   │   └── api/
│   │       └── RoundController.java
│   │
│   ├── payroll/                         # Module Payroll (Salaires/Primes)
│   │   ├── domain/
│   │   │   ├── entity/
│   │   │   │   ├── BonusConfig.java
│   │   │   │   ├── SalaryPayment.java
│   │   │   │   └── BonusCalcType.java
│   │   │   ├── repository/
│   │   │   │   ├── BonusConfigRepository.java
│   │   │   │   └── SalaryPaymentRepository.java
│   │   │   └── service/
│   │   │       ├── BonusCalculatorService.java
│   │   │       └── SalaryPaymentService.java
│   │   ├── application/
│   │   │   ├── dto/
│   │   │   │   ├── BonusConfigRequest.java
│   │   │   │   ├── CalculateSalaryRequest.java
│   │   │   │   ├── SalaryPaymentResponse.java
│   │   │   │   └── PayslipResponse.java
│   │   │   └── mapper/
│   │   │       └── PayrollMapper.java
│   │   └── api/
│   │       └── PayrollController.java
│   │
│   ├── report/                          # Module Report
│   │   ├── domain/
│   │   │   └── service/
│   │   │       ├── DashboardService.java
│   │   │       ├── ReportService.java
│   │   │       └── ExportService.java
│   │   ├── application/
│   │   │   └── dto/
│   │   │       ├── DailySituationResponse.java
│   │   │       ├── MonthlyReportResponse.java
│   │   │       ├── DriverReportResponse.java
│   │   │       └── KpiResponse.java
│   │   └── api/
│   │       ├── DashboardController.java
│   │       └── ReportController.java
│   │
│   └── sync/                            # Module Sync (Mobile)
│       ├── domain/
│       │   └── service/
│       │       ├── SyncService.java
│       │       └── ConflictResolver.java
│       ├── application/
│       │   └── dto/
│       │       ├── SyncDataResponse.java
│       │       ├── SyncDeliveriesRequest.java
│       │       ├── SyncReturnsRequest.java
│       │       └── SyncResultResponse.java
│       └── api/
│           └── SyncController.java
│
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   ├── application-prod.yml
│   └── db/migration/
│       ├── V1__create_tenant_tables.sql      # Tenants (first!)
│       ├── V2__create_identity_tables.sql    # Users with tenant_id
│       ├── V3__create_catalog_tables.sql
│       ├── V4__create_customer_tables.sql
│       ├── V5__create_driver_tables.sql
│       ├── V6__create_delivery_tables.sql
│       ├── V7__create_payment_tables.sql
│       ├── V8__create_production_tables.sql
│       ├── V9__create_expense_tables.sql
│       ├── V10__create_round_tables.sql
│       ├── V11__create_payroll_tables.sql
│       └── V12__seed_data.sql
│
├── src/test/java/com/delivery/
│   ├── identity/
│   ├── catalog/
│   ├── customer/
│   ├── driver/
│   ├── delivery/
│   ├── payment/
│   ├── production/
│   ├── expense/
│   ├── round/
│   ├── payroll/
│   ├── report/
│   └── sync/
│
├── pom.xml
├── Dockerfile
└── docker-compose.yml
```

### 2.4 Structure Interne d'un Module

Chaque module suit une structure en 3 couches:

```
module/
├── domain/                    # Coeur metier (pas de dependances externes)
│   ├── entity/               # Entites JPA
│   ├── repository/           # Interfaces Repository
│   ├── service/              # Logique metier
│   └── event/                # Evenements du domaine
│
├── application/               # Couche application
│   ├── dto/                  # Data Transfer Objects
│   │   ├── *Request.java    # DTOs d'entree
│   │   └── *Response.java   # DTOs de sortie
│   └── mapper/               # Mappers Entity <-> DTO
│
└── api/                       # Couche presentation
    └── *Controller.java      # REST Controllers
```

### 2.5 Communication Inter-Modules

Les modules communiquent via:

1. **Interfaces publiques** - Chaque module expose des services publics
2. **Evenements de domaine** - Communication asynchrone decouplée
3. **Dependances directes** (limitees) - Injection de services entre modules

```java
// Exemple: Le module Delivery a besoin du CustomerService
@Service
public class DeliveryService {

    private final CustomerService customerService;  // Du module customer
    private final ProductService productService;    // Du module catalog
    private final EventPublisher eventPublisher;    // Du module shared

    public Delivery createDelivery(CreateDeliveryRequest request) {
        // Verifier le customer
        Customer customer = customerService.findById(request.getCustomerId());

        // Creer la livraison
        Delivery delivery = new Delivery();
        // ...

        // Publier un evenement
        eventPublisher.publish(new DeliveryCreatedEvent(delivery));

        return delivery;
    }
}
```

### 2.6 Regles de Dependances entre Modules

```
┌─────────────────────────────────────────────────────────────────────┐
│                        REGLES DE DEPENDANCES                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  shared ◄──── Tous les modules dependent de shared                  │
│                                                                      │
│  identity ◄── Tous les modules peuvent utiliser User                │
│                                                                      │
│  catalog ◄─── delivery, production, report                          │
│                                                                      │
│  customer ◄── delivery, payment, round, report                      │
│                                                                      │
│  driver ◄──── customer, round, delivery, payroll, report            │
│                                                                      │
│  delivery ──► Publie events vers payment (balance update)           │
│                                                                      │
│  round ◄───── sync (mobile)                                         │
│                                                                      │
│  payroll ◄─── delivery (stats), driver                              │
│                                                                      │
│  report ◄──── Lecture seule de tous les modules                     │
│                                                                      │
│  sync ◄────── delivery, round, customer, catalog                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Dependencies (pom.xml)

```xml
<dependencies>
    <!-- Spring Boot Starters -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

    <!-- Database -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-core</artifactId>
    </dependency>

    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.3</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.12.3</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.12.3</version>
        <scope>runtime</scope>
    </dependency>

    <!-- OpenAPI -->
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.3.0</version>
    </dependency>

    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>

    <!-- MapStruct -->
    <dependency>
        <groupId>org.mapstruct</groupId>
        <artifactId>mapstruct</artifactId>
        <version>1.5.5.Final</version>
    </dependency>

    <!-- Test -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.springframework.security</groupId>
        <artifactId>spring-security-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

---

## 3. API REST Endpoints

### 3.0 Tenant (SaaS)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/tenants/register | Register new tenant (public) |
| GET | /api/tenants/me | Get current tenant info |
| PUT | /api/tenants/me | Update tenant profile |
| GET | /api/tenants/me/stats | Get tenant statistics |
| GET | /api/tenants/me/settings | Get tenant settings |
| PUT | /api/tenants/me/settings | Update tenant settings |
| POST | /api/tenants/me/invite | Invite user to tenant |
| GET | /api/tenants/me/users | List tenant users |

### 3.1 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login |
| POST | /api/auth/register | Register (creates tenant + user) |
| POST | /api/auth/refresh | Refresh token |
| POST | /api/auth/logout | Logout |

### 3.2 Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | List users |
| GET | /api/users/{id} | Get user |
| POST | /api/users | Create user |
| PUT | /api/users/{id} | Update user |
| DELETE | /api/users/{id} | Deactivate user |

### 3.3 Drivers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/drivers | List drivers |
| GET | /api/drivers/{id} | Get driver |
| GET | /api/drivers/{id}/customers | Get driver's customers |
| GET | /api/drivers/{id}/stats | Get driver stats |
| POST | /api/drivers | Create driver |
| PUT | /api/drivers/{id} | Update driver |

### 3.4 Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/customers | List customers |
| GET | /api/customers/{id} | Get customer |
| GET | /api/customers/{id}/history | Get transaction history |
| GET | /api/customers/{id}/balance | Get balance |
| POST | /api/customers | Create customer |
| PUT | /api/customers/{id} | Update customer |
| PUT | /api/customers/{id}/assign | Assign to driver |

### 3.5 Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | List products |
| GET | /api/products/{id} | Get product |
| GET | /api/products/{id}/price-history | Get price history |
| POST | /api/products | Create product |
| PUT | /api/products/{id} | Update product |

### 3.6 Rounds
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/rounds | List rounds |
| GET | /api/rounds/today | Get today's round (for driver) |
| GET | /api/rounds/{id} | Get round details |
| POST | /api/rounds/generate | Generate daily rounds |
| PUT | /api/rounds/{id}/exclude/{customerId} | Exclude customer |
| PUT | /api/rounds/{id}/optimize | Optimize order |

### 3.7 Deliveries
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/deliveries | List deliveries |
| GET | /api/deliveries/{id} | Get delivery |
| POST | /api/deliveries | Create delivery |
| PUT | /api/deliveries/{id}/cancel | Cancel delivery |

### 3.8 Returns
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/returns | List returns |
| POST | /api/returns | Create return |

### 3.9 Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/payments | List payments |
| POST | /api/payments | Create payment |

### 3.10 Sync (Mobile)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/sync/data | Get initial data for mobile |
| POST | /api/sync/deliveries | Sync deliveries from mobile |
| POST | /api/sync/returns | Sync returns from mobile |

### 3.11 Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/reports/daily | Daily situation |
| GET | /api/reports/monthly | Monthly report |
| GET | /api/reports/driver/{id} | Driver report |
| GET | /api/reports/export | Export (PDF/Excel) |

---

## 4. Architecture Frontend (Angular)

### 4.1 Structure du Projet

```
delivery-web/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── api.service.ts
│   │   │   │   └── storage.service.ts
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── role.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── jwt.interceptor.ts
│   │   │   │   └── error.interceptor.ts
│   │   │   └── models/
│   │   │       ├── user.model.ts
│   │   │       ├── customer.model.ts
│   │   │       └── ...
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   ├── directives/
│   │   │   └── pipes/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   └── auth.module.ts
│   │   │   ├── dashboard/
│   │   │   ├── customers/
│   │   │   ├── drivers/
│   │   │   ├── products/
│   │   │   ├── deliveries/
│   │   │   ├── rounds/
│   │   │   ├── payments/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   ├── app.component.ts
│   │   ├── app.routes.ts
│   │   └── app.config.ts
│   ├── assets/
│   ├── environments/
│   └── styles/
├── angular.json
└── package.json
```

---

## 5. Architecture Mobile (Flutter)

### 5.1 Structure du Projet

```
delivery_mobile/
├── lib/
│   ├── main.dart
│   ├── app/
│   │   ├── app.dart
│   │   └── routes.dart
│   ├── core/
│   │   ├── constants/
│   │   ├── utils/
│   │   ├── network/
│   │   │   ├── api_client.dart
│   │   │   └── api_endpoints.dart
│   │   ├── settings/
│   │   │   └── app_settings.dart        # Offline mode toggle
│   │   └── offline/                      # Optionnel - si mode offline active
│   │       ├── database_helper.dart
│   │       └── sync_manager.dart
│   ├── data/
│   │   ├── models/
│   │   │   ├── customer.dart
│   │   │   ├── product.dart
│   │   │   ├── delivery.dart
│   │   │   └── ...
│   │   ├── repositories/
│   │   │   ├── customer_repository.dart
│   │   │   ├── delivery_repository.dart
│   │   │   └── sync_repository.dart
│   │   └── local/
│   │       └── local_storage.dart
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login_screen.dart
│   │   │   └── auth_provider.dart
│   │   ├── round/
│   │   │   ├── round_screen.dart
│   │   │   ├── customer_list.dart
│   │   │   └── round_provider.dart
│   │   ├── delivery/
│   │   │   ├── delivery_screen.dart
│   │   │   ├── product_selector.dart
│   │   │   └── delivery_provider.dart
│   │   ├── return/
│   │   │   └── return_screen.dart
│   │   └── stats/
│   │       └── stats_screen.dart
│   └── widgets/
│       ├── customer_card.dart
│       ├── product_item.dart
│       └── sync_indicator.dart
├── pubspec.yaml
└── android/ios/
```

### 5.2 Dependencies (pubspec.yaml)

```yaml
dependencies:
  flutter:
    sdk: flutter

  # State Management
  flutter_riverpod: ^2.4.9

  # HTTP (Mode connecte - principal)
  dio: ^5.4.0

  # Local Database (Pour mode offline optionnel)
  sqflite: ^2.3.0
  path: ^1.8.3

  # Secure Storage
  flutter_secure_storage: ^9.0.0

  # Maps
  flutter_map: ^6.1.0
  latlong2: ^0.9.0
  geolocator: ^10.1.0

  # UI
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.1

  # Utils
  intl: ^0.18.1
  connectivity_plus: ^5.0.2  # Pour detecter si offline mode necessaire

  # JWT
  jwt_decoder: ^2.0.1
```

---

## 6. Base de Donnees

### 6.1 Configuration PostgreSQL

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/delivery_db
    username: delivery_user
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
  flyway:
    enabled: true
    locations: classpath:db/migration
```

### 6.2 Docker Compose

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: delivery_db
      POSTGRES_USER: delivery_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build: ./delivery-api
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: dev
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres

volumes:
  postgres_data:
```

---

## 7. Securite

### 7.1 JWT Configuration
- Access Token: 1 heure
- Refresh Token: 30 jours
- Algorithme: HS512

### 7.2 Roles et Permissions (Par Tenant)

| Role | Description | Endpoints autorises |
|------|-------------|---------------------|
| OWNER | Proprietaire du tenant | Tous + gestion tenant |
| ADMIN | Administrateur tenant | Tous sauf suppression tenant |
| MANAGER | Gestionnaire | Tout sauf /users, /tenants |
| ACCOUNTANT | Comptable | /payments, /expenses, /reports, /salaries |
| DRIVER | Livreur | /sync, /rounds/today, /deliveries (POST), /returns (POST) |

### 7.3 Isolation Multi-Tenant

- Chaque requete est automatiquement filtree par tenant_id
- Le tenant_id est extrait du JWT et injecte dans TenantContext
- Impossible d'acceder aux donnees d'un autre tenant
- Les contraintes UNIQUE incluent tenant_id (ex: email unique par tenant)

---

## 8. Architecture Mobile - Modes de Fonctionnement

### 8.1 Mode Connecte (Par Defaut)

L'application mobile fonctionne par defaut en mode connecte. Les donnees sont envoyees en temps reel au serveur.

```
┌─────────────────┐                    ┌─────────────────┐
│   MOBILE APP    │                    │     SERVER      │
└────────┬────────┘                    └────────┬────────┘
         │                                      │
         │  1. GET /api/rounds/today            │
         │─────────────────────────────────────>│
         │  (round + customers + products)      │
         │<─────────────────────────────────────│
         │                                      │
         │  2. POST /api/deliveries             │
         │─────────────────────────────────────>│
         │  (chaque livraison en temps reel)    │
         │<─────────────────────────────────────│
         │  (confirmation immediate)            │
         │                                      │
         │  3. POST /api/returns                │
         │─────────────────────────────────────>│
         │  (chaque retour en temps reel)       │
         │<─────────────────────────────────────│
         │                                      │
```

**Avantages du mode connecte:**
- Donnees a jour en temps reel
- Pas de conflits de synchronisation
- Solde client toujours exact
- Pas de stockage local necessaire

### 8.2 Mode Hors-ligne (Optionnel)

Le mode hors-ligne est une **option activable** dans les parametres pour les zones sans couverture internet.

```
┌─────────────────┐                    ┌─────────────────┐
│   MOBILE APP    │                    │     SERVER      │
└────────┬────────┘                    └────────┬────────┘
         │                                      │
         │  1. GET /api/sync/data               │
         │─────────────────────────────────────>│
         │  (customers, products, round)        │
         │<─────────────────────────────────────│
         │                                      │
         │  [MODE HORS-LIGNE ACTIVE]            │
         │  - Stockage local SQLite             │
         │  - Queue de synchronisation          │
         │                                      │
         │  2. POST /api/sync/deliveries        │
         │─────────────────────────────────────>│
         │  (batch de livraisons en attente)    │
         │<─────────────────────────────────────│
         │                                      │
         │  3. POST /api/sync/returns           │
         │─────────────────────────────────────>│
         │  (batch de retours en attente)       │
         │<─────────────────────────────────────│
         │                                      │
```

### 8.3 Activation du Mode Hors-ligne

```dart
// Settings screen
class OfflineModeSettings {
  bool offlineModeEnabled = false;  // Desactive par defaut

  void toggleOfflineMode(bool enabled) {
    offlineModeEnabled = enabled;
    if (enabled) {
      // Telecharger les donnees pour usage offline
      syncService.downloadForOffline();
    }
  }
}
```

### 8.4 Gestion Offline (si active)

- SQLite pour stockage local (uniquement si mode offline actif)
- Queue de synchronisation
- sync_id (UUID) pour eviter doublons
- Timestamp local pour resolution conflits
- Synchronisation automatique a la reconnexion

---

*Document d'Architecture Technique - Version 2.0*
*Architecture SaaS Multi-Tenant*
