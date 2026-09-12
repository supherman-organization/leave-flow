# Documentation technique — Leave Flow

Architecture, modèle de données et choix de conception du projet.

---

## Vue d'ensemble

Architecture **client-serveur découplée**. Le frontend React ne détient aucune
logique métier faisant autorité : toutes les règles et tous les contrôles
d'accès sont portés par le backend.

```
                    Navigateur
                        │
                        ▼
┌───────────────────────────────────────────────────┐
│              Réseau Docker interne                │
│                                                   │
│  ┌─────────────┐   ┌─────────────┐  ┌──────────┐  │
│  │  frontend   │   │   backend   │  │  mongo   │  │
│  │ React + TS  │──▶│Express + TS │─▶│ MongoDB 7│  │
│  │   :5174     │   │    :3000    │  │  :27017  │  │
│  └─────────────┘   └─────────────┘  └──────────┘  │
│                          │                │       │
│                    volume uploads/   volume       │
│                                     mongo-data    │
└───────────────────────────────────────────────────┘
```

Les services se joignent par leur nom sur le réseau Docker : le backend atteint
la base via l'hôte `mongo`, sans adresse IP codée en dur.

---

## Architecture backend

Organisation en **couches à responsabilité unique**, chaque couche ne connaissant
que la suivante.

```
Requête HTTP → routes → middlewares → controllers → services → models → MongoDB
```

| Couche | Responsabilité | Ce qu'elle ne fait pas |
| --- | --- | --- |
| `routes` | Associer chemin, méthode et middlewares | Aucune logique |
| `middlewares` | Authentification, rôle, validation, upload, erreurs | Accéder aux données métier |
| `controllers` | Traduire HTTP en appel métier, choisir le code de retour | Contenir des règles de gestion |
| `services` | Calcul des jours, chevauchement, soldes, transitions | Manipuler `req` ou `res` |
| `models` | Schémas Mongoose et accès aux données | Décider |

Les contrôleurs ne construisent jamais d'erreur HTTP : ils lèvent une `ApiError`
portant un code et un message, interceptée par le middleware d'erreur terminal.

| Dossier | Contenu |
| --- | --- |
| `config/` | Connexion Mongoose, variables d'environnement |
| `models/` | Schémas et interfaces TypeScript |
| `controllers/` | Un fichier par ressource |
| `services/` | Logique métier |
| `routes/` | Un routeur par ressource, montés sur `/api` |
| `middlewares/` | `auth`, `role`, `validate`, `upload`, `error` |
| `validators/` | Schémas Zod |
| `utils/` | JWT, bcrypt, dates, `ApiError` |
| `seed/` | Compte RH, jours fériés |

---

## Modèle de données

Quatre collections MongoDB.

### `users`

| Champ | Type | Contraintes |
| --- | --- | --- |
| `firstName`, `lastName` | String | requis |
| `email` | String | requis, **unique**, minuscules |
| `password` | String | requis, haché bcrypt, jamais exposé |
| `role` | String | `employee` \| `manager` \| `hr` — défaut `employee` |
| `isActive` | Boolean | défaut `true` |
| `mustSetPassword` | Boolean | défaut `true` |
| `manager` | ObjectId → `User` | facultatif, **auto-référence** |
| `team` | String | facultatif |
| `loginHistory` | Tableau | `{ date, ip, userAgent }` |

Le champ `manager` pointe vers un autre document de la même collection : c'est ce
lien qui définit le périmètre d'un manager, sans collection d'équipes dédiée —
un choix adapté à une structure de moins de 50 personnes à un seul niveau
hiérarchique.

### `leaverequests`

| Champ | Type | Contraintes |
| --- | --- | --- |
| `user` | ObjectId → `User` | requis |
| `type` | String | `cp` \| `rtt` \| `unpaid` \| `sick` \| `training` |
| `startDate`, `endDate` | Date | requis |
| `startPeriod` | String | `morning` \| `afternoon` — défaut `morning` |
| `endPeriod` | String | `morning` \| `afternoon` — défaut `afternoon` |
| `days` | Number | calculé par le serveur, multiple de 0,5 |
| `comment` | String | commentaire de l'employé |
| `managerComment` | String | motif du refus |
| `justificatif` | String | nom du fichier déposé |
| `status` | String | `pending` \| `approved` \| `refused` \| `cancelled` |
| `reviewedBy`, `reviewedAt` | ObjectId, Date | trace de la décision |

