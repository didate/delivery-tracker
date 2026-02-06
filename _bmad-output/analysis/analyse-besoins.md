# Analyse des Besoins - Plateforme SaaS de Gestion de Livraisons

## Résumé du Problème

Cette application est une **plateforme SaaS multi-tenant** permettant à plusieurs entreprises de fabrication et de livraison de produits (principalement laitiers) de gérer l'ensemble de leur activité commerciale de manière indépendante.

Chaque entreprise qui s'inscrit sur la plateforme (tenant) peut gérer ses produits, clients, livreurs, points de production, livraisons, retours, paiements, dépenses et salaires de manière totalement isolée des autres entreprises.

Le problème principal est l'absence d'un système centralisé permettant de :
- Permettre à plusieurs entreprises d'utiliser la même plateforme
- Isoler complètement les données entre entreprises
- Suivre les livraisons et les retours
- Gérer la comptabilité client (soldes, plafonds de crédit)
- Évaluer la performance des livreurs et calculer leurs primes
- Gérer les salaires et primes
- Planifier les tournées de livraison
- Suivre la production multi-sites et les dépenses
- Générer des rapports d'activité

---

## Acteurs

### Acteurs Plateforme (SaaS)

| Acteur | Description |
|--------|-------------|
| **Super Administrateur** | Gère la plateforme SaaS globalement, supervise les tenants, accède aux statistiques globales de la plateforme |
| **Propriétaire d'entreprise (Tenant Owner)** | S'inscrit sur la plateforme, crée son entreprise (tenant), configure son abonnement, devient administrateur de son tenant |

### Acteurs Tenant (Par entreprise)

| Acteur | Description |
|--------|-------------|
| **Administrateur Tenant** | Gère son entreprise, accède à tous les rapports, configure les produits, paramètre les primes et gère les utilisateurs de son tenant |
| **Livreur** | Effectue les livraisons via application mobile (mode hors-ligne), enregistre les livraisons et retours, consulte ses statistiques et primes |
| **Client** | Reçoit les produits, effectue les paiements (acteur externe, représenté dans le système) |

### Acteurs Secondaires (Par entreprise)

| Acteur | Description |
|--------|-------------|
| **Gestionnaire/Superviseur** | Supervise les livreurs, planifie les tournées, valide les données, génère des rapports intermédiaires |
| **Comptable** | Accède aux données financières, paiements, dépenses, salaires et rapports financiers |

---

## Fonctionnalités Principales (Exigences Fonctionnelles)

### 0. Gestion Multi-Tenant (SaaS)
- F0.1 : Inscription d'une nouvelle entreprise (création de tenant)
- F0.2 : Configuration du profil entreprise (nom, logo, coordonnées)
- F0.3 : Isolation complète des données entre tenants
- F0.4 : Chaque utilisateur est associé à un tenant unique
- F0.5 : Filtrage automatique des données par tenant_id
- F0.6 : Le propriétaire du tenant peut inviter d'autres utilisateurs
- F0.7 : Gestion de l'abonnement (optionnel pour évolution future)
- F0.8 : Tableau de bord super-admin pour supervision de la plateforme

### 1. Gestion des Produits
- F1.1 : Créer, modifier, supprimer un produit
- F1.2 : Chaque produit représente une combinaison unique (type + taille)
- F1.3 : Définir le prix unitaire par produit
- F1.4 : Historiser les changements de prix
- F1.5 : Activer/désactiver un produit

### 2. Gestion des Clients
- F2.1 : Créer, modifier, supprimer un client
- F2.2 : Enregistrer les coordonnées du client (nom, téléphone, adresse)
- F2.3 : Enregistrer les coordonnées GPS du client
- F2.4 : Définir un plafond de crédit par client
- F2.5 : Alerter quand le solde approche ou dépasse le plafond
- F2.6 : Consulter la liste des clients avec leur solde
- F2.7 : Consulter l'historique des transactions d'un client

### 3. Gestion des Livreurs
- F3.1 : Créer, modifier, supprimer un livreur
- F3.2 : Affecter des zones ou des clients à un livreur
- F3.3 : Consulter les statistiques de performance d'un livreur
- F3.4 : Définir le salaire de base d'un livreur

### 4. Gestion des Livraisons
- F4.1 : Enregistrer une livraison (client, livreur, date, produits, quantités)
- F4.2 : Calculer automatiquement le montant total de la livraison
- F4.3 : Enregistrer une livraison en mode hors-ligne (synchronisation ultérieure)
- F4.4 : Consulter l'historique des livraisons
- F4.5 : Filtrer les livraisons par date, client, livreur, point de production

