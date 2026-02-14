# Implementation Guide - JHipster 9 Project

Ce guide reflète l'état actuel du projet après migration vers JHipster 9.

---

## État Actuel

### Stack Technique
- **Backend**: JHipster 9 + Spring Boot 4 + Java 21
- **Frontend**: Angular 21 + Tailwind CSS
- **Base de données**: H2 (dev) / PostgreSQL (prod)
- **Migrations**: Liquibase

### Entités Implémentées (CRUD Complet)

| Entité | Package Backend | Frontend |
|--------|-----------------|:--------:|
| Tenant | `com.delivery.domain` | ✅ |
| TenantSettings | `com.delivery.domain` | ✅ |
| Product | `com.delivery.domain` | ✅ |
| PriceHistory | `com.delivery.domain` | ✅ |
| Vehicle | `com.delivery.domain` | ✅ |
| Driver | `com.delivery.domain` | ✅ |
| ProductionSite | `com.delivery.domain` | ✅ |
| Customer | `com.delivery.domain` | ✅ |
| Production | `com.delivery.domain` | ✅ |
| Delivery | `com.delivery.domain` | ✅ |
| DeliveryItem | `com.delivery.domain` | ✅ |
| Round | `com.delivery.domain` | ✅ |
| RoundCustomer | `com.delivery.domain` | ✅ |
| Payment | `com.delivery.domain` | ✅ |
| ProductReturn | `com.delivery.domain` | ✅ |
| ReturnItem | `com.delivery.domain` | ✅ |
| ExpenseCategory | `com.delivery.domain` | ✅ |
| Expense | `com.delivery.domain` | ✅ |

---

## Prochaines Phases de Développement

### Phase 1: Multi-Tenant (Priorité Haute)

**Objectif**: Isolation des données par tenant

#### 1.1 Backend - Filtrage par tenant_id

```java
// À créer: TenantContext.java
@Component
public class TenantContext {
    private static final ThreadLocal<Long> currentTenant = new ThreadLocal<>();

    public static Long getCurrentTenant() {
        return currentTenant.get();
    }

    public static void setCurrentTenant(Long tenantId) {
        currentTenant.set(tenantId);
    }

    public static void clear() {
        currentTenant.remove();
    }
}

// À créer: TenantFilter.java
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class TenantFilter extends OncePerRequestFilter {

    @Autowired
    private TokenProvider tokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String jwt = resolveToken(request);
        if (jwt != null && tokenProvider.validateToken(jwt)) {
            Long tenantId = tokenProvider.getTenantId(jwt);
            TenantContext.setCurrentTenant(tenantId);
        }
        try {
            chain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
```

#### 1.2 Entités - Hibernate Filters

```java
// Ajouter sur chaque entité tenant-aware
@Entity
@FilterDef(name = "tenantFilter", parameters = @ParamDef(name = "tenantId", type = Long.class))
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
public class Product extends AbstractAuditingEntity {
    // ...
}
```

#### 1.3 Services - Activer le filtre

```java
@Service
@Transactional
public class ProductService {

    @PersistenceContext
    private EntityManager entityManager;

    @PostConstruct
    public void enableTenantFilter() {
        entityManager.unwrap(Session.class)
            .enableFilter("tenantFilter")
            .setParameter("tenantId", TenantContext.getCurrentTenant());
    }
}
```

---

### Phase 2: Logique Métier (Priorité Haute)

#### 2.1 Calcul des Soldes Clients

```java
// CustomerService.java - Ajouter méthode
public BigDecimal calculateBalance(Long customerId) {
    BigDecimal deliveries = deliveryRepository.sumAmountByCustomerId(customerId);
    BigDecimal payments = paymentRepository.sumAmountByCustomerId(customerId);
    BigDecimal returns = returnRepository.sumCreditedAmountByCustomerId(customerId);

    return deliveries.subtract(payments).subtract(returns);
}

// CustomerRepository.java - Ajouter requête
@Query("SELECT COALESCE(SUM(d.totalAmount), 0) FROM Delivery d WHERE d.customer.id = :customerId")
BigDecimal sumAmountByCustomerId(@Param("customerId") Long customerId);
```

#### 2.2 Calcul Automatique des Totaux Livraison

```java
// DeliveryService.java - Modifier create
public Delivery createDelivery(DeliveryDTO dto) {
    Delivery delivery = deliveryMapper.toEntity(dto);

    // Calcul automatique du total
    BigDecimal total = delivery.getItems().stream()
        .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    delivery.setTotalAmount(total);

    return deliveryRepository.save(delivery);
}
```

---

### Phase 3: Tableaux de Bord (Priorité Moyenne)

#### 3.1 Endpoints Dashboard

```java
@RestController
@RequestMapping("/api/dashboard")
public class DashboardResource {

    @GetMapping("/daily")
    public DailySituationDTO getDailySituation(@RequestParam LocalDate date) {
        // Livraisons du jour
        // Paiements du jour
        // Retours du jour
        // Production du jour
        // Dépenses du jour
    }

    @GetMapping("/kpis")
    public KpisDTO getKpis(
        @RequestParam LocalDate startDate,
        @RequestParam LocalDate endDate) {
        // Chiffre d'affaires
        // Nombre de livraisons
        // Taux de retour
        // Clients actifs
    }
}
```

#### 3.2 Frontend Dashboard (Angular)

