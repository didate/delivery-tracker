# Index des User Stories - Plateforme SaaS de Gestion de Livraisons

## Vue d'Ensemble

Ce document liste toutes les user stories organisées par module avec leur état d'implémentation actuel.

**Stack technique**: JHipster 9 + Spring Boot 4 + Angular 21 + Tailwind CSS

### Légende
- ✅ Implémenté
- 🔶 Partiel
- ❌ À faire
- 🎯 Priorité haute

---

## Modules et Stories

### Module 0: Gestion Multi-Tenant (TEN)

> **Architecture**: Tous les utilisateurs sont liés à un tenant. Seul l'ADMIN peut créer des tenants.
> Pas d'auto-inscription.

| ID | Story | Priorité | État |
|----|-------|:--------:|:----:|
| TEN-001 | Tenant par défaut au démarrage | 🎯 | ❌ |
| TEN-002 | Créer un nouveau tenant (ADMIN) | 🎯 | 🔶 |
| TEN-003 | Basculer vers un tenant (ADMIN) | 🎯 | ❌ |
| TEN-004 | Créer un TENANT_ADMIN | 🎯 | ❌ |
| TEN-005 | Lister les tenants (ADMIN) | 🎯 | 🔶 |
| TEN-006 | Modifier un tenant (ADMIN) | Moyenne | 🔶 |
| TEN-007 | Activer/Désactiver un tenant (ADMIN) | Moyenne | ❌ |
| TEN-008 | Filtrage automatique par tenant | 🎯 | ❌ |
| TEN-009 | Configuration du tenant (TENANT_ADMIN) | Moyenne | ✅ |

### Module 1: Gestion des Produits (PRD)
| ID | Story | Priorité | État |
|----|-------|:--------:|:----:|
| PRD-001 | Créer un produit | 🎯 | ✅ |
| PRD-002 | Modifier un produit | 🎯 | ✅ |
| PRD-003 | Désactiver un produit | Moyenne | ✅ |
| PRD-004 | Lister les produits | 🎯 | ✅ |
| PRD-005 | Consulter l'historique des prix | Basse | ✅ |

### Module 2: Gestion des Clients (CLI)
| ID | Story | Priorité | État |
|----|-------|:--------:|:----:|
| CLI-001 | Créer un client | 🎯 | ✅ |
| CLI-002 | Modifier un client | 🎯 | ✅ |
| CLI-003 | Enregistrer les coordonnées GPS | 🎯 | ✅ |
| CLI-004 | Définir le plafond de crédit | Moyenne | ❌ |
| CLI-005 | Lister les clients avec solde | 🎯 | ❌ |
| CLI-006 | Consulter l'historique d'un client | Moyenne | ❌ |
| CLI-007 | Rechercher un client | 🎯 | ✅ |
| CLI-008 | Désactiver un client | Basse | ✅ |
| CLI-009 | Assigner un client à un chauffeur | 🎯 | 🔶 |
| CLI-010 | Assigner plusieurs clients à un chauffeur | Moyenne | ❌ |
| CLI-011 | Voir les clients d'un chauffeur | Moyenne | ❌ |

### Module 3: Gestion des Chauffeurs (LIV)
| ID | Story | Priorité | État |
|----|-------|:--------:|:----:|
| LIV-001 | Créer un chauffeur | 🎯 | ✅ |
| LIV-002 | Modifier un chauffeur | 🎯 | ✅ |
| LIV-003 | Affecter un chauffeur à un site | Moyenne | ❌ |
| LIV-004 | Définir le salaire de base | Moyenne | ❌ |
| LIV-005 | Consulter les statistiques d'un chauffeur | Moyenne | ❌ |
| LIV-006 | Lister les chauffeurs | 🎯 | ✅ |
| LIV-007 | Désactiver un chauffeur | Basse | ✅ |