### 5. Gestion des Retours
- F5.1 : Enregistrer un retour de produits (invendus, périmés, défectueux)
- F5.2 : Spécifier le motif du retour
- F5.3 : Ajuster le solde client si applicable
- F5.4 : Suivre les statistiques de retours par produit, livreur, client

### 6. Gestion des Paiements
- F6.1 : Enregistrer un paiement d'un client (montant, date, mode de paiement)
- F6.2 : Le paiement crédite le compte client (non lié à une livraison spécifique)
- F6.3 : Calculer automatiquement le solde du client
- F6.4 : Consulter l'historique des paiements

### 7. Gestion des Soldes Clients
- F7.1 : Afficher le solde courant d'un client (Livraisons - Paiements - Retours)
- F7.2 : Afficher la liste des clients avec solde débiteur
- F7.3 : Afficher la liste des clients dépassant leur plafond de crédit
- F7.4 : Bloquer les livraisons si plafond dépassé (optionnel/configurable)

### 8. Gestion des Points de Production
- F8.1 : Créer, modifier, supprimer un point de production
- F8.2 : Associer des livreurs à un point de production
- F8.3 : Suivre la production par site

### 9. Gestion de la Production
- F9.1 : Enregistrer la production journalière par produit et par point de production
- F9.2 : Consulter l'historique de production
- F9.3 : Comparer production vs livraisons vs retours (stock théorique)
- F9.4 : Alerter sur les écarts de stock

### 10. Gestion des Dépenses
- F10.1 : Enregistrer une dépense (montant, catégorie, description, date, point de production)
- F10.2 : Catégoriser les dépenses (matières premières, transport, équipement, etc.)
- F10.3 : Consulter l'historique des dépenses
- F10.4 : Filtrer par catégorie, période, point de production

### 11. Gestion des Salaires et Primes
- F11.1 : Définir le salaire de base par livreur
- F11.2 : Paramétrer les règles de calcul des primes (ex: % du CA livré, bonus par nombre de livraisons, etc.)
- F11.3 : Calculer automatiquement les primes selon les performances
- F11.4 : Générer les fiches de paie (salaire + primes)
- F11.5 : Historiser les paiements de salaires
- F11.6 : Consulter le détail des primes par livreur

### 12. Planification des Tournées
- F12.1 : Créer une tournée (liste de clients à visiter, ordre de passage)
- F12.2 : Affecter une tournée à un livreur
- F12.3 : Optimiser l'ordre de passage (basé sur GPS)
- F12.4 : Visualiser les tournées sur une carte
- F12.5 : Suivre l'avancement d'une tournée en temps réel

### 13. Tableaux de Bord et Situations
- F13.1 : Afficher la situation journalière complète (production, livraisons, retours, paiements, dépenses)
- F13.2 : Afficher la situation journalière par livreur
- F13.3 : Afficher la situation journalière par point de production
- F13.4 : Afficher les indicateurs clés (KPIs) : CA, marge, taux de retour, etc.

### 14. Rapports
- F14.1 : Générer un rapport mensuel (livraisons, paiements, retours, soldes, production, dépenses)
- F14.2 : Générer un rapport annuel
- F14.3 : Générer un rapport de performance par livreur (avec primes)
- F14.4 : Générer un rapport par point de production
- F14.5 : Exporter les rapports (PDF, Excel)

### 15. Gestion des Utilisateurs et Rôles
- F15.1 : Créer, modifier, supprimer un utilisateur
- F15.2 : Définir des rôles (Administrateur, Gestionnaire, Livreur, Comptable)
- F15.3 : Attribuer des permissions par rôle
- F15.4 : Authentification sécurisée
- F15.5 : Associer un utilisateur livreur à son profil livreur

### 16. Application Mobile Livreur
- F16.1 : Authentification du livreur
- F16.2 : Consulter la tournée du jour
- F16.3 : Enregistrer les livraisons (mode connecté par défaut)
- F16.4 : Enregistrer les retours (mode connecté par défaut)
- F16.5 : Mode hors-ligne optionnel (activable dans les paramètres)
- F16.6 : Synchronisation automatique si mode hors-ligne activé
- F16.7 : Visualiser ses statistiques et primes
- F16.8 : Navigation GPS vers les clients

