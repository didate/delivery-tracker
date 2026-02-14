# Module Production - User Stories

## PRO-001: Enregistrer la production journaliere

**En tant que** Administrateur ou Gestionnaire
**Je veux** enregistrer la production du jour
**Afin de** suivre les quantites fabriquees

### Criteres d'acceptation
- [ ] Je selectionne le point de production
- [ ] Je selectionne la date (defaut: aujourd'hui)
- [ ] Je vois la liste des produits actifs
- [ ] Pour chaque produit, je saisis la quantite produite
- [ ] Je peux laisser 0 pour les produits non fabriques
- [ ] Je peux ajouter des notes
- [ ] Un message de confirmation s'affiche
- [ ] Si une production existe deja pour ce jour/site, je peux la modifier

### Regles metier
- Une seule entree de production par jour et par site
- Les quantites doivent etre >= 0
- La modification est possible tant que le jour n'est pas cloture

### Donnees
- Point de production: Reference (obligatoire)
- Date: Date (obligatoire)
- Lignes: Liste de (Produit, Quantite)
- Notes: Text (optionnel)
- Enregistre par: Reference utilisateur (automatique)

---

## PRO-002: Consulter l'historique de production

**En tant que** Utilisateur
**Je veux** consulter l'historique de production
**Afin de** voir les quantites fabriquees sur une periode

### Criteres d'acceptation
- [ ] Je peux filtrer par point de production
- [ ] Je peux filtrer par periode
- [ ] Je peux filtrer par produit
- [ ] La liste affiche: date, site, produit, quantite
- [ ] Je vois le total par produit sur la periode
- [ ] Je peux voir le detail d'une journee

### Donnees affichees
| Colonne | Description |
|---------|-------------|
| Date | Date de production |
| Site | Point de production |
| Produit | Nom du produit |
| Quantite | Quantite produite |
| Enregistre par | Utilisateur |

### Totaux
- Total par produit
- Total general
- Moyenne journaliere par produit

---

## PRO-003: Comparer production vs livraisons

**En tant que** Administrateur ou Gestionnaire
**Je veux** comparer la production aux livraisons et retours
**Afin de** calculer le stock theorique

### Criteres d'acceptation
- [ ] Je selectionne une periode
- [ ] Je selectionne un point de production (ou tous)
- [ ] Pour chaque produit, je vois:
  - Quantite produite
  - Quantite livree
  - Quantite retournee
  - Stock theorique (Produit - Livre + Retours)
- [ ] Les ecarts sont mis en evidence
- [ ] Je peux exporter le tableau

### Calcul stock theorique
```
Stock = Production - Livraisons + Retours
```

### Affichage
| Produit | Produit | Livre | Retours | Stock |
|---------|---------|-------|---------|-------|
| Lait 1L | 100 | 85 | 5 | 20 |
| Lait 500ml | 150 | 140 | 10 | 20 |

---

## PRO-004: Alerter sur ecarts de stock

**En tant que** Administrateur ou Gestionnaire
**Je veux** etre alerte en cas d'ecart de stock anormal
**Afin de** detecter les problemes rapidement

### Criteres d'acceptation
- [ ] Le systeme detecte les stocks negatifs theoriques
- [ ] Le systeme detecte les stocks anormalement eleves
- [ ] Une alerte est affichee sur le tableau de bord
- [ ] Je peux configurer le seuil d'alerte
- [ ] Je peux voir le detail de l'ecart

### Regles d'alerte
| Condition | Alerte |
|-----------|--------|
| Stock < 0 | Stock negatif (erreur probable) |
| Stock > 2 x production moyenne | Stock anormalement eleve |

---

*Module Production - 4 stories*
