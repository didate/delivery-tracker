# Architecture et Modele de Domaine - Plateforme SaaS de Gestion de Livraisons

## 0. Architecture Multi-Tenant

### 0.1 Strategie d'Isolation

Cette application est une **plateforme SaaS multi-tenant** où chaque entreprise (tenant) possède ses propres données isolées.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    STRATEGIE MULTI-TENANT                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Approche: Isolation par colonne (tenant_id dans chaque table)          │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    BASE DE DONNEES UNIQUE                        │   │
│  │  ┌─────────────────────────────────────────────────────────┐    │   │
│  │  │  Toutes les tables contiennent: tenant_id UUID NOT NULL │    │   │
│  │  └─────────────────────────────────────────────────────────┘    │   │
│  │                                                                  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │   │
│  │  │ Tenant A │ │ Tenant B │ │ Tenant C │ │ Tenant D │  ...      │   │
│  │  │ tenant_id│ │ tenant_id│ │ tenant_id│ │ tenant_id│           │   │
│  │  │   = 1    │ │   = 2    │ │   = 3    │ │   = 4    │           │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Avantages:                                                             │
│  - Infrastructure unique (cout reduit)                                  │
│  - Maintenance simplifiee                                               │
│  - Schema unique pour tous                                              │
│  - Migration facile                                                     │
│                                                                         │
│  Implementation:                                                        │
│  - JWT contient le tenant_id de l'utilisateur                          │
│  - Filtrage automatique dans la couche service                         │
│  - Index sur (tenant_id, ...) pour performance                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 0.2 Flux d'Inscription Tenant

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Visiteur    │────▶│ Formulaire  │────▶│ Creation    │────▶│ Activation  │
│ accede site │     │ inscription │     │ Tenant +    │     │ compte      │
│             │     │ entreprise  │     │ User Owner  │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

---

## 1. Vue d'Ensemble de l'Architecture

### 1.1 Architecture Globale

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────┐              ┌──────────────────────┐         │
│  │   APPLICATION WEB    │              │  APPLICATION MOBILE  │         │
│  │                      │              │                      │         │
│  │  - Dashboard         │              │  - Rounds            │         │
│  │  - Gestion           │              │  - Deliveries        │         │
│  │  - Rapports          │              │  - Returns           │         │
│  │  - Administration    │              │  - Sync              │         │
│  │                      │              │  - Offline mode      │         │
│  └──────────┬───────────┘              └──────────┬───────────┘         │
│             │                                     │                      │
└─────────────┼─────────────────────────────────────┼──────────────────────┘
              │            HTTPS/REST               │
              └─────────────────┬───────────────────┘
                                │
┌───────────────────────────────┼──────────────────────────────────────────┐
│                         API GATEWAY                                       │
│                                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │    Auth     │  │    Rate     │  │   Routing   │  │   Logging   │     │
│  │  Middleware │  │   Limiter   │  │             │  │             │     │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘     │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │
┌───────────────────────────────┼──────────────────────────────────────────┐
│                        COUCHE METIER                                      │
│                                                                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          │
│  │     Service     │  │     Service     │  │     Service     │          │
│  │    Products     │  │    Customers    │  │    Drivers      │          │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘          │
│                                                                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          │
│  │     Service     │  │     Service     │  │     Service     │          │
│  │   Deliveries    │  │    Payments     │  │     Returns     │          │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘          │
│                                                                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          │
│  │     Service     │  │     Service     │  │     Service     │          │
│  │   Productions   │  │    Expenses     │  │     Rounds      │          │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘          │
│                                                                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          │
│  │     Service     │  │     Service     │  │     Service     │          │
│  │    Payroll      │  │    Reports      │  │      Sync       │          │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘          │
│                                                                           │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │
┌───────────────────────────────┼──────────────────────────────────────────┐
│                      COUCHE DONNEES                                       │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     BASE DE DONNEES                              │    │
│  │                    (PostgreSQL / MySQL)                          │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Architecture Mobile (Mode Connecte par Defaut)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      APPLICATION MOBILE                                  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                        UI LAYER                                   │  │
│  │   Screens: Login, Round, Delivery, Return, Stats                 │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                │                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     BUSINESS LOGIC                                │  │
│  │   Validation, Calculs, State Management                          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                │                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     NETWORK LAYER (Mode par defaut)               │  │
│  │   - API calls en temps reel                                       │  │
│  │   - Donnees envoyees immediatement au serveur                    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                │                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │            MODE HORS-LIGNE (Optionnel - activable)                │  │
│  │  ┌─────────────────┐  ┌─────────────────┐                        │  │
│  │  │  Local Storage  │  │   Sync Queue    │                        │  │
│  │  │   (SQLite)      │  │   (si active)   │                        │  │
│  │  └─────────────────┘  └─────────────────┘                        │  │
│  │   - Activable dans les parametres                                │  │
│  │   - Stockage local des donnees                                   │  │
│  │   - Synchronisation a la reconnexion                             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Mode de fonctionnement:**
- **Par defaut (Mode Connecte):** Les livraisons et retours sont envoyes directement au serveur
- **Mode Hors-ligne (Optionnel):** Activable dans les parametres pour les zones sans internet

