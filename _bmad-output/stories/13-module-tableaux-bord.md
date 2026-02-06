# Module Tableaux de Bord - User Stories

## DSH-001: Situation journaliere globale

**En tant que** Administrateur ou Gestionnaire
**Je veux** voir la situation complete de la journee
**Afin d'** avoir une vue d'ensemble de l'activite

### Criteres d'acceptation
- [ ] Je peux selectionner une date (defaut: aujourd'hui)
- [ ] Je vois le resume de la production
- [ ] Je vois le resume des livraisons
- [ ] Je vois le resume des retours
- [ ] Je vois le resume des paiements recus
- [ ] Je vois le resume des depenses
- [ ] Je vois le solde de la journee (Paiements - Depenses)
- [ ] Je peux acceder au detail de chaque section

### Affichage
```
========================================
     SITUATION DU [DATE]
========================================

PRODUCTION
- Total produit: XXX unites
- Valeur: XXX FCFA

LIVRAISONS
- Nombre: XX livraisons
- Montant total: XXX FCFA
- Clients livres: XX

RETOURS
- Nombre: XX retours
- Valeur: XXX FCFA

PAIEMENTS RECUS
- Nombre: XX paiements
- Montant total: XXX FCFA

DEPENSES
- Nombre: XX depenses
- Montant total: XXX FCFA

----------------------------------------
SOLDE JOURNEE: +/- XXX FCFA
(Paiements - Depenses)
========================================
```

---

## DSH-002: Situation journaliere par livreur

**En tant que** Administrateur ou Gestionnaire
**Je veux** voir la situation de chaque livreur
**Afin de** suivre leur activite individuelle

### Criteres d'acceptation
- [ ] Je peux selectionner une date
- [ ] Je vois un tableau avec tous les livreurs actifs
- [ ] Pour chaque livreur, je vois:
  - Nombre de livraisons
  - Montant total livre
  - Nombre de retours
  - Nombre de clients visites
- [ ] Je peux trier par n'importe quelle colonne
- [ ] Je vois les totaux en bas du tableau

### Affichage
| Livreur | Livraisons | Montant | Retours | Clients |
|---------|------------|---------|---------|---------|
| Jean D. | 12 | 450,000 | 2 | 10 |
| Marie K. | 15 | 520,000 | 1 | 12 |
| Paul M. | 8 | 280,000 | 3 | 8 |
| **TOTAL** | **35** | **1,250,000** | **6** | **30** |

---

## DSH-003: Situation journaliere par point de production

**En tant que** Administrateur
**Je veux** voir la situation par point de production
**Afin de** comparer les performances des sites

### Criteres d'acceptation
- [ ] Je peux selectionner une date
- [ ] Je vois un tableau par point de production
- [ ] Pour chaque site, je vois:
  - Production du jour
  - Livraisons (nombre et montant)
  - Retours
  - Depenses
- [ ] Je vois les totaux

### Affichage
| Site | Production | Livraisons | Montant | Retours | Depenses |
|------|------------|------------|---------|---------|----------|
| Site A | 500 u | 25 | 750,000 | 3 | 150,000 |
| Site B | 300 u | 18 | 500,000 | 2 | 100,000 |
| **TOTAL** | **800 u** | **43** | **1,250,000** | **5** | **250,000** |

---

## DSH-004: Indicateurs cles (KPIs)

**En tant que** Administrateur
**Je veux** voir les indicateurs cles de performance
**Afin de** piloter l'activite

### Criteres d'acceptation
- [ ] Je peux selectionner une periode (jour, semaine, mois)
- [ ] Je vois les KPIs principaux:
  - Chiffre d'affaires
  - Marge brute (CA - Depenses matieres)
  - Taux de retour
  - Panier moyen
  - Taux de recouvrement
- [ ] Je vois l'evolution par rapport a la periode precedente
- [ ] Les variations sont colorees (vert = amelioration, rouge = degradation)

### KPIs
| Indicateur | Formule | Objectif |
|------------|---------|----------|
| CA | Somme livraisons | Maximiser |
| Marge brute | CA - Depenses matieres | Maximiser |
| Taux retour | Retours / Livraisons x 100 | Minimiser (< 5%) |
| Panier moyen | CA / Nb livraisons | Maximiser |
| Recouvrement | Paiements / Livraisons x 100 | Maximiser (> 90%) |

### Affichage
```
┌────────────────────────────────────┐
│ CA du mois: 15,000,000 FCFA        │
│ vs mois precedent: +12% ▲          │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ Taux de retour: 3.2%               │
│ vs mois precedent: -0.5% ▼ (bien)  │
└────────────────────────────────────┘
```

---

## DSH-005: Graphiques visuels

**En tant que** Administrateur
**Je veux** voir des graphiques de l'activite
**Afin de** visualiser les tendances

### Criteres d'acceptation
- [ ] Graphique CA quotidien sur le mois
- [ ] Graphique evolution livraisons vs paiements
- [ ] Graphique repartition depenses par categorie
- [ ] Graphique top 5 clients
- [ ] Graphique performance livreurs
- [ ] Je peux changer la periode affichee
- [ ] Les graphiques sont interactifs (survol = detail)

### Types de graphiques
| Graphique | Type | Description |
|-----------|------|-------------|
| CA quotidien | Ligne | Evolution du CA jour par jour |
| Livraisons vs Paiements | Barres empilees | Comparaison entrees/sorties |
| Depenses | Camembert | Repartition par categorie |
| Top clients | Barres horizontales | 5 meilleurs clients |
| Livreurs | Barres | CA par livreur |

---

*Module Tableaux de Bord - 5 stories*
