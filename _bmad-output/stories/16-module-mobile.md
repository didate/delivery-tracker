# Module Application Mobile - User Stories

## MOB-001: Authentification mobile

**En tant que** Livreur
**Je veux** me connecter a l'application mobile
**Afin d'** acceder a mes fonctionnalites

### Criteres d'acceptation
- [ ] Je saisis mon email
- [ ] Je saisis mon mot de passe
- [ ] Le systeme verifie les identifiants
- [ ] Si corrects, je suis redirige vers l'ecran principal
- [ ] Mes identifiants sont memorises pour les prochaines connexions
- [ ] Je peux me deconnecter manuellement
- [ ] La session reste active meme sans connexion internet

### Securite
- Token JWT stocke de maniere securisee
- Expiration du token: 30 jours
- Deconnexion automatique si desactive cote serveur

---

## MOB-002: Consulter la tournee du jour

**En tant que** Livreur
**Je veux** voir ma tournee du jour
**Afin de** connaitre les clients a visiter

### Criteres d'acceptation
- [ ] L'ecran principal affiche la tournee du jour
- [ ] Je vois la liste des clients dans l'ordre de passage
- [ ] Pour chaque client, je vois: nom, adresse, telephone
- [ ] Je vois le statut de chaque client (a visiter, visite, saute)
- [ ] Je vois le nombre de clients visites / total
- [ ] Je peux voir le solde actuel du client
- [ ] Je peux appeler le client (clic sur telephone)
- [ ] Je peux naviguer vers le client (clic sur adresse)

### Affichage
```
┌────────────────────────────────────┐
│ Ma tournee du [DATE]               │
│ 3/10 clients visites               │
├────────────────────────────────────┤
│ ✓ 1. Client A - 150,000 FCFA       │
│     Quartier X, Rue Y              │
├────────────────────────────────────┤
│ ✓ 2. Client B - 85,000 FCFA        │
│     Quartier Z                     │
├────────────────────────────────────┤
│ ✓ 3. Client C - 0 FCFA             │
│     Centre-ville                   │
├────────────────────────────────────┤
│ ▶ 4. Client D - 220,000 FCFA       │
│     Quartier W              [>>]   │
├────────────────────────────────────┤
│   5. Client E                      │
│   6. Client F                      │
│   ...                              │
└────────────────────────────────────┘
```

---

## MOB-003: Enregistrer livraison hors-ligne

**En tant que** Livreur
**Je veux** enregistrer une livraison meme sans connexion
**Afin de** ne pas perdre de donnees sur le terrain

### Criteres d'acceptation
- [ ] Je selectionne le client (de la tournee ou recherche)
- [ ] Je vois le solde actuel du client (cache)
- [ ] J'ajoute les produits et quantites
- [ ] Le montant se calcule automatiquement
- [ ] Je valide la livraison
- [ ] La livraison est stockee localement
- [ ] Un indicateur montre "En attente de synchronisation"
- [ ] Je peux voir la liste des livraisons en attente

### Donnees stockees localement
- ID temporaire (UUID)
- Client (ID et nom)
- Produits et quantites
- Montant total
- Date et heure
- Statut: PENDING

### Interface
```
┌────────────────────────────────────┐
│ Nouvelle livraison                 │
│ Client: [Client D]                 │
│ Solde: 220,000 FCFA ⚠️             │
├────────────────────────────────────┤
│ Produits:                          │
│ + Lait 1L      x5    5,000 FCFA   │
│ + Lait 500ml   x10   3,000 FCFA   │
│                                    │
│ [+ Ajouter produit]                │
├────────────────────────────────────┤
│ TOTAL: 8,000 FCFA                  │
├────────────────────────────────────┤
│ [        VALIDER        ]          │
└────────────────────────────────────┘
```

---

## MOB-004: Enregistrer retour hors-ligne

**En tant que** Livreur
**Je veux** enregistrer un retour meme sans connexion
**Afin de** documenter les produits non livres

### Criteres d'acceptation
- [ ] Je selectionne le produit retourne
- [ ] Je saisis la quantite
- [ ] Je selectionne le motif
- [ ] Je peux ajouter une description
- [ ] Je peux optionnellement associer a un client
- [ ] Le retour est stocke localement
- [ ] Un indicateur montre "En attente de synchronisation"

