# Architecture Technique - Plateforme SaaS Delivery Management System

## 0. Contexte du Projet

Ce projet utilise **JHipster 9** comme générateur d'application, combinant Spring Boot 4 côté backend et Angular 21 côté frontend. L'architecture suit les conventions JHipster avec une personnalisation pour le multi-tenant.

---

## 1. Stack Technologique

### Backend (JHipster 9)
| Composant | Technologie | Version |
|-----------|-------------|---------|
| Générateur | JHipster | 9.x (Beta) |
| Language | Java | 21+ |
| Framework | Spring Boot | 4.x |
| Build Tool | Maven | 3.9+ |
| ORM | Spring Data JPA / Hibernate | 7.x |
| Security | Spring Security + JWT | |
| API Docs | SpringDoc OpenAPI | |
| Validation | Bean Validation (Jakarta) | |
| Migrations | Liquibase | |

### Frontend Web (JHipster 9)
| Composant | Technologie | Version |
|-----------|-------------|---------|
| Framework | Angular | 21+ |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| State | Angular Signals | |
| HTTP | Angular HttpClient | |
| i18n | ngx-translate | |
| Icons | FontAwesome | |

### Base de Données
| Composant | Technologie |
|-----------|-------------|
| SGBD Dev | H2 (in-memory) |
| SGBD Prod | PostgreSQL 17+ |
| Migrations | Liquibase |

### Infrastructure
| Composant | Technologie |
|-----------|-------------|
| Containerisation | Docker |
| Orchestration | Docker Compose |
| CI/CD | GitHub Actions |

---

## 2. Architecture JHipster - Structure du Projet

### 2.1 Structure Backend

```
src/main/java/com/delivery/
├── DeliveryApp.java                    # Point d'entrée Spring Boot
├── config/                             # Configuration Spring
│   ├── SecurityConfiguration.java
│   ├── DatabaseConfiguration.java
│   ├── WebConfigurer.java
│   └── ...
├── domain/                             # Entités JPA
│   ├── Tenant.java
│   ├── TenantSettings.java
│   ├── Product.java
│   ├── PriceHistory.java
│   ├── Vehicle.java
│   ├── Driver.java
│   ├── ProductionSite.java
│   ├── Customer.java
│   ├── Production.java
│   ├── Delivery.java
│   ├── DeliveryItem.java
│   ├── Round.java
│   ├── RoundCustomer.java
│   ├── Payment.java
│   ├── ProductReturn.java
│   ├── ReturnItem.java
│   ├── ExpenseCategory.java
│   ├── Expense.java
│   └── enumeration/
│       ├── DeliveryStatus.java
│       ├── RoundStatus.java
│       ├── PaymentMethod.java
│       ├── ReturnReason.java
│       └── VehicleType.java
├── repository/                         # Spring Data JPA Repositories
│   ├── TenantRepository.java
│   ├── ProductRepository.java
│   ├── CustomerRepository.java
│   └── ...
├── service/                            # Services métier
│   ├── TenantService.java
│   ├── ProductService.java
│   ├── dto/                           # DTOs
│   └── mapper/                        # MapStruct Mappers
├── web/rest/                          # REST Controllers
│   ├── TenantResource.java
│   ├── ProductResource.java
│   └── ...
└── security/                          # Sécurité
    ├── jwt/
    └── ...
```

### 2.2 Structure Frontend Angular

```
src/main/webapp/app/
├── app.component.ts                    # Composant racine
├── app.config.ts                       # Configuration standalone
├── app.routes.ts                       # Routes principales
├── core/                               # Services core
│   ├── auth/
│   │   ├── account.service.ts
│   │   ├── auth-jwt.service.ts
│   │   └── state-storage.service.ts
│   └── util/
├── entities/                           # Modules entités (CRUD)
│   ├── tenant/
│   ├── tenant-settings/
│   ├── product/
│   ├── price-history/
│   ├── vehicle/
│   ├── driver/
│   ├── production-site/
│   ├── customer/
│   ├── production/
│   ├── delivery/
│   ├── delivery-item/
│   ├── round/
│   ├── round-customer/
│   ├── payment/
│   ├── product-return/
│   ├── return-item/
│   ├── expense-category/
│   ├── expense/
│   └── entity.routes.ts
├── layouts/                            # Layouts
│   ├── main/
│   ├── sidebar/                       # Navigation latérale
│   │   ├── sidebar.component.ts
│   │   ├── sidebar.component.html
│   │   ├── sidebar-menu.config.ts    # Configuration menu
│   │   └── sidebar-item.model.ts
│   ├── header/
│   └── footer/
├── shared/                             # Composants partagés
│   ├── filter/                        # Filtres de recherche
│   ├── pagination/
│   ├── sort/
│   ├── directives/
│   │   └── responsive-table.directive.ts
│   └── language/
├── home/                               # Page d'accueil
├── account/                            # Gestion compte
└── admin/                              # Administration
```

