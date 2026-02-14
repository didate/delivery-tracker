# Module Utilisateurs - User Stories

## USR-001: Creer un utilisateur

**En tant que** Administrateur
**Je veux** creer un nouveau compte utilisateur
**Afin de** donner acces au systeme

### Criteres d'acceptation
- [ ] Je saisis le nom complet
- [ ] Je saisis l'adresse email (unique)
- [ ] Je selectionne le role
- [ ] Je genere ou saisis un mot de passe temporaire
- [ ] Pour le role LIVREUR, je peux associer un profil livreur
- [ ] L'utilisateur est cree avec le statut "actif"
- [ ] Un email de bienvenue est envoye (optionnel)
- [ ] L'utilisateur doit changer son mot de passe a la premiere connexion

### Roles disponibles
| Role | Description | Acces |
|------|-------------|-------|
| ADMIN | Administrateur | Acces complet |
| GESTIONNAIRE | Gestionnaire/Superviseur | Gestion operationnelle |
| COMPTABLE | Comptable | Donnees financieres |
| LIVREUR | Livreur | Application mobile uniquement |

### Donnees
- Nom: String (obligatoire)
- Email: String (obligatoire, unique)
- Mot de passe: String (hash)
- Role: Enum (obligatoire)
- Livreur associe: Reference (si role = LIVREUR)
- Actif: Boolean (defaut: true)

---

## USR-002: Modifier un utilisateur

**En tant que** Administrateur
**Je veux** modifier les informations d'un utilisateur
**Afin de** mettre a jour son profil

### Criteres d'acceptation
- [ ] Je peux modifier le nom
- [ ] Je peux modifier l'email (verification unicite)
- [ ] Je peux changer le role
- [ ] Si role change vers LIVREUR, je dois associer un livreur
- [ ] Si role change depuis LIVREUR, l'association est supprimee
- [ ] Je ne peux pas modifier mon propre role (securite)

---

## USR-003: Attribuer un role

**En tant que** Administrateur
**Je veux** attribuer ou changer le role d'un utilisateur
**Afin de** gerer ses permissions

### Criteres d'acceptation
- [ ] Je vois le role actuel
- [ ] Je peux selectionner un nouveau role
- [ ] Les permissions sont mises a jour immediatement
- [ ] L'utilisateur doit se reconnecter pour appliquer
- [ ] Un log d'audit est cree

### Matrice des permissions
| Permission | ADMIN | GESTIONNAIRE | COMPTABLE | LIVREUR |
|------------|-------|--------------|-----------|---------|
| Gestion utilisateurs | X | - | - | - |
| Gestion produits | X | X | - | - |
| Gestion clients | X | X | - | - |
| Gestion livreurs | X | X | - | - |
| Livraisons (lecture) | X | X | X | Propres |
| Livraisons (ecriture) | X | X | - | X |
| Paiements | X | X | X | - |
| Depenses | X | X | X | - |
| Salaires | X | - | X | - |
| Rapports | X | X | X | - |
| Tournees | X | X | - | Propres |
| Dashboard | X | X | X | - |

---

## USR-004: Authentification

**En tant que** Utilisateur
**Je veux** me connecter au systeme
**Afin d'** acceder a mes fonctionnalites

### Criteres d'acceptation
- [ ] Je saisis mon email
- [ ] Je saisis mon mot de passe
- [ ] Le systeme verifie les identifiants
- [ ] Si corrects, je suis redirige vers le dashboard
- [ ] Si incorrects, un message d'erreur s'affiche
- [ ] Apres 5 echecs, le compte est bloque temporairement (15 min)
- [ ] La session expire apres 8 heures d'inactivite
- [ ] Je peux cocher "Se souvenir de moi" (30 jours)

### Securite
- Mots de passe hashes (bcrypt)
- Sessions JWT
- HTTPS obligatoire
- Protection CSRF

---

## USR-005: Reinitialiser mot de passe

**En tant que** Utilisateur
**Je veux** reinitialiser mon mot de passe
**Afin de** recuperer l'acces a mon compte

### Criteres d'acceptation
- [ ] Je clique sur "Mot de passe oublie"
- [ ] Je saisis mon email
- [ ] Un email avec un lien de reinitialisation est envoye
- [ ] Le lien est valide 1 heure
- [ ] Je saisis un nouveau mot de passe
- [ ] Le mot de passe doit respecter les regles de complexite
- [ ] Je suis redirige vers la page de connexion

### Regles mot de passe
- Minimum 8 caracteres
- Au moins 1 majuscule
- Au moins 1 chiffre
- Pas identique aux 3 derniers mots de passe

---

## USR-006: Desactiver un utilisateur

**En tant que** Administrateur
**Je veux** desactiver un compte utilisateur
**Afin de** revoquer son acces

### Criteres d'acceptation
- [ ] Je peux desactiver un utilisateur actif
- [ ] Je peux reactiver un utilisateur desactive
- [ ] Un utilisateur desactive ne peut plus se connecter
- [ ] Les sessions actives sont invalidees
- [ ] L'historique des actions est conserve
- [ ] Je ne peux pas me desactiver moi-meme

### Regles metier
- La desactivation est immediate
- L'utilisateur reçoit un message "Compte desactive" a la connexion

---

## USR-007: Journal d'audit

**En tant que** Administrateur
**Je veux** consulter le journal d'audit
**Afin de** tracer les actions des utilisateurs

### Criteres d'acceptation
- [ ] Je vois la liste des actions tracees
- [ ] Chaque entree inclut: date, utilisateur, action, details
- [ ] Je peux filtrer par utilisateur
- [ ] Je peux filtrer par type d'action
- [ ] Je peux filtrer par periode
- [ ] Je peux exporter le journal

### Actions tracees
| Action | Description |
|--------|-------------|
| LOGIN | Connexion reussie |
| LOGOUT | Deconnexion |
| LOGIN_FAILED | Echec de connexion |
| CREATE | Creation d'entite |
| UPDATE | Modification d'entite |
| DELETE | Suppression/Desactivation |
| EXPORT | Export de donnees |

### Donnees affichees
| Colonne | Description |
|---------|-------------|
| Date/Heure | Timestamp |
| Utilisateur | Nom et email |
| Action | Type d'action |
| Entite | Type et ID concerne |
| Details | Description |
| IP | Adresse IP |

---

*Module Utilisateurs - 7 stories*
