# Module Customers (Clients) - User Stories

## CLI-001: Creer un customer

**En tant que** Administrateur ou Gestionnaire
**Je veux** creer un nouveau customer dans le systeme
**Afin de** pouvoir enregistrer des livraisons pour ce customer

### Criteres d'acceptation
- [ ] Je peux saisir le nom du customer
- [ ] Je peux saisir le numero de telephone
- [ ] Je peux saisir l'adresse complete
- [ ] Je peux saisir des notes optionnelles
- [ ] Un code customer unique est genere automatiquement
- [ ] Le customer est cree avec is_active = true
- [ ] Le solde initial est 0
- [ ] Un message de confirmation s'affiche

### Regles metier
- Le numero de telephone doit etre unique (si renseigne)
- Le nom est obligatoire

### Donnees (Table: customers)
- code: Auto-genere (ex: CLI-0001)
- name: String (max 100 caracteres)
- phone: String (max 20 caracteres)
- address: Text
- notes: Text (optionnel)
- driver_id: NULL (pas encore assigne)

---

## CLI-002: Modifier un customer

**En tant que** Administrateur ou Gestionnaire
**Je veux** modifier les informations d'un customer existant
**Afin de** mettre a jour ses coordonnees

### Criteres d'acceptation
- [ ] Je peux modifier name
- [ ] Je peux modifier phone
- [ ] Je peux modifier address
- [ ] Je peux modifier notes
- [ ] Le code customer n'est pas modifiable
- [ ] Un message de confirmation s'affiche

---

## CLI-003: Enregistrer les coordonnees GPS

**En tant que** Administrateur, Gestionnaire ou Driver
**Je veux** enregistrer les coordonnees GPS d'un customer
**Afin de** faciliter la navigation et l'optimisation des tournees

### Criteres d'acceptation
- [ ] Je peux saisir manuellement latitude et longitude
- [ ] Sur mobile, je peux capturer la position actuelle
- [ ] Les coordonnees sont validees (format correct)
- [ ] Les coordonnees sont affichees sur une mini-carte
- [ ] Je peux modifier des coordonnees existantes

### Regles metier
- latitude: entre -90 et 90
- longitude: entre -180 et 180
- Precision: 6 decimales minimum

---

## CLI-004: Definir le credit limit

**En tant que** Administrateur
**Je veux** definir un credit limit pour un customer
**Afin de** limiter le risque d'impayes

### Criteres d'acceptation
- [ ] Je peux definir un montant maximum de credit (credit_limit)
- [ ] Je peux modifier le credit_limit existant
- [ ] Je peux supprimer le credit_limit (NULL = illimite)
- [ ] Le systeme affiche le solde actuel vs le credit_limit
- [ ] Un avertissement s'affiche si le customer est proche du credit_limit (> 80%)

### Regles metier
- credit_limit = 0 signifie pas de credit autorise
- credit_limit = NULL signifie illimite
- Alerte a 80% du credit_limit

---

## CLI-005: Lister les customers avec solde

**En tant que** Utilisateur
**Je veux** voir la liste des customers avec leur solde
**Afin de** avoir une vue d'ensemble de la situation financiere

### Criteres d'acceptation
- [ ] La liste affiche: code, name, phone, balance, credit_limit, driver
- [ ] Les customers avec solde debiteur sont mis en evidence
- [ ] Les customers depassant leur credit_limit sont marques en rouge
- [ ] Je peux filtrer par: tous, debiteurs, crediteurs, credit_limit depasse
- [ ] Je peux filtrer par Driver assigne
- [ ] Je peux trier par name, balance, date derniere transaction
- [ ] Je peux rechercher par name, code ou phone
- [ ] La pagination est disponible

### Donnees affichees
| Colonne | Description |
|---------|-------------|
| code | Code unique |
| name | Nom du customer |
| phone | Numero de telephone |
| balance | Solde actuel (colore) |
| credit_limit | Plafond de credit |
| driver | Driver assigne |
| status | Normal / Warning / Exceeded |
| Actions | View, Edit, Assign, History |

---

## CLI-006: Consulter l'historique d'un customer

**En tant que** Utilisateur
**Je veux** consulter l'historique complet des transactions d'un customer
**Afin de** comprendre l'evolution de son compte

### Criteres d'acceptation
- [ ] Je vois toutes les Deliveries du customer
- [ ] Je vois tous les Payments du customer
- [ ] Je vois tous les Returns du customer
- [ ] Chaque transaction affiche: date, type, amount, balance after
- [ ] Les transactions sont triees par date decroissante
- [ ] Je peux filtrer par type de transaction
- [ ] Je peux filtrer par periode

