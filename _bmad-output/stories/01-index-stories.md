# Index des User Stories - Application de Gestion de Livraisons

## Vue d'Ensemble

Ce document liste toutes les user stories organisees par module. Chaque story est identifiee par un code unique suivant le format: `MOD-XXX` ou MOD est le module et XXX le numero.

---

## Modules et Stories

### Module 1: Gestion des Produits (PRD)
| ID | Story | Priorite |
|----|-------|----------|
| PRD-001 | Creer un produit | Haute |
| PRD-002 | Modifier un produit | Haute |
| PRD-003 | Desactiver un produit | Moyenne |
| PRD-004 | Lister les produits | Haute |
| PRD-005 | Consulter l'historique des prix | Basse |

### Module 2: Gestion des Customers (CLI)
| ID | Story | Priorite |
|----|-------|----------|
| CLI-001 | Creer un customer | Haute |
| CLI-002 | Modifier un customer | Haute |
| CLI-003 | Enregistrer les coordonnees GPS | Haute |
| CLI-004 | Definir le credit limit | Moyenne |
| CLI-005 | Lister les customers avec solde | Haute |
| CLI-006 | Consulter l'historique d'un customer | Moyenne |
| CLI-007 | Rechercher un customer | Haute |
| CLI-008 | Desactiver un customer | Basse |
| CLI-009 | Assigner un customer a un driver | Haute |
| CLI-010 | Assigner plusieurs customers a un driver | Moyenne |
| CLI-011 | Voir les customers d'un driver | Moyenne |

### Module 3: Gestion des Livreurs (LIV)
| ID | Story | Priorite |
|----|-------|----------|
| LIV-001 | Creer un livreur | Haute |
| LIV-002 | Modifier un livreur | Haute |
| LIV-003 | Affecter un livreur a un point de production | Moyenne |
| LIV-004 | Definir le salaire de base | Moyenne |
| LIV-005 | Consulter les statistiques d'un livreur | Moyenne |
| LIV-006 | Lister les livreurs | Haute |
| LIV-007 | Desactiver un livreur | Basse |

### Module 4: Gestion des Livraisons (DEL)
| ID | Story | Priorite |
|----|-------|----------|
| DEL-001 | Enregistrer une livraison | Haute |
| DEL-002 | Ajouter des produits a une livraison | Haute |
| DEL-003 | Calculer le montant total | Haute |
| DEL-004 | Lister les livraisons | Haute |
| DEL-005 | Filtrer les livraisons | Moyenne |
| DEL-006 | Consulter le detail d'une livraison | Haute |
| DEL-007 | Annuler une livraison | Moyenne |

### Module 5: Gestion des Retours (RET)
| ID | Story | Priorite |
|----|-------|----------|
| RET-001 | Enregistrer un retour | Haute |
| RET-002 | Specifier le motif du retour | Haute |
| RET-003 | Crediter le compte client | Moyenne |
| RET-004 | Lister les retours | Moyenne |
| RET-005 | Statistiques des retours | Basse |

### Module 6: Gestion des Paiements (PAY)
| ID | Story | Priorite |
|----|-------|----------|
| PAY-001 | Enregistrer un paiement | Haute |
| PAY-002 | Consulter le solde client | Haute |
| PAY-003 | Lister les paiements | Haute |
| PAY-004 | Filtrer les paiements | Moyenne |
| PAY-005 | Exporter les paiements | Basse |

### Module 7: Gestion des Points de Production (PPR)
| ID | Story | Priorite |
|----|-------|----------|
| PPR-001 | Creer un point de production | Haute |
| PPR-002 | Modifier un point de production | Moyenne |
| PPR-003 | Associer des livreurs | Moyenne |
| PPR-004 | Lister les points de production | Haute |

### Module 8: Gestion de la Production (PRO)
| ID | Story | Priorite |
|----|-------|----------|
| PRO-001 | Enregistrer la production journaliere | Haute |
| PRO-002 | Consulter l'historique de production | Moyenne |
| PRO-003 | Comparer production vs livraisons | Moyenne |
| PRO-004 | Alerter sur ecarts de stock | Basse |

### Module 9: Gestion des Depenses (DEP)
| ID | Story | Priorite |
|----|-------|----------|
| DEP-001 | Enregistrer une depense | Haute |
| DEP-002 | Categoriser les depenses | Haute |
| DEP-003 | Lister les depenses | Haute |
| DEP-004 | Filtrer les depenses | Moyenne |
| DEP-005 | Total des depenses par periode | Moyenne |

### Module 10: Gestion des Salaires et Primes (SAL)
| ID | Story | Priorite |
|----|-------|----------|
| SAL-001 | Configurer les regles de prime | Haute |
| SAL-002 | Calculer les primes d'un livreur | Haute |
| SAL-003 | Generer une fiche de paie | Haute |
| SAL-004 | Enregistrer un paiement de salaire | Haute |
| SAL-005 | Historique des salaires | Moyenne |
| SAL-006 | Consulter le detail des primes | Moyenne |

