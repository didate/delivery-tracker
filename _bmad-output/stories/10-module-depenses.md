# Module Depenses - User Stories

## DEP-001: Enregistrer une depense

**En tant que** Administrateur, Gestionnaire ou Comptable
**Je veux** enregistrer une depense
**Afin de** suivre les sorties d'argent

### Criteres d'acceptation
- [ ] Je peux selectionner le point de production (optionnel)
- [ ] Je selectionne la date (defaut: aujourd'hui)
- [ ] Je saisis le montant
- [ ] Je selectionne la categorie
- [ ] Je saisis une description
- [ ] Je peux joindre un justificatif (photo/scan)
- [ ] L'utilisateur qui enregistre est trace automatiquement
- [ ] Un message de confirmation s'affiche

### Regles metier
- Le montant doit etre > 0
- La categorie est obligatoire
- La description est obligatoire

### Donnees
- Date: Date (obligatoire)
- Montant: Decimal (obligatoire, > 0)
- Categorie: Enum (obligatoire)
- Description: Text (obligatoire)
- Point de production: Reference (optionnel)
- Justificatif: Fichier (optionnel)
- Enregistre par: Reference utilisateur (automatique)

---

## DEP-002: Categoriser les depenses

**En tant que** Administrateur
**Je veux** definir les categories de depenses
**Afin de** classifier les sorties d'argent

### Categories par defaut
| Code | Libelle | Description |
|------|---------|-------------|
| MATIERES | Matieres premieres | Lait, ingredients, emballages |
| TRANSPORT | Transport | Carburant, entretien vehicules |
| SALAIRES | Salaires | Paiements des salaires |
| EQUIPEMENT | Equipement | Materiel, machines |
| CHARGES | Charges | Electricite, eau, loyer |
| MAINTENANCE | Maintenance | Reparations, entretien |
| AUTRE | Autre | Autres depenses |

### Criteres d'acceptation
- [ ] Les categories par defaut sont disponibles
- [ ] L'administrateur peut ajouter de nouvelles categories
- [ ] L'administrateur peut desactiver une categorie (pas supprimer)
- [ ] Une categorie desactivee n'est plus proposee pour les nouvelles depenses
- [ ] L'historique des depenses conserve les anciennes categories

---

## DEP-003: Lister les depenses

**En tant que** Gestionnaire ou Comptable
**Je veux** voir la liste des depenses
**Afin de** suivre les sorties d'argent

### Criteres d'acceptation
- [ ] La liste affiche: date, categorie, description, montant, site
- [ ] Je peux filtrer par date
- [ ] Je peux filtrer par categorie
- [ ] Je peux filtrer par point de production
- [ ] La liste est triee par date decroissante
- [ ] Le total des depenses filtrees s'affiche
- [ ] La pagination est disponible

### Donnees affichees
| Colonne | Description |
|---------|-------------|
| Date | Date de la depense |
| Categorie | Type de depense |
| Description | Description |
| Montant | Montant |
| Site | Point de production |
| Enregistre par | Utilisateur |
| Justificatif | Oui/Non |
| Actions | Voir, Modifier |

---

## DEP-004: Filtrer les depenses

**En tant que** Gestionnaire ou Comptable
**Je veux** filtrer les depenses selon differents criteres
**Afin d'** analyser les couts

### Criteres d'acceptation
- [ ] Filtre par periode: jour, semaine, mois, annee, personnalise
- [ ] Filtre par categorie: selection multiple
- [ ] Filtre par point de production
- [ ] Filtre par utilisateur (qui a enregistre)
- [ ] Les filtres sont combinables
- [ ] Reinitialisation des filtres en un clic

### Totaux affiches
- Nombre de depenses
- Montant total
- Repartition par categorie (montant et %)

---

## DEP-005: Total des depenses par periode

**En tant que** Administrateur ou Comptable
**Je veux** voir le total des depenses par periode
**Afin de** suivre l'evolution des couts

### Criteres d'acceptation
- [ ] Je selectionne une periode (mois, trimestre, annee)
- [ ] Je vois le total global
- [ ] Je vois le total par categorie
- [ ] Je vois le total par point de production
- [ ] Je vois l'evolution mois par mois (graphique)
- [ ] Je peux comparer avec la periode precedente
- [ ] Je peux exporter les donnees

### Affichage
```
Periode: Janvier 2024
Total: 1,500,000 FCFA

Par categorie:
- Matieres premieres: 800,000 (53%)
- Transport: 300,000 (20%)
- Charges: 250,000 (17%)
- Autres: 150,000 (10%)

Par site:
- Site A: 900,000
- Site B: 600,000
```

---

*Module Depenses - 5 stories*
