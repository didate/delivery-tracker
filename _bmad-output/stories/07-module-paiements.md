# Module Paiements - User Stories

## PAY-001: Enregistrer un paiement

**En tant que** Gestionnaire, Comptable ou Livreur
**Je veux** enregistrer un paiement d'un client
**Afin de** crediter son compte

### Criteres d'acceptation
- [ ] Je peux rechercher et selectionner un client
- [ ] Le systeme affiche le solde actuel du client
- [ ] Je saisis le montant du paiement
- [ ] Je selectionne le mode de paiement
- [ ] Je peux saisir une reference (numero cheque, etc.)
- [ ] Je peux ajouter des notes
- [ ] La date est automatique (modifiable par admin)
- [ ] Le solde est recalcule et affiche apres validation
- [ ] Un message de confirmation s'affiche

### Regles metier
- Le montant doit etre > 0
- Le paiement credite le compte client (diminue le solde)
- Le paiement n'est pas lie a une livraison specifique

### Donnees
- Client: Reference (obligatoire)
- Montant: Decimal (obligatoire, > 0)
- Mode de paiement: Enum (obligatoire)
- Reference: String (optionnel)
- Date: Date (automatique ou saisie)
- Notes: Text (optionnel)
- Enregistre par: Reference utilisateur (automatique)

### Modes de paiement
| Code | Libelle |
|------|---------|
| ESPECES | Especes |
| VIREMENT | Virement bancaire |
| CHEQUE | Cheque |
| MOBILE | Paiement mobile |

---

## PAY-002: Consulter le solde client

**En tant que** Utilisateur
**Je veux** consulter le solde d'un client
**Afin de** connaitre sa situation financiere

### Criteres d'acceptation
- [ ] Je recherche le client
- [ ] Le systeme affiche le solde actuel
- [ ] Le solde positif (client doit) est en rouge
- [ ] Le solde negatif (client en avance) est en vert
- [ ] Je vois le plafond de credit si defini
- [ ] Je vois le pourcentage d'utilisation du plafond
- [ ] Je vois la date de la derniere transaction

### Affichage
```
Client: [Nom du client]
Solde actuel: [Montant] FCFA
Plafond: [Montant] FCFA
Utilisation: [XX]%
Derniere transaction: [Date]
```

---

## PAY-003: Lister les paiements

**En tant que** Gestionnaire ou Comptable
**Je veux** voir la liste des paiements
**Afin de** suivre les encaissements

### Criteres d'acceptation
- [ ] La liste affiche: date, client, montant, mode, reference, enregistre par
- [ ] Je peux filtrer par date (aujourd'hui, semaine, mois, periode)
- [ ] Je peux filtrer par client
- [ ] Je peux filtrer par mode de paiement
- [ ] La liste est triee par date decroissante
- [ ] Le total des paiements filtres s'affiche
- [ ] La pagination est disponible

### Donnees affichees
| Colonne | Description |
|---------|-------------|
| Date | Date du paiement |
| Client | Nom du client |
| Montant | Montant paye |
| Mode | Mode de paiement |
| Reference | Numero reference |
| Enregistre par | Utilisateur |
| Actions | Voir detail |

---

## PAY-004: Filtrer les paiements

**En tant que** Gestionnaire ou Comptable
**Je veux** filtrer les paiements selon differents criteres
**Afin de** analyser les encaissements

### Criteres d'acceptation
- [ ] Filtre par periode: aujourd'hui, hier, semaine, mois, personnalise
- [ ] Filtre par client: recherche et selection
- [ ] Filtre par mode de paiement: liste deroulante
- [ ] Filtre par utilisateur qui a enregistre
- [ ] Les filtres sont combinables
- [ ] Affichage du total filtre

### Totaux affiches
- Nombre de paiements
- Montant total
- Repartition par mode de paiement

---

## PAY-005: Exporter les paiements

**En tant que** Comptable ou Administrateur
**Je veux** exporter la liste des paiements
**Afin de** les integrer dans ma comptabilite

### Criteres d'acceptation
- [ ] Je peux exporter en format Excel (.xlsx)
- [ ] Je peux exporter en format CSV
- [ ] L'export respecte les filtres actifs
- [ ] L'export inclut toutes les colonnes
- [ ] L'export inclut une ligne de total
- [ ] Le fichier est telecharge automatiquement

### Contenu export
| Colonne | Format |
|---------|--------|
| Date | JJ/MM/AAAA |
| Client | Texte |
| Montant | Nombre |
| Mode | Texte |
| Reference | Texte |
| Notes | Texte |
| Enregistre par | Texte |

---

*Module Paiements - 5 stories*