### 17. Fonctionnalités Complémentaires
- F17.1 : Notifications (rappel de paiement, alerte plafond, synchronisation)
- F17.2 : Sauvegarde et restauration des données
- F17.3 : Journal d'audit des actions utilisateurs
- F17.4 : Tableau de bord avec graphiques visuels
- F17.5 : Gestion des paramètres système (devise, formats, seuils d'alerte)

---

## Exigences Non-Fonctionnelles

| Catégorie | Exigence |
|-----------|----------|
| **Multi-Tenant** | Isolation complète des données entre tenants via tenant_id |
| **Performance** | L'application doit être réactive, temps de réponse < 3 secondes |
| **Scalabilité** | La plateforme doit supporter plusieurs entreprises simultanément |
| **Disponibilité** | L'application web doit être accessible 24h/24 |
| **Mode connecté** | L'application mobile fonctionne par défaut en mode connecté (temps réel) |
| **Hors-ligne (optionnel)** | Mode hors-ligne activable pour les zones sans couverture internet |
| **Synchronisation** | Synchronisation fiable si mode hors-ligne activé |
| **Sécurité** | Authentification obligatoire, mots de passe chiffrés, sessions sécurisées |
| **Isolation** | Un utilisateur ne peut jamais accéder aux données d'un autre tenant |
| **Ergonomie** | Interface intuitive, application mobile native ou hybride |
| **Fiabilité** | Intégrité des données financières garantie, gestion des conflits de synchronisation |
| **Extensibilité** | Architecture permettant l'ajout de nouvelles fonctionnalités |
| **Localisation** | Support de la langue française |
| **Responsive** | Application web adaptée aux tablettes et PC |
| **GPS** | Précision GPS suffisante pour la localisation et la navigation |

---

## Contraintes

1. **Contrainte multi-tenant** : Toutes les tables doivent contenir un champ tenant_id pour l'isolation des données
2. **Contrainte d'isolation** : Chaque requête doit automatiquement filtrer par tenant_id de l'utilisateur connecté
3. **Contrainte mobile** : Application mobile obligatoire pour les livreurs, mode connecté par défaut
4. **Contrainte mode connecté** : Par défaut, l'application mobile envoie les données en temps réel au serveur
5. **Contrainte hors-ligne** : Si le mode hors-ligne est activé, les données doivent se synchroniser sans perte ni doublon
5. **Contrainte GPS** : Les coordonnées GPS doivent être précises pour la planification et la navigation
6. **Contrainte financière** : Les calculs de solde, salaires et primes doivent être exacts et vérifiables
7. **Contrainte de traçabilité** : Toutes les opérations financières doivent être historisées et non supprimables
8. **Contrainte d'accès** : L'accès aux données doit être contrôlé selon les rôles ET le tenant
9. **Contrainte multi-sites** : Le système doit gérer plusieurs points de production de manière indépendante par tenant

---

## Hypothèses

### Hypothèses Multi-Tenant
1. Chaque entreprise qui s'inscrit opère de manière totalement indépendante
2. Un utilisateur appartient à un seul tenant (pas de multi-tenant par utilisateur)
3. Le propriétaire d'un tenant peut créer d'autres utilisateurs pour son entreprise
4. L'isolation par tenant_id est suffisante (pas besoin de schémas séparés)
5. Les tenants partagent la même infrastructure (base de données, serveurs)

### Hypothèses Métier
6. Les clients paient généralement après réception des produits (système de crédit)
7. Un livreur peut livrer plusieurs clients par jour
8. Un client peut recevoir plusieurs livraisons avant de payer
9. Les paiements créditent le compte client globalement (non liés à une livraison spécifique)
10. Les prix des produits peuvent varier dans le temps
11. La production est enregistrée quotidiennement par point de production
12. Les dépenses sont enregistrées manuellement
13. Les livreurs ont des smartphones Android ou iOS
14. **Les zones de livraison sont généralement couvertes par internet (3G/4G/WiFi)**
15. **Le mode connecté est le mode de fonctionnement principal de l'application mobile**
16. **Le mode hors-ligne est une option pour les rares cas de zones non couvertes**
17. Le calcul du solde client = Total livraisons - Total paiements - Total retours (si crédités)
18. Chaque produit est défini par sa combinaison type + taille (ex: "Lait 1L", "Lait 500ml")
19. Les primes sont calculées périodiquement (hebdomadaire ou mensuel)

---

## Règles Métier

### Solde Client
```
Solde = Σ(Livraisons) - Σ(Paiements) - Σ(Retours crédités)
```
- Solde positif = Le client doit de l'argent
- Solde négatif = Le client a un crédit

### Plafond de Crédit
- Si solde ≥ plafond : Alerte
- Possibilité de bloquer les nouvelles livraisons (configurable)

### Prime Livreur (exemple paramétrable)
- Prime = Salaire de base + (CA livré × taux) + (Nb livraisons × bonus unitaire)
- Les paramètres (taux, bonus) sont configurables par l'administrateur

### Stock Théorique
```
Stock = Σ(Production) - Σ(Livraisons) + Σ(Retours)
```

---

## Glossaire

| Terme | Définition |
|-------|------------|
| **Tenant** | Entreprise inscrite sur la plateforme SaaS, avec ses propres données isolées |
| **tenant_id** | Identifiant unique du tenant, présent dans chaque table pour l'isolation |
| **Livraison** | Acte de remettre des produits à un client, générant une créance |
| **Retour** | Produits ramenés par le livreur (invendus, périmés, défectueux) |
| **Paiement** | Somme versée par un client pour régler ses créances (crédit global) |
| **Solde** | Montant dû par le client à l'entreprise |
| **Plafond de crédit** | Montant maximum de dette autorisé pour un client |
| **Production** | Quantité de produits fabriqués sur une période donnée |
| **Point de production** | Lieu physique où sont fabriqués les produits |
| **Dépense** | Sortie d'argent liée à l'activité de l'entreprise |
| **Tournée** | Ensemble de clients à visiter par un livreur dans un ordre défini |
| **Prime** | Rémunération variable basée sur la performance du livreur |
| **Synchronisation** | Transfert des données entre l'application mobile et le serveur |

---

## Architecture Applicative (Vue Haut Niveau)

```
┌─────────────────────────────────────────────────────────────┐
│                  PLATEFORME SAAS                            │
│    ┌─────────────────────────────────────────────────────┐  │
│    │              APPLICATION WEB                        │  │
│    │    (Administration, Rapports, Tableaux de bord)     │  │
│    │    Utilisateurs: Admin Tenant, Gestionnaire, etc.   │  │
│    └─────────────────────────────────────────────────────┘  │
│                              │                              │
│                              ▼                              │
│    ┌─────────────────────────────────────────────────────┐  │
│    │              API / SERVEUR                          │  │
│    │     (Logique métier, Isolation Multi-Tenant)        │  │
│    │     Filtrage automatique par tenant_id              │  │
│    └─────────────────────────────────────────────────────┘  │
│                              │                              │
│                              ▼                              │
│    ┌─────────────────────────────────────────────────────┐  │
│    │              BASE DE DONNÉES                        │  │
│    │      (Toutes tables avec tenant_id)                 │  │
│    │  ┌─────────┐  ┌─────────┐  ┌─────────┐             │  │
│    │  │Tenant A │  │Tenant B │  │Tenant C │  ...        │  │
│    │  └─────────┘  └─────────┘  └─────────┘             │  │
│    └─────────────────────────────────────────────────────┘  │
│                              │                              │
│                              ▼                              │
│    ┌─────────────────────────────────────────────────────┐  │
│    │            APPLICATION MOBILE                       │  │
│    │   (Livraisons, Retours, Tournées, Mode hors-ligne)  │  │
│    │            Utilisateurs: Livreurs                   │  │
│    │          (Données filtrées par tenant)              │  │
│    └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Stratégie Multi-Tenant

```
┌──────────────────────────────────────────────────────────┐
│                    APPROCHE CHOISIE                      │
│                                                          │
│   Isolation par colonne tenant_id (Row-Level Security)   │
│                                                          │
│   Avantages:                                             │
│   - Simple à implémenter                                 │
│   - Base de données unique                               │
│   - Maintenance simplifiée                               │
│   - Coût d'infrastructure réduit                         │
│                                                          │
│   Implémentation:                                        │
│   - Chaque table contient tenant_id (NOT NULL)           │
│   - Index sur tenant_id pour performance                 │
│   - Filtrage automatique dans la couche service          │
│   - JWT contient le tenant_id de l'utilisateur           │
└──────────────────────────────────────────────────────────┘
```

---

*Document d'analyse BMAD - Version 3.0*
*Architecture SaaS Multi-Tenant*