---

## 2. Modele de Domaine

### 2.1 Diagramme des Entites (English Names)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DOMAIN MODEL (MULTI-TENANT)                         │
└─────────────────────────────────────────────────────────────────────────────────┘

                              ┌───────────────────┐
                              │      Tenant       │
                              ├───────────────────┤
                              │ id                │
                              │ name              │
                              │ code              │
                              │ email             │
                              │ is_active         │
                              └─────────┬─────────┘
                                        │ 1
                                        │
                    ┌───────────────────┼───────────────────┐
                    │ N                 │ N                 │ N
            ┌───────▼───────┐   ┌───────▼───────┐   ┌───────▼───────┐
            │     User      │   │    Product    │   │ProductionSite │
            ├───────────────┤   ├───────────────┤   ├───────────────┤
            │ id            │   │ id            │   │ id            │
            │ tenant_id     │   │ tenant_id     │   │ tenant_id     │
            │ name          │   │ name          │   │ name          │
            │ email         │   │ price         │   │ address       │
            │ role          │   │ is_active     │   │ is_active     │
            │ is_active     │   └───────────────┘   └───────────────┘
            └───────┬───────┘
                            │ 1
                            │
                            │ 0..1
                    ┌───────▼───────┐          ┌───────────────────┐
                    │    Driver     │          │ ProductionSite    │
                    ├───────────────┤          ├───────────────────┤
                    │ id            │ N      1 │ id                │
                    │ name          ├──────────┤ name              │
                    │ phone         │          │ address           │
                    │ base_salary   │          │ is_active         │
                    │ is_active     │          └─────────┬─────────┘
                    └───────┬───────┘                    │
                            │                            │ 1
           ┌────────────────┼────────────────┐           │
           │                │                │           │ N
           │ N              │ N              │    ┌──────▼──────┐
    ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼────┤ Production  │
    │    Round    │  │  Delivery   │  │   Return  │├─────────────┤
    ├─────────────┤  ├─────────────┤  ├───────────┤│ id          │
    │ id          │  │ id          │  │ id        ││ date        │
    │ date        │  │ date        │  │ date      ││ quantity    │
    │ status      │  │ total_amount│  │ reason    │└──────┬──────┘
    │ auto_gen    │  │ sync_status │  │ amount    │       │ N
    └──────┬──────┘  └──────┬──────┘  └─────┬─────┘       │
           │                │               │             │ 1
           │ N              │ 1             │ 1    ┌──────▼──────┐
           │         ┌──────▼──────┐        │      │   Product   │
           │         │DeliveryItem │        │      ├─────────────┤
           │         ├─────────────┤        │      │ id          │
           │         │ quantity    │        │      │ name        │
           │         │ unit_price  │        │      │ price       │
           │         │ amount      │        │      │ is_active   │
           │         └──────┬──────┘        │      └─────────────┘
           │                │ N             │
           │                │               │
           │         ┌──────▼───────────────▼──────┐
           │         │                             │
    ┌──────▼─────────▼──┐                   ┌──────▼──────┐
    │     Customer      │                   │   Payment   │
    ├───────────────────┤                   ├─────────────┤
    │ id                │ 1               N │ id          │
    │ name              ├───────────────────┤ date        │
    │ phone             │                   │ amount      │
    │ address           │                   │ method      │
    │ latitude          │                   └─────────────┘
    │ longitude         │
    │ credit_limit      │
    │ driver_id (FK)    │ ◄── Client attitré au livreur
    │ is_active         │
    └───────────────────┘


    ┌───────────────┐         ┌───────────────┐         ┌───────────────┐
    │    Expense    │         │ SalaryPayment │         │  BonusConfig  │
    ├───────────────┤         ├───────────────┤         ├───────────────┤
    │ id            │         │ id            │         │ id            │
    │ date          │         │ date          │         │ name          │
    │ amount        │         │ base_salary   │         │ calc_type     │
    │ category      │         │ bonus         │         │ value         │
    │ description   │         │ total         │         │ is_active     │
    └───────────────┘         └───────────────┘         └───────────────┘