Le champ `days` est **dénormalisé** : il fige la valeur ayant servi au décompte
du solde et évite un recalcul à chaque affichage de liste.

### `leavebalances`

| Champ | Type | Contraintes |
| --- | --- | --- |
| `user` | ObjectId → `User` | requis |
| `year` | Number | requis |
| `cp` | Number | défaut `25` |
| `rtt` | Number | défaut `12` |

Le solde est **séparé de l'utilisateur et porté par année**, ce qui conserve
l'historique : le solde 2025 reste consultable après le passage à 2026.

Seuls `cp` et `rtt` sont décomptés. Les congés sans solde, arrêts maladie et
formations sont enregistrés mais n'entament aucun compteur.

### `holidays`

| Champ | Type | Contraintes |
| --- | --- | --- |
| `date` | Date | requis, **unique** |
| `name` | String | requis |

### Relations

```
        ┌──────────────────┐
        │      User        │◀────┐
        └──────────────────┘     │ manager
             ▲         ▲─────────┘ (auto-référence)
      user   │              ▲
             │              │ reviewedBy
   ┌─────────┴────────┐     │
┌──┴───────────┐  ┌───┴─────┴────┐      ┌──────────┐
│ LeaveBalance │  │ LeaveRequest │      │ Holiday  │
│  (1 par an)  │  │              │      │ (isolée) │
└──────────────┘  └──────────────┘      └──────────┘
```

### Index

| Collection | Index | Type | Justification |
| --- | --- | --- | --- |
| `users` | `email` | unique | Unicité de l'identifiant, recherche à chaque connexion |
| `users` | `manager` | simple | Résolution du périmètre d'un manager |
| `leaverequests` | `{ user, status }` | composé | Liste des demandes d'un utilisateur, comptage des demandes en attente |
| `leaverequests` | `{ startDate, endDate }` | composé | Requêtes par intervalle : calendrier mensuel, filtre par période |
| `leavebalances` | `{ user, year }` | composé, unique | Interdit deux soldes pour une même année |
| `holidays` | `date` | unique | Rend le seed idempotent |

Les index composés suivent la règle du **préfixe gauche** : MongoDB n'exploite
`{ user, status }` que si la requête mentionne `user`. C'est précisément pourquoi
un second index `{ startDate, endDate }` est nécessaire aux requêtes du
calendrier, qui ne filtrent pas par utilisateur.

---

## Cycle de vie d'une demande

```
                    ┌───────────┐
      création ───▶ │  pending  │
                    └─────┬─────┘
        ┌─────────────────┼─────────────────┐
   approve()         refuse()          cancel()
  manager / RH      manager / RH        auteur
        ▼                 ▼                 ▼
  ┌───────────┐    ┌───────────┐    ┌───────────┐
  │ approved  │    │  refused  │    │ cancelled │
  └───────────┘    └───────────┘    └───────────┘
        ▲                 ▲                 ▲
        └─────────────────┴─────────────────┘
              PATCH /leave-requests/:id/status
                    RH uniquement
```

| Transition | Conditions | Effets |
| --- | --- | --- |
| → `pending` | Dates cohérentes, pas de chevauchement, durée non nulle | Calcul de `days` |
| `pending` → `approved` | En attente, dans le périmètre | Décompte du solde CP ou RTT, `reviewedBy` et `reviewedAt` |
| `pending` → `refused` | Commentaire **obligatoire** | `managerComment` enregistré |
| `pending` → `cancelled` | Auteur uniquement | Aucun impact sur le solde |
| tout état → tout état | RH uniquement | Correction manuelle, sans ajustement du solde |

---

## Architecture frontend

```
pages → services → api.ts (axios + intercepteurs) → API backend
```

Aucun composant n'appelle axios directement : tout passe par un service. Un
changement de contrat n'impacte qu'un seul fichier.

| Dossier | Contenu |
| --- | --- |
| `types/` | Interfaces partagées, miroir des modèles serveur |
| `services/` | Un fichier par ressource |
| `context/` | `AuthContext` : jeton, utilisateur, rôle |
| `hooks/` | `useSort` |
| `lib/` | Libellés français, formatage, calcul des jours |
| `components/` | Layout, gardes de route, composants d'interface |
| `pages/` | Les huit écrans |