### Interface
```
┌────────────────────────────────────┐
│ Nouveau retour                     │
├────────────────────────────────────┤
│ Produit: [Lait 1L        ▼]        │
│ Quantite: [  5  ]                  │
│ Motif: [Invendu          ▼]        │
│ Client: [Aucun           ▼]        │
│ Notes: [________________]          │
├────────────────────────────────────┤
│ [        VALIDER        ]          │
└────────────────────────────────────┘
```

---

## MOB-005: Synchronisation automatique

**En tant que** Livreur
**Je veux** que mes donnees se synchronisent automatiquement
**Afin de** ne pas avoir a m'en soucier

### Criteres d'acceptation
- [ ] La synchronisation demarre quand une connexion est detectee
- [ ] Les livraisons en attente sont envoyees au serveur
- [ ] Les retours en attente sont envoyes au serveur
- [ ] Les nouvelles donnees sont telechargees (clients, produits, prix)
- [ ] Un indicateur montre l'etat de synchronisation
- [ ] En cas d'erreur, une notification s'affiche
- [ ] Je peux forcer une synchronisation manuelle
- [ ] Le nombre d'elements en attente est visible

### Etats de synchronisation
| Etat | Icone | Description |
|------|-------|-------------|
| Synchronise | ✓ vert | Tout est a jour |
| En cours | ↻ bleu | Synchronisation en cours |
| En attente | ⏳ orange | Elements en attente (X) |
| Erreur | ⚠️ rouge | Echec de synchronisation |
| Hors ligne | ✕ gris | Pas de connexion |

### Gestion des conflits
- Si un client a ete modifie sur le serveur, les nouvelles infos sont telechargees
- Les livraisons locales sont envoyees avec leur timestamp
- En cas de doublon detecte, le serveur rejette et notifie

---

## MOB-006: Navigation GPS

**En tant que** Livreur
**Je veux** naviguer vers un client
**Afin de** trouver facilement son adresse

### Criteres d'acceptation
- [ ] Je peux cliquer sur "Naviguer" pour un client
- [ ] L'application de navigation par defaut s'ouvre (Google Maps, Waze, etc.)
- [ ] Les coordonnees GPS du client sont utilisees
- [ ] Si pas de GPS, l'adresse textuelle est utilisee
- [ ] Je peux choisir l'application de navigation

### Integration
```
Client D - Quartier W
[📞 Appeler] [📍 Naviguer] [✓ Livrer]
```

---

## MOB-007: Consulter ses statistiques

**En tant que** Livreur
**Je veux** voir mes statistiques de performance
**Afin de** suivre mon activite et mes primes

### Criteres d'acceptation
- [ ] Je vois mes stats du jour
- [ ] Je vois mes stats de la semaine
- [ ] Je vois mes stats du mois
- [ ] Je vois le detail des primes estimees
- [ ] Les donnees sont mises a jour a chaque synchronisation

### Affichage
```
┌────────────────────────────────────┐
│ Mes statistiques                   │
├────────────────────────────────────┤
│ Aujourd'hui:                       │
│ - Livraisons: 8                    │
│ - CA: 320,000 FCFA                 │
│ - Retours: 1                       │
├────────────────────────────────────┤
│ Ce mois:                           │
│ - Livraisons: 85                   │
│ - CA: 3,200,000 FCFA               │
│ - Retours: 5 (5.9%)                │
├────────────────────────────────────┤
│ Primes estimees:                   │
│ - Commission (2%): 64,000 FCFA     │
│ - Bonus livr.: 4,250 FCFA          │
│ - TOTAL: 68,250 FCFA               │
└────────────────────────────────────┘
```

---

## MOB-008: Notifications

**En tant que** Livreur
**Je veux** recevoir des notifications
**Afin d'** etre informe des evenements importants

### Criteres d'acceptation
- [ ] Je recois une notification quand une tournee m'est affectee
- [ ] Je recois une notification de rappel le matin
- [ ] Je recois une notification si synchronisation echoue
- [ ] Je peux activer/desactiver les notifications
- [ ] Les notifications s'affichent meme app fermee

### Types de notifications
| Type | Message | Action |
|------|---------|--------|
| Tournee | "Nouvelle tournee pour demain: 12 clients" | Ouvrir tournee |
| Rappel | "Bonjour! Votre tournee du jour: 10 clients" | Ouvrir app |
| Sync | "5 livraisons en attente de synchronisation" | Forcer sync |
| Erreur | "Echec de synchronisation. Verifiez votre connexion" | Ouvrir parametres |

---

*Module Application Mobile - 8 stories*
