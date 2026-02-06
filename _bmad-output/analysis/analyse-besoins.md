# Analyse des Besoins - Application de Gestion de Livraisons

## Résumé du Problème

Le propriétaire d'une entreprise de fabrication de produits (principalement laitiers) a besoin d'une application pour gérer l'ensemble de son activité commerciale. L'entreprise fabrique des produits de différentes tailles avec des prix unitaires variables, dispose d'une base de clients, emploie des livreurs pour distribuer les produits et peut avoir plusieurs points de production.

Le problème principal est l'absence d'un système centralisé permettant de :
- Suivre les livraisons et les retours
- Gérer la comptabilité client (soldes, plafonds de crédit)
- Évaluer la performance des livreurs et calculer leurs primes
- Gérer les salaires et primes
- Planifier les tournées de livraison
- Suivre la production multi-sites et les dépenses
- Générer des rapports d'activité

---

## Acteurs

### Acteurs Principaux

| Acteur | Description |
|--------|-------------|
| **Propriétaire/Administrateur** | Gère l'ensemble du système, accède à tous les rapports, configure les produits, paramètre les primes et gère les utilisateurs |
| **Livreur** | Effectue les livraisons via application mobile (mode hors-ligne), enregistre les livraisons et retours, consulte ses statistiques et primes |
| **Client** | Reçoit les produits, effectue les paiements (acteur externe, représenté dans le système) |

### Acteurs Secondaires

| Acteur | Description |
|--------|-------------|
| **Gestionnaire/Superviseur** | Supervise les livreurs, planifie les tournées, valide les données, génère des rapports intermédiaires |
| **Comptable** | Accède aux données financières, paiements, dépenses, salaires et rapports financiers |

---

## Fonctionnalités Principales (Exigences Fonctionnelles)

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
- F16.3 : Enregistrer les livraisons (mode hors-ligne)
- F16.4 : Enregistrer les retours (mode hors-ligne)
- F16.5 : Synchronisation automatique quand connexion disponible
- F16.6 : Visualiser ses statistiques et primes
- F16.7 : Navigation GPS vers les clients

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
| **Performance** | L'application doit être réactive, temps de réponse < 3 secondes |
| **Disponibilité** | L'application web doit être accessible 24h/24 |
| **Hors-ligne** | L'application mobile doit fonctionner sans connexion internet |
| **Synchronisation** | Synchronisation fiable des données mobile ↔ serveur |
| **Sécurité** | Authentification obligatoire, mots de passe chiffrés, sessions sécurisées |
| **Ergonomie** | Interface intuitive, application mobile native ou hybride |
| **Fiabilité** | Intégrité des données financières garantie, gestion des conflits de synchronisation |
| **Extensibilité** | Architecture permettant l'ajout de nouvelles fonctionnalités |
| **Localisation** | Support de la langue française |
| **Responsive** | Application web adaptée aux tablettes et PC |
| **GPS** | Précision GPS suffisante pour la localisation et la navigation |

---

## Contraintes

1. **Contrainte mobile** : Application mobile obligatoire pour les livreurs avec mode hors-ligne
2. **Contrainte de synchronisation** : Les données enregistrées hors-ligne doivent se synchroniser sans perte ni doublon
3. **Contrainte GPS** : Les coordonnées GPS doivent être précises pour la planification et la navigation
4. **Contrainte financière** : Les calculs de solde, salaires et primes doivent être exacts et vérifiables
5. **Contrainte de traçabilité** : Toutes les opérations financières doivent être historisées et non supprimables
6. **Contrainte d'accès** : L'accès aux données doit être contrôlé selon les rôles
7. **Contrainte multi-sites** : Le système doit gérer plusieurs points de production de manière indépendante

---

## Hypothèses

1. Les clients paient généralement après réception des produits (système de crédit)
2. Un livreur peut livrer plusieurs clients par jour
3. Un client peut recevoir plusieurs livraisons avant de payer
4. Les paiements créditent le compte client globalement (non liés à une livraison spécifique)
5. Les prix des produits peuvent varier dans le temps
6. La production est enregistrée quotidiennement par point de production
7. Les dépenses sont enregistrées manuellement
8. Les livreurs ont des smartphones Android ou iOS
9. La connexion internet peut être intermittente sur le terrain
10. Le calcul du solde client = Total livraisons - Total paiements - Total retours (si crédités)
11. Chaque produit est défini par sa combinaison type + taille (ex: "Lait 1L", "Lait 500ml")
12. Les primes sont calculées périodiquement (hebdomadaire ou mensuel)

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
│                    APPLICATION WEB                          │
│         (Administration, Rapports, Tableaux de bord)        │
│              Utilisateurs: Admin, Gestionnaire, Comptable   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API / SERVEUR                          │
│              (Logique métier, Base de données)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION MOBILE                        │
│         (Livraisons, Retours, Tournées, Mode hors-ligne)    │
│              Utilisateurs: Livreurs                         │
└─────────────────────────────────────────────────────────────┘
```

---

*Document d'analyse BMAD - Version 2.0*
*Questions ouvertes résolues*
