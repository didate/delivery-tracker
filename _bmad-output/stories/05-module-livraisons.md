# Module Livraisons - User Stories

## DEL-001: Enregistrer une livraison

**En tant que** Livreur ou Gestionnaire
**Je veux** enregistrer une nouvelle livraison
**Afin de** documenter les produits livres a un client

### Criteres d'acceptation
- [ ] Je peux selectionner un client
- [ ] Le systeme affiche le solde actuel du client
- [ ] Si le client depasse son plafond, un avertissement s'affiche
- [ ] Je peux ajouter un ou plusieurs produits
- [ ] Pour chaque produit, je saisis la quantite
- [ ] Le prix unitaire est automatiquement rempli (prix actuel)
- [ ] Le montant par ligne est calcule automatiquement
- [ ] Le montant total est calcule automatiquement
- [ ] Je peux ajouter des notes optionnelles
- [ ] La date et l'heure sont enregistrees automatiquement
- [ ] Le livreur est identifie automatiquement (connecte)
- [ ] Un message de confirmation s'affiche

### Regles metier
- Le prix applique est le prix du produit au moment de la livraison
- Le solde du client est mis a jour apres validation
- En mode hors-ligne, la livraison est stockee localement

### Donnees
- Client: Reference (obligatoire)
- Livreur: Reference (automatique)
- Date/Heure: DateTime (automatique)
- Lignes: Liste de (Produit, Quantite, Prix, Montant)
- Montant total: Decimal (calcule)
- Notes: Text (optionnel)

---

## DEL-002: Ajouter des produits a une livraison

**En tant que** Livreur ou Gestionnaire
**Je veux** ajouter des produits a une livraison en cours de saisie
**Afin de** composer la commande du client

### Criteres d'acceptation
- [ ] Je vois la liste des produits actifs
- [ ] Je peux rechercher un produit par nom ou code
- [ ] Je peux selectionner un produit
- [ ] Je saisis la quantite
- [ ] Le prix unitaire s'affiche automatiquement
- [ ] Le montant de la ligne se calcule
- [ ] Je peux ajouter plusieurs produits
- [ ] Je peux modifier la quantite d'un produit deja ajoute
- [ ] Je peux supprimer un produit de la liste
- [ ] Le total se met a jour en temps reel

### Regles metier
- Quantite minimum = 1
- Pas de quantite negative
- Un meme produit ne peut apparaitre qu'une fois (on modifie la quantite)

---

## DEL-003: Calculer le montant total

**En tant que** Systeme
**Je veux** calculer automatiquement le montant total d'une livraison
**Afin de** garantir l'exactitude des montants

### Criteres d'acceptation
- [ ] Le montant de chaque ligne = quantite x prix unitaire
- [ ] Le montant total = somme des montants des lignes
- [ ] Les calculs utilisent 2 decimales
- [ ] L'arrondi est au centime superieur
- [ ] Le total se met a jour a chaque modification

### Regles metier
```
Montant_ligne = Quantite x Prix_unitaire
Montant_total = SUM(Montant_ligne)
```

---

## DEL-004: Lister les livraisons

**En tant que** Utilisateur
**Je veux** voir la liste des livraisons
**Afin de** consulter l'historique des operations

### Criteres d'acceptation
- [ ] La liste affiche: date, client, livreur, montant, statut sync
- [ ] Je peux filtrer par date (aujourd'hui, semaine, mois, periode)
- [ ] Je peux filtrer par client
- [ ] Je peux filtrer par livreur
- [ ] Je peux filtrer par point de production
- [ ] La liste est triee par date decroissante par defaut
- [ ] La pagination est disponible
- [ ] Le total des livraisons filtrees s'affiche

### Donnees affichees
| Colonne | Description |
|---------|-------------|
| Date | Date et heure |
| Client | Nom du client |
| Livreur | Nom du livreur |
| Nb produits | Nombre de lignes |
| Montant | Montant total |
| Statut | Synced / Pending |
| Actions | Voir detail |

---

## DEL-005: Filtrer les livraisons

**En tant que** Utilisateur
**Je veux** filtrer les livraisons selon differents criteres
**Afin de** trouver rapidement les informations recherchees

### Criteres d'acceptation
- [ ] Filtre par periode: aujourd'hui, hier, cette semaine, ce mois, personnalise
- [ ] Filtre par client: selection dans liste ou recherche
- [ ] Filtre par livreur: selection dans liste
- [ ] Filtre par point de production: selection dans liste
- [ ] Les filtres sont combinables (ET logique)
- [ ] Un bouton "Reinitialiser" efface tous les filtres
- [ ] Le nombre de resultats s'affiche
- [ ] Le total des montants filtres s'affiche

---

## DEL-006: Consulter le detail d'une livraison

**En tant que** Utilisateur
**Je veux** voir le detail complet d'une livraison
**Afin de** verifier les produits et montants

### Criteres d'acceptation
- [ ] Je vois les informations generales: date, client, livreur
- [ ] Je vois la liste des produits avec quantites et prix
- [ ] Je vois le montant total
- [ ] Je vois les notes si presentes
- [ ] Je vois le statut de synchronisation
- [ ] Je vois qui a enregistre la livraison
- [ ] Je peux imprimer un recu

### Donnees affichees
**En-tete:**
- Date et heure
- Client (nom, telephone, adresse)
- Livreur
- Point de production

**Lignes:**
| Produit | Quantite | Prix unitaire | Montant |
|---------|----------|---------------|---------|
| ... | ... | ... | ... |

**Pied:**
- Total
- Notes

---

## DEL-007: Annuler une livraison

**En tant que** Administrateur ou Gestionnaire
**Je veux** annuler une livraison erronee
**Afin de** corriger une erreur de saisie

### Criteres d'acceptation
- [ ] Je peux annuler une livraison recente (< 24h)
- [ ] Je dois saisir un motif d'annulation
- [ ] Le solde du client est recalcule
- [ ] La livraison reste visible avec le statut "Annulee"
- [ ] Une trace d'audit est creee
- [ ] Confirmation requise avant annulation

### Regles metier
- Seules les livraisons de moins de 24h peuvent etre annulees
- Une livraison annulee ne peut pas etre modifiee
- Le motif d'annulation est obligatoire
- L'annulation credite le compte client du montant de la livraison

---

*Module Livraisons - 7 stories*
