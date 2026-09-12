# Documentation de l'API — Leave Flow

API REST du projet. Tous les chemins sont préfixés par `/api`.

Base locale : `http://localhost:3000/api`

---

## Conventions

| Élément | Règle |
| --- | --- |
| Chemins | Kebab-case au pluriel : `/leave-requests`, `/users` |
| Champs | camelCase : `startDate`, `managerComment` |
| Format | JSON, sauf `POST /leave-requests` en `multipart/form-data` |
| Dates | `AAAA-MM-JJ` en entrée, ISO 8601 en sortie |
| Actions métier | `PATCH` + verbe : `/approve`, `/refuse`, `/cancel` |

---

## Authentification

Le jeton JWT obtenu à la connexion se transmet dans l'en-tête :

```http
Authorization: Bearer <token>
```

Il contient l'identifiant et le rôle de l'utilisateur. Sa signature est vérifiée
à chaque requête : un jeton modifié est rejeté.

**Rôles** : `employee`, `manager`, `hr`.

---

## Codes de statut

| Code | Signification |
| --- | --- |
| `200` | Succès |
| `201` | Ressource créée |
| `400` | Données invalides ou règle métier violée |
| `401` | Jeton absent, expiré ou invalide |
| `403` | Rôle insuffisant ou ressource hors périmètre |
| `404` | Ressource inexistante |
| `409` | Conflit : email déjà utilisé, chevauchement de dates |

**Format des erreurs** — identique sur toutes les routes :

```json
{ "message": "Le commentaire est obligatoire pour un refus." }
```

---

## Pagination

Les listes acceptent `page` et `limit` en paramètres de requête et renvoient :

```json
{ "data": [ ... ], "total": 45, "page": 1, "limit": 8, "totalPages": 6 }
```

---

## Endpoints

### Authentification

| Méthode | Chemin | Rôle | Payload | Réponse |
| --- | --- | --- | --- | --- |
| `POST` | `/auth/login` | public | `{ email, password }` | `{ token, mustSetPassword, user }` |
| `POST` | `/auth/set-password` | authentifié | `{ newPassword }` | `200` |

`mustSetPassword` vaut `true` quand l'utilisateur se connecte avec un mot de
passe temporaire : le client le redirige vers l'écran de définition du mot de passe.

### Utilisateurs — réservé au rôle RH

| Méthode | Chemin | Payload | Réponse |
| --- | --- | --- | --- |
| `GET` | `/users?page&limit&search&role` | — | Liste paginée |
| `POST` | `/users` | `{ firstName, lastName, email, role, manager?, team? }` | `{ user, temporaryPassword }` — `201` |
| `PUT` | `/users/:id` | champs partiels | Utilisateur mis à jour |
| `PATCH` | `/users/:id/status` | `{ isActive }` | Utilisateur mis à jour |
| `POST` | `/users/:id/reset-password` | — | `{ temporaryPassword }` |

Le mot de passe temporaire n'est retourné qu'à cet instant : seul son haché est
conservé ensuite.

### Demandes de congés

| Méthode | Chemin | Rôle | Payload | Réponse |
| --- | --- | --- | --- | --- |
| `POST` | `/leave-requests` | authentifié | multipart (voir ci-dessous) | Demande créée — `201` |
| `GET` | `/leave-requests/mine?page&limit&status&type` | authentifié | — | Liste paginée |
| `GET` | `/leave-requests?page&limit&status&type&employee&from&to` | manager, RH | — | Liste paginée |
| `GET` | `/leave-requests/:id` | propriétaire, manager, RH | — | Demande |
| `PATCH` | `/leave-requests/:id/cancel` | propriétaire | — | Statut `cancelled` |
| `PATCH` | `/leave-requests/:id/approve` | manager, RH | — | Statut `approved` |
| `PATCH` | `/leave-requests/:id/refuse` | manager, RH | `{ managerComment }` **requis** | Statut `refused` |
| `PATCH` | `/leave-requests/:id/status` | RH | `{ status, managerComment? }` | Statut modifié |