```

### 2.2 Description des Entites (English)

#### Tenant (Entreprise)
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Primary key |
| code | String | Unique tenant code (auto-generated) |
| name | String | Company name |
| email | String | Contact email |
| phone | String | Contact phone |
| address | Text | Company address |
| logo_url | String | Company logo URL |
| is_active | Boolean | Tenant active |
| created_at | DateTime | Registration date |
| settings | JSON | Tenant-specific settings |

#### User
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Primary key |
| **tenant_id** | UUID | **Tenant (FK, NOT NULL)** |
| name | String | Full name |
| email | String | Email (unique per tenant) |
| password | String | Password hash |
| role | Enum | OWNER, ADMIN, MANAGER, ACCOUNTANT, DRIVER |
| is_active | Boolean | Account active or disabled |
| created_at | DateTime | Creation date |
| last_login | DateTime | Last login |

#### Driver
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Primary key |
| **tenant_id** | UUID | **Tenant (FK, NOT NULL)** |
| user_id | UUID | Link to user account (optional) |
| production_site_id | UUID | Assigned production site |
| name | String | Full name |
| phone | String | Phone number |
| base_salary | Decimal | Monthly base salary |
| is_active | Boolean | Driver active |
| hire_date | Date | Hire date |

#### Customer
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Primary key |
| **tenant_id** | UUID | **Tenant (FK, NOT NULL)** |
| code | String | Unique customer code (per tenant) |
| name | String | Name or company name |
| phone | String | Phone number |
| address | String | Full address |
| latitude | Decimal | GPS coordinate |
| longitude | Decimal | GPS coordinate |
| credit_limit | Decimal | Authorized credit limit |
| **driver_id** | UUID | **Assigned driver (FK)** |
| is_active | Boolean | Customer active |
| created_at | DateTime | Creation date |
| notes | Text | Additional notes |

#### Product
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Primary key |
| **tenant_id** | UUID | **Tenant (FK, NOT NULL)** |
| code | String | Unique product code (per tenant) |
| name | String | Full name (e.g., "Milk 1L") |
| description | String | Description |
| price | Decimal | Current unit price |
| is_active | Boolean | Product available |
| created_at | DateTime | Creation date |

#### PriceHistory
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Primary key |
| **tenant_id** | UUID | **Tenant (FK, NOT NULL)** |
| product_id | UUID | Related product |
| price | Decimal | Price at this date |
| start_date | DateTime | Start validity date |
| end_date | DateTime | End date (null if current) |

#### ProductionSite
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Primary key |
| **tenant_id** | UUID | **Tenant (FK, NOT NULL)** |
| name | String | Site name |
| address | String | Address |
| is_active | Boolean | Site active |

#### Production
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Primary key |
| **tenant_id** | UUID | **Tenant (FK, NOT NULL)** |
| production_site_id | UUID | Production site |
| product_id | UUID | Produced product |
| date | Date | Production date |
| quantity | Integer | Quantity produced |
| notes | Text | Notes |

#### Round (Tournee)
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Primary key |
| **tenant_id** | UUID | **Tenant (FK, NOT NULL)** |
| driver_id | UUID | Assigned driver |
| date | Date | Round date |
| status | Enum | PLANNED, IN_PROGRESS, COMPLETED, CANCELLED |
| auto_generated | Boolean | If generated automatically |
| start_time | Time | Expected start time |
| end_time | Time | Expected end time |
| created_at | DateTime | Creation timestamp |

#### RoundCustomer
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Primary key |
| **tenant_id** | UUID | **Tenant (FK, NOT NULL)** |
| round_id | UUID | Round |
| customer_id | UUID | Customer to visit |
| order | Integer | Visit order |
| status | Enum | TO_VISIT, VISITED, SKIPPED |
| visit_time | DateTime | Actual visit time |
| excluded | Boolean | Manually excluded from round |

#### Delivery
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Primary key |
| **tenant_id** | UUID | **Tenant (FK, NOT NULL)** |
| customer_id | UUID | Delivered customer |
| driver_id | UUID | Driver |
| round_id | UUID | Round (optional) |
| date | DateTime | Date and time |
| total_amount | Decimal | Calculated total amount |
| sync_status | Enum | SYNCED, PENDING, CONFLICT |
| sync_id | UUID | ID for synchronization |
| local_created_at | DateTime | Creation date on mobile |

#### DeliveryItem
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Primary key |
| **tenant_id** | UUID | **Tenant (FK, NOT NULL)** |
| delivery_id | UUID | Parent delivery |
| product_id | UUID | Delivered product |
| quantity | Integer | Quantity |
| unit_price | Decimal | Price at delivery time |
| amount | Decimal | Quantity x Unit price |

#### Return
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Primary key |
| **tenant_id** | UUID | **Tenant (FK, NOT NULL)** |
| customer_id | UUID | Customer (optional) |
| driver_id | UUID | Driver |
| product_id | UUID | Returned product |
| date | DateTime | Return date |
| quantity | Integer | Returned quantity |
| reason | Enum | UNSOLD, EXPIRED, DEFECTIVE, OTHER |
| description | Text | Additional description |
| amount | Decimal | Return value |
| credit_customer | Boolean | If return credits customer account |
| sync_status | Enum | SYNCED, PENDING |

#### Payment
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Primary key |
| **tenant_id** | UUID | **Tenant (FK, NOT NULL)** |
| customer_id | UUID | Customer |
| date | DateTime | Payment date |
| amount | Decimal | Amount paid |
| method | Enum | CASH, TRANSFER, CHECK, MOBILE |
| reference | String | Reference (check number, etc.) |
| notes | Text | Notes |
| recorded_by | UUID | User who recorded |

#### Expense
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Primary key |
| **tenant_id** | UUID | **Tenant (FK, NOT NULL)** |
| production_site_id | UUID | Related site (optional) |
| date | Date | Expense date |
| amount | Decimal | Amount |
| category | Enum | RAW_MATERIALS, TRANSPORT, SALARIES, EQUIPMENT, OTHER |
| description | Text | Description |
| recorded_by | UUID | User |

#### BonusConfig
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Primary key |
| **tenant_id** | UUID | **Tenant (FK, NOT NULL)** |
| name | String | Rule name |
| calc_type | Enum | PERCENTAGE_REVENUE, BONUS_PER_DELIVERY, FIXED_BONUS |
| value | Decimal | Value (% or amount) |
| min_threshold | Decimal | Minimum threshold to trigger |
| is_active | Boolean | Rule active |

#### SalaryPayment
| Attribut | Type | Description |
|----------|------|-------------|
| id | UUID | Primary key |
| **tenant_id** | UUID | **Tenant (FK, NOT NULL)** |
| driver_id | UUID | Driver |
| period_start | Date | Period start |
| period_end | Date | Period end |
| base_salary | Decimal | Base salary |
| bonus | Decimal | Total bonus |
| total | Decimal | Total to pay |
| payment_date | Date | Actual payment date |
| status | Enum | CALCULATED, PAID |
| bonus_details | JSON | Bonus calculation details |

---

## 3. Relations entre Entites

### 3.1 Relations Multi-Tenant

| Source Entity | Relation | Target Entity | Cardinality |
|---------------|----------|---------------|-------------|
| **Tenant** | **owns** | **User** | **1 - N** |
| **Tenant** | **owns** | **Driver** | **1 - N** |
| **Tenant** | **owns** | **Customer** | **1 - N** |
| **Tenant** | **owns** | **Product** | **1 - N** |
| **Tenant** | **owns** | **ProductionSite** | **1 - N** |
| **Tenant** | **owns** | **All other entities** | **1 - N** |

### 3.2 Relations Metier

| Source Entity | Relation | Target Entity | Cardinality |
|---------------|----------|---------------|-------------|
| User | is | Driver | 1 - 0..1 |
| ProductionSite | employs | Driver | 1 - N |
| ProductionSite | produces | Production | 1 - N |
| Product | has | PriceHistory | 1 - N |
| Product | concerns | Production | 1 - N |
| **Driver** | **has_assigned** | **Customer** | **1 - N** |
| Driver | performs | Round | 1 - N |
| Driver | makes | Delivery | 1 - N |
| Driver | records | Return | 1 - N |
| Round | contains | RoundCustomer | 1 - N |
| Customer | is_in | RoundCustomer | 1 - N |
| Customer | receives | Delivery | 1 - N |
| Customer | makes | Payment | 1 - N |
| Customer | returns | Return | 1 - N |
| Delivery | contains | DeliveryItem | 1 - N |
| Product | composes | DeliveryItem | 1 - N |
| Driver | receives | SalaryPayment | 1 - N |

---

## 4. Flux Metier Principaux

### 4.1 Flux de Creation de Tournee (Automatique)

```
┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Chaque  │────▶│ Recuperer   │────▶│ Creer Round │────▶│ Ajouter     │
│ Jour    │     │ Livreurs    │     │ pour chaque │     │ Customers   │
│ (Auto)  │     │ Actifs      │     │ livreur     │     │ attribues   │
└─────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
                                                               │
                ┌─────────────┐     ┌─────────────┐            │
                │ Round       │◀────│ Optimiser   │◀───────────┘
                │ Prete       │     │ ordre GPS   │
                └─────────────┘     └─────────────┘
