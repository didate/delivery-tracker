# Module Points de Production - User Stories

## PPR-001: Creer un point de production

**En tant que** Administrateur
**Je veux** creer un nouveau point de production
**Afin de** gerer plusieurs sites de fabrication

### Criteres d'acceptation
- [ ] Je peux saisir le nom du site
- [ ] Je peux saisir l'adresse
- [ ] Je peux saisir les coordonnees GPS (optionnel)
- [ ] Le site est cree avec le statut "actif"
- [ ] Un message de confirmation s'affiche

### Regles metier
- Le nom du site doit etre unique
- Au moins un point de production doit exister dans le systeme

### Donnees
- Nom: String (max 100 caracteres, obligatoire)
- Adresse: Text (optionnel)
- Latitude: Decimal (optionnel)
- Longitude: Decimal (optionnel)
- Actif: Boolean (defaut: true)

---

## PPR-002: Modifier un point de production

**En tant que** Administrateur
**Je veux** modifier les informations d'un point de production
**Afin de** mettre a jour ses coordonnees

### Criteres d'acceptation
- [ ] Je peux modifier le nom
- [ ] Je peux modifier l'adresse
- [ ] Je peux modifier les coordonnees GPS
- [ ] Je peux activer/desactiver le site
- [ ] Un message de confirmation s'affiche

### Regles metier
- Le dernier site actif ne peut pas etre desactive

---

## PPR-003: Associer des livreurs a un point de production

**En tant que** Administrateur ou Gestionnaire
**Je veux** voir et gerer les livreurs rattaches a un point de production
**Afin de** organiser les equipes

### Criteres d'acceptation
- [ ] Je vois la liste des livreurs du site
- [ ] Je peux ajouter un livreur au site
- [ ] Je peux retirer un livreur du site (l'affecter ailleurs)
- [ ] Je vois le nombre de livreurs par site
- [ ] Un livreur sans affectation peut etre affecte

### Regles metier
- Un livreur appartient a un seul site a la fois
- Retirer un livreur d'un site l'affecte a "Non affecte"

---

## PPR-004: Lister les points de production

**En tant que** Utilisateur
**Je veux** voir la liste des points de production
**Afin de** connaitre les sites disponibles

### Criteres d'acceptation
- [ ] La liste affiche: nom, adresse, nombre de livreurs, statut
- [ ] Je peux filtrer par statut (actif/inactif/tous)
- [ ] Je peux voir les statistiques rapides (production du jour)
- [ ] Je peux acceder au detail d'un site

### Donnees affichees
| Colonne | Description |
|---------|-------------|
| Nom | Nom du site |
| Adresse | Adresse |
| Livreurs | Nombre de livreurs rattaches |
| Statut | Actif / Inactif |
| Production (jour) | Total du jour |
| Actions | Voir, Modifier |

---

*Module Points de Production - 4 stories*
