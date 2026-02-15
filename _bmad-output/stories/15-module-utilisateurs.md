# Module Utilisateurs - User Stories

## Vue d'ensemble

Le systeme n'autorise PAS l'auto-inscription des utilisateurs.
Tous les utilisateurs sont crees par un administrateur:
- L'ADMIN systeme (ROLE_ADMIN) peut creer tous types d'utilisateurs
- Le TENANT_ADMIN peut creer des utilisateurs pour son tenant uniquement
- Tous les utilisateurs sont lies a un tenant

### Roles disponibles
| Role | Cree par | Scope |
|------|----------|-------|
| ROLE_ADMIN | Initial (systeme) | Global - peut gerer tous les tenants |
| ROLE_TENANT_ADMIN | ADMIN | Tenant - gere son entreprise |
| ROLE_MANAGER | ADMIN ou TENANT_ADMIN | Tenant - gestion operationnelle |
| ROLE_ACCOUNTANT | ADMIN ou TENANT_ADMIN | Tenant - donnees financieres |
| ROLE_DRIVER | ADMIN ou TENANT_ADMIN | Tenant - application mobile |

---

## USR-001: Creer un utilisateur

**En tant que** ADMIN ou TENANT_ADMIN
**Je veux** creer un nouveau compte utilisateur
**Afin de** donner acces au systeme

### Criteres d'acceptation
- [ ] Seuls ADMIN et TENANT_ADMIN peuvent creer des utilisateurs
- [ ] Je saisis le nom complet (obligatoire)
- [ ] Je saisis l'adresse email (unique, obligatoire)
- [ ] Je selectionne le role parmi les roles autorises
- [ ] Je genere ou saisis un mot de passe temporaire
- [ ] L'utilisateur est automatiquement lie au tenant actuel
- [ ] Pour le role DRIVER, je peux associer un profil livreur
- [ ] L'utilisateur est cree avec le statut "actif"
- [ ] L'utilisateur doit changer son mot de passe a la premiere connexion

### Roles creables par role
| Createur | Peut creer |
|----------|------------|
| ADMIN | TENANT_ADMIN, MANAGER, ACCOUNTANT, DRIVER |
| TENANT_ADMIN | MANAGER, ACCOUNTANT, DRIVER |

### Donnees
- Nom: String (obligatoire)
- Email: String (obligatoire, unique dans le tenant)
- Mot de passe: String (temporaire, hash)
- Role: Enum (obligatoire)
- Tenant: Reference (automatique = tenant actuel)
- Livreur associe: Reference (si role = DRIVER)
- Actif: Boolean (defaut: true)
- Doit changer mot de passe: Boolean (defaut: true)

---

## USR-002: Modifier un utilisateur

**En tant que** ADMIN ou TENANT_ADMIN
**Je veux** modifier les informations d'un utilisateur
**Afin de** mettre a jour son profil

### Criteres d'acceptation
- [ ] Je peux modifier le nom
- [ ] Je peux modifier l'email (verification unicite)
- [ ] Je peux changer le role (selon mes droits)
- [ ] Si role change vers DRIVER, je dois associer un livreur
- [ ] Si role change depuis DRIVER, l'association est supprimee
- [ ] Je ne peux pas modifier mon propre role
- [ ] TENANT_ADMIN ne peut modifier que les utilisateurs de son tenant

### Regles metier
- L'ADMIN peut modifier tous les utilisateurs
- Le TENANT_ADMIN ne peut pas promouvoir en ADMIN
- Le TENANT_ADMIN ne peut pas modifier d'autres TENANT_ADMIN

---

## USR-003: Matrice des permissions

**En tant que** Systeme
**Je veux** appliquer les permissions selon les roles
**Afin de** controler les acces

### Matrice des permissions
| Permission | ADMIN | TENANT_ADMIN | MANAGER | ACCOUNTANT | DRIVER |
|------------|-------|--------------|---------|------------|--------|
| Gestion tenants | X | - | - | - | - |
| Gestion utilisateurs (tous) | X | - | - | - | - |
| Gestion utilisateurs (tenant) | X | X | - | - | - |
| Gestion produits | X | X | X | - | - |
| Gestion clients | X | X | X | - | - |
| Gestion livreurs | X | X | X | - | - |
| Livraisons (lecture) | X | X | X | X | Propres |
| Livraisons (ecriture) | X | X | X | - | X |
| Paiements | X | X | X | X | - |
| Depenses | X | X | X | X | - |
| Salaires | X | X | - | X | - |
| Rapports | X | X | X | X | - |
| Tournees | X | X | X | - | Propres |
| Dashboard | X | X | X | X | - |
| Configuration tenant | X | X | - | - | - |

---

## USR-004: Authentification

**En tant que** Utilisateur
**Je veux** me connecter au systeme
**Afin d'** acceder a mes fonctionnalites

### Criteres d'acceptation
- [ ] Je saisis mon email
- [ ] Je saisis mon mot de passe
- [ ] Le systeme verifie les identifiants
- [ ] Le systeme verifie que mon tenant est actif
- [ ] Si premiere connexion, je dois changer mon mot de passe
- [ ] Si corrects, je suis redirige vers le dashboard
- [ ] Si incorrects, un message d'erreur s'affiche
- [ ] Apres 5 echecs, le compte est bloque temporairement (15 min)
- [ ] La session expire apres 8 heures d'inactivite

