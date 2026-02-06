# Module Produits - User Stories

## PRD-001: Creer un produit

**En tant que** Administrateur
**Je veux** creer un nouveau produit dans le systeme
**Afin de** pouvoir l'inclure dans les livraisons

### Criteres d'acceptation
- [ ] Je peux saisir un code produit unique
- [ ] Je peux saisir un nom de produit (ex: "Lait 1L", "Yaourt 500g")
- [ ] Je peux saisir une description optionnelle
- [ ] Je peux definir le prix unitaire
- [ ] Le systeme valide que le code est unique
- [ ] Le systeme valide que le prix est positif
- [ ] Le produit est cree avec le statut "actif" par defaut
- [ ] Un message de confirmation s'affiche apres creation

### Regles metier
- Le code produit doit etre unique dans le systeme
- Le prix doit etre > 0
- Le nom est obligatoire

### Donnees
- Code: String (max 20 caracteres)
- Nom: String (max 100 caracteres)
- Description: String (max 500 caracteres, optionnel)
- Prix: Decimal (2 decimales)

---

## PRD-002: Modifier un produit

**En tant que** Administrateur
**Je veux** modifier les informations d'un produit existant
**Afin de** mettre a jour ses caracteristiques ou son prix

### Criteres d'acceptation
- [ ] Je peux modifier le nom du produit
- [ ] Je peux modifier la description
- [ ] Je peux modifier le prix
- [ ] Le code produit n'est pas modifiable
- [ ] Si le prix change, l'ancien prix est historise avec sa date de fin
- [ ] Le nouveau prix est enregistre avec sa date de debut
- [ ] Un message de confirmation s'affiche apres modification

### Regles metier
- Le changement de prix cree automatiquement une entree dans l'historique des prix
- Les livraisons passees conservent le prix au moment de la livraison

---

## PRD-003: Desactiver un produit

**En tant que** Administrateur
**Je veux** desactiver un produit
**Afin qu'** il ne soit plus disponible pour les nouvelles livraisons

### Criteres d'acceptation
- [ ] Je peux desactiver un produit actif
- [ ] Je peux reactiver un produit desactive
- [ ] Un produit desactive n'apparait plus dans la liste des produits disponibles pour une livraison
- [ ] Un produit desactive reste visible dans l'historique des livraisons
- [ ] Un message de confirmation s'affiche avant desactivation

### Regles metier
- Un produit desactive conserve son historique
- La desactivation est reversible

---

## PRD-004: Lister les produits

**En tant que** Utilisateur
**Je veux** voir la liste de tous les produits
**Afin de** connaitre les produits disponibles et leurs prix

### Criteres d'acceptation
- [ ] La liste affiche: code, nom, prix, statut
- [ ] Je peux filtrer par statut (actif/inactif/tous)
- [ ] Je peux rechercher par nom ou code
- [ ] La liste est triee par nom par defaut
- [ ] Je peux changer l'ordre de tri
- [ ] La pagination est disponible si > 20 produits

### Donnees affichees
| Colonne | Description |
|---------|-------------|
| Code | Code unique du produit |
| Nom | Nom complet |
| Prix | Prix unitaire actuel |
| Statut | Actif / Inactif |
| Actions | Modifier, Desactiver |

---

## PRD-005: Consulter l'historique des prix

**En tant que** Administrateur ou Comptable
**Je veux** consulter l'historique des prix d'un produit
**Afin de** voir l'evolution des prix dans le temps

### Criteres d'acceptation
- [ ] Je peux voir la liste des prix successifs du produit
- [ ] Chaque entree affiche: prix, date debut, date fin
- [ ] Le prix actuel est mis en evidence
- [ ] La liste est triee par date decroissante

### Donnees affichees
| Colonne | Description |
|---------|-------------|
| Prix | Prix unitaire |
| Date debut | Date d'application |
| Date fin | Fin de validite (vide si actuel) |
| Duree | Nombre de jours |

---

*Module Produits - 5 stories*