### Module 4: Gestion des Livraisons (DEL)
| ID | Story | Priorité | État |
|----|-------|:--------:|:----:|
| DEL-001 | Enregistrer une livraison | 🎯 | ✅ |
| DEL-002 | Ajouter des produits à une livraison | 🎯 | ✅ |
| DEL-003 | Calculer le montant total | 🎯 | 🔶 |
| DEL-004 | Lister les livraisons | 🎯 | ✅ |
| DEL-005 | Filtrer les livraisons | Moyenne | ✅ |
| DEL-006 | Consulter le détail d'une livraison | 🎯 | ✅ |
| DEL-007 | Annuler une livraison | Moyenne | ✅ |

### Module 5: Gestion des Retours (RET)
| ID | Story | Priorité | État |
|----|-------|:--------:|:----:|
| RET-001 | Enregistrer un retour | 🎯 | ✅ |
| RET-002 | Spécifier le motif du retour | 🎯 | ✅ |
| RET-003 | Créditer le compte client | Moyenne | ❌ |
| RET-004 | Lister les retours | Moyenne | ✅ |
| RET-005 | Statistiques des retours | Basse | ❌ |

### Module 6: Gestion des Paiements (PAY)
| ID | Story | Priorité | État |
|----|-------|:--------:|:----:|
| PAY-001 | Enregistrer un paiement | 🎯 | ✅ |
| PAY-002 | Consulter le solde client | 🎯 | ❌ |
| PAY-003 | Lister les paiements | 🎯 | ✅ |
| PAY-004 | Filtrer les paiements | Moyenne | ✅ |
| PAY-005 | Exporter les paiements | Basse | ❌ |

### Module 7: Gestion des Sites de Production (PPR)
| ID | Story | Priorité | État |
|----|-------|:--------:|:----:|
| PPR-001 | Créer un site de production | 🎯 | ✅ |
| PPR-002 | Modifier un site de production | Moyenne | ✅ |
| PPR-003 | Associer des chauffeurs | Moyenne | ❌ |
| PPR-004 | Lister les sites de production | 🎯 | ✅ |

### Module 8: Gestion de la Production (PRO)
| ID | Story | Priorité | État |
|----|-------|:--------:|:----:|
| PRO-001 | Enregistrer la production journalière | 🎯 | ✅ |
| PRO-002 | Consulter l'historique de production | Moyenne | ✅ |
| PRO-003 | Comparer production vs livraisons | Moyenne | ❌ |
| PRO-004 | Alerter sur écarts de stock | Basse | ❌ |

### Module 9: Gestion des Dépenses (DEP)
| ID | Story | Priorité | État |
|----|-------|:--------:|:----:|
| DEP-001 | Enregistrer une dépense | 🎯 | ✅ |
| DEP-002 | Catégoriser les dépenses | 🎯 | ✅ |
| DEP-003 | Lister les dépenses | 🎯 | ✅ |
| DEP-004 | Filtrer les dépenses | Moyenne | ✅ |
| DEP-005 | Total des dépenses par période | Moyenne | ❌ |

### Module 10: Gestion des Salaires et Primes (SAL)
| ID | Story | Priorité | État |
|----|-------|:--------:|:----:|
| SAL-001 | Configurer les règles de prime | 🎯 | ❌ |
| SAL-002 | Calculer les primes d'un chauffeur | 🎯 | ❌ |
| SAL-003 | Générer une fiche de paie | 🎯 | ❌ |
| SAL-004 | Enregistrer un paiement de salaire | 🎯 | ❌ |
| SAL-005 | Historique des salaires | Moyenne | ❌ |
| SAL-006 | Consulter le détail des primes | Moyenne | ❌ |

### Module 11: Gestion des Tournées (TRN)
| ID | Story | Priorité | État |
|----|-------|:--------:|:----:|
| TRN-001 | Générer automatiquement les tournées | 🎯 | ❌ |
| TRN-002 | Exclure un client d'une tournée | Moyenne | ❌ |
| TRN-003 | Optimiser l'ordre de passage | Moyenne | ❌ |
| TRN-004 | Consulter une tournée | 🎯 | ✅ |
| TRN-005 | Visualiser la tournée sur carte | Basse | ❌ |
| TRN-006 | Suivre l'avancement d'une tournée | Moyenne | 🔶 |
| TRN-007 | Marquer une visite comme effectuée | 🎯 | ✅ |
| TRN-008 | Régénérer une tournée | Basse | ❌ |

