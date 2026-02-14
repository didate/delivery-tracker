# Module Systeme - User Stories

## SYS-001: Parametres systeme

**En tant que** Administrateur
**Je veux** configurer les parametres du systeme
**Afin de** personnaliser l'application

### Criteres d'acceptation
- [ ] Je peux definir le nom de l'entreprise
- [ ] Je peux uploader le logo de l'entreprise
- [ ] Je peux definir la devise (FCFA par defaut)
- [ ] Je peux definir le format de date
- [ ] Je peux definir les seuils d'alerte
- [ ] Les modifications sont appliquees immediatement

### Parametres disponibles
| Parametre | Type | Defaut | Description |
|-----------|------|--------|-------------|
| nom_entreprise | String | - | Nom affiche sur les rapports |
| logo | Image | - | Logo pour rapports et app |
| devise | String | FCFA | Symbole monetaire |
| format_date | String | JJ/MM/AAAA | Format d'affichage |
| seuil_plafond_alerte | Number | 80 | % du plafond pour alerte |
| delai_sync_max | Number | 24 | Heures avant alerte sync |
| periode_prime | Enum | MENSUEL | Periode de calcul des primes |

---

## SYS-002: Sauvegarde des donnees

**En tant que** Administrateur
**Je veux** sauvegarder les donnees du systeme
**Afin de** prevenir les pertes de donnees

### Criteres d'acceptation
- [ ] Je peux lancer une sauvegarde manuelle
- [ ] La sauvegarde inclut toutes les donnees
- [ ] La sauvegarde est compressée
- [ ] Je peux telecharger le fichier de sauvegarde
- [ ] Un historique des sauvegardes est conserve
- [ ] Les sauvegardes automatiques sont configurables

### Options de sauvegarde
| Option | Description |
|--------|-------------|
| Sauvegarde complete | Toutes les donnees |
| Sauvegarde incrementale | Uniquement les modifications |
| Frequence auto | Quotidienne / Hebdomadaire |
| Retention | Nombre de sauvegardes conservees |

### Donnees incluses
- Utilisateurs
- Produits et historique prix
- Clients
- Livreurs
- Points de production
- Livraisons et lignes
- Retours
- Paiements
- Production
- Depenses
- Tournees
- Salaires et primes
- Configuration

---

## SYS-003: Restauration des donnees

**En tant que** Administrateur
**Je veux** restaurer les donnees depuis une sauvegarde
**Afin de** recuperer en cas de probleme

### Criteres d'acceptation
- [ ] Je peux selectionner une sauvegarde existante
- [ ] Je peux uploader un fichier de sauvegarde
- [ ] Un avertissement s'affiche avant restauration
- [ ] La restauration remplace toutes les donnees
- [ ] Un log de restauration est genere
- [ ] Les utilisateurs sont deconnectes pendant la restauration

### Processus
1. Selection du fichier de sauvegarde
2. Verification de l'integrite
3. Avertissement et confirmation
4. Deconnexion des utilisateurs
5. Restauration des donnees
6. Verification post-restauration
7. Notification de fin

### Avertissement
```
⚠️ ATTENTION

La restauration va:
- Supprimer toutes les donnees actuelles
- Remplacer par les donnees de la sauvegarde du [DATE]
- Deconnecter tous les utilisateurs

Cette action est IRREVERSIBLE.

[ Annuler ] [ Confirmer la restauration ]
```

---

## SYS-004: Gestion des conflits de synchronisation

**En tant que** Systeme
**Je veux** gerer les conflits de synchronisation mobile
**Afin de** garantir l'integrite des donnees

### Criteres d'acceptation
- [ ] Le systeme detecte les conflits potentiels
- [ ] Les livraisons avec timestamps sont validees
- [ ] Les doublons sont detectes et rejetes
- [ ] Un rapport de conflits est genere
- [ ] L'administrateur peut resoudre manuellement les conflits
- [ ] Les conflits resolus sont traces

### Types de conflits
| Type | Description | Resolution |
|------|-------------|------------|
| Doublon | Meme livraison envoyee 2 fois | Rejet automatique |
| Client modifie | Client modifie pendant offline | Fusion des donnees |
| Produit supprime | Livraison avec produit inactif | Alerte admin |
| Timestamp invalide | Date future ou trop ancienne | Rejet avec notification |

### Resolution automatique
```
1. Verifier le sync_id (UUID unique)
2. Si deja existe -> Rejeter comme doublon
3. Verifier le timestamp
4. Si > 24h ancien -> Accepter avec flag
5. Si futur -> Rejeter avec erreur
6. Valider les references (client, produits)
7. Enregistrer la livraison
8. Mettre a jour le solde client
```

---

## SYS-005: Notifications systeme

**En tant que** Administrateur
**Je veux** recevoir des notifications systeme
**Afin d'** etre alerte des problemes

### Criteres d'acceptation
- [ ] Notification si livreur non synchronise depuis 24h
- [ ] Notification si sauvegarde automatique echoue
- [ ] Notification si espace disque insuffisant
- [ ] Notification si erreurs systeme detectees
- [ ] Les notifications sont affichees dans le dashboard
- [ ] Je peux configurer les notifications par email

### Types de notifications
| Type | Severite | Description |
|------|----------|-------------|
| sync_retard | Warning | Livreur non sync depuis 24h |
| backup_echec | Erreur | Echec sauvegarde auto |
| espace_disque | Warning | Disque < 10% libre |
| erreur_systeme | Erreur | Exception non geree |
| securite | Critique | Tentatives connexion suspectes |

### Affichage dashboard
```
┌────────────────────────────────────┐
│ 🔔 Notifications systeme (3)       │
├────────────────────────────────────┤
│ ⚠️ Jean DUPONT non synchronise     │
│    depuis 26 heures                │
│    [Voir] [Ignorer]                │
├────────────────────────────────────┤
│ ⚠️ Marie KONAN non synchronisee    │
│    depuis 48 heures                │
│    [Voir] [Ignorer]                │
├────────────────────────────────────┤
│ ✓ Sauvegarde auto reussie          │
│    05/02/2024 03:00                │
└────────────────────────────────────┘
```

---

*Module Systeme - 5 stories*
