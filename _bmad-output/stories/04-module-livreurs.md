# Module Livreurs - User Stories

## LIV-001: Creer un livreur

**En tant que** Administrateur
**Je veux** creer un nouveau livreur dans le systeme
**Afin qu'** il puisse effectuer des livraisons

### Criteres d'acceptation
- [ ] Je peux saisir le nom complet du livreur
- [ ] Je peux saisir le numero de telephone
- [ ] Je peux selectionner le point de production de rattachement
- [ ] Je peux definir le salaire de base
- [ ] Je peux definir la date d'embauche
- [ ] Le livreur est cree avec le statut "actif"
- [ ] Un compte utilisateur peut etre cree simultanement (optionnel)

### Regles metier
- Le numero de telephone doit etre unique
- Le salaire de base doit etre >= 0
- Le rattachement a un point de production est obligatoire

### Donnees
- Nom: String (max 100 caracteres)
- Telephone: String (max 20 caracteres)
- Point de production: Reference
- Salaire de base: Decimal
- Date d'embauche: Date

---

## LIV-002: Modifier un livreur

**En tant que** Administrateur
**Je veux** modifier les informations d'un livreur
**Afin de** mettre a jour ses donnees ou son salaire

### Criteres d'acceptation
- [ ] Je peux modifier le nom
- [ ] Je peux modifier le telephone
- [ ] Je peux changer le point de production
- [ ] Je peux modifier le salaire de base
- [ ] Le changement de salaire prend effet immediatement
- [ ] Un historique des changements de salaire est conserve

---

## LIV-003: Affecter un livreur a un point de production

**En tant que** Administrateur ou Gestionnaire
**Je veux** affecter ou changer le point de production d'un livreur
**Afin de** reorganiser les equipes

### Criteres d'acceptation
- [ ] Je peux voir le point de production actuel
- [ ] Je peux selectionner un nouveau point de production
- [ ] La date de changement est enregistree
- [ ] L'historique des affectations est conserve

### Regles metier
- Un livreur appartient a un seul point de production a la fois
- Le changement est effectif immediatement

---

## LIV-004: Definir le salaire de base

**En tant que** Administrateur
**Je veux** definir ou modifier le salaire de base d'un livreur
**Afin de** calculer correctement sa remuneration

### Criteres d'acceptation
- [ ] Je peux voir le salaire actuel
- [ ] Je peux saisir le nouveau salaire
- [ ] Je dois saisir la date d'effet
- [ ] L'ancien salaire est historise
- [ ] Un message de confirmation s'affiche

### Regles metier
- Le salaire doit etre >= 0
- Le changement peut etre retroactif ou futur

---

## LIV-005: Consulter les statistiques d'un livreur

**En tant que** Administrateur, Gestionnaire ou Livreur (ses propres stats)
**Je veux** consulter les statistiques de performance d'un livreur
**Afin de** evaluer son travail

### Criteres d'acceptation
- [ ] Je peux selectionner une periode (jour, semaine, mois, annee, personnalise)
- [ ] Je vois le nombre total de livraisons
- [ ] Je vois le chiffre d'affaires total livre
- [ ] Je vois le nombre de retours
- [ ] Je vois le taux de retour
- [ ] Je vois le montant moyen par livraison
- [ ] Je vois le nombre de clients uniques visites
- [ ] Je vois le nombre de jours travailles

### Donnees affichees
| Indicateur | Description |
|------------|-------------|
| Livraisons | Nombre total |
| CA livre | Somme des montants |
| Retours | Nombre et montant |
| Taux retour | % retours / livraisons |
| Moyenne/livraison | CA / nombre livraisons |
| Clients visites | Nombre unique |
| Jours travailles | Jours avec au moins 1 livraison |

---

## LIV-006: Lister les livreurs

**En tant que** Administrateur ou Gestionnaire
**Je veux** voir la liste de tous les livreurs
**Afin de** gerer l'equipe de livraison

### Criteres d'acceptation
- [ ] La liste affiche: nom, telephone, point de production, statut
- [ ] Je peux filtrer par point de production
- [ ] Je peux filtrer par statut (actif/inactif)
- [ ] Je peux rechercher par nom ou telephone
- [ ] La liste est triee par nom par defaut
- [ ] Je peux voir les statistiques rapides (livraisons du jour)

### Donnees affichees
| Colonne | Description |
|---------|-------------|
| Nom | Nom complet |
| Telephone | Numero |
| Point production | Site de rattachement |
| Statut | Actif / Inactif |
| Livraisons (jour) | Nombre du jour |
| Actions | Voir, Modifier, Stats |

---

## LIV-007: Desactiver un livreur

**En tant que** Administrateur
**Je veux** desactiver un livreur
**Afin qu'** il ne puisse plus effectuer de livraisons

### Criteres d'acceptation
- [ ] Je peux desactiver un livreur actif
- [ ] Je peux reactiver un livreur desactive
- [ ] Un livreur desactive ne peut plus se connecter a l'app mobile
- [ ] Un livreur desactive ne peut plus etre affecte a une tournee
- [ ] L'historique des livraisons est conserve
- [ ] Si le livreur a des tournees planifiees, un avertissement s'affiche

### Regles metier
- La desactivation ne supprime pas les donnees historiques
- Les tournees futures doivent etre reassignees

---

*Module Livreurs - 7 stories*