### Donnees affichees
| Colonne | Description |
|---------|-------------|
| Date | Date de la transaction |
| Type | Delivery / Payment / Return |
| Reference | Numero de reference |
| Debit | Montant debiteur |
| Credit | Montant crediteur |
| Balance | Solde apres transaction |

---

## CLI-007: Rechercher un customer

**En tant que** Utilisateur
**Je veux** rechercher rapidement un customer
**Afin d'** acceder a ses informations sans parcourir toute la liste

### Criteres d'acceptation
- [ ] Je peux rechercher par name (recherche partielle)
- [ ] Je peux rechercher par code exact
- [ ] Je peux rechercher par phone
- [ ] Les resultats s'affichent en temps reel (autocompletion)
- [ ] Je peux selectionner un resultat pour voir le detail

### Regles metier
- Recherche insensible a la casse
- Recherche partielle sur name (contient)
- Minimum 2 caracteres pour declencher la recherche

---

## CLI-008: Desactiver un customer

**En tant que** Administrateur
**Je veux** desactiver un customer
**Afin qu'** il ne soit plus disponible pour les nouvelles Deliveries

### Criteres d'acceptation
- [ ] Je peux desactiver un customer actif (is_active = false)
- [ ] Je peux reactiver un customer desactive
- [ ] Un customer desactive n'apparait plus dans les Rounds
- [ ] L'historique du customer est conserve
- [ ] Si le customer a un solde non nul, un avertissement s'affiche
- [ ] Confirmation requise avant desactivation

### Regles metier
- La desactivation ne supprime pas les donnees
- Le solde reste visible et recouvrable

---

## CLI-009: Assigner un customer a un driver

**En tant que** Administrateur ou Gestionnaire
**Je veux** assigner un customer a un driver
**Afin que** le customer apparaisse dans les tournees de ce driver

### Criteres d'acceptation
- [ ] Je peux selectionner un customer
- [ ] Je peux voir le driver actuellement assigne (si existe)
- [ ] Je peux selectionner un nouveau driver dans la liste
- [ ] Le customer.driver_id est mis a jour
- [ ] Le customer apparaitra dans les prochaines Rounds du driver
- [ ] Je peux retirer l'assignation (driver_id = NULL)

### Regles metier
- Un customer ne peut etre assigne qu'a un seul driver
- Changer de driver prend effet des la prochaine generation de Round
- Un customer sans driver n'apparait dans aucune Round

### Interface
```
Customer: [Client ABC]
Driver actuel: Jean DUPONT
Nouveau driver: [Liste deroulante des drivers actifs]
[Sauvegarder] [Retirer l'assignation]
```

---

## CLI-010: Assigner plusieurs customers a un driver

**En tant que** Administrateur ou Gestionnaire
**Je veux** assigner plusieurs customers a un driver en une fois
**Afin de** configurer rapidement les zones de livraison

### Criteres d'acceptation
- [ ] Je peux selectionner un driver
- [ ] Je vois la liste des customers assignes a ce driver
- [ ] Je vois la liste des customers non assignes
- [ ] Je peux ajouter des customers a ce driver (multi-selection)
- [ ] Je peux retirer des customers de ce driver
- [ ] Les modifications sont appliquees en masse
- [ ] Un resume des changements est affiche

### Interface
```
Driver: Jean DUPONT

Customers assignes (15):      Customers disponibles (42):
[x] Client A                  [ ] Client X
[x] Client B                  [ ] Client Y
[x] Client C                  [ ] Client Z
...                           ...

[<< Retirer]  [Ajouter >>]
[Sauvegarder]
```

---

## CLI-011: Voir les customers d'un driver

**En tant que** Gestionnaire ou Administrateur
**Je veux** voir tous les customers assignes a un driver
**Afin de** visualiser sa zone de couverture

### Criteres d'acceptation
- [ ] Je selectionne un driver
- [ ] Je vois la liste de ses customers (ou driver_id = driver.id)
- [ ] Je vois le nombre total de customers
- [ ] Je peux voir sur une carte la position de ses customers
- [ ] Je peux acceder au detail d'un customer

### Affichage
```
Driver: Jean DUPONT
Customers assignes: 15

| Name | Address | Balance | Last visit |
|------|---------|---------|------------|
| Client A | Quartier X | 50,000 | 05/02/2024 |
| Client B | Quartier Y | 0 | 05/02/2024 |
...

[Voir sur carte]
```

---

*Module Customers (Clients) - 11 stories*
*Mise a jour: Ajout assignation Customer-Driver*
