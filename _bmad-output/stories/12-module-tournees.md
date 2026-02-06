# Module Rounds (Tournees) - User Stories

## TRN-001: Generer automatiquement les tournees

**En tant que** Systeme ou Gestionnaire
**Je veux** generer automatiquement les tournees du jour
**Afin que** chaque livreur ait sa liste de clients a visiter

### Criteres d'acceptation
- [ ] Le systeme genere une Round par Driver actif
- [ ] Chaque Round inclut tous les Customers ou driver_id = driver.id
- [ ] Les Customers sont ajoutes a RoundCustomer avec status = TO_VISIT
- [ ] L'ordre de visite est optimise par GPS (si coordonnees disponibles)
- [ ] La Round a status = PLANNED et auto_generated = true
- [ ] La generation peut etre declenchee manuellement ou par tache planifiee
- [ ] Si une Round existe deja pour ce jour/driver, elle n'est pas recreee

### Regles metier
- Un Driver sans Customer attribue = Round vide ou non creee
- Une seule Round par Driver par jour (contrainte UNIQUE)
- Generation quotidienne automatique (ex: 5h du matin)

### Flux
```
1. Recuperer tous les Drivers actifs
2. Pour chaque Driver:
   a. Verifier si Round existe pour aujourd'hui
   b. Si non, creer Round (status=PLANNED)
   c. Recuperer Customers ou driver_id = driver.id AND is_active = true
   d. Pour chaque Customer, creer RoundCustomer
   e. Optimiser l'ordre par GPS
3. Notifier les drivers (optionnel)
```

---

## TRN-002: Exclure un client d'une tournee

**En tant que** Gestionnaire ou Administrateur
**Je veux** exclure un client d'une tournee specifique
**Afin de** l'ecarter temporairement sans changer son affectation

### Criteres d'acceptation
- [ ] Je peux voir la liste des Customers d'une Round
- [ ] Je peux marquer un Customer comme "exclu" (excluded = true)
- [ ] Le Customer exclu n'apparait plus dans la tournee du livreur
- [ ] L'exclusion ne modifie pas l'affectation driver_id du Customer
- [ ] Je peux re-inclure un Customer exclu
- [ ] Le livreur voit uniquement les Customers non exclus

### Regles metier
- L'exclusion est specifique a cette Round (date)
- Le Customer reste assigne au Driver pour les futures Rounds

---

## TRN-003: Optimiser l'ordre de passage

**En tant que** Systeme ou Gestionnaire
**Je veux** optimiser l'ordre de visite des clients
**Afin de** minimiser les distances parcourues

### Criteres d'acceptation
- [ ] L'optimisation utilise les coordonnees GPS des Customers
- [ ] Le point de depart est le ProductionSite du Driver
- [ ] L'algorithme calcule le trajet le plus court
- [ ] Les Customers sans GPS sont places a la fin
- [ ] La distance totale estimee est affichee
- [ ] Le Gestionnaire peut ajuster manuellement apres optimisation

### Algorithme
```
1. Partir du ProductionSite (lat, lng)
2. Trouver le Customer non visite le plus proche
3. Marquer comme visite, ajouter a la liste ordonnee
4. Repeter jusqu'a tous les Customers
5. Customers sans GPS -> ajouter a la fin
6. Mettre a jour RoundCustomer.visit_order
```

---

## TRN-004: Consulter une tournee

**En tant que** Gestionnaire, Administrateur ou Driver (sa propre tournee)
**Je veux** consulter les details d'une tournee
**Afin de** voir les clients a visiter

### Criteres d'acceptation
- [ ] Je vois les informations de la Round: date, driver, status
- [ ] Je vois la liste des Customers dans l'ordre de passage
- [ ] Pour chaque Customer: nom, adresse, telephone, solde, status visite
- [ ] Je vois le nombre de Customers (total, visites, a visiter, sautes)
- [ ] Je vois le CA realise (si livraisons effectuees)
- [ ] Je vois les Customers exclus separement

### Donnees affichees
| # | Customer | Adresse | Solde | Status |
|---|----------|---------|-------|--------|
| 1 | Client A | Quartier X | 50,000 | VISITED |
| 2 | Client B | Quartier Y | 120,000 | TO_VISIT |
| 3 | Client C | Centre | 0 | SKIPPED |

---

## TRN-005: Visualiser la tournee sur carte

**En tant que** Gestionnaire ou Administrateur
**Je veux** voir la tournee sur une carte
**Afin de** visualiser le parcours geographique

### Criteres d'acceptation
- [ ] La carte affiche le ProductionSite comme point de depart
- [ ] Chaque Customer est marque avec son numero d'ordre
- [ ] Le trajet est trace entre les points
- [ ] Les couleurs indiquent le status (vert=visite, gris=a visiter, orange=saute)
- [ ] La distance totale est affichee
- [ ] Je peux zoomer et naviguer

### Affichage
```
[Carte avec:]
- Marqueur depart (ProductionSite) = icone usine
- Marqueurs Customers = numeros 1, 2, 3...
- Ligne de parcours
- Legende couleurs
- Distance: XX km
```

---

## TRN-006: Suivre l'avancement d'une tournee

**En tant que** Gestionnaire ou Administrateur
**Je veux** suivre l'avancement d'une tournee en cours
**Afin de** superviser le travail du Driver

### Criteres d'acceptation
- [ ] Je vois le status de chaque Customer: TO_VISIT, VISITED, SKIPPED
- [ ] Je vois l'heure de visite pour les VISITED
- [ ] Je vois le pourcentage d'avancement
- [ ] Je vois le CA realise en temps reel
- [ ] La derniere synchronisation est affichee
- [ ] Un rafraichissement automatique est disponible

### Indicateurs
- Progression: X/Y clients (XX%)
- CA realise: XXX FCFA
- Derniere sync: il y a X minutes

---

## TRN-007: Marquer une visite comme effectuee

**En tant que** Driver (via mobile)
**Je veux** marquer un client comme visite
**Afin de** mettre a jour l'avancement de ma tournee

### Criteres d'acceptation
- [ ] Je peux marquer un Customer comme VISITED (avec ou sans livraison)
- [ ] Je peux marquer un Customer comme SKIPPED (avec motif optionnel)
- [ ] L'heure de visite est enregistree automatiquement
- [ ] Le status est synchronise au serveur
- [ ] En mode offline, le status est stocke localement

### Status possibles
| Status | Description |
|--------|-------------|
| TO_VISIT | Pas encore visite |
| VISITED | Visite effectuee (livraison ou non) |
| SKIPPED | Client saute (absent, ferme, refuse) |

---

## TRN-008: Regenerer une tournee

**En tant que** Gestionnaire ou Administrateur
**Je veux** regenerer une tournee existante
**Afin de** prendre en compte les changements d'affectation

### Criteres d'acceptation
- [ ] Je peux regenerer une Round pour mettre a jour la liste des Customers
- [ ] Les nouveaux Customers assignes au Driver sont ajoutes
- [ ] Les Customers retires de l'affectation sont supprimes
- [ ] Les visites deja effectuees (VISITED) sont conservees
- [ ] Confirmation requise avant regeneration

### Regles metier
- Seules les Rounds avec status PLANNED peuvent etre regenerees
- Une Round IN_PROGRESS ou COMPLETED ne peut pas etre regeneree

---

*Module Rounds (Tournees) - 8 stories*
*Mise a jour: Generation automatique avec Customers assignes*
