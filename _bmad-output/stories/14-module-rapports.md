# Module Rapports - User Stories

## RPT-001: Rapport mensuel

**En tant que** Administrateur ou Comptable
**Je veux** generer un rapport mensuel complet
**Afin de** avoir une synthese de l'activite du mois

### Criteres d'acceptation
- [ ] Je selectionne le mois et l'annee
- [ ] Le rapport inclut:
  - Resume executif
  - Production totale par produit
  - Livraisons (nombre, montant, par livreur)
  - Retours (nombre, montant, par motif)
  - Paiements recus
  - Depenses par categorie
  - Evolution des soldes clients
  - Performance des livreurs
- [ ] Les donnees sont comparees au mois precedent
- [ ] Je peux exporter en PDF
- [ ] Je peux exporter en Excel

### Structure du rapport
```
RAPPORT MENSUEL - [MOIS] [ANNEE]

1. RESUME EXECUTIF
   - CA total: XXX FCFA (+X% vs mois precedent)
   - Livraisons: XXX
   - Paiements recus: XXX FCFA
   - Solde clients: XXX FCFA

2. PRODUCTION
   [Tableau par produit]

3. LIVRAISONS
   [Tableau par livreur]
   [Graphique evolution]

4. RETOURS
   [Tableau par motif]
   [Taux de retour]

5. PAIEMENTS
   [Total par mode]
   [Evolution recouvrement]

6. DEPENSES
   [Tableau par categorie]
   [Graphique repartition]

7. SOLDES CLIENTS
   [Top 10 debiteurs]
   [Evolution encours]

8. PERFORMANCE LIVREURS
   [Classement]
   [Primes calculees]
```

---

## RPT-002: Rapport annuel

**En tant que** Administrateur
**Je veux** generer un rapport annuel
**Afin de** avoir une vue d'ensemble de l'annee

### Criteres d'acceptation
- [ ] Je selectionne l'annee
- [ ] Le rapport inclut les memes sections que le mensuel
- [ ] Les donnees sont aggregees par mois
- [ ] L'evolution mois par mois est visible
- [ ] Comparaison avec l'annee precedente si disponible
- [ ] Graphiques annuels
- [ ] Export PDF et Excel

### Graphiques specifiques
- Evolution CA mensuel
- Saisonnalite des ventes
- Evolution des effectifs livreurs
- Evolution des depenses

---

## RPT-003: Rapport par livreur

**En tant que** Administrateur ou Gestionnaire
**Je veux** generer un rapport de performance par livreur
**Afin d'** evaluer son travail

### Criteres d'acceptation
- [ ] Je selectionne le livreur
- [ ] Je selectionne la periode
- [ ] Le rapport inclut:
  - Informations livreur
  - Statistiques de livraison
  - Statistiques de retour
  - Chiffre d'affaires genere
  - Taux de retour
  - Clients visites
  - Primes gagnees
  - Evolution dans le temps
- [ ] Comparaison avec la moyenne des livreurs
- [ ] Export PDF

### Structure
```
RAPPORT LIVREUR - [NOM]
Periode: [DEBUT] - [FIN]

PROFIL
- Point de production: XXX
- Date embauche: XX/XX/XXXX
- Salaire base: XXX FCFA

ACTIVITE
- Jours travailles: XX
- Livraisons totales: XXX
- CA total: XXX FCFA
- Retours: XX (X%)
- Clients uniques: XX

PERFORMANCE
- CA moyen/jour: XXX FCFA
- Livraisons/jour: X.X
- Taux retour: X.X% (moyenne: Y.Y%)

REMUNERATION
- Salaire base: XXX FCFA
- Primes: XXX FCFA
- Total: XXX FCFA

EVOLUTION
[Graphique hebdomadaire]
```

---

## RPT-004: Rapport par point de production

**En tant que** Administrateur
**Je veux** generer un rapport par point de production
**Afin de** comparer les performances des sites

### Criteres d'acceptation
- [ ] Je selectionne le point de production
- [ ] Je selectionne la periode
- [ ] Le rapport inclut:
  - Production totale
  - Livraisons des livreurs du site
  - Retours
  - Depenses du site
  - Rentabilite
- [ ] Comparaison avec les autres sites
- [ ] Export PDF et Excel

### Indicateurs specifiques
- Production vs Livraisons (utilisation)
- Marge par site (CA - Depenses)
- Performance moyenne des livreurs du site

---

## RPT-005: Export PDF

**En tant que** Utilisateur
**Je veux** exporter un rapport en PDF
**Afin de** l'imprimer ou l'archiver

### Criteres d'acceptation
- [ ] Le PDF est genere avec mise en page professionnelle
- [ ] Logo de l'entreprise en en-tete
- [ ] Date de generation
- [ ] Pagination
- [ ] Tableaux lisibles
- [ ] Graphiques inclus en images
- [ ] Le fichier est telecharge automatiquement
- [ ] Nom du fichier: Rapport_[Type]_[Date].pdf

### Format
- Taille: A4
- Orientation: Portrait ou Paysage selon le contenu
- Marges: Standard (2cm)
- Police: Lisible (min 10pt)

---

## RPT-006: Export Excel

**En tant que** Utilisateur
**Je veux** exporter les donnees en Excel
**Afin de** les analyser ou les retraiter

### Criteres d'acceptation
- [ ] Le fichier Excel (.xlsx) est genere
- [ ] Chaque section est sur un onglet separe
- [ ] Les donnees sont structurees en tableaux
- [ ] Les formules de totaux sont incluses
- [ ] Les colonnes sont dimensionnees
- [ ] Le fichier est telecharge automatiquement
- [ ] Nom du fichier: Export_[Type]_[Date].xlsx

### Structure du fichier
```
Onglet 1: Resume
Onglet 2: Production
Onglet 3: Livraisons
Onglet 4: Retours
Onglet 5: Paiements
Onglet 6: Depenses
Onglet 7: Clients
```

---

*Module Rapports - 6 stories*