**État d'authentification** — `AuthContext` lit le jeton depuis le `localStorage`
au montage, afin qu'un rafraîchissement de page ne déconnecte pas. Aucune
bibliothèque d'état global n'a été introduite : l'authentification est le seul
état réellement partagé entre écrans.

**Gardes de route** — `ProtectedRoute` exige un jeton, `RoleRoute` vérifie le
rôle. Ces gardes relèvent de l'ergonomie, non de la sécurité : le contrôle
serveur reste seul à faire autorité.

**Français** — les libellés sont centralisés dans `lib/constants.ts`. Les valeurs
techniques circulent en anglais (`pending`, `approved`), la traduction
n'intervenant qu'à l'affichage.

---

## Sécurité

**Mots de passe** — hachés avec bcrypt, qui intègre un sel unique par empreinte
et reste volontairement lent, rendant les tables précalculées inopérantes.
Les mots de passe temporaires ne sont retournés qu'une fois ; `mustSetPassword`
contraint le collaborateur à en choisir un dès la première connexion.

**JWT** — signé en HS256 avec la clé `JWT_SECRET`, connue du seul serveur. Un
utilisateur qui modifierait son rôle dans le jeton produirait une signature
incohérente et serait rejeté. La clé est fournie par variable d'environnement et
n'est jamais versionnée.

**Contrôle d'accès** — deux niveaux. Le middleware `role` vérifie le rôle ; les
services restreignent ensuite le périmètre, un manager n'ayant de droits que sur
son équipe. La restriction est appliquée **avant** les filtres de la requête.

| Ressource | Employé | Manager | RH |
| --- | --- | --- | --- |
| Ses demandes (créer, consulter, annuler) | ✅ | ✅ | ✅ |
| Voir les demandes de son équipe | ❌ | ✅ | ✅ |
| Voir toutes les demandes | ❌ | ❌ | ✅ |
| Valider ou refuser | ❌ | équipe | toutes |
| Corriger un statut | ❌ | ❌ | ✅ |
| Gérer les utilisateurs | ❌ | ❌ | ✅ |

**Validation** — doublée. Côté client pour le confort de saisie ; côté serveur
avec des schémas **Zod**, seuls à faire autorité puisque le client peut être
contourné par un appel direct à l'API.

**Fichiers** — types restreints (PNG, JPG, PDF) et taille limitée à 5 Mo. Stockés
dans un volume Docker exclu du dépôt Git.

**Autres** — un compte désactivé ne peut plus se connecter mais conserve son
historique. Le message d'échec de connexion reste générique, sans distinguer une
adresse inconnue d'un mot de passe erroné, afin que la base d'emails ne puisse
être énumérée.

---

## Gestion des erreurs

```
service  →  throw new ApiError(409, "…")
            ↓
middleware d'erreur  →  { message }
            ↓
intercepteur axios   →  401 : purge du jeton + redirection
            ↓
getApiError()        →  toast.error(message)
```

Ce point unique de sortie garantit un format d'erreur identique sur toutes les
routes et empêche toute trace d'exécution de remonter au client.

---

## Choix techniques et limites assumées

| Choix | Raison | Évolution |
| --- | --- | --- |
| Tri appliqué à la page courante | La pagination est serveur ; un tri global exigerait des paramètres `sort` et `order` sur chaque route | Déplacer le tri côté serveur |
| Recherche par collaborateur côté client | L'API filtre par identifiant, non par nom | Ajouter un paramètre `search` |
| La correction RH ne recrédite pas le solde | Cas exceptionnels de nature imprévisible ; une compensation automatique risquerait de produire un solde erroné | Proposer l'ajustement avec confirmation |
| Profil en lecture seule | Rôle, équipe et manager relèvent de décisions RH | — |
| Cloche de notification décorative | Les notifications visuelles demandées sont assurées par les messages contextuels | Ajouter un modèle `Notification` |
| Deux formes d'identifiant (`id` / `_id`) | La réponse de connexion est construite spécifiquement | Uniformiser la sérialisation |
| Pas de tests automatisés | Validation conduite manuellement sur les trois rôles | Jest et Supertest sur l'authentification et le RBAC |

---