**Création d'une demande** — `multipart/form-data` :

| Champ | Requis | Valeurs |
| --- | --- | --- |
| `type` | oui | `cp`, `rtt`, `unpaid`, `sick`, `training` |
| `startDate`, `endDate` | oui | `AAAA-MM-JJ` |
| `startPeriod`, `endPeriod` | oui | `morning`, `afternoon` |
| `comment` | non | Texte libre |
| `justificatif` | non | PNG, JPG ou PDF — 5 Mo max |

Le nombre de jours est calculé par le serveur : week-ends exclus, demi-journées
prises en compte.

**Périmètre** — appliqué côté serveur : un manager ne reçoit que les demandes des
collaborateurs dont il est le manager désigné, les RH reçoivent tout.

### Tableau de bord, calendrier, profil

| Méthode | Chemin | Rôle | Réponse |
| --- | --- | --- | --- |
| `GET` | `/dashboard` | authentifié | `{ role, balance, myPendingCount, recentRequests, upcomingLeaves, pendingToReview? }` |
| `GET` | `/calendar?month=AAAA-MM&team` | authentifié | `{ month, leaves, holidays }` |
| `GET` | `/profile` | authentifié | `{ user, balance }` |
| `PATCH` | `/profile/password` | authentifié | `{ currentPassword, newPassword }` |
| `GET` | `/health` | public | `{ status, db }` |

`pendingToReview` n'est présent que pour les rôles manager et RH.
Le calendrier ne retourne que les demandes au statut `approved`.

---

## Modèles retournés

### User

```json
{
  "_id": "6710a3f2c9d1e40012a4b7c8",
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean.dupont@supherman.com",
  "role": "employee",
  "isActive": true,
  "mustSetPassword": false,
  "manager": { "_id": "...", "firstName": "Marie", "lastName": "Curie" },
  "team": "Backend",
  "loginHistory": [ { "date": "...", "ip": "...", "userAgent": "..." } ]
}
```

Le champ `password` n'est jamais retourné.

### LeaveRequest

```json
{
  "_id": "6710b4c3d8e2f50023b5c9d1",
  "user": { "_id": "...", "firstName": "Jean", "lastName": "Dupont" },
  "type": "cp",
  "startDate": "2026-09-14T00:00:00.000Z",
  "endDate": "2026-09-18T00:00:00.000Z",
  "startPeriod": "morning",
  "endPeriod": "afternoon",
  "days": 5,
  "comment": "Congés de rentrée",
  "managerComment": null,
  "justificatif": null,
  "status": "pending",
  "reviewedBy": null,
  "reviewedAt": null,
  "createdAt": "2026-09-01T09:12:00.000Z"
}
```

### LeaveBalance

```json
{ "cp": 22.5, "rtt": 8, "year": 2026 }
```

---

## Points de vigilance

- `POST /auth/login` retourne l'utilisateur avec un champ **`id`**, toutes les
  autres routes avec **`_id`**.
- `POST /leave-requests` attend du `multipart/form-data`, pas du JSON.
- Le tri des listes n'est pas géré par l'API : il est appliqué côté client.
- Les justificatifs sont stockés dans `uploads/` côté serveur ; la réponse ne
  contient que le nom du fichier.

---

## Exemple

```bash
# Connexion et récupération du jeton
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rh@supherman.com","password":"Suph3rm4n!"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Tableau de bord
curl -s http://localhost:3000/api/dashboard -H "Authorization: Bearer $TOKEN"

# Création d'une demande
curl -s -X POST http://localhost:3000/api/leave-requests \
  -H "Authorization: Bearer $TOKEN" \
  -F "type=cp" -F "startDate=2026-09-14" -F "endDate=2026-09-18" \
  -F "startPeriod=morning" -F "endPeriod=afternoon"
```