```

**Description:**
1. Chaque jour (ou a la demande), le systeme genere automatiquement les tournees
2. Pour chaque livreur actif:
   - Creer un Round avec status = PLANNED
   - Recuperer tous les Customer ou driver_id = livreur
   - Ajouter chaque customer au RoundCustomer
   - Optimiser l'ordre de passage par GPS
3. Le gestionnaire peut ensuite exclure des clients si necessaire

### 4.2 Flux de Livraison

```
┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Debut   │────▶│ Consulter   │────▶│ Selectionner│────▶│ Ajouter     │
│         │     │ Round       │     │ Customer    │     │ Products    │
└─────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
                                                               │
                ┌─────────────┐     ┌─────────────┐            │
                │ Fin         │◀────│ Mettre a    │◀───────────┘
                │             │     │ jour solde  │
                └─────────────┘     │ customer    │
                                    └─────────────┘
```

### 4.3 Flux de Synchronisation Mobile

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Connection  │────▶│ Check       │────▶│ Resolve     │
│ Detected    │     │ Sync Queue  │     │ Conflicts   │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
┌─────────────┐     ┌─────────────┐            │
│ Notify      │◀────│ Download    │◀───────────┘
│ User        │     │ New Data    │
│             │     │             │
└─────────────┘     └─────────────┘
```

