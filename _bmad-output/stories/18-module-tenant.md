# Module Tenant (Multi-Tenant) - User Stories

## Vue d'ensemble

Le systeme utilise une architecture multi-tenant ou:
- Tous les utilisateurs sont lies a un tenant
- Un tenant par defaut existe au demarrage (pour l'ADMIN systeme)
- Seul l'ADMIN peut creer de nouveaux tenants
- L'ADMIN peut basculer vers un tenant via la page profil
- Dans un tenant, l'ADMIN peut creer un TENANT_ADMIN qui gerera ce tenant

### Roles et hierarchie
| Role | Scope | Capacites |
|------|-------|-----------|
| ROLE_ADMIN | Systeme | Creer/gerer tous les tenants, basculer entre tenants |
| ROLE_TENANT_ADMIN | Tenant specifique | Gerer les utilisateurs et donnees de son tenant |
| ROLE_MANAGER | Tenant specifique | Gestion operationnelle |
| ROLE_ACCOUNTANT | Tenant specifique | Donnees financieres |
| ROLE_DRIVER | Tenant specifique | Application mobile uniquement |

---

## TEN-001: Tenant par defaut

**En tant que** Systeme
**Je veux** avoir un tenant par defaut au demarrage
**Afin de** permettre a l'ADMIN de commencer a travailler

### Criteres d'acceptation
- [ ] Un tenant "Default" existe au premier demarrage
- [ ] Ce tenant a le code "TEN-0001"
- [ ] L'utilisateur ADMIN est associe a ce tenant par defaut
- [ ] Le tenant par defaut ne peut pas etre supprime
- [ ] Le tenant par defaut est marque is_default = true

### Script d'initialisation
```sql
-- Liquibase ou Flyway
INSERT INTO tenant (id, code, name, is_active, is_default)
VALUES (1, 'TEN-0001', 'Default', true, true);

UPDATE jhi_user SET tenant_id = 1 WHERE login = 'admin';
```

---

## TEN-002: Creer un nouveau tenant (ADMIN)

**En tant que** ADMIN (ROLE_ADMIN)
**Je veux** creer un nouveau tenant (entreprise)
**Afin de** permettre a une nouvelle entreprise d'utiliser la plateforme

### Criteres d'acceptation
- [ ] Seul ROLE_ADMIN peut acceder a cette fonctionnalite
- [ ] Je saisis le nom de l'entreprise
- [ ] Je saisis l'email de contact
- [ ] Je saisis le telephone (optionnel)
- [ ] Un code tenant unique est genere automatiquement (TEN-XXXX)
- [ ] Le tenant est cree avec is_active = true
- [ ] Un message de confirmation s'affiche
- [ ] Je suis redirige vers la liste des tenants

### Regles metier
- Le nom d'entreprise ne doit pas etre vide
- Le code tenant est genere: TEN-XXXX (numero incremental)
- L'email doit etre valide (format)

### Interface
```
Creer un Tenant
---------------
Nom de l'entreprise: [_________________] *
Email de contact:    [_________________]
Telephone:           [_________________]

[Annuler] [Creer]
```

---

## TEN-003: Basculer vers un tenant (ADMIN)

**En tant que** ADMIN (ROLE_ADMIN)
**Je veux** basculer vers un tenant specifique
**Afin de** gerer ce tenant et creer ses utilisateurs

### Criteres d'acceptation
- [ ] Dans la page profil ou le header, je vois le tenant actuel
- [ ] Je peux ouvrir une liste de tous les tenants
- [ ] Je selectionne un tenant pour y basculer
- [ ] Apres bascule, toutes mes actions sont dans le contexte de ce tenant
- [ ] Un indicateur visuel montre le tenant actif
- [ ] Je peux revenir au tenant par defaut a tout moment

### Interface header
```
┌─────────────────────────────────────────────────┐
│  DELIVERY APP          [Tenant: Entreprise ABC ▼]  [Admin ▼]
│                         ├─ Default
│                         ├─ Entreprise ABC ✓
│                         ├─ Entreprise XYZ
│                         └─ Nouvelle entreprise...
└─────────────────────────────────────────────────┘
```

### Regles metier
- Le tenant selectionne est stocke dans la session/JWT
- Les donnees affichees sont filtrees par le tenant selectionne
- L'ADMIN garde ses privileges ADMIN dans tous les tenants

---

## TEN-004: Creer un administrateur de tenant (TENANT_ADMIN)

**En tant que** ADMIN (ROLE_ADMIN)
**Je veux** creer un TENANT_ADMIN pour un tenant
**Afin que** cette personne puisse gerer son entreprise

### Criteres d'acceptation
- [ ] Je dois d'abord basculer vers le tenant cible
- [ ] Je peux creer un utilisateur avec role TENANT_ADMIN
- [ ] Je saisis: nom, email, mot de passe temporaire
- [ ] L'utilisateur est automatiquement lie au tenant actuel
- [ ] L'utilisateur doit changer son mot de passe a la premiere connexion
- [ ] Un email de bienvenue peut etre envoye (optionnel)

### Regles metier
- Un tenant peut avoir plusieurs TENANT_ADMIN
- Le TENANT_ADMIN ne peut pas changer de tenant
- Le TENANT_ADMIN peut gerer uniquement les utilisateurs de son tenant

### Flux
```
1. ADMIN bascule vers le tenant "Entreprise ABC"
2. ADMIN va dans Gestion Utilisateurs
3. ADMIN cree un utilisateur avec role TENANT_ADMIN
4. Le nouvel utilisateur est lie a "Entreprise ABC"
5. L'utilisateur recoit ses identifiants
6. A la premiere connexion, il change son mot de passe
```

---

## TEN-005: Lister les tenants (ADMIN)

**En tant que** ADMIN (ROLE_ADMIN)
**Je veux** voir la liste de tous les tenants
**Afin de** les gerer

### Criteres d'acceptation
- [ ] Je vois tous les tenants du systeme
- [ ] Pour chaque tenant: code, nom, email, statut, date de creation
- [ ] Je peux filtrer par nom ou code
- [ ] Je peux filtrer par statut (actif/inactif)
- [ ] Je peux trier par colonne
- [ ] Pagination si plus de 20 tenants

### Donnees affichees
| Colonne | Description |
|---------|-------------|
| Code | TEN-XXXX |
| Nom | Nom de l'entreprise |
| Email | Email de contact |
| Statut | Actif / Inactif |
| Utilisateurs | Nombre d'utilisateurs |
| Date creation | Date de creation |
| Actions | Voir, Editer, Basculer |

---

## TEN-006: Modifier un tenant (ADMIN)

**En tant que** ADMIN (ROLE_ADMIN)
**Je veux** modifier les informations d'un tenant
**Afin de** mettre a jour ses donnees

### Criteres d'acceptation
- [ ] Je peux modifier le nom de l'entreprise
- [ ] Je peux modifier l'email de contact
- [ ] Je peux modifier le telephone
- [ ] Je peux ajouter/modifier l'adresse
- [ ] Je ne peux pas modifier le code tenant
- [ ] Les modifications sont sauvegardees
- [ ] Un message de confirmation s'affiche

---

## TEN-007: Activer/Desactiver un tenant (ADMIN)

**En tant que** ADMIN (ROLE_ADMIN)
**Je veux** activer ou desactiver un tenant
**Afin de** controler l'acces a la plateforme

### Criteres d'acceptation
- [ ] Je peux desactiver un tenant actif
- [ ] Je peux reactiver un tenant desactive
- [ ] Une confirmation est requise pour la desactivation
- [ ] Tous les utilisateurs du tenant sont deconnectes a la desactivation
- [ ] Les utilisateurs d'un tenant desactive ne peuvent plus se connecter
- [ ] Les donnees sont conservees (soft delete)
- [ ] Le tenant par defaut ne peut pas etre desactive

### Regles metier
- La desactivation est immediate
- Message utilisateur: "Votre entreprise a ete desactivee. Contactez l'administrateur."

---

## TEN-008: Filtrage automatique par tenant

**En tant que** Systeme
**Je veux** filtrer automatiquement toutes les requetes par tenant_id
**Afin d'** assurer l'isolation des donnees

### Criteres d'acceptation
- [ ] Le tenant_id est extrait du JWT a chaque requete
- [ ] Pour l'ADMIN, le tenant_id selectionne est utilise
- [ ] Toutes les requetes SELECT incluent WHERE tenant_id = ?
- [ ] Toutes les requetes INSERT incluent le tenant_id
- [ ] Les requetes UPDATE et DELETE sont filtrees par tenant_id
- [ ] Une erreur est retournee si acces non autorise
- [ ] Les logs d'audit incluent le tenant_id

### Implementation technique
```java
// TenantContext - stocke le tenant actif
public class TenantContext {
    private static final ThreadLocal<Long> currentTenant = new ThreadLocal<>();

    public static void setCurrentTenant(Long tenantId) {
        currentTenant.set(tenantId);
    }

    public static Long getCurrentTenant() {
        return currentTenant.get();
    }
}

// Pour ADMIN avec tenant selectionne
// JWT contient: { roles: ["ROLE_ADMIN"], selectedTenantId: 5 }
```

---

## TEN-009: Configuration du tenant (TENANT_ADMIN)

**En tant que** TENANT_ADMIN
**Je veux** configurer les parametres de mon entreprise
**Afin de** personnaliser le comportement du systeme

### Criteres d'acceptation
- [ ] Je peux modifier le nom de l'entreprise
- [ ] Je peux modifier les coordonnees de contact
- [ ] Je peux uploader le logo de l'entreprise
- [ ] Je peux configurer la devise (FCFA, EUR, USD)
- [ ] Je peux configurer le format de date
- [ ] Je ne peux pas modifier le code tenant

### Parametres disponibles
| Cle | Description | Valeur par defaut |
|-----|-------------|-------------------|
| currency | Devise | FCFA |
| date_format | Format de date | DD/MM/YYYY |
| timezone | Fuseau horaire | Africa/Dakar |
| email_notifications | Notifications email | true |

---

*Module Tenant (Multi-Tenant) - 9 stories*
*Gestion centralisee des tenants par l'ADMIN systeme*