---

## 3. Entités Implémentées

### 3.1 Diagramme des Entités

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DOMAIN MODEL                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐                                                       │
│  │    Tenant    │ ◄─────────────────────────────────────────────────┐   │
│  │  (Locataire) │                                                    │   │
│  └──────┬───────┘                                                    │   │
│         │ 1:1                                                        │   │
│         ▼                                                            │   │
│  ┌──────────────────┐                                                │   │
│  │  TenantSettings  │                                                │   │
│  └──────────────────┘                                                │   │
│                                                                       │   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │   │
│  │   Product   │  │   Vehicle   │  │   Driver    │  │  Customer   │ │   │
│  │  (Produit)  │  │ (Véhicule)  │  │ (Chauffeur) │  │  (Client)   │ │   │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘ │   │
│         │                │                │                │        │   │
│    1:N  │                │ N:1            │ N:1            │        │   │
│         ▼                │                │                │        │   │
│  ┌──────────────┐        │                │                │        │   │
│  │ PriceHistory │        └────────────────┴────────────────┘        │   │
│  └──────────────┘                         │                         │   │
│                                           │                         │   │
│  ┌──────────────────┐                     │                         │   │
│  │  ProductionSite  │                     │                         │   │
│  │ (Site production)│                     │                         │   │
│  └────────┬─────────┘                     │                         │   │
│           │ 1:N                           │                         │   │
│           ▼                               │                         │   │
│  ┌──────────────┐                         │                         │   │
│  │  Production  │                         │                         │   │
│  └──────────────┘                         │                         │   │
│                                           │                         │   │
│  ┌──────────────┐  N:1                    │                         │   │
│  │   Delivery   │◄────────────────────────┤                         │   │
│  │  (Livraison) │                         │                         │   │
│  └──────┬───────┘                         │                         │   │
│         │ 1:N                             │                         │   │
│         ▼                                 │                         │   │
│  ┌──────────────┐                         │                         │   │
│  │ DeliveryItem │                         │                         │   │
│  └──────────────┘                         │                         │   │
│                                           │                         │   │
│  ┌──────────────┐                         │                         │   │
│  │    Round     │──────────────────────────┘                         │   │
│  │  (Tournée)   │                                                   │   │
│  └──────┬───────┘                                                   │   │
│         │ 1:N                                                       │   │
│         ▼                                                           │   │
│  ┌──────────────────┐                                               │   │
│  │  RoundCustomer   │                                               │   │
│  │ (Client tournée) │                                               │   │
│  └──────────────────┘                                               │   │
│                                                                      │   │
│  ┌──────────────┐     ┌──────────────────┐                          │   │
│  │   Payment    │     │  ProductReturn   │                          │   │
│  │  (Paiement)  │     │ (Retour produit) │                          │   │
│  └──────────────┘     └───────┬──────────┘                          │   │
│                               │ 1:N                                 │   │
│                               ▼                                     │   │
│                       ┌──────────────┐                              │   │
│                       │  ReturnItem  │                              │   │
│                       └──────────────┘                              │   │
│                                                                      │   │
│  ┌──────────────────┐     ┌──────────────┐                          │   │
│  │ ExpenseCategory  │◄────│   Expense    │                          │   │
│  │ (Cat. dépense)   │ 1:N │  (Dépense)   │                          │   │
│  └──────────────────┘     └──────────────┘                          │   │
│                                                                      │   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Énumérations

| Enum | Valeurs |
|------|---------|
| `DeliveryStatus` | PENDING, IN_PROGRESS, DELIVERED, CANCELLED |
| `RoundStatus` | PLANNED, IN_PROGRESS, COMPLETED, CANCELLED |
| `PaymentMethod` | CASH, BANK_TRANSFER, CHECK, MOBILE_PAYMENT |
| `ReturnReason` | DAMAGED, EXPIRED, WRONG_PRODUCT, EXCESS, CUSTOMER_REFUSAL, OTHER |
| `VehicleType` | CAR, MOTO, TRUCK, VAN |

---

## 4. API REST Endpoints

### 4.1 Endpoints par Entité (Convention JHipster)

Chaque entité suit le pattern REST standard JHipster:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/{entities} | Liste paginée avec filtres |
| GET | /api/{entities}/{id} | Détail d'une entité |
| POST | /api/{entities} | Créer une entité |
| PUT | /api/{entities}/{id} | Mettre à jour une entité |
| PATCH | /api/{entities}/{id} | Mise à jour partielle |
| DELETE | /api/{entities}/{id} | Supprimer une entité |