### Module 11: Gestion des Rounds (TRN)
| ID | Story | Priorite |
|----|-------|----------|
| TRN-001 | Generer automatiquement les rounds | Haute |
| TRN-002 | Exclure un customer d'un round | Moyenne |
| TRN-003 | Optimiser l'ordre de passage | Moyenne |
| TRN-004 | Consulter un round | Haute |
| TRN-005 | Visualiser le round sur carte | Basse |
| TRN-006 | Suivre l'avancement d'un round | Moyenne |
| TRN-007 | Marquer une visite comme effectuee | Haute |
| TRN-008 | Regenerer un round | Basse |

### Module 12: Tableaux de Bord (DSH)
| ID | Story | Priorite |
|----|-------|----------|
| DSH-001 | Situation journaliere globale | Haute |
| DSH-002 | Situation par livreur | Haute |
| DSH-003 | Situation par point de production | Moyenne |
| DSH-004 | Indicateurs cles (KPIs) | Moyenne |
| DSH-005 | Graphiques visuels | Basse |

### Module 13: Rapports (RPT)
| ID | Story | Priorite |
|----|-------|----------|
| RPT-001 | Rapport mensuel | Haute |
| RPT-002 | Rapport annuel | Moyenne |
| RPT-003 | Rapport par livreur | Haute |
| RPT-004 | Rapport par point de production | Moyenne |
| RPT-005 | Export PDF | Haute |
| RPT-006 | Export Excel | Haute |

### Module 14: Gestion des Utilisateurs (USR)
| ID | Story | Priorite |
|----|-------|----------|
| USR-001 | Creer un utilisateur | Haute |
| USR-002 | Modifier un utilisateur | Haute |
| USR-003 | Attribuer un role | Haute |
| USR-004 | Authentification | Haute |
| USR-005 | Reinitialiser mot de passe | Moyenne |
| USR-006 | Desactiver un utilisateur | Moyenne |
| USR-007 | Journal d'audit | Basse |

### Module 15: Application Mobile (MOB)
| ID | Story | Priorite |
|----|-------|----------|
| MOB-001 | Authentification mobile | Haute |
| MOB-002 | Consulter la tournee du jour | Haute |
| MOB-003 | Enregistrer livraison hors-ligne | Haute |
| MOB-004 | Enregistrer retour hors-ligne | Haute |
| MOB-005 | Synchronisation automatique | Haute |
| MOB-006 | Navigation GPS | Moyenne |
| MOB-007 | Consulter ses statistiques | Basse |
| MOB-008 | Notifications | Basse |

### Module 16: Systeme (SYS)
| ID | Story | Priorite |
|----|-------|----------|
| SYS-001 | Parametres systeme | Moyenne |
| SYS-002 | Sauvegarde des donnees | Haute |
| SYS-003 | Restauration des donnees | Haute |
| SYS-004 | Gestion des conflits de sync | Haute |
| SYS-005 | Notifications systeme | Moyenne |

---

## Statistiques

| Module | Nombre de Stories | Haute Priorite | Moyenne | Basse |
|--------|-------------------|----------------|---------|-------|
| Products | 5 | 3 | 1 | 1 |
| Customers | 11 | 5 | 4 | 2 |
| Drivers | 7 | 3 | 3 | 1 |
| Deliveries | 7 | 5 | 2 | 0 |
| Returns | 5 | 2 | 2 | 1 |
| Payments | 5 | 3 | 1 | 1 |
| ProductionSites | 4 | 2 | 2 | 0 |
| Productions | 4 | 1 | 2 | 1 |
| Expenses | 5 | 3 | 2 | 0 |
| Salaries/Bonus | 6 | 4 | 2 | 0 |
| Rounds | 8 | 3 | 3 | 2 |
| Dashboard | 5 | 2 | 2 | 1 |
| Reports | 6 | 4 | 2 | 0 |
| Users | 7 | 4 | 2 | 1 |
| Mobile | 8 | 5 | 1 | 2 |
| System | 5 | 3 | 2 | 0 |
| **TOTAL** | **98** | **52** | **33** | **13** |

---

## Ordre de Developpement Suggere (Sprints)

### Sprint 1 - Fondations
- USR-001 a USR-004 (Authentification et utilisateurs)
- PRD-001 a PRD-004 (Produits de base)
- CLI-001 a CLI-003, CLI-007 (Clients de base)

### Sprint 2 - Operations Core
- LIV-001 a LIV-004, LIV-006 (Livreurs)
- DEL-001 a DEL-004, DEL-006 (Livraisons)
- PAY-001 a PAY-003 (Paiements)

### Sprint 3 - Operations Avancees
- RET-001 a RET-004 (Retours)
- PPR-001 a PPR-004 (Points de production)
- PRO-001 a PRO-002 (Production)
- DEP-001 a DEP-003 (Depenses)

### Sprint 4 - Mobile
- MOB-001 a MOB-005 (Application mobile core)
- SYS-004 (Synchronisation)

### Sprint 5 - Tournees et Salaires
- TRN-001 a TRN-004 (Tournees)
- SAL-001 a SAL-004 (Salaires et primes)

### Sprint 6 - Reporting
- DSH-001 a DSH-004 (Tableaux de bord)
- RPT-001, RPT-003, RPT-005, RPT-006 (Rapports essentiels)

### Sprint 7 - Finitions
- Stories restantes de priorite moyenne et basse
- MOB-006 a MOB-008 (Mobile avance)
- Optimisations et ameliorations

---

*Document BMAD - Index des Stories*
*Version 1.0*
