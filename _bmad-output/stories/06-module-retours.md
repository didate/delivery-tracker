# Module Retours - User Stories

## RET-001: Enregistrer un retour

**En tant que** Livreur ou Gestionnaire
**Je veux** enregistrer un retour de produits
**Afin de** documenter les produits non livres ou retournes

### Criteres d'acceptation
- [ ] Je peux selectionner un client (optionnel pour les invendus)
- [ ] Je peux selectionner un produit
- [ ] Je saisis la quantite retournee
- [ ] Je selectionne le motif du retour
- [ ] Le montant est calcule automatiquement (quantite x prix)
- [ ] Je peux indiquer si le retour credite le compte client
- [ ] La date et l'heure sont enregistrees automatiquement
- [ ] Le livreur est identifie automatiquement
- [ ] Je peux ajouter une description complementaire

### Regles metier
- Si le client est specifie et "crediter client" est coche, le solde client diminue
- Le retour est comptabilise dans le stock theorique
- En mode hors-ligne, le retour est stocke localement

### Donnees
- Client: Reference (optionnel)
- Livreur: Reference (automatique)
- Produit: Reference (obligatoire)
- Quantite: Integer (obligatoire, > 0)
- Motif: Enum (obligatoire)
- Description: Text (optionnel)
- Crediter client: Boolean
- Montant: Decimal (calcule)

---

## RET-002: Specifier le motif du retour

**En tant que** Livreur ou Gestionnaire
**Je veux** specifier le motif du retour
**Afin de** categoriser les retours pour analyse

### Criteres d'acceptation
- [ ] Je dois choisir un motif parmi: INVENDU, PERIME, DEFECTUEUX, AUTRE
- [ ] Si motif = AUTRE, la description est obligatoire
- [ ] Le motif est obligatoire pour valider le retour

### Motifs disponibles
| Code | Libelle | Description |
|------|---------|-------------|
| INVENDU | Invendu | Produit non vendu en fin de tournee |
| PERIME | Perime | Produit arrive a date de peremption |
| DEFECTUEUX | Defectueux | Produit endommage ou defaillant |
| AUTRE | Autre | Autre raison (description requise) |

---

## RET-003: Crediter le compte client

**En tant que** Gestionnaire ou Administrateur
**Je veux** crediter le compte client lors d'un retour
**Afin de** rembourser le client pour les produits retournes

### Criteres d'acceptation
- [ ] Je peux cocher "Crediter le compte client"
- [ ] Si coche, le montant du retour est deduit du solde client
- [ ] Le nouveau solde s'affiche apres validation
- [ ] L'operation apparait dans l'historique du client comme "Retour"

### Regles metier
- Seuls les retours avec client specifie peuvent crediter
- Le credit est egal au montant du retour (quantite x prix)
- Solde client = Solde actuel - Montant retour

---

## RET-004: Lister les retours

**En tant que** Utilisateur
**Je veux** voir la liste des retours
**Afin de** suivre les produits retournes

### Criteres d'acceptation
- [ ] La liste affiche: date, livreur, client, produit, quantite, motif, montant
- [ ] Je peux filtrer par date
- [ ] Je peux filtrer par livreur
- [ ] Je peux filtrer par motif
- [ ] Je peux filtrer par produit
- [ ] La liste est triee par date decroissante
- [ ] Le total des retours s'affiche (quantite et montant)

### Donnees affichees
| Colonne | Description |
|---------|-------------|
| Date | Date et heure |
| Livreur | Nom du livreur |
| Client | Nom (ou "N/A") |
| Produit | Nom du produit |
| Quantite | Nombre retourne |
| Motif | Type de retour |
| Montant | Valeur |
| Credite | Oui/Non |

---

## RET-005: Statistiques des retours

**En tant que** Administrateur ou Gestionnaire
**Je veux** voir les statistiques des retours
**Afin d'** analyser les causes et reduire les pertes

### Criteres d'acceptation
- [ ] Je peux selectionner une periode
- [ ] Je vois le total des retours (quantite et montant)
- [ ] Je vois la repartition par motif (graphique)
- [ ] Je vois les produits les plus retournes
- [ ] Je vois les livreurs avec le plus de retours
- [ ] Je vois le taux de retour global (retours / livraisons)
- [ ] Je peux exporter les donnees

### Indicateurs
| Indicateur | Description |
|------------|-------------|
| Total retours | Nombre et montant |
| Par motif | Repartition % |
| Top produits | 5 produits les plus retournes |
| Par livreur | Taux de retour par livreur |
| Taux global | % retours vs livraisons |

---

*Module Retours - 5 stories*
