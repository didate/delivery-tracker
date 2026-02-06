# Module Salaires et Primes - User Stories

## SAL-001: Configurer les regles de prime

**En tant que** Administrateur
**Je veux** configurer les regles de calcul des primes
**Afin de** definir la politique de remuneration variable

### Criteres d'acceptation
- [ ] Je peux creer une nouvelle regle de prime
- [ ] Je definis le nom de la regle
- [ ] Je selectionne le type de calcul
- [ ] Je definis la valeur (% ou montant fixe)
- [ ] Je peux definir un seuil minimum
- [ ] Je peux activer/desactiver une regle
- [ ] Plusieurs regles peuvent etre actives simultanement

### Types de calcul
| Type | Description | Exemple |
|------|-------------|---------|
| POURCENTAGE_CA | % du chiffre d'affaires livre | 2% du CA |
| BONUS_LIVRAISON | Montant fixe par livraison | 100 FCFA/livraison |
| BONUS_FIXE | Prime fixe si objectif atteint | 10,000 FCFA si CA > 500,000 |

### Donnees
- Nom: String (obligatoire)
- Type de calcul: Enum (obligatoire)
- Valeur: Decimal (obligatoire)
- Seuil minimum: Decimal (optionnel)
- Actif: Boolean

### Exemple de configuration
```
Regle 1: "Commission CA"
- Type: POURCENTAGE_CA
- Valeur: 2%
- Seuil: 0 (des le 1er franc)

Regle 2: "Bonus livraisons"
- Type: BONUS_LIVRAISON
- Valeur: 50 FCFA
- Seuil: 0

Regle 3: "Prime objectif"
- Type: BONUS_FIXE
- Valeur: 15,000 FCFA
- Seuil: 1,000,000 FCFA de CA
```

---

## SAL-002: Calculer les primes d'un livreur

**En tant que** Administrateur ou Comptable
**Je veux** calculer les primes d'un livreur pour une periode
**Afin de** determiner sa remuneration variable

### Criteres d'acceptation
- [ ] Je selectionne le livreur
- [ ] Je selectionne la periode (debut et fin)
- [ ] Le systeme calcule les metriques:
  - Chiffre d'affaires total livre
  - Nombre de livraisons
  - Nombre de retours
- [ ] Le systeme applique chaque regle active
- [ ] Le detail du calcul est affiche
- [ ] Le total des primes est affiche

### Calcul
```
Pour chaque regle active:
  Si type = POURCENTAGE_CA:
    prime += CA_total x valeur%
  Si type = BONUS_LIVRAISON:
    prime += nb_livraisons x valeur
  Si type = BONUS_FIXE et CA_total >= seuil:
    prime += valeur

Total primes = Somme des primes de chaque regle
```

### Affichage
```
Livreur: Jean DUPONT
Periode: 01/01/2024 - 31/01/2024

Metriques:
- CA livre: 1,500,000 FCFA
- Livraisons: 85
- Retours: 5

Primes calculees:
- Commission CA (2%): 30,000 FCFA
- Bonus livraisons (50/livr): 4,250 FCFA
- Prime objectif: 15,000 FCFA

TOTAL PRIMES: 49,250 FCFA
```

---

## SAL-003: Generer une fiche de paie

**En tant que** Administrateur ou Comptable
**Je veux** generer la fiche de paie d'un livreur
**Afin de** documenter sa remuneration

### Criteres d'acceptation
- [ ] Je selectionne le livreur
- [ ] Je selectionne la periode
- [ ] Le systeme affiche:
  - Salaire de base
  - Detail des primes
  - Total a payer
- [ ] Je peux generer un document PDF
- [ ] Je peux enregistrer le paiement

### Fiche de paie
```
====================================
         FICHE DE PAIE
====================================
Livreur: Jean DUPONT
Periode: 01/01/2024 - 31/01/2024
------------------------------------
Salaire de base:        150,000 FCFA

Primes:
- Commission CA (2%):    30,000 FCFA
- Bonus livraisons:       4,250 FCFA
- Prime objectif:        15,000 FCFA
------------------------------------
Sous-total primes:       49,250 FCFA
------------------------------------
TOTAL A PAYER:          199,250 FCFA
====================================
```

---

## SAL-004: Enregistrer un paiement de salaire

**En tant que** Administrateur ou Comptable
**Je veux** enregistrer le paiement du salaire d'un livreur
**Afin de** tracer les remunerations versees

### Criteres d'acceptation
- [ ] Je selectionne le livreur
- [ ] Je selectionne la periode concernee
- [ ] Le systeme affiche le montant calcule
- [ ] Je confirme le montant paye
- [ ] Je saisis la date de paiement
- [ ] Je peux ajouter des notes
- [ ] Le paiement est enregistre avec statut "PAYE"
- [ ] La fiche est archivee

### Regles metier
- Un paiement de salaire ne peut etre fait qu'une fois par periode
- Le montant peut etre ajuste (avec justification)
- L'historique des paiements est conserve

### Donnees
- Livreur: Reference
- Periode debut: Date
- Periode fin: Date
- Salaire base: Decimal
- Primes: Decimal
- Total: Decimal
- Date paiement: Date
- Statut: CALCULE / PAYE
- Notes: Text

---

## SAL-005: Historique des salaires

**En tant que** Administrateur ou Comptable
**Je veux** consulter l'historique des salaires payes
**Afin de** suivre les remunerations

### Criteres d'acceptation
- [ ] Je peux filtrer par livreur
- [ ] Je peux filtrer par periode
- [ ] La liste affiche: livreur, periode, salaire, primes, total, statut
- [ ] Je peux voir le detail d'un paiement
- [ ] Je vois le total des salaires payes
- [ ] Je peux exporter les donnees

### Donnees affichees
| Colonne | Description |
|---------|-------------|
| Livreur | Nom |
| Periode | Debut - Fin |
| Salaire base | Montant |
| Primes | Montant |
| Total | Montant total |
| Date paiement | Date |
| Statut | Calcule / Paye |

---

## SAL-006: Consulter le detail des primes

**En tant que** Livreur
**Je veux** consulter le detail de mes primes
**Afin de** comprendre ma remuneration

### Criteres d'acceptation
- [ ] Je vois mes statistiques de la periode
- [ ] Je vois le detail de chaque prime appliquee
- [ ] Je vois le total des primes
- [ ] Je peux consulter les periodes precedentes
- [ ] L'affichage est adapte au mobile

### Affichage mobile
```
Mes primes - Janvier 2024

Mon activite:
- CA livre: 1,500,000 FCFA
- Livraisons: 85

Mes primes:
Commission (2%): 30,000
Bonus livr.: 4,250
Objectif: 15,000
-----------------
TOTAL: 49,250 FCFA
```

---

*Module Salaires et Primes - 6 stories*