```typescript
// dashboard.component.ts
@Component({
  selector: 'jhi-dashboard',
  standalone: true,
  imports: [CommonModule, ChartComponent],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-gray-500 text-sm">Chiffre d'affaires</h3>
        <p class="text-3xl font-bold text-gray-900">{{ stats.revenue | currency }}</p>
      </div>
      <!-- Autres KPIs -->
    </div>
  `
})
export class DashboardComponent {
  stats = signal<KpisDTO | null>(null);
}
```

---

### Phase 4: Application Mobile (Priorité Haute)

#### 4.1 Stack Recommandé

| Option | Avantages | Inconvénients |
|--------|-----------|---------------|
| **Flutter** | Cross-platform, performance native | Nouveau langage (Dart) |
| **React Native** | JavaScript, grande communauté | Performance variable |

**Recommandation**: Flutter pour performance native et offline.

#### 4.2 Structure du Projet Flutter

```
delivery_mobile/
├── lib/
│   ├── main.dart
│   ├── core/
│   │   ├── api/
│   │   │   ├── api_client.dart         # HTTP client (Dio)
│   │   │   ├── auth_service.dart       # JWT auth
│   │   │   └── api_interceptor.dart    # Token refresh
│   │   ├── storage/
│   │   │   └── secure_storage.dart     # JWT storage
│   │   └── offline/
│   │       ├── database.dart           # SQLite
│   │       └── sync_service.dart       # Sync logic
│   ├── models/
│   │   ├── round.dart
│   │   ├── customer.dart
│   │   ├── delivery.dart
│   │   └── product.dart
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login_screen.dart
│   │   │   └── login_controller.dart
│   │   ├── round/
│   │   │   ├── round_screen.dart
│   │   │   ├── round_controller.dart
│   │   │   └── customer_card.dart
│   │   ├── delivery/
│   │   │   ├── delivery_screen.dart
│   │   │   ├── delivery_controller.dart
│   │   │   └── product_selector.dart
│   │   └── return/
│   │       ├── return_screen.dart
│   │       └── return_controller.dart
│   └── widgets/
│       ├── loading_indicator.dart
│       └── error_dialog.dart
├── pubspec.yaml
└── android/ios/
```

#### 4.3 Dépendances Flutter

```yaml
# pubspec.yaml
dependencies:
  flutter:
    sdk: flutter

  # State Management
  flutter_riverpod: ^2.4.9

  # HTTP
  dio: ^5.4.0

  # Storage
  flutter_secure_storage: ^9.0.0
  sqflite: ^2.3.0  # Pour mode offline

  # Maps & GPS
  flutter_map: ^6.1.0
  latlong2: ^0.9.0
  geolocator: ^10.1.0

  # UI
  flutter_svg: ^2.0.9

  # Utils
  intl: ^0.18.1
  connectivity_plus: ^5.0.2
```

#### 4.4 Authentification Mobile

```dart
// auth_service.dart
class AuthService {
  final Dio _dio;
  final FlutterSecureStorage _storage;

  Future<bool> login(String username, String password) async {
    try {
      final response = await _dio.post(
        '/api/authenticate',
        data: {
          'username': username,
          'password': password,
          'rememberMe': true,
        },
      );

      final token = response.data['id_token'];
      await _storage.write(key: 'jwt_token', value: token);

      return true;
    } catch (e) {
      return false;
    }
  }

  Future<String?> getToken() async {
    return await _storage.read(key: 'jwt_token');
  }
}
```

#### 4.5 Écran Tournée du Jour

```dart
// round_screen.dart
class RoundScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final roundAsync = ref.watch(todayRoundProvider);

    return Scaffold(
      appBar: AppBar(title: Text('Tournée du jour')),
      body: roundAsync.when(
        loading: () => CircularProgressIndicator(),
        error: (e, _) => Text('Erreur: $e'),
        data: (round) => ListView.builder(
          itemCount: round.customers.length,
          itemBuilder: (ctx, i) => CustomerCard(
            customer: round.customers[i],
            onTap: () => _openDelivery(context, round.customers[i]),
          ),
        ),
      ),
    );
  }
}
```

---

## Commandes Utiles

### Développement

```bash
# Backend (Spring Boot)
./mvnw

# Frontend (Angular)
npm start

# Build production
./mvnw -Pprod clean verify

# Tests
./mvnw verify
npm test
```

### JHipster

```bash
# Générer une nouvelle entité
jhipster entity NewEntity

# Mettre à jour les entités
jhipster entity ExistingEntity

# Ajouter une langue
jhipster languages
```

### Flutter (Mobile)

```bash
# Créer le projet
flutter create delivery_mobile

# Lancer en dev
flutter run

# Build Android
flutter build apk

# Build iOS
flutter build ios
```

---

## Fichiers Clés

### Backend
- `src/main/java/com/delivery/config/SecurityConfiguration.java` - Sécurité
- `src/main/java/com/delivery/domain/` - Entités JPA
- `src/main/java/com/delivery/repository/` - Repositories
- `src/main/java/com/delivery/service/` - Services
- `src/main/java/com/delivery/web/rest/` - Controllers

### Frontend
- `src/main/webapp/app/entities/` - Modules CRUD
- `src/main/webapp/app/layouts/sidebar/sidebar-menu.config.ts` - Menu
- `src/main/webapp/app/shared/` - Composants partagés
- `src/main/webapp/i18n/` - Traductions

### Configuration
- `src/main/resources/config/application.yml` - Config Spring
- `src/main/resources/config/liquibase/` - Migrations DB
- `angular.json` - Config Angular
- `tailwind.config.js` - Config Tailwind

---

*Implementation Guide - Version 2.0*
*JHipster 9 + Spring Boot 4 + Angular 21 + Tailwind CSS*