### 4.4 Flux de Calcul des Primes (Bonus)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Select      │────▶│ Get Driver  │────▶│ Apply       │
│ Period      │     │ Deliveries  │     │ Bonus Rules │
│             │     │             │     │             │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
┌─────────────┐     ┌─────────────┐            │
│ Generate    │◀────│ Calculate   │◀───────────┘
│ Payslip     │     │ Total       │
│             │     │             │
└─────────────┘     └─────────────┘
```

---

## 5. Cas d'Utilisation Principaux

### UC-01: Generer les Tournees du Jour

**Acteur principal:** Systeme (automatique) ou Gestionnaire (manuel)
**Preconditions:** Drivers et Customers existent, Customers assignes aux Drivers
**Postconditions:** Rounds crees pour tous les drivers actifs

**Scenario principal:**
1. Le systeme identifie tous les drivers actifs
2. Pour chaque driver:
   a. Creer un nouveau Round (date = aujourd'hui, status = PLANNED)
   b. Recuperer tous les Customers ou driver_id = driver.id
   c. Pour chaque customer, creer un RoundCustomer
   d. Calculer l'ordre optimal base sur les coordonnees GPS
3. Les rounds sont prets pour consultation

**Extensions:**
- 2b. Aucun customer attribue: Le round est cree vide (ou pas cree)
- Le gestionnaire peut exclure des customers du round

---

### UC-02: Enregistrer une Livraison

**Acteur principal:** Driver
**Preconditions:** Driver authentifie, Customer existant
**Postconditions:** Delivery enregistree, Customer balance mise a jour

**Scenario principal:**
1. Le driver consulte son Round du jour
2. Il selectionne un Customer
3. Le systeme affiche les infos Customer et son solde
4. Le driver ajoute des Products et quantites
5. Le systeme calcule le total_amount
6. Le driver valide la Delivery
7. Le systeme enregistre la Delivery et les DeliveryItems
8. Le systeme met a jour le solde Customer
9. Le RoundCustomer.status passe a VISITED

---

### UC-03: Assigner un Customer a un Driver

**Acteur principal:** Manager / Admin
**Preconditions:** Customer et Driver existent
**Postconditions:** Customer.driver_id = Driver.id

**Scenario principal:**
1. L'utilisateur selectionne un Customer
2. L'utilisateur selectionne un Driver dans la liste
3. Le systeme met a jour Customer.driver_id
4. Le Customer apparaitra dans les prochains Rounds du Driver

---

## 6. Regles de Gestion

### 6.1 Regles Multi-Tenant

| Code | Regle |
|------|-------|
| **RG-T01** | **Toutes les tables (sauf tenants) contiennent tenant_id NOT NULL** |
| **RG-T02** | **Un utilisateur appartient a un seul tenant** |
| **RG-T03** | **Toute requete est automatiquement filtree par tenant_id** |
| **RG-T04** | **Les contraintes d'unicite incluent tenant_id (ex: email unique par tenant)** |
| **RG-T05** | **Le tenant_id est extrait du JWT et injecte dans chaque service** |
| **RG-T06** | **Un utilisateur ne peut jamais acceder aux donnees d'un autre tenant** |

### 6.2 Regles Metier

| Code | Regle |
|------|-------|
| RG-01 | Customer balance = Sum(Deliveries) - Sum(Payments) - Sum(credited Returns) |
| RG-02 | Une Delivery ne peut pas etre supprimee, seulement annulee |
| RG-03 | Un Payment ne peut pas etre supprime, seulement corrige par mouvement inverse |
| RG-04 | Le prix applique a une Delivery est le Product.price au moment de la Delivery |
| RG-05 | Un Return credite le Customer seulement si credit_customer = true |
| RG-06 | Les bonus sont calcules sur la periode definie (semaine/mois) |
| RG-07 | Un User avec role DRIVER ne voit que ses propres donnees |
| RG-08 | Mode connecte par defaut: les donnees sont envoyees en temps reel |
| RG-09 | Mode hors-ligne optionnel: les donnees sont synchronisees a la reconnexion |
| RG-10 | En cas de conflit de sync (mode offline), la version serveur prevaut |
| RG-11 | Stock theorique = Production - Deliveries + Returns |
| **RG-12** | **Un Customer est assigne a un seul Driver (driver_id)** |
| **RG-13** | **Un Round est genere automatiquement avec tous les Customers du Driver** |
| **RG-14** | **Le gestionnaire peut exclure des Customers d'un Round** |

---

## 7. Schema de Base de Donnees (Tables SQL - Multi-Tenant)

```sql
-- ============================================
-- TENANT TABLE (No tenant_id - root table)
-- ============================================
CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    logo_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    settings JSONB DEFAULT '{}'::jsonb
);