### Module 12: Tableaux de Bord (DSH)
| ID | Story | Priorité | État |
|----|-------|:--------:|:----:|
| DSH-001 | Situation journalière globale | 🎯 | ❌ |
| DSH-002 | Situation par chauffeur | 🎯 | ❌ |
| DSH-003 | Situation par site de production | Moyenne | ❌ |
| DSH-004 | Indicateurs clés (KPIs) | Moyenne | ❌ |
| DSH-005 | Graphiques visuels | Basse | ❌ |

### Module 13: Rapports (RPT)
| ID | Story | Priorité | État |
|----|-------|:--------:|:----:|
| RPT-001 | Rapport mensuel | 🎯 | ❌ |
| RPT-002 | Rapport annuel | Moyenne | ❌ |
| RPT-003 | Rapport par chauffeur | 🎯 | ❌ |
| RPT-004 | Rapport par site de production | Moyenne | ❌ |
| RPT-005 | Export PDF | 🎯 | ❌ |
| RPT-006 | Export Excel | 🎯 | ❌ |

### Module 14: Gestion des Utilisateurs (USR)

> **Important**: Pas d'auto-inscription. Tous les utilisateurs sont créés par ADMIN ou TENANT_ADMIN.

| ID | Story | Priorité | État |
|----|-------|:--------:|:----:|
| USR-001 | Créer un utilisateur (ADMIN/TENANT_ADMIN) | 🎯 | ✅ |
| USR-002 | Modifier un utilisateur | 🎯 | ✅ |
| USR-003 | Matrice des permissions | 🎯 | ✅ |
| USR-004 | Authentification (pas d'inscription) | 🎯 | 🔶 |
| USR-005 | Réinitialiser mot de passe | Moyenne | ✅ |
| USR-006 | Changer mot de passe (première connexion) | 🎯 | ❌ |
| USR-007 | Désactiver un utilisateur | Moyenne | ✅ |
| USR-008 | Lister les utilisateurs | 🎯 | ✅ |
| USR-009 | Reset mot de passe utilisateur (admin) | Moyenne | ❌ |
| USR-010 | Journal d'audit | Basse | ❌ |

### Module 15: Application Mobile (MOB) - À développer
| ID | Story | Priorité | État |
|----|-------|:--------:|:----:|
| MOB-001 | Authentification mobile | 🎯 | ❌ |
| MOB-002 | Consulter la tournée du jour | 🎯 | ❌ |
| MOB-003 | Enregistrer livraison (mode connecté) | 🎯 | ❌ |
| MOB-004 | Enregistrer retour (mode connecté) | 🎯 | ❌ |
| MOB-005 | Activer mode hors-ligne (optionnel) | Moyenne | ❌ |
| MOB-006 | Navigation GPS | Moyenne | ❌ |
| MOB-007 | Consulter ses statistiques | Basse | ❌ |
| MOB-008 | Notifications | Basse | ❌ |

### Module 16: Système (SYS)
| ID | Story | Priorité | État |
|----|-------|:--------:|:----:|
| SYS-001 | Paramètres système | Moyenne | 🔶 |
| SYS-002 | Sauvegarde des données | 🎯 | ❌ |
| SYS-003 | Restauration des données | 🎯 | ❌ |
| SYS-004 | Gestion des conflits de sync | 🎯 | ❌ |
| SYS-005 | Notifications système | Moyenne | ❌ |

---

## Statistiques

| Module | Total | ✅ | 🔶 | ❌ | Progression |
|--------|:-----:|:--:|:--:|:--:|:-----------:|
| Tenant (SaaS) | 9 | 1 | 3 | 5 | 11% |
| Produits | 5 | 5 | 0 | 0 | 100% |
| Clients | 11 | 5 | 1 | 5 | 45% |
| Chauffeurs | 7 | 4 | 0 | 3 | 57% |
| Livraisons | 7 | 6 | 1 | 0 | 86% |
| Retours | 5 | 3 | 0 | 2 | 60% |
| Paiements | 5 | 3 | 0 | 2 | 60% |
| Sites Production | 4 | 3 | 0 | 1 | 75% |
| Production | 4 | 2 | 0 | 2 | 50% |
| Dépenses | 5 | 4 | 0 | 1 | 80% |
| Salaires/Primes | 6 | 0 | 0 | 6 | 0% |
| Tournées | 8 | 2 | 1 | 5 | 25% |
| Tableaux de bord | 5 | 0 | 0 | 5 | 0% |
| Rapports | 6 | 0 | 0 | 6 | 0% |
| Utilisateurs | 10 | 6 | 1 | 3 | 60% |
| **Mobile** | **8** | **0** | **0** | **8** | **0%** |
| Système | 5 | 0 | 1 | 4 | 10% |
| **TOTAL** | **110** | **44** | **8** | **58** | **40%** |

---

## Plan de Développement

### Phase 1 - Compléter le Backend (Priorité: Haute)
**Objectif**: Logique métier complète

1. **Sprint 1.1 - Multi-Tenant & Utilisateurs**
   - TEN-001: Tenant par défaut au démarrage
   - TEN-008: Filtrage automatique par tenant_id
   - TEN-003: Basculer vers un tenant (ADMIN)
   - TEN-004: Créer TENANT_ADMIN
   - USR-004: Désactiver auto-inscription
   - USR-006: Changement mot de passe première connexion

2. **Sprint 1.2 - Soldes Clients**
   - CLI-005: Liste clients avec solde
   - PAY-002: Consulter solde client
   - DEL-003: Calcul automatique montant

3. **Sprint 1.3 - Statistiques**
   - LIV-005: Stats chauffeur
   - RET-005: Stats retours
   - DEP-005: Totaux dépenses

### Phase 2 - Tableaux de Bord et Rapports (Priorité: Moyenne)
**Objectif**: Visibilité business

1. **Sprint 2.1 - Dashboard**
   - DSH-001 à DSH-004

2. **Sprint 2.2 - Rapports**
   - RPT-001, RPT-003, RPT-005, RPT-006

### Phase 3 - Salaires et Primes (Priorité: Moyenne)
**Objectif**: Gestion RH

- SAL-001 à SAL-006

### Phase 4 - Application Mobile (Priorité: Haute)
**Objectif**: Digitalisation terrain

**Stack recommandé**: Flutter ou React Native

1. **Sprint 4.1 - Core Mobile**
   - MOB-001: Authentification
   - MOB-002: Tournée du jour
   - MOB-003: Enregistrement livraison
   - MOB-004: Enregistrement retour

2. **Sprint 4.2 - Fonctionnalités Avancées**
   - MOB-006: Navigation GPS
   - MOB-007: Statistiques
   - MOB-005: Mode hors-ligne

3. **Sprint 4.3 - Sync & Notifications**
   - SYS-004: Gestion conflits sync
   - MOB-008: Notifications

---

## Notes Techniques pour l'Application Mobile

### Architecture Recommandée
```
delivery_mobile/
├── lib/
│   ├── main.dart
│   ├── app/
│   │   ├── app.dart
│   │   └── routes.dart
│   ├── core/
│   │   ├── api/
│   │   │   ├── api_client.dart        # Connexion API JHipster
│   │   │   └── auth_service.dart      # JWT auth
│   │   ├── storage/
│   │   │   └── secure_storage.dart
│   │   └── offline/                   # Si mode offline activé
│   │       ├── database.dart
│   │       └── sync_manager.dart
│   ├── features/
│   │   ├── auth/
│   │   │   └── login_screen.dart
│   │   ├── round/
│   │   │   ├── round_screen.dart
│   │   │   └── customer_list.dart
│   │   ├── delivery/
│   │   │   ├── delivery_screen.dart
│   │   │   └── product_selector.dart
│   │   ├── return/
│   │   │   └── return_screen.dart
│   │   └── stats/
│   │       └── stats_screen.dart
│   └── widgets/
└── pubspec.yaml
```

### Intégration API JHipster
- Endpoint: `/api/authenticate` pour JWT
- Headers: `Authorization: Bearer <token>`
- Endpoints REST standards JHipster

---

*Document BMAD - Index des Stories*
*Version 3.0 - JHipster 9 + Tailwind CSS*
