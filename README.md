# Leave Flow — Plateforme de gestion des congés et absences

Application web interne permettant à une PME de centraliser les demandes de congés, d'automatiser leur circuit de validation et d'offrir une vision claire des absences de tous les collaborateurs.

Développée pour **SUP Herman** (moins de 50 employés), qui gérait jusqu'ici ses demandes par email et Slack avec report manuel dans un calendrier partagé.

---

## Compte de démonstration

Un compte **Responsable RH** est créé automatiquement par le script de seed :

| Email | Mot de passe |
|---|---|
| `rh@supherman.com` | `Suph3rm4n!` |

Ce compte donne accès à l'intégralité des fonctionnalités : gestion des utilisateurs, gestion de toutes les demandes, calendrier global.

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Base de données et seeds](#base-de-données-et-seeds)
- [Lancement et vérification](#lancement-et-vérification)
- [Commandes utiles](#commandes-utiles)
- [Structure du projet](#structure-du-projet)
- [Documentation](#documentation)
- [Dépannage](#dépannage)

---

## Fonctionnalités

L'application distingue trois rôles aux périmètres croissants.

| Rôle | Périmètre |
|---|---|
| **Employé** | Consulte son solde, crée et suit ses demandes, annule une demande en attente |
| **Manager** | Idem, plus la validation ou le refus des demandes de son équipe |
| **RH** | Idem, plus la gestion des comptes utilisateurs et la correction de n'importe quel statut |

Les huit écrans de l'application :

1. **Connexion** — authentification par email et mot de passe. Aucune auto-inscription : les comptes sont créés exclusivement par les RH. Définition du mot de passe à la première connexion.
2. **Tableau de bord** — résumé adapté au rôle : solde de congés, demandes en attente, prochains congés, historique récent.
3. **Mes demandes** — liste paginée et triable, filtre par statut, détail en modale avec le commentaire du manager, annulation possible tant que la demande est en attente.
4. **Nouvelle demande** — choix du type, sélection des dates, gestion des demi-journées, calcul automatique des jours décomptés, commentaire optionnel, dépôt d'un justificatif, blocage des saisies incohérentes.
5. **Gestion des demandes** — vue manager et RH avec filtres par statut, type, période et collaborateur. Validation en un clic, refus avec commentaire obligatoire, correction de statut réservée aux RH.
6. **Calendrier global** — grille mensuelle des congés validés, colorés par type, filtrable par équipe, jours fériés signalés.
7. **Gestion des utilisateurs** — réservée aux RH : création, modification, activation ou désactivation d'un compte, réinitialisation de mot de passe, attribution du rôle et du manager responsable.
8. **Profil** — informations personnelles, soldes CP et RTT, historique de connexion, changement de mot de passe.

Transversalement : contrôle d'accès par rôle appliqué côté serveur, validation des entrées sur le front et le back, messages d'erreur explicites, pagination des listes, recherche et tri des tableaux, notifications visuelles, interface responsive.

---

## Stack technique

| Couche | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS 4, Vite |
| Routage et état | react-router-dom, Context API |
| Client HTTP | axios (intercepteurs pour le token et les erreurs 401) |
| Backend | Node.js 20, Express, TypeScript |
| Base de données | MongoDB 7 via Mongoose |
| Authentification | JWT signé HS256, mots de passe hachés avec bcrypt |
| Validation | Zod (schémas côté serveur) |
| Conteneurisation | Docker et Docker Compose |

---

## Prérequis

**Docker Desktop** (ou Docker Engine avec le plugin Compose v2) est le seul logiciel requis. Node.js n'a pas besoin d'être installé sur la machine hôte : tout s'exécute dans les conteneurs.

Vérification :

```bash
docker --version
docker compose version
```

Les ports **3000**, **5174** et **27017** doivent être libres.

---

## Installation

### 1. Cloner le dépôt

```bash
git clone <https://github.com/supherman-organization/leave-flow.git> 
cd leave-flow
```

### 2. Créer les fichiers d'environnement

Deux fichiers sont nécessaires : un à la racine pour le backend et la base, un dans `frontend/` pour l'URL de l'API. Aucun des deux n'est versionné ; des modèles `.env.example` sont fournis.

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

### 3. Générer une clé de signature JWT

Le modèle contient une valeur factice qu'il faut remplacer par une chaîne aléatoire :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copiez le résultat dans le fichier `.env` à la racine, en remplacement de `change-me` :

```dotenv
JWT_SECRET=8f2c4a9e1b7d3f6082c5e4a1d9b8f37c2e6a0d4b9f1c8e3a7d2b5f0c9e4a1d68
```

> Si Node.js n'est pas installé localement, utilisez `openssl rand -hex 32`, ou n'importe quelle chaîne aléatoire d'au moins 32 caractères.

### 4. Construire et démarrer les conteneurs

```bash
docker compose up -d --build
```

Le premier lancement télécharge les images et installe les dépendances : comptez quelques minutes. Trois conteneurs démarrent : `leaveflow-mongo`, `leaveflow-backend` et `leaveflow-frontend`.

### 5. Initialiser les données

```bash
docker compose exec backend npm run seed
docker compose exec backend npm run seed:holidays
```

L'application est alors accessible sur **http://localhost:5174**.

---

## Variables d'environnement

### Racine — `.env`

Lu par Docker Compose, qui injecte ces valeurs dans le conteneur backend.

| Variable | Exemple | Rôle |
|---|---|---|
| `MONGO_PORT` | `27017` | Port MongoDB exposé sur la machine hôte |
| `BACKEND_PORT` | `3000` | Port de l'API exposé sur la machine hôte |
| `FRONTEND_PORT` | `5174` | Port du serveur de développement Vite |
| `MONGO_URI` | `mongodb://mongo:27017/leaveflow` | Chaîne de connexion. `mongo` est le nom du service Docker, résolu par le réseau interne |
| `JWT_SECRET` | chaîne aléatoire de 64 caractères | Clé de signature des tokens. Ne quitte jamais le serveur |
| `JWT_EXPIRES_IN` | `7d` | Durée de validité d'un token |

### Frontend — `frontend/.env`

| Variable | Exemple | Rôle |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000/api` | URL de base de l'API appelée par le navigateur |

> Les variables préfixées `VITE_` sont intégrées au bundle JavaScript livré au navigateur : elles sont donc publiques. Aucun secret ne doit y figurer.

### À propos du `JWT_SECRET`

Ce n'est pas un token, mais la clé qui sert à en signer. À la connexion, le serveur construit un jeton contenant l'identifiant et le rôle de l'utilisateur, puis calcule une signature à partir de ce contenu et du secret. À chaque requête suivante, il recalcule cette signature pour vérifier que le jeton n'a pas été falsifié — un utilisateur qui modifierait son rôle dans le token verrait sa requête rejetée.

Changer le secret invalide tous les tokens en circulation : les utilisateurs connectés doivent se reconnecter.

---

## Base de données et seeds

MongoDB est fourni par le conteneur `leaveflow-mongo`. Les données persistent dans le volume Docker `mongo-data` entre les redémarrages ; aucune installation locale n'est nécessaire.

Deux scripts d'initialisation sont fournis.

| Commande | Effet |
|---|---|
| `docker compose exec backend npm run seed` | Crée le compte RH `rh@supherman.com` avec son solde de congés. Idempotent : ne fait rien si le compte existe déjà |
| `docker compose exec backend npm run seed:holidays` | Insère les jours fériés français utilisés par le calendrier global |

Les deux sont **obligatoires** au premier lancement : sans le premier, aucun compte ne permet de se connecter.

### Repartir d'une base vierge

```bash
docker compose down -v
docker compose up -d --build
docker compose exec backend npm run seed
docker compose exec backend npm run seed:holidays
```

L'option `-v` supprime le volume de données. À utiliser en connaissance de cause : toutes les demandes et tous les comptes créés sont perdus.

---

## Lancement et vérification

| Service | URL |
|---|---|
| Interface web | http://localhost:5174 |
| API | http://localhost:3000/api |
| Point de santé | http://localhost:3000/api/health |

Vérifier que l'API et la base communiquent :

```bash
curl http://localhost:3000/api/health
# {"status":"ok","db":"connected"}
```

Puis ouvrir http://localhost:5174 et se connecter avec `rh@supherman.com` / `Suph3rm4n!`.

---

## Commandes utiles

### Docker

```bash
docker compose up -d --build     # construire et démarrer
docker compose down              # arrêter (les données sont conservées)
docker compose down -v           # arrêter et supprimer les données
docker compose logs -f backend   # suivre les logs de l'API
docker compose ps                # état des conteneurs
docker compose config            # afficher la configuration après substitution des variables
```

Après l'ajout d'une dépendance npm, reconstruire en renouvelant le volume `node_modules` :

```bash
docker compose up -d --build -V frontend
```

### Scripts npm

Exécutables dans les conteneurs via `docker compose exec <service> npm run <script>`.

| Service | Script | Effet |
|---|---|---|
| backend | `dev` | Serveur de développement avec rechargement à chaud (tsx watch) |
| backend | `build` | Compilation TypeScript vers `dist/` |
| backend | `start` | Démarrage de la version compilée |
| backend | `seed` | Création du compte RH |
| backend | `seed:holidays` | Insertion des jours fériés |
| frontend | `dev` | Serveur de développement Vite |
| frontend | `build` | Vérification des types puis build de production |
| frontend | `lint` | Analyse ESLint |
| frontend | `preview` | Prévisualisation du build de production |

---

## Structure du projet

```
leave-flow/
├── docker-compose.yml       # orchestration des trois services
├── .env                     # secrets, non versionné
├── .env.example             # modèle à copier
├── README.md
├── docs/                    # documentation détaillée
│
├── backend/
│   ├── Dockerfile
│   └── src/
│       ├── config/          # connexion MongoDB, chargement des variables d'environnement
│       ├── models/          # schémas Mongoose : User, LeaveRequest, LeaveBalance, Holiday
│       ├── controllers/     # réception des requêtes, appel des services, formatage des réponses
│       ├── services/        # logique métier : calcul des jours, transitions de statut, soldes
│       ├── routes/          # définition des routes REST, montées sur /api
│       ├── middlewares/     # authentification, contrôle de rôle, upload, gestion d'erreurs
│       ├── validators/      # schémas Zod de validation des entrées
│       ├── utils/           # JWT, hachage, helpers de dates, classe ApiError
│       ├── seed/            # scripts d'initialisation
│       ├── app.ts           # assemblage Express
│       └── server.ts        # connexion à la base puis écoute
│
└── frontend/
    ├── Dockerfile
    ├── vite.config.ts
    └── src/
        ├── types/           # interfaces TypeScript partagées
        ├── services/        # client axios et appels API par ressource
        ├── context/         # AuthContext : token, utilisateur, rôle
        ├── hooks/           # useSort
        ├── lib/             # libellés français, formatage, calcul des jours
        ├── components/      # layout, gardes de route, composants d'interface
        └── pages/           # les huit écrans de l'application
```

---

## Documentation

La documentation est répartie entre ce README et le dossier `docs/`.

| Livrable | Emplacement |
|---|---|
| Instructions d'installation | [Installation](#installation) — ci-dessus |
| Configuration des variables d'environnement | [Variables d'environnement](#variables-denvironnement) — ci-dessus |
| Configuration de la base de données | [Base de données et seeds](#base-de-données-et-seeds) — ci-dessus |
| Lancement du frontend et du backend | [Lancement et vérification](#lancement-et-vérification) — ci-dessus |
| **Documentation de l'API** | [`docs/API.md`](docs/API.md) |
| **Documentation technique (architecture)** | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| **Manuel utilisateur** | [`docs/MANUEL-UTILISATEUR.md`](docs/MANUEL-UTILISATEUR.md) |

Le découpage en fichiers distincts a été retenu pour la lisibilité : chaque document s'adresse à un lecteur différent — administrateur système, développeur intégrateur, utilisateur final.

---

## Dépannage

**Le frontend affiche une page blanche sans erreur dans la console**
Problème de structure de routage. Vérifier que `Layout.tsx` contient bien `<Outlet />`, sans quoi aucune page enfant ne s'affiche.

**Page blanche avec une erreur rouge dans la console**
Import incorrect ou appel API en échec. Ouvrir l'onglet Réseau des outils de développement pour identifier la requête fautive.

**`Cannot find module` après l'ajout d'une dépendance**
Le volume `node_modules` du conteneur n'a pas été mis à jour :

```bash
docker compose up -d --build -V frontend
```

**Les styles Tailwind ne s'appliquent pas**
Vérifier que le plugin est bien **appelé** dans `vite.config.ts` : `tailwindcss()` et non `tailwindcss`. Redémarrer ensuite le conteneur frontend.

**`{"db":"disconnected"}` sur le point de santé**
MongoDB n'était pas prêt au démarrage de l'API. Consulter `docker compose logs mongo`, puis relancer le backend :

```bash
docker compose restart backend
```

**Déconnexion inattendue après modification du `.env`**
Comportement normal : changer `JWT_SECRET` invalide les tokens existants. Il suffit de se reconnecter.

**Un port est déjà utilisé**
Modifier `MONGO_PORT`, `BACKEND_PORT` ou `FRONTEND_PORT` dans `.env`. Si le port de l'API change, mettre à jour `VITE_API_URL` dans `frontend/.env` en conséquence.

---

## Notes de développement

Le système de fichiers des conteneurs Linux est sensible à la casse : les chemins d'import doivent respecter exactement la casse des noms de fichiers, même si le développement se fait sous Windows où l'erreur passerait inaperçue.

Conventions de nommage retenues : `camelCase` pour l'infrastructure (services, hooks, utilitaires), `PascalCase` pour les composants et pages React.