-- ============================================
-- ALL OTHER TABLES WITH tenant_id
-- ============================================

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL, -- OWNER, ADMIN, MANAGER, ACCOUNTANT, DRIVER
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    UNIQUE(tenant_id, email)
);

-- Production sites
CREATE TABLE production_sites (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(100) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(tenant_id, name)
);

-- Drivers
CREATE TABLE drivers (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID REFERENCES users(id),
    production_site_id UUID REFERENCES production_sites(id) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    base_salary DECIMAL(15, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    hire_date DATE,
    UNIQUE(tenant_id, phone)
);

-- Products
CREATE TABLE products (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(15, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, code)
);

-- Price history
CREATE TABLE price_history (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    product_id UUID REFERENCES products(id) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP
);

-- Customers
CREATE TABLE customers (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    credit_limit DECIMAL(15, 2),
    driver_id UUID REFERENCES drivers(id), -- Assigned driver
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    UNIQUE(tenant_id, code)
);

-- Production records
CREATE TABLE productions (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    production_site_id UUID REFERENCES production_sites(id) NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    date DATE NOT NULL,
    quantity INTEGER NOT NULL,
    notes TEXT,
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, production_site_id, product_id, date)
);

-- Rounds (Tournees)
CREATE TABLE rounds (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    driver_id UUID REFERENCES drivers(id) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'PLANNED', -- PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
    auto_generated BOOLEAN DEFAULT TRUE,
    start_time TIME,
    end_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, driver_id, date)
);

