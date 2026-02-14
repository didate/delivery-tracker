# Module Tenant (Multi-Tenant) - User Stories

## TEN-001: Inscription d'une nouvelle entreprise

**En tant que** Visiteur (futur proprietaire d'entreprise)
**Je veux** m'inscrire sur la plateforme SaaS
**Afin de** creer mon espace de gestion de livraisons

### Criteres d'acceptation
- [ ] Je peux acceder a un formulaire d'inscription
- [ ] Je saisis le nom de mon entreprise
- [ ] Je saisis mon email (sera l'email du compte owner)
- [ ] Je saisis un mot de passe securise
- [ ] Je saisis mon numero de telephone (optionnel)
- [ ] Un code tenant unique est genere automatiquement
- [ ] Un utilisateur avec role OWNER est cree automatiquement
- [ ] Un email de confirmation est envoye
- [ ] Le tenant est cree avec is_active = true

### Regles metier
- L'email doit etre unique sur la plateforme
- Le nom d'entreprise ne doit pas etre vide
- Le mot de passe doit respecter les regles de securite (8+ caracteres, mixte)
- Le code tenant est genere: TEN-XXXX (numero incremental)

### Flux
```
1. Visiteur remplit le formulaire d'inscription
2. Systeme valide les donnees
3. Systeme cree le Tenant
4. Systeme cree l'User avec role=OWNER, tenant_id=nouveau tenant
5. Systeme envoie email de bienvenue
6. Utilisateur est redirige vers son dashboard
```

---

## TEN-002: Configuration du profil entreprise

**En tant que** Owner ou Admin du tenant
**Je veux** configurer le profil de mon entreprise
**Afin de** personnaliser mon espace

### Criteres d'acceptation
- [ ] Je peux modifier le nom de l'entreprise
- [ ] Je peux ajouter/modifier l'adresse
- [ ] Je peux ajouter/modifier le telephone de contact
- [ ] Je peux uploader le logo de l'entreprise
- [ ] Je peux definir des parametres specifiques (devise, langue, etc.)
- [ ] Les modifications sont sauvegardees
- [ ] Un message de confirmation s'affiche

### Donnees (Table: tenants)
- name: String (max 100 caracteres)
- email: String (contact email)
- phone: String (max 20 caracteres)
- address: Text
- logo_url: String (URL du logo)
- settings: JSON (parametres specifiques)

---

## TEN-003: Inviter un utilisateur

**En tant que** Owner ou Admin du tenant
**Je veux** inviter un nouvel utilisateur dans mon entreprise
**Afin qu'** il puisse acceder au systeme

### Criteres d'acceptation
- [ ] Je peux saisir l'email du nouvel utilisateur
- [ ] Je peux selectionner son role (ADMIN, MANAGER, ACCOUNTANT, DRIVER)
- [ ] Un email d'invitation est envoye
- [ ] L'utilisateur cree son mot de passe via le lien d'invitation
- [ ] L'utilisateur est automatiquement associe a mon tenant
- [ ] Je peux voir la liste des invitations en attente
- [ ] Je peux annuler une invitation

### Regles metier
- L'email doit etre unique au sein du tenant
- Seul OWNER peut creer des ADMIN
- L'invitation expire apres 7 jours
- Le nouvel utilisateur herite du tenant_id de l'invitant

### Interface
```
Inviter un utilisateur
----------------------
Email: [_________________]
Role: [MANAGER ▼]
      - ADMIN
      - MANAGER
      - ACCOUNTANT
      - DRIVER

[Envoyer l'invitation]
```

---

## TEN-004: Gerer les utilisateurs du tenant

**En tant que** Owner ou Admin du tenant
**Je veux** gerer les utilisateurs de mon entreprise
**Afin de** controler les acces

### Criteres d'acceptation
- [ ] Je vois la liste de tous les utilisateurs de mon tenant
- [ ] Je vois pour chaque utilisateur: nom, email, role, statut, derniere connexion
- [ ] Je peux modifier le role d'un utilisateur
- [ ] Je peux desactiver un utilisateur
- [ ] Je peux reactiver un utilisateur desactive
- [ ] Je ne peux pas modifier mon propre role (si OWNER)
- [ ] Le OWNER ne peut pas etre desactive

### Donnees affichees
| Colonne | Description |
|---------|-------------|
| Nom | Nom complet |
| Email | Email de connexion |
| Role | OWNER, ADMIN, MANAGER, etc. |
| Statut | Actif / Inactif |
| Derniere connexion | Date et heure |
| Actions | Edit, Desactiver |

---

## TEN-005: Consulter les statistiques du tenant

**En tant que** Owner ou Admin du tenant
**Je veux** voir les statistiques globales de mon entreprise
**Afin de** suivre l'activite

### Criteres d'acceptation
- [ ] Je vois le nombre total de clients
- [ ] Je vois le nombre total de livreurs
- [ ] Je vois le nombre total de produits
- [ ] Je vois le CA total (livraisons)
- [ ] Je vois le total des paiements recus
- [ ] Je vois le solde global des clients
- [ ] Les statistiques sont filtrees par tenant_id automatiquement

### Dashboard Tenant
```
┌─────────────────────────────────────────────────────┐
│                 MON ENTREPRISE                      │
├─────────────────────────────────────────────────────┤
│  Clients: 150       Livreurs: 8        Produits: 25│
│  CA Total: 12,500,000 FCFA                         │
│  Paiements: 10,200,000 FCFA                        │
│  Solde Clients: 2,300,000 FCFA                     │
└─────────────────────────────────────────────────────┘
```

---

## TEN-006: Desactiver le compte entreprise

**En tant que** Owner du tenant
**Je veux** pouvoir desactiver mon compte entreprise
**Afin de** suspendre l'activite si necessaire

### Criteres d'acceptation
- [ ] Seul le OWNER peut desactiver le tenant
- [ ] Une confirmation est requise (double confirmation)
- [ ] Tous les utilisateurs du tenant sont deconnectes
- [ ] Les donnees sont conservees mais inaccessibles
- [ ] L'acces a l'API est bloque pour ce tenant
- [ ] Un email de confirmation est envoye

### Regles metier
- La desactivation ne supprime pas les donnees
- Le tenant peut etre reactive par contact support
- Les donnees restent en base pendant 90 jours minimum

---

## TEN-007: Filtrage automatique par tenant

**En tant que** Systeme
**Je veux** filtrer automatiquement toutes les requetes par tenant_id
**Afin d'** assurer l'isolation des donnees

### Criteres d'acceptation
- [ ] Le tenant_id est extrait du JWT a chaque requete
- [ ] Toutes les requetes SELECT incluent WHERE tenant_id = ?
- [ ] Toutes les requetes INSERT incluent le tenant_id
- [ ] Les requetes UPDATE et DELETE sont filtrees par tenant_id
- [ ] Une erreur est retournee si un utilisateur tente d'acceder a des donnees d'un autre tenant
- [ ] Les logs d'audit incluent le tenant_id

### Implementation technique
```java
// Exemple Spring Boot - TenantContext
@Component
public class TenantFilter implements Filter {
    @Override
    public void doFilter(request, response, chain) {
        String tenantId = extractTenantFromJWT(request);
        TenantContext.setCurrentTenant(tenantId);
        try {
            chain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
```

---

## TEN-008: Gestion des parametres du tenant

**En tant que** Owner ou Admin du tenant
**Je veux** configurer les parametres specifiques de mon entreprise
**Afin de** personnaliser le comportement du systeme

### Criteres d'acceptation
- [ ] Je peux configurer la devise (FCFA, EUR, USD, etc.)
- [ ] Je peux configurer le format de date
- [ ] Je peux configurer le fuseau horaire
- [ ] Je peux activer/desactiver certaines fonctionnalites
- [ ] Je peux configurer les notifications par email
- [ ] Les parametres sont stockes dans tenant_settings

### Parametres disponibles
| Cle | Description | Valeur par defaut |
|-----|-------------|-------------------|
| currency | Devise | FCFA |
| date_format | Format de date | DD/MM/YYYY |
| timezone | Fuseau horaire | Africa/Dakar |
| email_notifications | Notifications email | true |
| auto_round_generation | Generation auto des tournees | true |
| credit_limit_warning | Seuil d'alerte credit (%) | 80 |

---

*Module Tenant (Multi-Tenant) - 8 stories*
*Gestion des entreprises sur la plateforme SaaS*
