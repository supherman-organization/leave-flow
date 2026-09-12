# Leave Flow — Gestion des congés et absences

Application interne de gestion des demandes de congés et d'absences pour **SUP Herman**.
Solution fullstack conteneurisée : API REST (Node.js / Express / MongoDB) +
interface React, orchestrée par Docker.

---

## Prérequis

L'application s'utilise **via Docker** — c'est la seule méthode prévue.
Toute l'infrastructure (application, API, base de données) est conteneurisée :
**aucune installation de Node.js ou MongoDB n'est nécessaire.**

- **Docker** et **Docker Compose**
- Lien de téléchargement ([Docker Desktop](https://www.docker.com/products/docker-desktop/))

Vérifier qu'ils sont présents et que Docker Desktop est démarré :

```bash
docker --version
docker compose version
```

---

## Installation

#### 1. Cloner le projet avec cette commande :
```bash
git clone https://github.com/supherman-organization/leave-flow.git
```

#### 2. Accéder au dossier et créer les fichiers .env :
```bash
cd leave-flow
cp .env.example .env
cp frontend/.env.example frontend/.env
```

#### 3. Générer un token :
```bash
openssl rand -hex 32
```

#### 4. Mettre à jour le JWT dans le .env :
Copier le token généré dans `JWT_SECRET`

---

## Démarrer l'application

Pour démarrer le projet, on lance :
```bash
docker compose up --build
```

Puis, dans un **second terminal**, créer le compte RH et les jours fériés :
```bash
docker compose exec backend npm run seed
docker compose exec backend npm run seed:holidays
```

Ces deux commandes ne sont à exécuter **qu'au premier démarrage**.

---

## Connexion

#### 1. Pour accéder à l'interface de gestion des congés :
Dans un navigateur, saisir l'adresse :
- `http://localhost:5174`

#### 2. Saisir l'email et le mot de passe
- Email : `rh@supherman.com`
- Mot de passe : `Suph3rm4n!`

---

## Documentation

Les instructions d'installation, la configuration des variables d'environnement,
la configuration de la base de données et le lancement de l'application figurent
dans ce README. Les trois autres livrables sont dans le dossier `docs/` :

| Document | Contenu |
| --- | --- |
| [`docs/API.md`](docs/API.md) | Documentation de l'API REST |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Documentation technique |
| [`docs/MANUEL-UTILISATEUR.md`](docs/MANUEL-UTILISATEUR.md) | Manuel utilisateur |

Ce découpage a été retenu pour la lisibilité : chaque document s'adresse à un
lecteur différent — administrateur système, développeur, utilisateur final.

---

## Autres informations

| Service | URL |
| --- | --- |
| **Application** | http://localhost:5174 |
| API backend | http://localhost:3000/api |
| État de l'API | http://localhost:3000/api/health |

**Variables d'environnement** (`.env` à la racine) :

| Variable | Rôle |
| --- | --- |
| `MONGO_URI` | Connexion à la base de données |
| `JWT_SECRET` | Clé de signature des jetons d'authentification |
| `JWT_EXPIRES_IN` | Durée de validité d'un jeton |

**Arrêter l'application :**

```bash
docker compose down       # arrête les conteneurs
docker compose down -v    # + efface les données de la base
```

**Repartir d'une base vierge :**

```bash
docker compose down -v
docker compose up -d --build
docker compose exec backend npm run seed
docker compose exec backend npm run seed:holidays
```