-- Round customers
CREATE TABLE round_customers (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    round_id UUID REFERENCES rounds(id) NOT NULL,
    customer_id UUID REFERENCES customers(id) NOT NULL,
    visit_order INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'TO_VISIT', -- TO_VISIT, VISITED, SKIPPED
    visit_time TIMESTAMP,
    excluded BOOLEAN DEFAULT FALSE,
    UNIQUE(tenant_id, round_id, customer_id)
);

-- Deliveries
CREATE TABLE deliveries (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    customer_id UUID REFERENCES customers(id) NOT NULL,
    driver_id UUID REFERENCES drivers(id) NOT NULL,
    round_id UUID REFERENCES rounds(id),
    date TIMESTAMP NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    sync_status VARCHAR(20) DEFAULT 'SYNCED', -- SYNCED, PENDING, CONFLICT
    sync_id UUID,
    local_created_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    UNIQUE(tenant_id, sync_id)
);

-- Delivery items
CREATE TABLE delivery_items (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    delivery_id UUID REFERENCES deliveries(id) NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL
);

-- Returns
CREATE TABLE returns (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    customer_id UUID REFERENCES customers(id),
    driver_id UUID REFERENCES drivers(id) NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    date TIMESTAMP NOT NULL,
    quantity INTEGER NOT NULL,
    reason VARCHAR(20) NOT NULL, -- UNSOLD, EXPIRED, DEFECTIVE, OTHER
    description TEXT,
    amount DECIMAL(15, 2) NOT NULL,
    credit_customer BOOLEAN DEFAULT FALSE,
    sync_status VARCHAR(20) DEFAULT 'SYNCED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    customer_id UUID REFERENCES customers(id) NOT NULL,
    date TIMESTAMP NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    method VARCHAR(20) NOT NULL, -- CASH, TRANSFER, CHECK, MOBILE
    reference VARCHAR(100),
    notes TEXT,
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expenses
CREATE TABLE expenses (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    production_site_id UUID REFERENCES production_sites(id),
    date DATE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    category VARCHAR(30) NOT NULL, -- RAW_MATERIALS, TRANSPORT, SALARIES, EQUIPMENT, OTHER
    description TEXT NOT NULL,
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bonus configuration
CREATE TABLE bonus_configs (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(100) NOT NULL,
    calc_type VARCHAR(30) NOT NULL, -- PERCENTAGE_REVENUE, BONUS_PER_DELIVERY, FIXED_BONUS
    value DECIMAL(15, 4) NOT NULL,
    min_threshold DECIMAL(15, 2),
    is_active BOOLEAN DEFAULT TRUE
);

-- Salary payments
CREATE TABLE salary_payments (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    driver_id UUID REFERENCES drivers(id) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    base_salary DECIMAL(15, 2) NOT NULL,
    bonus DECIMAL(15, 2) NOT NULL,
    total DECIMAL(15, 2) NOT NULL,
    payment_date DATE,
    status VARCHAR(20) DEFAULT 'CALCULATED', -- CALCULATED, PAID
    bonus_details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, driver_id, period_start, period_end)
);

-- Audit log
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tenant settings (per tenant)
CREATE TABLE tenant_settings (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    key VARCHAR(100) NOT NULL,
    value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, key)
);