### Messages d'erreur
- "Identifiants incorrects" (email ou mot de passe invalide)
- "Compte desactive. Contactez votre administrateur."
- "Votre entreprise a ete desactivee. Contactez l'administrateur."
- "Compte temporairement bloque. Reessayez dans X minutes."

### Securite
- Mots de passe hashes (bcrypt)
- Sessions JWT avec tenant_id
- HTTPS obligatoire
- Protection CSRF

### Note importante
- **PAS de lien "Creer un compte"** sur la page de connexion
- **PAS de page d'inscription publique**
- Seule l'option "Mot de passe oublie" est disponible

---

## USR-005: Reinitialiser mot de passe

**En tant que** Utilisateur
**Je veux** reinitialiser mon mot de passe
**Afin de** recuperer l'acces a mon compte

### Criteres d'acceptation
- [ ] Je clique sur "Mot de passe oublie"
- [ ] Je saisis mon email
- [ ] Si l'email existe, un lien de reinitialisation est envoye
- [ ] Le message ne revele pas si l'email existe ou non (securite)
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

## USR-006: Changer mot de passe (premiere connexion)

**En tant que** Utilisateur nouvellement cree
**Je veux** changer mon mot de passe temporaire
**Afin de** securiser mon compte

### Criteres d'acceptation
- [ ] A ma premiere connexion, je suis redirige vers le changement de mot de passe
- [ ] Je ne peux pas acceder aux autres pages avant le changement
- [ ] Je saisis mon mot de passe actuel (temporaire)
- [ ] Je saisis un nouveau mot de passe
- [ ] Je confirme le nouveau mot de passe
- [ ] Le mot de passe doit respecter les regles de complexite
- [ ] Apres changement, je suis redirige vers le dashboard

---

## USR-007: Desactiver un utilisateur

**En tant que** ADMIN ou TENANT_ADMIN
**Je veux** desactiver un compte utilisateur
**Afin de** revoquer son acces

### Criteres d'acceptation
- [ ] Je peux desactiver un utilisateur actif
- [ ] Je peux reactiver un utilisateur desactive
- [ ] Un utilisateur desactive ne peut plus se connecter
- [ ] Les sessions actives sont invalidees
- [ ] L'historique des actions est conserve
- [ ] Je ne peux pas me desactiver moi-meme
- [ ] TENANT_ADMIN ne peut desactiver que les utilisateurs de son tenant
- [ ] On ne peut pas desactiver un ADMIN

### Regles metier
- La desactivation est immediate
- L'utilisateur recoit un message "Compte desactive" a la connexion

---

## USR-008: Lister les utilisateurs

**En tant que** ADMIN ou TENANT_ADMIN
**Je veux** voir la liste des utilisateurs
**Afin de** les gerer

### Criteres d'acceptation
- [ ] ADMIN voit tous les utilisateurs de tous les tenants
- [ ] TENANT_ADMIN voit uniquement les utilisateurs de son tenant
- [ ] Pour chaque utilisateur: nom, email, role, tenant, statut, derniere connexion
- [ ] Je peux filtrer par role
- [ ] Je peux filtrer par statut (actif/inactif)
- [ ] Je peux rechercher par nom ou email
- [ ] Pagination si plus de 20 utilisateurs

### Donnees affichees
| Colonne | Description |
|---------|-------------|
| Nom | Nom complet |
| Email | Email de connexion |
| Role | ADMIN, TENANT_ADMIN, etc. |
| Tenant | Nom du tenant (ADMIN uniquement) |
| Statut | Actif / Inactif |
| Derniere connexion | Date et heure |
| Actions | Edit, Desactiver, Reset password |

---

## USR-009: Reinitialiser le mot de passe d'un utilisateur

**En tant que** ADMIN ou TENANT_ADMIN
**Je veux** reinitialiser le mot de passe d'un utilisateur
**Afin de** l'aider a recuperer son acces

### Criteres d'acceptation
- [ ] Je selectionne un utilisateur
- [ ] Je clique sur "Reinitialiser mot de passe"
- [ ] Un nouveau mot de passe temporaire est genere
- [ ] L'utilisateur devra changer son mot de passe a la prochaine connexion
- [ ] Un email avec le nouveau mot de passe est envoye (optionnel)
- [ ] Une confirmation s'affiche avec le mot de passe temporaire

---

## USR-010: Journal d'audit

**En tant que** ADMIN ou TENANT_ADMIN
**Je veux** consulter le journal d'audit
**Afin de** tracer les actions des utilisateurs

### Criteres d'acceptation
- [ ] Je vois la liste des actions tracees
- [ ] ADMIN voit les actions de tous les tenants
- [ ] TENANT_ADMIN voit uniquement les actions de son tenant
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
| PASSWORD_CHANGE | Changement de mot de passe |
| PASSWORD_RESET | Reinitialisation de mot de passe |

---

*Module Utilisateurs - 10 stories*
*Gestion centralisee des utilisateurs - Pas d'auto-inscription*