### 4.2 Endpoints Disponibles

- `/api/tenants`
- `/api/tenant-settings`
- `/api/products`
- `/api/price-histories`
- `/api/vehicles`
- `/api/drivers`
- `/api/production-sites`
- `/api/customers`
- `/api/productions`
- `/api/deliveries`
- `/api/delivery-items`
- `/api/rounds`
- `/api/round-customers`
- `/api/payments`
- `/api/product-returns`
- `/api/return-items`
- `/api/expense-categories`
- `/api/expenses`

### 4.3 Authentification
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/authenticate | Login (retourne JWT) |
| POST | /api/register | Inscription |
| GET | /api/account | Info utilisateur connecté |
| POST | /api/account | Mise à jour compte |
| POST | /api/account/change-password | Changement mot de passe |

---

## 5. Sécurité

### 5.1 JWT Configuration
- Access Token via header `Authorization: Bearer <token>`
- Refresh géré par JHipster
- Algorithme: HS512

### 5.2 Rôles
| Role | Description |
|------|-------------|
| ROLE_ADMIN | Administrateur complet |
| ROLE_USER | Utilisateur standard |

### 5.3 Filtres de Sécurité
- JHipster Security Configuration
- CORS configuré pour développement
- CSRF désactivé pour API REST

---

## 6. Frontend - Tailwind CSS

### 6.1 Configuration
Le projet utilise Tailwind CSS 3.x avec:
- Palette de couleurs: Orange comme couleur primaire
- Responsive design (breakpoints: sm, md, lg, xl)
- Dark mode ready (non activé)

### 6.2 Composants UI
- Tables responsives avec `jhiResponsiveTable` directive
- Filtres de recherche avec `jhi-filter`
- Pagination personnalisée
- Modales et dialogs
- Formulaires stylisés

### 6.3 Sidebar Menu
Configuration déclarative dans `sidebar-menu.config.ts`:
- Menu hiérarchique avec dropdowns
- Contrôle d'accès par rôle
- Icônes FontAwesome
- i18n support

---

## 7. Internationalisation (i18n)

### 7.1 Langues Supportées
- Français (fr) - Langue par défaut
- Anglais (en)

### 7.2 Structure des Fichiers
```
src/main/webapp/i18n/
├── fr/
│   ├── global.json
│   ├── home.json
│   ├── product.json
│   ├── customer.json
│   └── ... (un fichier par entité)
└── en/
    └── ... (même structure)
```

---

## 8. Base de Données

### 8.1 Configuration Développement (H2)
```yaml
spring:
  datasource:
    type: com.zaxxer.hikari.HikariDataSource
    url: jdbc:h2:mem:delivery
    username: delivery
    password:
  h2:
    console:
      enabled: true
      path: /h2-console
```

### 8.2 Configuration Production (PostgreSQL)
```yaml
spring:
  datasource:
    type: com.zaxxer.hikari.HikariDataSource
    url: jdbc:postgresql://localhost:5432/delivery
    username: delivery
    password: ${DB_PASSWORD}
```

### 8.3 Migrations Liquibase
Les migrations sont gérées automatiquement par JHipster/Liquibase dans:
```
src/main/resources/config/liquibase/
├── master.xml
└── changelog/
    ├── 00000000000000_initial_schema.xml
    └── ... (changelogs par entité)
```

---

## 9. Architecture Multi-Tenant (À Implémenter)

### 9.1 Stratégie Recommandée
Isolation par colonne `tenant_id` (Row-Level Security):
- Chaque entité possède un champ `tenant_id`
- Filtrage automatique via Hibernate Filters
- JWT contient le `tenant_id` de l'utilisateur

### 9.2 Implémentation Suggérée
```java
// TenantContext - ThreadLocal storage
public class TenantContext {
    private static final ThreadLocal<Long> currentTenant = new ThreadLocal<>();

    public static Long getCurrentTenant() {
        return currentTenant.get();
    }

    public static void setCurrentTenant(Long tenantId) {
        currentTenant.set(tenantId);
    }
}

// TenantFilter - Hibernate Filter
@FilterDef(name = "tenantFilter", parameters = @ParamDef(name = "tenantId", type = Long.class))
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
```

---

## 10. Déploiement

### 10.1 Docker
```bash
# Build
./mvnw -Pprod verify jib:dockerBuild

# Run avec Docker Compose
docker-compose -f src/main/docker/app.yml up
```

### 10.2 Scripts Disponibles
```bash
# Développement
./mvnw
npm start

# Production build
./mvnw -Pprod clean verify

# Tests
./mvnw verify
npm test
```

---

*Document d'Architecture Technique - Version 3.0*
*JHipster 9 + Spring Boot 4 + Angular 21 + Tailwind CSS*