-- ============================================
-- INDEXES (with tenant_id for performance)
-- ============================================
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_production_sites_tenant ON production_sites(tenant_id);
CREATE INDEX idx_drivers_tenant ON drivers(tenant_id);
CREATE INDEX idx_products_tenant ON products(tenant_id);
CREATE INDEX idx_customers_tenant ON customers(tenant_id);
CREATE INDEX idx_customers_driver ON customers(tenant_id, driver_id);
CREATE INDEX idx_productions_tenant ON productions(tenant_id);
CREATE INDEX idx_rounds_tenant ON rounds(tenant_id);
CREATE INDEX idx_rounds_driver_date ON rounds(tenant_id, driver_id, date);
CREATE INDEX idx_round_customers_tenant ON round_customers(tenant_id);
CREATE INDEX idx_deliveries_tenant ON deliveries(tenant_id);
CREATE INDEX idx_deliveries_customer ON deliveries(tenant_id, customer_id);
CREATE INDEX idx_deliveries_driver ON deliveries(tenant_id, driver_id);
CREATE INDEX idx_deliveries_date ON deliveries(tenant_id, date);
CREATE INDEX idx_delivery_items_tenant ON delivery_items(tenant_id);
CREATE INDEX idx_returns_tenant ON returns(tenant_id);
CREATE INDEX idx_returns_driver ON returns(tenant_id, driver_id);
CREATE INDEX idx_payments_tenant ON payments(tenant_id);
CREATE INDEX idx_payments_customer ON payments(tenant_id, customer_id);
CREATE INDEX idx_expenses_tenant ON expenses(tenant_id);
CREATE INDEX idx_bonus_configs_tenant ON bonus_configs(tenant_id);
CREATE INDEX idx_salary_payments_tenant ON salary_payments(tenant_id);
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
```

---

## 8. Glossaire (English Terms)

| Term | French | Definition |
|------|--------|------------|
| **Tenant** | Entreprise | Company registered on the SaaS platform, with isolated data |
| **tenant_id** | ID Entreprise | Unique tenant identifier, present in all tables for isolation |
| **Delivery** | Livraison | Act of delivering products to a customer, creating a debt |
| **Return** | Retour | Products returned by driver (unsold, expired, defective) |
| **Payment** | Paiement | Amount paid by customer to settle debts (global credit) |
| **Balance** | Solde | Amount owed by customer to the company |
| **Credit Limit** | Plafond de credit | Maximum authorized debt for a customer |
| **Production** | Production | Quantity of products manufactured |
| **ProductionSite** | Point de production | Physical location where products are made |
| **Expense** | Depense | Money outflow related to business activity |
| **Round** | Tournee | Set of customers to visit by a driver on a given day |
| **Bonus** | Prime | Variable compensation based on driver performance |
| **Sync** | Synchronisation | Data transfer between mobile app and server |
| **Driver** | Livreur | Person who delivers products |
| **Customer** | Client | Person or company receiving products |

---

*Document BMAD - Architecture and Domain Model*
*Version 3.0 - Multi-Tenant SaaS Architecture*
